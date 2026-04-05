import { decimal, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with Shadow Corps progression and geolocation fields.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  shadowCorpsTier: mysqlEnum("shadowCorpsTier", ["recruit", "analyst", "sentinel", "architect", "witness"]).default("recruit").notNull(),
  experiencePoints: int("experiencePoints").default(0).notNull(),
  totalTruthCredits: int("totalTruthCredits").default(0).notNull(),
  locationLatitude: decimal("locationLatitude", { precision: 10, scale: 8 }),
  locationLongitude: decimal("locationLongitude", { precision: 11, scale: 8 }),
  locationUpdatedAt: timestamp("locationUpdatedAt"),
  oathTaken: int("oathTaken").default(0).notNull(),
  oathTakenAt: timestamp("oathTakenAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Missions: Verification tasks with location, difficulty, and rewards
 */
export const missions = mysqlTable("missions", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  missionType: mysqlEnum("missionType", ["infrastructure", "environmental", "civic", "social", "emergency"]).notNull(),
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard", "expert"]).default("medium").notNull(),
  locationLatitude: decimal("locationLatitude", { precision: 10, scale: 8 }).notNull(),
  locationLongitude: decimal("locationLongitude", { precision: 11, scale: 8 }).notNull(),
  locationRadiusMeters: int("locationRadiusMeters").default(100).notNull(),
  rewardTruthCredits: int("rewardTruthCredits").notNull(),
  rewardXp: int("rewardXp").notNull(),
  validationCriteria: text("validationCriteria").notNull(),
  deadlineAt: timestamp("deadlineAt"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  status: mysqlEnum("status", ["active", "completed", "expired", "archived"]).default("active").notNull(),
}, (table) => ({
  createdByIdx: index("idx_created_by").on(table.createdBy),
  statusIdx: index("idx_status").on(table.status),
  locationIdx: index("idx_location").on(table.locationLatitude, table.locationLongitude),
}));

export type Mission = typeof missions.$inferSelect;
export type InsertMission = typeof missions.$inferInsert;

/**
 * Magic Moments: 15-second verified documentation of reality
 */
export const magicMoments = mysqlTable("magic_moments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  missionId: int("missionId"),
  anomalyId: int("anomalyId"),
  photoUrl: varchar("photoUrl", { length: 512 }),
  videoUrl: varchar("videoUrl", { length: 512 }),
  description: text("description"),
  locationLatitude: decimal("locationLatitude", { precision: 10, scale: 8 }).notNull(),
  locationLongitude: decimal("locationLongitude", { precision: 11, scale: 8 }).notNull(),
  timestampCaptured: timestamp("timestampCaptured").notNull(),
  cryptographicSignature: varchar("cryptographicSignature", { length: 512 }).notNull(),
  verificationStatus: mysqlEnum("verificationStatus", ["pending", "approved", "rejected", "disputed"]).default("pending").notNull(),
  truthScore: decimal("truthScore", { precision: 3, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userCreatedIdx: index("idx_user_created").on(table.userId, table.createdAt),
  locationIdx: index("idx_mm_location").on(table.locationLatitude, table.locationLongitude),
  verificationStatusIdx: index("idx_verification_status").on(table.verificationStatus),
}));

export type MagicMoment = typeof magicMoments.$inferSelect;
export type InsertMagicMoment = typeof magicMoments.$inferInsert;

/**
 * Truth Credit Ledger: Immutable record of all transactions
 */
export const truthCreditLedger = mysqlTable("truth_credit_ledger", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  transactionType: mysqlEnum("transactionType", ["earn_mission", "earn_verification", "earn_upvote", "redeem", "transfer", "admin_adjustment"]).notNull(),
  amount: int("amount").notNull(),
  reason: varchar("reason", { length: 255 }),
  relatedEntityType: varchar("relatedEntityType", { length: 50 }),
  relatedEntityId: int("relatedEntityId"),
  cryptographicSignature: varchar("cryptographicSignature", { length: 512 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
  userTimestampIdx: index("idx_user_timestamp").on(table.userId, table.timestamp),
  transactionTypeIdx: index("idx_transaction_type").on(table.transactionType),
}));

export type TruthCreditLedgerEntry = typeof truthCreditLedger.$inferSelect;
export type InsertTruthCreditLedgerEntry = typeof truthCreditLedger.$inferInsert;

/**
 * Anomalies: Detected deviations from expected reality
 */
export const anomalies = mysqlTable("anomalies", {
  id: int("id").autoincrement().primaryKey(),
  anomalyType: mysqlEnum("anomalyType", ["infrastructure_damage", "environmental_hazard", "civic_issue", "data_discrepancy", "emergency"]).notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  locationLatitude: decimal("locationLatitude", { precision: 10, scale: 8 }).notNull(),
  locationLongitude: decimal("locationLongitude", { precision: 11, scale: 8 }).notNull(),
  description: text("description").notNull(),
  nadeConfidenceScore: decimal("nadeConfidenceScore", { precision: 3, scale: 2 }),
  status: mysqlEnum("status", ["active", "investigating", "resolved", "false_positive"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
}, (table) => ({
  priorityStatusIdx: index("idx_priority_status").on(table.priority, table.status),
  locationIdx: index("idx_anomaly_location").on(table.locationLatitude, table.locationLongitude),
}));

export type Anomaly = typeof anomalies.$inferSelect;
export type InsertAnomaly = typeof anomalies.$inferInsert;

/**
 * Verifications: Community validation of Magic Moments
 */
export const verifications = mysqlTable("verifications", {
  id: int("id").autoincrement().primaryKey(),
  magicMomentId: int("magicMomentId").notNull(),
  validatorId: int("validatorId").notNull(),
  verdict: mysqlEnum("verdict", ["approved", "rejected", "needs_review"]).notNull(),
  reasoning: text("reasoning"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
  magicMomentIdx: index("idx_magic_moment").on(table.magicMomentId),
  validatorIdx: index("idx_validator").on(table.validatorId),
}));

export type Verification = typeof verifications.$inferSelect;
export type InsertVerification = typeof verifications.$inferInsert;

/**
 * Reality Stream Posts: Social feed with community-verified content
 */
export const realityStreamPosts = mysqlTable("reality_stream_posts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  content: text("content").notNull(),
  mediaUrls: json("mediaUrls"),
  truthScore: decimal("truthScore", { precision: 3, scale: 2 }).default("0").notNull(),
  upvotes: int("upvotes").default(0).notNull(),
  downvotes: int("downvotes").default(0).notNull(),
  verificationStatus: mysqlEnum("verificationStatus", ["unverified", "verified", "disputed"]).default("unverified").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userCreatedIdx: index("idx_post_user_created").on(table.userId, table.createdAt),
  truthScoreIdx: index("idx_truth_score").on(table.truthScore),
}));

export type RealityStreamPost = typeof realityStreamPosts.$inferSelect;
export type InsertRealityStreamPost = typeof realityStreamPosts.$inferInsert;

/**
 * Badges: Achievement recognition for milestones
 */
export const badges = mysqlTable("badges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  badgeType: varchar("badgeType", { length: 100 }).notNull(),
  description: text("description"),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
}, (table) => ({
  userBadgeIdx: index("idx_user_badge").on(table.userId, table.badgeType),
}));

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;

/**
 * Post Comments: Comments on Reality Stream posts
 */
export const postComments = mysqlTable("post_comments", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  userId: int("userId").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  postIdx: index("idx_post_id").on(table.postId),
  userIdx: index("idx_comment_user").on(table.userId),
}));

