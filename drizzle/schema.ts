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
  chosenFaction: mysqlEnum("chosenFaction", ["eco", "data", "tech", "shadow"]),
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
 * Territories: Geographic regions controlled by different factions
 */
export const territories = mysqlTable("territories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  faction: mysqlEnum("faction", ["truth_seekers", "reality_architects", "shadow_corps", "neutral"]).default("neutral").notNull(),
  centerLatitude: decimal("centerLatitude", { precision: 10, scale: 8 }).notNull(),
  centerLongitude: decimal("centerLongitude", { precision: 11, scale: 8 }).notNull(),
  radiusMeters: int("radiusMeters").default(1000).notNull(),
  signalStrength: int("signalStrength").default(50).notNull(), // 0-100
  memberCount: int("memberCount").default(0).notNull(),
  controlledSince: timestamp("controlledSince").defaultNow().notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  factionIdx: index("idx_faction").on(table.faction),
  locationIdx: index("idx_territory_location").on(table.centerLatitude, table.centerLongitude),
  signalIdx: index("idx_signal_strength").on(table.signalStrength),
}));

export type Territory = typeof territories.$inferSelect;
export type InsertTerritory = typeof territories.$inferInsert;

/**
 * Territory Capture Events: Records each signal-shifting action in a territory.
 * Tracks faction warfare and determines flip events.
 */
export const territoryCaptureEvents = mysqlTable("territory_capture_events", {
  id: int("id").autoincrement().primaryKey(),
  territoryId: int("territoryId").notNull(),
  userId: int("userId").notNull(),
  faction: mysqlEnum("faction", ["truth_seekers", "reality_architects", "shadow_corps", "neutral"]).notNull(),
  capturePoints: int("capturePoints").default(10).notNull(),
  signalBefore: int("signalBefore").notNull(),
  signalAfter: int("signalAfter").notNull(),
  eventType: mysqlEnum("eventType", ["reinforce", "contest", "flip", "decay"]).default("reinforce").notNull(),
  capturedAt: timestamp("capturedAt").defaultNow().notNull(),
}, (table) => ({
  territoryIdx: index("idx_capture_territory").on(table.territoryId),
  userIdx: index("idx_capture_user").on(table.userId),
  factionIdx: index("idx_capture_faction").on(table.faction),
  timeIdx: index("idx_capture_time").on(table.capturedAt),
}));

export type TerritoryCaptureEvent = typeof territoryCaptureEvents.$inferSelect;
export type InsertTerritoryCaptureEvent = typeof territoryCaptureEvents.$inferInsert;

/**
 * Reality Anchors: Investigator-placed anomaly detection markers.
 * Used for the Investigator System — detecting identity spoofs, signal rifts, and data fraud.
 */
