import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { generateSignature } from "./crypto";
import { getSessionCookieOptions } from "./_core/cookies";

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

    // Update oath status in database
    await db.updateUserOathStatus(ctx.user.id, true);

    // Award initial Truth Credits
    const signature = generateSignature({
      userId: ctx.user.id,
      action: "oath_taken",
      timestamp: new Date().getTime(),
    });

    await db.recordTruthCreditTransaction({
      userId: ctx.user.id,
      transactionType: "earn_mission",
      amount: 500,
      reason: "Shadow Corps oath taken",
      cryptographicSignature: signature,
    });

    // Award XP
    await db.updateUserXP(ctx.user.id, 100);

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
// SHADOW CORPS ROUTER
// ============================================================================

const shadowCorpsRouter = router({
  // Get or create the current user's Shadow Analyst profile
  getAnalystProfile: protectedProcedure.query(async ({ ctx }) => {
    return db.getOrCreateShadowAnalystProfile(ctx.user.id);
  }),

  // Advance a Crucible phase for the current analyst
  advanceCruciblePhase: protectedProcedure
    .input(
      z.object({
        phase: z.enum(["phase_1", "phase_2", "phase_3", "complete"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const profile = await db.getOrCreateShadowAnalystProfile(ctx.user.id);
      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Analyst profile not found" });
      }

      const phaseOrder = ["none", "phase_1", "phase_2", "phase_3", "complete"];
      const currentIdx = phaseOrder.indexOf(profile.cruciblePhase);
      const targetIdx = phaseOrder.indexOf(input.phase);

      if (targetIdx !== currentIdx + 1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Crucible phases must be completed in order",
        });
      }

      const updates: Parameters<typeof db.updateAnalystProfile>[1] = {
        cruciblePhase: input.phase,
      };

      if (input.phase === "phase_1" && profile.cruciblePhase === "none") {
        updates.crucibleStartedAt = new Date();
        updates.psychEvalCompleted = true;
      }
      if (input.phase === "phase_2") {
        updates.technicalCertCompleted = true;
      }
      if (input.phase === "complete") {
        updates.crucibleCompletedAt = new Date();
        updates.analystLevel = "3";
        // Generate a ZKP credential hash
        const oathHash = generateSignature({
          userId: ctx.user.id,
          covenant: "immutable_oath",
          timestamp: new Date().getTime(),
        });
        updates.immutableOathHash = oathHash;
        updates.oathRenewedAt = new Date();

        // Award Level 3 XP and credits
        await db.updateUserXP(ctx.user.id, 5000);
        const sig = generateSignature({ userId: ctx.user.id, action: "crucible_complete", timestamp: Date.now() });
        await db.recordTruthCreditTransaction({
          userId: ctx.user.id,
          transactionType: "earn_mission",
          amount: 10000,
          reason: "Shadow Corps Crucible completed — Level 3 Analyst",
          cryptographicSignature: sig,
        });
        await db.awardBadge(ctx.user.id, "level_3_shadow_analyst", "Completed the Crucible and attained Level 3");
      }

      return db.updateAnalystProfile(ctx.user.id, updates);
    }),

  // Renew the Immutable Oath (required before high-stakes missions)
  renewOath: protectedProcedure.mutation(async ({ ctx }) => {
    const profile = await db.getOrCreateShadowAnalystProfile(ctx.user.id);
    if (!profile) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Analyst profile not found" });
    }

    const oathHash = generateSignature({
      userId: ctx.user.id,
      covenant: "oath_renewed",
      timestamp: new Date().getTime(),
    });

    return db.updateAnalystProfile(ctx.user.id, {
      immutableOathHash: oathHash,
      oathRenewedAt: new Date(),
    });
  }),

  // Initiate a new Ghost Audit
  initiateGhostAudit: protectedProcedure
    .input(
      z.object({
        auditTitle: z.string().min(5).max(255),
        targetEntity: z.string().min(10),
        auditType: z.enum([
          "financial_forensics",
          "physical_surveillance",
          "legal_analysis",
          "behavioral_pattern",
          "supply_chain",
        ]),
        pteConfidenceScore: z.number().min(0).max(1).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const profile = await db.getOrCreateShadowAnalystProfile(ctx.user.id);
      const level = (profile?.analystLevel ?? "1") as "1" | "2" | "3";

      return db.createGhostAudit({
        initiatedBy: ctx.user.id,
        auditTitle: input.auditTitle,
        targetEntity: input.targetEntity,
        auditType: input.auditType,
        pteConfidenceScore: input.pteConfidenceScore,
        analystLevel: level,
      });
    }),

  // Get all Ghost Audits for the current user
  getMyAudits: protectedProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ input, ctx }) => {
      return db.getGhostAuditsByUser(ctx.user.id, input.limit);
    }),

  // Get a single Ghost Audit by ID
  getAuditById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const audit = await db.getGhostAuditById(input.id);
      if (!audit) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ghost Audit not found" });
      }
      if (audit.initiatedBy !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }
      return audit;
    }),

  // Submit findings and advance audit status
  submitAuditFindings: protectedProcedure
    .input(
      z.object({
        auditId: z.number(),
        findings: z.string().min(10),
        evidenceUrls: z.array(z.string()).optional(),
        newStatus: z.enum(["active", "synthesizing", "complete"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const audit = await db.getGhostAuditById(input.auditId);
      if (!audit) throw new TRPCError({ code: "NOT_FOUND", message: "Audit not found" });
      if (audit.initiatedBy !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });

      const updates: Parameters<typeof db.updateGhostAudit>[1] = {
        findings: input.findings,
        evidenceUrls: input.evidenceUrls,
        status: input.newStatus,
      };
      if (input.newStatus === "complete") {
        updates.completedAt = new Date();
      }

      return db.updateGhostAudit(input.auditId, updates);
    }),

  // Publish a completed Ghost Audit to the Shadow Black Book
  publishToBlackBook: protectedProcedure
    .input(
      z.object({
        auditId: z.number(),
        title: z.string().min(5).max(255),
        redactionStatus: z.enum(["public", "restricted", "classified"]).default("public"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const audit = await db.getGhostAuditById(input.auditId);
      if (!audit) throw new TRPCError({ code: "NOT_FOUND", message: "Audit not found" });
      if (audit.initiatedBy !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
      if (audit.status !== "complete") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Only completed audits can be published" });
      }
      if (audit.publishedToBlackBook) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Already published to Black Book" });
      }

      const profile = await db.getOrCreateShadowAnalystProfile(ctx.user.id);
      const level = (profile?.analystLevel ?? "1") as "1" | "2" | "3";

      const previousHash = await db.getLatestBlackBookHash();
      const entryHash = generateSignature({
        auditId: input.auditId,
        contributorId: ctx.user.id,
        content: audit.findings ?? "",
        previousHash: previousHash ?? "GENESIS",
        timestamp: Date.now(),
      });

      const entry = await db.createBlackBookEntry({
        auditId: input.auditId,
        contributorId: ctx.user.id,
        entryHash,
        previousHash: previousHash ?? "GENESIS",
        title: input.title,
        content: audit.findings ?? "",
        evidenceUrls: Array.isArray(audit.evidenceUrls) ? audit.evidenceUrls as string[] : [],
        verificationLevel: level,
        redactionStatus: input.redactionStatus,
      });

      await db.updateGhostAudit(input.auditId, { publishedToBlackBook: true });

      // Award Truth Credits for publishing
      const sig = generateSignature({ userId: ctx.user.id, action: "blackbook_publish", timestamp: Date.now() });
      await db.recordTruthCreditTransaction({
        userId: ctx.user.id,
        transactionType: "earn_mission",
        amount: 500 * parseInt(level),
        reason: `Published Ghost Audit to the Shadow Black Book: ${input.title}`,
        cryptographicSignature: sig,
      });

      return entry;
    }),

  // Get Black Book entries (public ledger)
  getBlackBook: publicProcedure
    .input(z.object({ limit: z.number().default(20), offset: z.number().default(0) }))
    .query(async ({ input }) => {
      return db.getBlackBookEntries(input.limit, input.offset, "public");
    }),

  // Upvote a Black Book entry (consensus mechanism)
  upvoteBlackBookEntry: protectedProcedure
    .input(z.object({ entryId: z.number() }))
    .mutation(async ({ input }) => {
      await db.upvoteBlackBookEntry(input.entryId);
      return { success: true };
    }),

  // Record a "Soul Saved" acknowledgment (Level 3 only: victim-centered reward)
  recordSoulSaved: protectedProcedure.mutation(async ({ ctx }) => {
    const profile = await db.getOrCreateShadowAnalystProfile(ctx.user.id);
    if (!profile || profile.analystLevel !== "3") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only Level 3 Shadow Analysts receive Souls Saved acknowledgments",
      });
    }

    await db.incrementAnalystStat(ctx.user.id, "soulsSaved");

    const sig = generateSignature({ userId: ctx.user.id, action: "soul_saved", timestamp: Date.now() });
    await db.recordTruthCreditTransaction({
      userId: ctx.user.id,
      transactionType: "earn_mission",
      amount: 2000,
      reason: "Soul Saved — your verification led to a successful rescue",
      cryptographicSignature: sig,
    });
    await db.awardBadge(ctx.user.id, `souls_saved_${(profile.soulsSaved ?? 0) + 1}`, "A life was changed because of your work");

    return { success: true };
  }),
});

// ============================================================================
// TERRITORIES ROUTER
// ============================================================================

const territoriesRouter = router({
  getNearby: protectedProcedure
    .input(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
        radiusKm: z.number().default(10),
      })
    )
    .query(async ({ input }) => {
      return db.getTerritoriesNearby(
        input.latitude,
        input.longitude,
        input.radiusKm
      );
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const territory = await db.getTerritoryById(input.id);
      if (!territory) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Territory not found" });
      }
      return territory;
    }),

  getLeaderboard: publicProcedure
    .query(async () => {
      return db.getTerritoryLeaderboard();
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
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  missions: missionRouter,
  verification: verificationRouter,
  truthCredits: truthCreditsRouter,
  anomaly: anomalyRouter,
  realityStream: realityStreamRouter,
  profile: profileRouter,
  territories: territoriesRouter,
  shadowCorps: shadowCorpsRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