export type PostComment = typeof postComments.$inferSelect;
export type InsertPostComment = typeof postComments.$inferInsert;

/**
 * Mission Acceptances: Track which users have accepted which missions
 */
export const missionAcceptances = mysqlTable("mission_acceptances", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  missionId: int("missionId").notNull(),
  acceptedAt: timestamp("acceptedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  status: mysqlEnum("status", ["in_progress", "completed", "abandoned", "expired"]).default("in_progress").notNull(),
}, (table) => ({
  userMissionIdx: index("idx_user_mission").on(table.userId, table.missionId),
  statusIdx: index("idx_acceptance_status").on(table.status),
}));

export type MissionAcceptance = typeof missionAcceptances.$inferSelect;
export type InsertMissionAcceptance = typeof missionAcceptances.$inferInsert;

/**
 * Factions: ECO, DATA, TECH, SHADOW
 */
export const factions = mysqlTable("factions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  color: varchar("color", { length: 7 }).notNull(), // Hex color
  icon: varchar("icon", { length: 255 }),
  memberCount: int("memberCount").default(0).notNull(),
  totalSignalStrength: int("totalSignalStrength").default(0).notNull(),
  territoriesControlled: int("territoriesControlled").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Faction = typeof factions.$inferSelect;
export type InsertFaction = typeof factions.$inferInsert;

/**
 * User Faction Membership
 */
export const userFactionMemberships = mysqlTable("user_faction_memberships", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  factionId: int("factionId").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  signalStrength: int("signalStrength").default(0).notNull(),
  factionRank: varchar("factionRank", { length: 100 }).default("member").notNull(),
}, (table) => ({
  userFactionIdx: index("idx_user_faction").on(table.userId, table.factionId),
}));