export const realityAnchors = mysqlTable("reality_anchors", {
  id: int("id").autoincrement().primaryKey(),
  placedBy: int("placedBy").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  anchorType: mysqlEnum("anchorType", [
    "identity_challenge",
    "signal_anomaly",
    "data_inconsistency",
    "reality_fracture",
    "convergence_rift",
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  evidenceUrl: varchar("evidenceUrl", { length: 1024 }),
  confidenceScore: decimal("confidenceScore", { precision: 3, scale: 2 }).default("0.50").notNull(),
  status: mysqlEnum("status", ["active", "investigating", "confirmed", "debunked", "expired"])
    .default("active")
    .notNull(),
  investigatorCount: int("investigatorCount").default(0).notNull(),
  rewardTruthCredits: int("rewardTruthCredits").default(200).notNull(),
  rewardXp: int("rewardXp").default(100).notNull(),
  expiresAt: timestamp("expiresAt"),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  locationIdx: index("idx_anchor_location").on(table.latitude, table.longitude),
  statusIdx: index("idx_anchor_status").on(table.status),
  placedByIdx: index("idx_anchor_placed_by").on(table.placedBy),
}));

export type RealityAnchor = typeof realityAnchors.$inferSelect;
export type InsertRealityAnchor = typeof realityAnchors.$inferInsert;

/**
 * Anchor Investigations: Users contributing to investigating a Reality Anchor.
 */
export const anchorInvestigations = mysqlTable("anchor_investigations", {
  id: int("id").autoincrement().primaryKey(),
  anchorId: int("anchorId").notNull(),
  userId: int("userId").notNull(),
  verdict: mysqlEnum("verdict", ["confirmed", "debunked", "inconclusive"]),
  notes: text("notes"),
  evidenceUrl: varchar("evidenceUrl", { length: 1024 }),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  verdictAt: timestamp("verdictAt"),
}, (table) => ({
  anchorIdx: index("idx_investigation_anchor").on(table.anchorId),
  userIdx: index("idx_investigation_user").on(table.userId),
}));

export type AnchorInvestigation = typeof anchorInvestigations.$inferSelect;
export type InsertAnchorInvestigation = typeof anchorInvestigations.$inferInsert;

// ============================================================================
// BATTLE SYSTEM TABLES
// ============================================================================

/**
 * Squads: Faction-aligned operative teams for coordinated territory assaults.
 */
export const squads = mysqlTable("squads", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 60 }).notNull(),
  tag: varchar("tag", { length: 6 }).notNull(),
  faction: mysqlEnum("faction", ["truth_seekers", "reality_architects", "shadow_corps", "neutral"]).notNull(),
  leaderId: int("leaderId").notNull(),
  memberCount: int("memberCount").default(1).notNull(),
  totalCapturePoints: int("totalCapturePoints").default(0).notNull(),
  totalFlips: int("totalFlips").default(0).notNull(),
  wins: int("wins").default(0).notNull(),
  losses: int("losses").default(0).notNull(),
  bio: text("bio"),
  emblem: varchar("emblem", { length: 4 }).default("⚔"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  tagIdx: index("idx_squad_tag").on(table.tag),
  factionIdx: index("idx_squad_faction").on(table.faction),
  leaderIdx: index("idx_squad_leader").on(table.leaderId),
}));

export type Squad = typeof squads.$inferSelect;
export type InsertSquad = typeof squads.$inferInsert;

