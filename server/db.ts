import { eq, and, desc, asc, gte, lte, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  missions,
  magicMoments,
  truthCreditLedger,
  anomalies,
  verifications,
  realityStreamPosts,
  badges,
  postComments,
  missionAcceptances,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================================
// USER QUERIES
// ============================================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(
  userId: number,
  data: {
    name?: string;
    email?: string;
    locationLatitude?: number;
    locationLongitude?: number;
  }
) {
  const db = await getDb();
  if (!db) return undefined;

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.locationLatitude !== undefined)
    updateData.locationLatitude = data.locationLatitude;
  if (data.locationLongitude !== undefined)
    updateData.locationLongitude = data.locationLongitude;
  if (Object.keys(updateData).length > 0) {
    updateData.locationUpdatedAt = new Date();
  }

  await db.update(users).set(updateData).where(eq(users.id, userId));

  return getUserById(userId);
}

export async function getLeaderboard(
  type: "global" | "local" | "seasonal",
  limit = 100,
  latitude?: number,
  longitude?: number
) {
  const db = await getDb();
  if (!db) return [];

  let whereConditions = undefined;

  if (type === "local" && latitude && longitude) {
    // For local leaderboard, filter by proximity (roughly 10km radius)
    whereConditions = and(
      gte(users.locationLatitude, sql`${latitude - 0.1}`),
      lte(users.locationLatitude, sql`${latitude + 0.1}`),
      gte(users.locationLongitude, sql`${longitude - 0.1}`),
      lte(users.locationLongitude, sql`${longitude + 0.1}`)
    );
  }

  if (whereConditions) {
    return db
      .select({
        id: users.id,
        name: users.name,
        totalTruthCredits: users.totalTruthCredits,
        experiencePoints: users.experiencePoints,
        shadowCorpsTier: users.shadowCorpsTier,
      })
      .from(users)
      .where(whereConditions)
      .orderBy(desc(users.totalTruthCredits))
      .limit(limit);
  }

  return db
    .select({
      id: users.id,
      name: users.name,
      totalTruthCredits: users.totalTruthCredits,
      experiencePoints: users.experiencePoints,
      shadowCorpsTier: users.shadowCorpsTier,
    })
    .from(users)
    .orderBy(desc(users.totalTruthCredits))
    .limit(limit);
}

// ============================================================================
// MISSION QUERIES
// ============================================================================

export async function createMission(data: {
  title: string;
  description: string;
  missionType:
    | "infrastructure"
    | "environmental"
    | "civic"
    | "social"
    | "emergency";
  difficulty: "easy" | "medium" | "hard" | "expert";
  locationLatitude: number;
  locationLongitude: number;
  locationRadiusMeters: number;
  rewardTruthCredits: number;
  rewardXp: number;
  validationCriteria: string;
  createdBy: number;
  deadlineAt?: Date;
}) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(missions).values({
    title: data.title,
    description: data.description,
    missionType: data.missionType as any,
    difficulty: data.difficulty as any,
    locationLatitude: sql`${data.locationLatitude}`,
    locationLongitude: sql`${data.locationLongitude}`,
    locationRadiusMeters: data.locationRadiusMeters,
    rewardTruthCredits: data.rewardTruthCredits,
    rewardXp: data.rewardXp,
    validationCriteria: data.validationCriteria,
    createdBy: data.createdBy,
    deadlineAt: data.deadlineAt,
  });
  return result;
}

