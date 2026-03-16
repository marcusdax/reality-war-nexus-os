import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { generateSignature } from "./crypto";

// ============================================================================
// MISSION ROUTER
// ============================================================================

const missionRouter = router({
  listNearby: protectedProcedure
    .input(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
        radiusKm: z.number().default(5),
        difficulty: z.enum(["easy", "medium", "hard", "expert"]).optional(),
        missionType: z
          .enum(["infrastructure", "environmental", "civic", "social", "emergency"])
          .optional(),
      })
    )
    .query(async ({ input }) => {
      return db.getMissionsNearby(
        input.latitude,
        input.longitude,
        input.radiusKm,
        input.difficulty,
        input.missionType
      );
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const mission = await db.getMissionById(input.id);
      if (!mission) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Mission not found" });
      }
      return mission;
    }),

  accept: protectedProcedure
    .input(z.object({ missionId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const mission = await db.getMissionById(input.missionId);
      if (!mission) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Mission not found" });
      }

      return db.acceptMission(ctx.user.id, input.missionId);
    }),

  submitMagicMoment: protectedProcedure
    .input(
      z.object({
        missionId: z.number(),
        photoUrl: z.string().optional(),
        videoUrl: z.string().optional(),
        description: z.string(),
        latitude: z.number(),
        longitude: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const mission = await db.getMissionById(input.missionId);
      if (!mission) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Mission not found" });
      }

      const timestamp = new Date();
      const signature = generateSignature({
        userId: ctx.user.id,
        latitude: input.latitude,
        longitude: input.longitude,
        timestamp: timestamp.getTime(),
      });

      const magicMoment = await db.createMagicMoment({
        userId: ctx.user.id,
        missionId: input.missionId,
        photoUrl: input.photoUrl,
        videoUrl: input.videoUrl,
        description: input.description,
        locationLatitude: input.latitude,
        locationLongitude: input.longitude,
        timestampCaptured: timestamp,
        cryptographicSignature: signature,
      });

      // Award initial Truth Credits
      await db.recordTruthCreditTransaction({
        userId: ctx.user.id,
        transactionType: "earn_mission",
        amount: mission.rewardTruthCredits,
        reason: `Submitted verification for: ${mission.title}`,
        relatedEntityType: "mission",
        relatedEntityId: input.missionId,
        cryptographicSignature: signature,
      });

      return magicMoment;
    }),

  create: adminProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        missionType: z.enum(["infrastructure", "environmental", "civic", "social", "emergency"]),
        difficulty: z.enum(["easy", "medium", "hard", "expert"]),
        latitude: z.number(),
        longitude: z.number(),
        rewardTruthCredits: z.number().min(1),
        validationCriteria: z.string(),
        deadlineAt: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return db.createMission({
        title: input.title,
        description: input.description,
        missionType: input.missionType,
        difficulty: input.difficulty,
        locationLatitude: input.latitude,
        locationLongitude: input.longitude,
        locationRadiusMeters: 100,
        rewardTruthCredits: input.rewardTruthCredits,
        rewardXp: Math.floor(input.rewardTruthCredits / 2),
        validationCriteria: input.validationCriteria,
        createdBy: ctx.user.id,
        deadlineAt: input.deadlineAt,
      });
    }),
});

// ============================================================================
// VERIFICATION ROUTER
// ============================================================================

