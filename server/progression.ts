import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Progression system for Shadow Corps tiers and XP advancement
 */

export const TIER_PROGRESSION = {
  recruit: { minXp: 0, maxXp: 499, displayName: "Recruit", color: "gray" },
  analyst: { minXp: 500, maxXp: 1499, displayName: "Analyst", color: "cyan" },
  sentinel: { minXp: 1500, maxXp: 3499, displayName: "Sentinel", color: "purple" },
  architect: { minXp: 3500, maxXp: 6999, displayName: "Architect", color: "pink" },
  witness: { minXp: 7000, maxXp: Infinity, displayName: "Witness", color: "amber" },
};

export const TIER_BENEFITS = {
  recruit: {
    missionRewardMultiplier: 1.0,
    dailyMissionLimit: 5,
    maxTruthCredits: 1000,
    badgeSlots: 3,
  },
  analyst: {
    missionRewardMultiplier: 1.1,
    dailyMissionLimit: 8,
    maxTruthCredits: 2500,
    badgeSlots: 5,
  },
  sentinel: {
    missionRewardMultiplier: 1.25,
    dailyMissionLimit: 12,
    maxTruthCredits: 5000,
    badgeSlots: 8,
  },
  architect: {
    missionRewardMultiplier: 1.5,
    dailyMissionLimit: 20,
    maxTruthCredits: 10000,
    badgeSlots: 12,
  },
  witness: {
    missionRewardMultiplier: 2.0,
    dailyMissionLimit: Infinity,
    maxTruthCredits: Infinity,
    badgeSlots: 20,
  },
};

/**
 * Calculate tier based on XP
 */
export function calculateTier(xp: number): keyof typeof TIER_PROGRESSION {
  if (xp >= TIER_PROGRESSION.witness.minXp) return "witness";
  if (xp >= TIER_PROGRESSION.architect.minXp) return "architect";
  if (xp >= TIER_PROGRESSION.sentinel.minXp) return "sentinel";
  if (xp >= TIER_PROGRESSION.analyst.minXp) return "analyst";
  return "recruit";
}

/**
 * Get XP progress to next tier
 */
export function getXpProgress(xp: number): {
  currentTier: keyof typeof TIER_PROGRESSION;
  nextTier: keyof typeof TIER_PROGRESSION | null;
  currentTierXp: number;
  nextTierXp: number;
  progressPercent: number;
} {
  const currentTier = calculateTier(xp);
  const tierData = TIER_PROGRESSION[currentTier];

  const tiers: (keyof typeof TIER_PROGRESSION)[] = ["recruit", "analyst", "sentinel", "architect", "witness"];
  const currentTierIndex = tiers.indexOf(currentTier);
  const nextTier = currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : null;

  const nextTierData = nextTier ? TIER_PROGRESSION[nextTier] : null;
  const nextTierXp = nextTierData?.minXp ?? Infinity;

  const xpInCurrentTier = xp - tierData.minXp;
  const xpNeededForTier = nextTierXp - tierData.minXp;
  const progressPercent = xpNeededForTier === Infinity ? 100 : Math.min(100, (xpInCurrentTier / xpNeededForTier) * 100);

  return {
    currentTier,
    nextTier,
    currentTierXp: tierData.minXp,
    nextTierXp,
    progressPercent,
  };
}

/**
 * Award XP to user and handle tier progression
 */
export async function awardXp(
  userId: number,
  amount: number,
  reason: string
): Promise<{
  newXp: number;
  tierChanged: boolean;
  oldTier?: keyof typeof TIER_PROGRESSION;
  newTier?: keyof typeof TIER_PROGRESSION;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  // Get current user
  const userResult = await db.select().from(users).where(eq(users.id, userId));
  const user = userResult[0];

  if (!user) throw new Error("User not found");

  const oldTier = calculateTier(user.experiencePoints);
  const newXp = user.experiencePoints + amount;
  const newTier = calculateTier(newXp);

  // Update user XP
  await db
    .update(users)
    .set({
      experiencePoints: newXp,
      shadowCorpsTier: newTier,
    })
    .where(eq(users.id, userId));

  return {
    newXp,
    tierChanged: oldTier !== newTier,
    oldTier,
    newTier,
  };
}

/**
 * Get tier benefits for a user
 */
export function getTierBenefits(tier: keyof typeof TIER_PROGRESSION) {
  return TIER_BENEFITS[tier];
}

/**
 * Calculate mission reward multiplier based on user tier
 */
export function calculateRewardMultiplier(tier: keyof typeof TIER_PROGRESSION): number {
  return TIER_BENEFITS[tier].missionRewardMultiplier;
}

/**
 * Check if user can complete more missions today
 */
export async function canCompleteMissionToday(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const userResult = await db.select().from(users).where(eq(users.id, userId));
  const user = userResult[0];

  if (!user) throw new Error("User not found");

  const tier = calculateTier(user.experiencePoints);
  const dailyLimit = TIER_BENEFITS[tier].dailyMissionLimit;

  // TODO: Query mission completions for today
  // For now, return true if daily limit is Infinity
  return dailyLimit === Infinity;
}