export async function getMissionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(missions)
    .where(eq(missions.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getMissionsNearby(
  latitude: number,
  longitude: number,
  radiusKm = 5,
  difficulty?: string,
  missionType?: string
) {
  const db = await getDb();
  if (!db) return [];

  const radiusDegrees = radiusKm / 111; // Rough conversion: 1 degree ≈ 111km

  let whereConditions = and(
    eq(missions.status, "active"),
    gte(missions.locationLatitude, sql`${latitude - radiusDegrees}`),
    lte(missions.locationLatitude, sql`${latitude + radiusDegrees}`),
    gte(missions.locationLongitude, sql`${longitude - radiusDegrees}`),
    lte(missions.locationLongitude, sql`${longitude + radiusDegrees}`)
  );

  if (difficulty) {
    whereConditions = and(whereConditions, eq(missions.difficulty, difficulty as any));
  }
  if (missionType) {
    whereConditions = and(whereConditions, eq(missions.missionType, missionType as any));
  }

  return db
    .select()
    .from(missions)
    .where(whereConditions)
    .orderBy(asc(missions.createdAt));
}

export async function updateMissionStatus(
  missionId: number,
  status: "active" | "completed" | "expired" | "archived"
) {
  const db = await getDb();
  if (!db) return undefined;

  await db.update(missions).set({ status }).where(eq(missions.id, missionId));

  return getMissionById(missionId);
}

// ============================================================================
// MAGIC MOMENT QUERIES
// ============================================================================

export async function createMagicMoment(data: {
  userId: number;
  missionId?: number;
  anomalyId?: number;
  photoUrl?: string;
  videoUrl?: string;
  description?: string;
  locationLatitude: number;
  locationLongitude: number;
  timestampCaptured: Date;
  cryptographicSignature: string;
}) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(magicMoments).values({
    userId: data.userId,
    missionId: data.missionId,
    anomalyId: data.anomalyId,
    photoUrl: data.photoUrl,
    videoUrl: data.videoUrl,
    description: data.description,
    locationLatitude: sql`${data.locationLatitude}`,
    locationLongitude: sql`${data.locationLongitude}`,
    timestampCaptured: data.timestampCaptured,
    cryptographicSignature: data.cryptographicSignature,
  });
  return result;
}

export async function getMagicMomentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(magicMoments)
    .where(eq(magicMoments.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getPendingMagicMoments(limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(magicMoments)
    .where(eq(magicMoments.verificationStatus, "pending" as any))
    .orderBy(desc(magicMoments.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function updateMagicMomentStatus(
  id: number,
  status: "pending" | "approved" | "rejected" | "disputed",
  truthScore?: number
) {
  const db = await getDb();
  if (!db) return undefined;

  const updateData: Record<string, unknown> = { verificationStatus: status };
  if (truthScore !== undefined) updateData.truthScore = truthScore;

  await db
    .update(magicMoments)
    .set(updateData)
    .where(eq(magicMoments.id, id));

  return getMagicMomentById(id);
}

// ============================================================================
// TRUTH CREDIT LEDGER QUERIES
// ============================================================================

export async function recordTruthCreditTransaction(data: {
  userId: number;
  transactionType:
    | "earn_mission"
    | "earn_verification"
    | "earn_upvote"
    | "redeem"
    | "transfer"
    | "admin_adjustment";
  amount: number;
  reason?: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
  cryptographicSignature: string;
}) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(truthCreditLedger).values(data);

  // Update user's total Truth Credits
  const user = await getUserById(data.userId);
  if (user) {
    const ledgerEntries = await db
      .select({ amount: truthCreditLedger.amount })
      .from(truthCreditLedger)
      .where(eq(truthCreditLedger.userId, data.userId));

    const total = ledgerEntries.reduce((sum, entry) => sum + entry.amount, 0);
    await db
      .update(users)
      .set({ totalTruthCredits: Math.max(0, total) })
      .where(eq(users.id, data.userId));
  }

  return result;
}

export async function getTruthCreditBalance(userId: number) {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({ amount: truthCreditLedger.amount })
    .from(truthCreditLedger)
    .where(eq(truthCreditLedger.userId, userId));

  return result.reduce((sum, entry) => sum + entry.amount, 0);
}

export async function getTruthCreditLedger(
  userId: number,
  limit = 50,
  offset = 0
) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(truthCreditLedger)
    .where(eq(truthCreditLedger.userId, userId))
    .orderBy(desc(truthCreditLedger.timestamp))
    .limit(limit)
    .offset(offset);
}

// ============================================================================
// ANOMALY QUERIES
// ============================================================================

export async function createAnomaly(data: {
  anomalyType:
    | "infrastructure_damage"
    | "environmental_hazard"
    | "civic_issue"
    | "data_discrepancy"
    | "emergency";
  priority: "low" | "medium" | "high" | "critical";
  locationLatitude: number;
  locationLongitude: number;
  description: string;
  nadeConfidenceScore?: number;
}) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(anomalies).values({
    anomalyType: data.anomalyType as any,
    priority: data.priority as any,
    locationLatitude: sql`${data.locationLatitude}`,
    locationLongitude: sql`${data.locationLongitude}`,
    description: data.description,
    nadeConfidenceScore: data.nadeConfidenceScore ? sql`${data.nadeConfidenceScore}` : undefined,
  });
  return result;
}

export async function getAnomalyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(anomalies)
    .where(eq(anomalies.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAnomaliesNearby(
  latitude: number,
  longitude: number,
  radiusKm = 5,
  priority?: string
) {
  const db = await getDb();
  if (!db) return [];

  const radiusDegrees = radiusKm / 111;

  let whereConditions = and(
    eq(anomalies.status, "active"),
    gte(anomalies.locationLatitude, sql`${latitude - radiusDegrees}`),
    lte(anomalies.locationLatitude, sql`${latitude + radiusDegrees}`),
    gte(anomalies.locationLongitude, sql`${longitude - radiusDegrees}`),
    lte(anomalies.locationLongitude, sql`${longitude + radiusDegrees}`)
  );

  if (priority) {
    whereConditions = and(whereConditions, eq(anomalies.priority, priority as any));
  }

  return db
    .select()
    .from(anomalies)
    .where(whereConditions)
    .orderBy(desc(anomalies.nadeConfidenceScore));
}

export async function updateAnomalyStatus(
  id: number,
  status: "active" | "investigating" | "resolved" | "false_positive"
) {
  const db = await getDb();
  if (!db) return undefined;

  const updateData: Record<string, unknown> = { status };
  if (status === "resolved") {
    updateData.resolvedAt = new Date();
  }

  await db.update(anomalies).set(updateData).where(eq(anomalies.id, id));

  return getAnomalyById(id);
}

// ============================================================================
// VERIFICATION QUERIES
// ============================================================================

export async function createVerification(data: {
  magicMomentId: number;
  validatorId: number;
  verdict: "approved" | "rejected" | "needs_review";
  reasoning?: string;
}) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(verifications).values(data);
  return result;
}

export async function getVerificationsForMagicMoment(magicMomentId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(verifications)
    .where(eq(verifications.magicMomentId, magicMomentId));
}

// ============================================================================
// REALITY STREAM QUERIES
// ============================================================================

export async function createRealityStreamPost(data: {
  userId: number;
  content: string;
  mediaUrls?: string[];
}) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(realityStreamPosts).values({
    userId: data.userId,
    content: data.content,
    mediaUrls: data.mediaUrls ? JSON.stringify(data.mediaUrls) : null,
  });

  return result;
}

export async function getRealityStreamFeed(
  limit = 20,
  offset = 0,
  sort: "recent" | "trending" | "verified" = "recent"
) {
  const db = await getDb();
  if (!db) return [];

  if (sort === "recent") {
    return db
      .select()
      .from(realityStreamPosts)
      .orderBy(desc(realityStreamPosts.createdAt))
      .limit(limit)
      .offset(offset);
  } else if (sort === "trending") {
    return db
      .select()
      .from(realityStreamPosts)
      .orderBy(desc(realityStreamPosts.upvotes))
      .limit(limit)
      .offset(offset);
  } else if (sort === "verified") {
    return db
      .select()
      .from(realityStreamPosts)
      .where(eq(realityStreamPosts.verificationStatus, "verified"))
      .orderBy(desc(realityStreamPosts.truthScore))
      .limit(limit)
      .offset(offset);
  }

  return [];
}

export async function updatePostUpvotes(postId: number, increment = 1) {
  const db = await getDb();
  if (!db) return undefined;

  await db
    .update(realityStreamPosts)
    .set({
      upvotes: sql`upvotes + ${increment}`,
    })
    .where(eq(realityStreamPosts.id, postId));
}

// ============================================================================
// BADGE QUERIES
// ============================================================================

export async function awardBadge(
  userId: number,
  badgeType: string,
  description?: string
) {
  const db = await getDb();
  if (!db) return undefined;

  // Check if user already has this badge
  const existing = await db
    .select()
    .from(badges)
    .where(
      and(eq(badges.userId, userId), eq(badges.badgeType, badgeType))
    )
    .limit(1);

  if (existing.length > 0) {
    return existing[0]; // Already has badge
  }

  const result = await db.insert(badges).values({
    userId,
    badgeType,
    description,
  });

  return result;
}

export async function getUserBadges(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(badges).where(eq(badges.userId, userId));
}

// ============================================================================
// MISSION ACCEPTANCE QUERIES
// ============================================================================

export async function acceptMission(userId: number, missionId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(missionAcceptances).values({
    userId,
    missionId,
  });

  return result;
}

export async function getUserActiveMissions(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(missionAcceptances)
    .where(
      and(
        eq(missionAcceptances.userId, userId),
        eq(missionAcceptances.status, "in_progress")
      )
    );
}

export async function completeMission(
  userId: number,
  missionId: number,
  magicMomentId: number
) {
  const db = await getDb();
  if (!db) return undefined;

  // Update mission acceptance
  await db
    .update(missionAcceptances)
    .set({
      status: "completed",
      completedAt: new Date(),
    })
    .where(
      and(
        eq(missionAcceptances.userId, userId),
        eq(missionAcceptances.missionId, missionId)
      )
    );

  // Get mission details for rewards
  const mission = await getMissionById(missionId);
  if (mission) {
    // Award Truth Credits
    await recordTruthCreditTransaction({
      userId,
      transactionType: "earn_mission",
      amount: mission.rewardTruthCredits,
      reason: `Completed mission: ${mission.title}`,
      relatedEntityType: "mission",
      relatedEntityId: missionId,
      cryptographicSignature: "", // Will be set by caller
    });

    // Award XP
    const user = await getUserById(userId);
    if (user) {
      await db
        .update(users)
        .set({
          experiencePoints: user.experiencePoints + mission.rewardXp,
        })
        .where(eq(users.id, userId));
    }
  }
}

// ============================================================================
// COMMENT QUERIES
// ============================================================================

export async function createComment(
  postId: number,
  userId: number,
  content: string
) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(postComments).values({
    postId,
    userId,
    content,
  });

  return result;
}

export async function getPostComments(postId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(postComments)
    .where(eq(postComments.postId, postId))
    .orderBy(asc(postComments.createdAt));
}


// ============================================================================
// TERRITORY QUERIES
// ============================================================================

export async function getTerritoriesNearby(
  latitude: number,
  longitude: number,
  radiusKm: number = 10
) {
  const db = await getDb();
  if (!db) return [];
  
  // Simple distance calculation (in real app, use proper geospatial queries)
  // For now, return empty array as territories table doesn't exist yet
  return [];
}

export async function getTerritoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  // Return undefined as territories table doesn't exist yet
  return undefined;
}

export async function getTerritoryLeaderboard() {
  const db = await getDb();
  if (!db) return [];
  
  // Return empty array as territories table doesn't exist yet
  return [];
}