export type UserFactionMembership = typeof userFactionMemberships.$inferSelect;
export type InsertUserFactionMembership = typeof userFactionMemberships.$inferInsert;

/**
 * Territories: Hexagonal grid or quadtree cells for faction control
 */
export const territories = mysqlTable("territories", {
  id: int("id").autoincrement().primaryKey(),
  gridId: varchar("gridId", { length: 100 }).notNull().unique(), // Hex ID or quadtree key
  centerLatitude: decimal("centerLatitude", { precision: 10, scale: 8 }).notNull(),
  centerLongitude: decimal("centerLongitude", { precision: 11, scale: 8 }).notNull(),
  radiusMeters: int("radiusMeters").default(500).notNull(),
  controllingFactionId: int("controllingFactionId"),
  signalStrengthEco: int("signalStrengthEco").default(0).notNull(),
  signalStrengthData: int("signalStrengthData").default(0).notNull(),
  signalStrengthTech: int("signalStrengthTech").default(0).notNull(),
  signalStrengthShadow: int("signalStrengthShadow").default(0).notNull(),
  capturePointsRequired: int("capturePointsRequired").default(100).notNull(),
  lastCapturedAt: timestamp("lastCapturedAt"),
  lastCapturedBy: int("lastCapturedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  gridIdIdx: index("idx_grid_id").on(table.gridId),
  factionIdx: index("idx_controlling_faction").on(table.controllingFactionId),
  locationIdx: index("idx_territory_location").on(table.centerLatitude, table.centerLongitude),
}));

export type Territory = typeof territories.$inferSelect;
export type InsertTerritory = typeof territories.$inferInsert;

/**
 * Territory Capture History: Track all capture events
 */
export const territoryCaptureHistory = mysqlTable("territory_capture_history", {
  id: int("id").autoincrement().primaryKey(),
  territoryId: int("territoryId").notNull(),
  previousFactionId: int("previousFactionId"),
  newFactionId: int("newFactionId").notNull(),
  capturedBy: int("capturedBy").notNull(),
  signalStrengthUsed: int("signalStrengthUsed").notNull(),
  capturedAt: timestamp("capturedAt").defaultNow().notNull(),
}, (table) => ({
  territoryIdx: index("idx_territory_capture").on(table.territoryId),
  factionIdx: index("idx_capture_faction").on(table.newFactionId),
}));

export type TerritoryCaptureHistory = typeof territoryCaptureHistory.$inferSelect;
export type InsertTerritoryCaptureHistory = typeof territoryCaptureHistory.$inferInsert;

/**
 * Signal Strength Ledger: Track signal strength gains and transfers
 */
export const signalStrengthLedger = mysqlTable("signal_strength_ledger", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  factionId: int("factionId").notNull(),
  transactionType: mysqlEnum("transactionType", ["mission_complete", "verification", "territory_capture", "territory_defense", "transfer", "admin_adjustment"]).notNull(),
  amount: int("amount").notNull(),
  reason: varchar("reason", { length: 255 }),
  relatedEntityType: varchar("relatedEntityType", { length: 50 }),
  relatedEntityId: int("relatedEntityId"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
  userFactionIdx: index("idx_signal_user_faction").on(table.userId, table.factionId),
  transactionTypeIdx: index("idx_signal_transaction").on(table.transactionType),
}));

export type SignalStrengthLedger = typeof signalStrengthLedger.$inferSelect;
export type InsertSignalStrengthLedger = typeof signalStrengthLedger.$inferInsert;