export const squadMembers = mysqlTable("squad_members", {
  id: int("id").autoincrement().primaryKey(),
  squadId: int("squadId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["leader", "officer", "member"]).default("member").notNull(),
  capturePointsContributed: int("capturePointsContributed").default(0).notNull(),
  flipsContributed: int("flipsContributed").default(0).notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
}, (table) => ({
  uniqueMember: index("idx_squad_member_unique").on(table.squadId, table.userId),
  userIdx: index("idx_squad_member_user").on(table.userId),
}));

export type SquadMember = typeof squadMembers.$inferSelect;
export type InsertSquadMember = typeof squadMembers.$inferInsert;

/**
 * Battle Events: Declared faction assaults on a territory with a live time window.
 * Attacking vs. defending factions accumulate points from capture actions during the window.
 */
export const battleEvents = mysqlTable("battle_events", {
  id: int("id").autoincrement().primaryKey(),
  territoryId: int("territoryId").notNull(),
  initiatedBy: int("initiatedBy").notNull(),
  attackingFaction: mysqlEnum("attackingFaction", ["truth_seekers", "reality_architects", "shadow_corps", "neutral"]).notNull(),
  defendingFaction: mysqlEnum("defendingFaction", ["truth_seekers", "reality_architects", "shadow_corps", "neutral"]).notNull(),
  attackSquadId: int("attackSquadId"),
  defendSquadId: int("defendSquadId"),
  status: mysqlEnum("status", ["pending", "active", "concluded", "cancelled"]).default("pending").notNull(),
  durationMinutes: int("durationMinutes").default(30).notNull(),
  attackPoints: int("attackPoints").default(0).notNull(),
  defendPoints: int("defendPoints").default(0).notNull(),
  attackerCount: int("attackerCount").default(0).notNull(),
  defenderCount: int("defenderCount").default(0).notNull(),
  winnerFaction: mysqlEnum("winnerFaction", ["truth_seekers", "reality_architects", "shadow_corps", "neutral"]),
  tcPot: int("tcPot").default(0).notNull(),
  startedAt: timestamp("startedAt"),
  endsAt: timestamp("endsAt"),
  concludedAt: timestamp("concludedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  territoryIdx: index("idx_battle_territory").on(table.territoryId),
  statusIdx: index("idx_battle_status").on(table.status),
  factionsIdx: index("idx_battle_factions").on(table.attackingFaction, table.defendingFaction),
}));

export type BattleEvent = typeof battleEvents.$inferSelect;
export type InsertBattleEvent = typeof battleEvents.$inferInsert;

export const battleParticipants = mysqlTable("battle_participants", {
  id: int("id").autoincrement().primaryKey(),
  battleId: int("battleId").notNull(),
  userId: int("userId").notNull(),
  faction: mysqlEnum("faction", ["truth_seekers", "reality_architects", "shadow_corps", "neutral"]).notNull(),
  side: mysqlEnum("side", ["attack", "defend"]).notNull(),
  pointsContributed: int("pointsContributed").default(0).notNull(),
  actionsCount: int("actionsCount").default(0).notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
}, (table) => ({
  uniqueParticipant: index("idx_battle_participant_unique").on(table.battleId, table.userId),
  battleIdx: index("idx_battle_participant_battle").on(table.battleId),
  userIdx: index("idx_battle_participant_user").on(table.userId),
}));

export type BattleParticipant = typeof battleParticipants.$inferSelect;
export type InsertBattleParticipant = typeof battleParticipants.$inferInsert;

/**
 * Duels: 1v1 operative challenges with a TC wager on territory control.
 * Whoever accumulates more capture points during the duel window wins.
 */
export const duels = mysqlTable("duels", {
  id: int("id").autoincrement().primaryKey(),
  challengerId: int("challengerId").notNull(),
  challengerFaction: mysqlEnum("challengerFaction", ["truth_seekers", "reality_architects", "shadow_corps", "neutral"]).notNull(),
  defenderId: int("defenderId"),
  defenderFaction: mysqlEnum("defenderFaction", ["truth_seekers", "reality_architects", "shadow_corps", "neutral"]),
  territoryId: int("territoryId").notNull(),
  tcWager: int("tcWager").default(100).notNull(),
  durationMinutes: int("durationMinutes").default(60).notNull(),
  status: mysqlEnum("status", ["open", "accepted", "active", "concluded", "cancelled", "expired"]).default("open").notNull(),
  challengerPoints: int("challengerPoints").default(0).notNull(),
  defenderPoints: int("defenderPoints").default(0).notNull(),
  winnerId: int("winnerId"),
  acceptedAt: timestamp("acceptedAt"),
  startedAt: timestamp("startedAt"),
  endsAt: timestamp("endsAt"),
  concludedAt: timestamp("concludedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  challengerIdx: index("idx_duel_challenger").on(table.challengerId),
  defenderIdx: index("idx_duel_defender").on(table.defenderId),
  territoryIdx: index("idx_duel_territory").on(table.territoryId),
  statusIdx: index("idx_duel_status").on(table.status),
}));

export type Duel = typeof duels.$inferSelect;
export type InsertDuel = typeof duels.$inferInsert;

/**
 * Shadow Analyst Profiles: Extended profiles for Level 1-3 Shadow Corps analysts.
 * Tracks AiTR score, Rep Score, Crucible progress, and mission statistics.
 */
export const shadowAnalystProfiles = mysqlTable("shadow_analyst_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  analystLevel: mysqlEnum("analystLevel", ["1", "2", "3"]).default("1").notNull(),
  aitrScore: decimal("aitrScore", { precision: 5, scale: 2 }).default("0"),
  repScore: decimal("repScore", { precision: 5, scale: 2 }).default("0"),
  zkpCredentialHash: varchar("zkpCredentialHash", { length: 512 }),
  specializations: json("specializations"),
  missionsCompleted: int("missionsCompleted").default(0).notNull(),
  ghostAuditsInitiated: int("ghostAuditsInitiated").default(0).notNull(),
  soulsSaved: int("soulsSaved").default(0).notNull(),
  cruciblePhase: mysqlEnum("cruciblePhase", ["none", "phase_1", "phase_2", "phase_3", "complete"]).default("none").notNull(),
  crucibleStartedAt: timestamp("crucibleStartedAt"),
  crucibleCompletedAt: timestamp("crucibleCompletedAt"),
  psychEvalCompleted: int("psychEvalCompleted").default(0).notNull(),
  technicalCertCompleted: int("technicalCertCompleted").default(0).notNull(),
  immutableOathHash: varchar("immutableOathHash", { length: 512 }),
  oathRenewedAt: timestamp("oathRenewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("idx_analyst_user").on(table.userId),
  levelIdx: index("idx_analyst_level").on(table.analystLevel),
}));