const verificationRouter = router({
  getPending: protectedProcedure.query(async ({ ctx }) => {
    return db.getPendingMagicMoments(20, 0);
  }),

  submit: protectedProcedure
    .input(
      z.object({
        magicMomentId: z.number(),
        verdict: z.enum(["approved", "rejected", "needs_review"]),
        reasoning: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const magicMoment = await db.getMagicMomentById(input.magicMomentId);
      if (!magicMoment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Magic Moment not found" });
      }

      // Create verification record
      await db.createVerification({
        magicMomentId: input.magicMomentId,
        validatorId: ctx.user.id,
        verdict: input.verdict,
        reasoning: input.reasoning,
      });

      // Get all verifications for this moment
      const verifications = await db.getVerificationsForMagicMoment(input.magicMomentId);

      // Calculate truth score based on verdicts
      const approvedCount = verifications.filter((v) => v.verdict === "approved").length;
      const totalCount = verifications.length;
      const truthScore = totalCount > 0 ? approvedCount / totalCount : 0;

      // Update magic moment status and truth score
      let newStatus: "pending" | "approved" | "rejected" | "disputed" = "pending";
      if (totalCount >= 3) {
        if (truthScore >= 0.66) {
          newStatus = "approved";
        } else if (truthScore <= 0.33) {
          newStatus = "rejected";
        } else {
          newStatus = "disputed";
        }
      }

      await db.updateMagicMomentStatus(input.magicMomentId, newStatus, truthScore);

      // Award verification credits to validator
      if (input.verdict === "approved") {
        const signature = generateSignature({
          userId: ctx.user.id,
          magicMomentId: input.magicMomentId,
          timestamp: new Date().getTime(),
        });

        await db.recordTruthCreditTransaction({
          userId: ctx.user.id,
          transactionType: "earn_verification",
          amount: 5,
          reason: "Verified Magic Moment",
          relatedEntityType: "magic_moment",
          relatedEntityId: input.magicMomentId,
          cryptographicSignature: signature,
        });
      }

      return { success: true, newStatus, truthScore };
    }),

  getHistory: protectedProcedure
    .input(z.object({ magicMomentId: z.number() }))
    .query(async ({ input }) => {
      return db.getVerificationsForMagicMoment(input.magicMomentId);
    }),
});

// ============================================================================
// TRUTH CREDITS ROUTER
// ============================================================================

const truthCreditsRouter = router({
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    const balance = await db.getTruthCreditBalance(ctx.user.id);
    const ledger = await db.getTruthCreditLedger(ctx.user.id, 10, 0);
    return { balance, recentTransactions: ledger };
  }),

  getLedger: protectedProcedure
    .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
    .query(async ({ input, ctx }) => {
      return db.getTruthCreditLedger(ctx.user.id, input.limit, input.offset);
    }),

  transfer: protectedProcedure
    .input(
      z.object({
        recipientId: z.number(),
        amount: z.number().min(1),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const balance = await db.getTruthCreditBalance(ctx.user.id);
      if (balance < input.amount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient Truth Credits",
        });
      }

      const signature = generateSignature({
        userId: ctx.user.id,
        recipientId: input.recipientId,
        amount: input.amount,
        timestamp: new Date().getTime(),
      });

      // Debit from sender
      await db.recordTruthCreditTransaction({
        userId: ctx.user.id,
        transactionType: "transfer",
        amount: -input.amount,
        reason: `Transferred to user ${input.recipientId}`,
        cryptographicSignature: signature,
      });

      // Credit to recipient
      await db.recordTruthCreditTransaction({
        userId: input.recipientId,
        transactionType: "transfer",
        amount: input.amount,
        reason: `Received from user ${ctx.user.id}`,
        cryptographicSignature: signature,
      });

      return { success: true };
    }),
});

// ============================================================================
// ANOMALY ROUTER
// ============================================================================

const anomalyRouter = router({
  getNearby: protectedProcedure
    .input(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
        radiusKm: z.number().default(5),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
      })
    )
    .query(async ({ input }) => {
      return db.getAnomaliesNearby(
        input.latitude,
        input.longitude,
        input.radiusKm,
        input.priority
      );
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const anomaly = await db.getAnomalyById(input.id);
      if (!anomaly) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Anomaly not found" });
      }
      return anomaly;
    }),

  report: protectedProcedure
    .input(
      z.object({
        anomalyType: z.enum([
          "infrastructure_damage",
          "environmental_hazard",
          "civic_issue",
          "data_discrepancy",
          "emergency",
        ]),
        description: z.string(),
        latitude: z.number(),
        longitude: z.number(),
        photoUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return db.createAnomaly({
        anomalyType: input.anomalyType,
        priority: input.anomalyType === "emergency" ? "critical" : "high",
        locationLatitude: input.latitude,
        locationLongitude: input.longitude,
        description: input.description,
        nadeConfidenceScore: 0.7, // Default confidence
      });
    }),
});

// ============================================================================
// REALITY STREAM ROUTER
// ============================================================================

const realityStreamRouter = router({
  getFeed: publicProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
        sort: z.enum(["recent", "trending", "verified"]).default("recent"),
      })
    )
    .query(async ({ input }) => {
      return db.getRealityStreamFeed(input.limit, input.offset, input.sort);
    }),

  create: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1),
        mediaUrls: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return db.createRealityStreamPost({
        userId: ctx.user.id,
        content: input.content,
        mediaUrls: input.mediaUrls,
      });
    }),

  upvote: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await db.updatePostUpvotes(input.postId, 1);

      // Award Truth Credits to post author
      const signature = generateSignature({
        userId: ctx.user.id,
        postId: input.postId,
        timestamp: new Date().getTime(),
      });

      await db.recordTruthCreditTransaction({
        userId: ctx.user.id,
        transactionType: "earn_upvote",
        amount: 1,
        reason: "Post upvoted",
        relatedEntityType: "post",
        relatedEntityId: input.postId,
        cryptographicSignature: signature,
      });

      return { success: true };
    }),

  comment: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return db.createComment(input.postId, ctx.user.id, input.content);
    }),

  getComments: publicProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ input }) => {
      return db.getPostComments(input.postId);
    }),
});