export type ShadowAnalystProfile = typeof shadowAnalystProfiles.$inferSelect;
export type InsertShadowAnalystProfile = typeof shadowAnalystProfiles.$inferInsert;

/**
 * Ghost Audits: Covert intelligence-gathering operations against opaque entities.
 * The constitutional immune system in action — documenting the state's physical footprint.
 */
export const ghostAudits = mysqlTable("ghost_audits", {
  id: int("id").autoincrement().primaryKey(),
  initiatedBy: int("initiatedBy").notNull(),
  auditTitle: varchar("auditTitle", { length: 255 }).notNull(),
  targetEntity: text("targetEntity").notNull(),
  auditType: mysqlEnum("auditType", [
    "financial_forensics",
    "physical_surveillance",
    "legal_analysis",
    "behavioral_pattern",
    "supply_chain",
  ]).notNull(),
  status: mysqlEnum("status", [
    "initiated",
    "active",
    "synthesizing",
    "complete",
    "archived",
  ]).default("initiated").notNull(),
  pteConfidenceScore: decimal("pteConfidenceScore", { precision: 3, scale: 2 }),
  findings: text("findings"),
  evidenceUrls: json("evidenceUrls"),
  publishedToBlackBook: int("publishedToBlackBook").default(0).notNull(),
  analystLevel: mysqlEnum("analystLevel", ["1", "2", "3"]).default("1").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  initiatedByIdx: index("idx_audit_initiated_by").on(table.initiatedBy),
  statusIdx: index("idx_audit_status").on(table.status),
  typeIdx: index("idx_audit_type").on(table.auditType),
}));

export type GhostAudit = typeof ghostAudits.$inferSelect;
export type InsertGhostAudit = typeof ghostAudits.$inferInsert;

/**
 * Shadow Black Book Entries: Immutable, censorship-proof ledger of verified intelligence.
 * Each entry is chained cryptographically — to censor it, you'd need to shut down the network.
 */
export const shadowBlackBookEntries = mysqlTable("shadow_black_book_entries", {
  id: int("id").autoincrement().primaryKey(),
  auditId: int("auditId"),
  contributorId: int("contributorId").notNull(),
  entryHash: varchar("entryHash", { length: 512 }).notNull(),
  previousHash: varchar("previousHash", { length: 512 }),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  evidenceUrls: json("evidenceUrls"),
  verificationLevel: mysqlEnum("verificationLevel", ["1", "2", "3"]).default("1").notNull(),
  consensusVotes: int("consensusVotes").default(0).notNull(),
  redactionStatus: mysqlEnum("redactionStatus", ["public", "restricted", "classified"]).default("public").notNull(),
  publishedAt: timestamp("publishedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  contributorIdx: index("idx_blackbook_contributor").on(table.contributorId),
  auditIdx: index("idx_blackbook_audit").on(table.auditId),
  levelIdx: index("idx_blackbook_level").on(table.verificationLevel),
}));

export type ShadowBlackBookEntry = typeof shadowBlackBookEntries.$inferSelect;
export type InsertShadowBlackBookEntry = typeof shadowBlackBookEntries.$inferInsert;