// ============================================================================
// PROFILE ROUTER
// ============================================================================

const profileRouter = router({
  getProfile: protectedProcedure
    .input(z.object({ userId: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      const userId = input.userId || ctx.user.id;
      const user = await db.getUserById(userId);
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const badges = await db.getUserBadges(userId);
      const truthCredits = await db.getTruthCreditBalance(userId);

      return {
        ...user,
        badges,
        truthCredits,
      };
    }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        locationLatitude: z.number().optional(),
        locationLongitude: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return db.updateUserProfile(ctx.user.id, input);
    }),

  takeOath: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await db.getUserById(ctx.user.id);
    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    if (user.oathTaken) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Oath already taken",
      });
    }

    // Update oath status (imported from schema)
    const { users } = require("../drizzle/schema");
    const { eq } = require("drizzle-orm");
    const db_instance = await db.getDb();
    if (db_instance) {
      await db_instance
        .update(users)
        .set({
          oathTaken: 1,
          oathTakenAt: new Date(),
        })
        .where(eq(users.id, ctx.user.id));
    }

    // Award initial Truth Credits
    const signature = generateSignature({
      userId: ctx.user.id,
      action: "oath_taken",
      timestamp: new Date().getTime(),
    });

    await db.recordTruthCreditTransaction({
      userId: ctx.user.id,
      transactionType: "earn_mission",
      amount: 50,
      reason: "Shadow Corps oath taken",
      cryptographicSignature: signature,
    });

    // Award first badge
    await db.awardBadge(ctx.user.id, "shadow_corps_recruit", "Joined the Shadow Corps");

    return { success: true };
  }),

  getLeaderboard: publicProcedure
    .input(
      z.object({
        type: z.enum(["global", "local", "seasonal"]).default("global"),
        limit: z.number().default(100),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      return db.getLeaderboard(input.type, input.limit, input.latitude, input.longitude);
    }),
});

// ============================================================================
// ADMIN ROUTER
// ============================================================================

const adminRouter = router({
  getModerationQueue: adminProcedure.query(async () => {
    return db.getPendingMagicMoments(50, 0);
  }),

  resolveModerationCase: adminProcedure
    .input(
      z.object({
        caseType: z.enum(["magic_moment", "post", "user"]),
        caseId: z.number(),
        resolution: z.enum(["approved", "rejected", "user_warning", "user_suspension"]),
        reasoning: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (input.caseType === "magic_moment") {
        await db.updateMagicMomentStatus(
          input.caseId,
          input.resolution === "approved" ? "approved" : "rejected"
        );
      }

      return { success: true };
    }),

  generateMissions: adminProcedure
    .input(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
        count: z.number().default(5),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const missions = [];
      const types: Array<"infrastructure" | "environmental" | "civic" | "social" | "emergency"> = [
        "infrastructure",
        "environmental",
        "civic",
        "social",
        "emergency",
      ];
      const difficulties: Array<"easy" | "medium" | "hard" | "expert"> = [
        "easy",
        "medium",
        "hard",
        "expert",
      ];

      for (let i = 0; i < input.count; i++) {
        const mission = await db.createMission({
          title: `Verification Task ${i + 1}`,
          description: "Document and verify local conditions",
          missionType: types[Math.floor(Math.random() * types.length)],
          difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
          locationLatitude: input.latitude + (Math.random() - 0.5) * 0.1,
          locationLongitude: input.longitude + (Math.random() - 0.5) * 0.1,
          locationRadiusMeters: 100,
          rewardTruthCredits: 10 + Math.floor(Math.random() * 40),
          rewardXp: 5 + Math.floor(Math.random() * 20),
          validationCriteria: "Provide clear photographic evidence",
          createdBy: ctx.user.id,
        });
        missions.push(mission);
      }

      return missions;
    }),
});

// ============================================================================
// MAIN ROUTER
// ============================================================================

export const appRouter = router({
  system: router({}), // Placeholder for system router
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = require("./_core/cookies").getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie("manus_session", { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  missions: missionRouter,
  verification: verificationRouter,
  truthCredits: truthCreditsRouter,
  anomaly: anomalyRouter,
  realityStream: realityStreamRouter,
  profile: profileRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
