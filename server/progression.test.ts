import { describe, it, expect } from "vitest";
import {
  calculateTier,
  getXpProgress,
  getTierBenefits,
  calculateRewardMultiplier,
  TIER_PROGRESSION,
  TIER_BENEFITS,
} from "./progression";

describe("Progression System", () => {
  describe("calculateTier", () => {
    it("should return recruit tier for 0 XP", () => {
      expect(calculateTier(0)).toBe("recruit");
    });

    it("should return analyst tier for 500 XP", () => {
      expect(calculateTier(500)).toBe("analyst");
    });

    it("should return sentinel tier for 1500 XP", () => {
      expect(calculateTier(1500)).toBe("sentinel");
    });

    it("should return architect tier for 3500 XP", () => {
      expect(calculateTier(3500)).toBe("architect");
    });

    it("should return witness tier for 7000 XP", () => {
      expect(calculateTier(7000)).toBe("witness");
    });

    it("should handle edge cases at tier boundaries", () => {
      expect(calculateTier(499)).toBe("recruit");
      expect(calculateTier(500)).toBe("analyst");
      expect(calculateTier(1499)).toBe("analyst");
      expect(calculateTier(1500)).toBe("sentinel");
    });
  });

  describe("getXpProgress", () => {
    it("should calculate progress for recruit tier", () => {
      const progress = getXpProgress(250);
      expect(progress.currentTier).toBe("recruit");
      expect(progress.nextTier).toBe("analyst");
      expect(progress.currentTierXp).toBe(0);
      expect(progress.nextTierXp).toBe(500);
      expect(progress.progressPercent).toBeCloseTo(50, 1);
    });

    it("should calculate progress for analyst tier", () => {
      const progress = getXpProgress(750);
      expect(progress.currentTier).toBe("analyst");
      expect(progress.nextTier).toBe("sentinel");
      expect(progress.currentTierXp).toBe(500);
      expect(progress.nextTierXp).toBe(1500);
      expect(progress.progressPercent).toBeCloseTo(25, 1);
    });

    it("should show 100% progress for witness tier", () => {
      const progress = getXpProgress(10000);
      expect(progress.currentTier).toBe("witness");
      expect(progress.nextTier).toBeNull();
      expect(progress.progressPercent).toBe(100);
    });

    it("should handle XP at tier boundaries", () => {
      const progress = getXpProgress(500);
      expect(progress.currentTier).toBe("analyst");
      expect(progress.progressPercent).toBe(0);
    });
  });

  describe("getTierBenefits", () => {
    it("should return correct benefits for recruit tier", () => {
      const benefits = getTierBenefits("recruit");
      expect(benefits.missionRewardMultiplier).toBe(1.0);
      expect(benefits.dailyMissionLimit).toBe(5);
      expect(benefits.maxTruthCredits).toBe(1000);
      expect(benefits.badgeSlots).toBe(3);
    });

    it("should return correct benefits for analyst tier", () => {
      const benefits = getTierBenefits("analyst");
      expect(benefits.missionRewardMultiplier).toBe(1.1);
      expect(benefits.dailyMissionLimit).toBe(8);
      expect(benefits.maxTruthCredits).toBe(2500);
      expect(benefits.badgeSlots).toBe(5);
    });

    it("should return correct benefits for witness tier", () => {
      const benefits = getTierBenefits("witness");
      expect(benefits.missionRewardMultiplier).toBe(2.0);
      expect(benefits.dailyMissionLimit).toBe(Infinity);
      expect(benefits.maxTruthCredits).toBe(Infinity);
      expect(benefits.badgeSlots).toBe(20);
    });

    it("should have increasing benefits per tier", () => {
      const recruits = getTierBenefits("recruit");
      const analyst = getTierBenefits("analyst");
      const sentinel = getTierBenefits("sentinel");
      const architect = getTierBenefits("architect");
      const witness = getTierBenefits("witness");

      expect(analyst.missionRewardMultiplier).toBeGreaterThan(recruits.missionRewardMultiplier);
      expect(sentinel.missionRewardMultiplier).toBeGreaterThan(analyst.missionRewardMultiplier);
      expect(architect.missionRewardMultiplier).toBeGreaterThan(sentinel.missionRewardMultiplier);
      expect(witness.missionRewardMultiplier).toBeGreaterThan(architect.missionRewardMultiplier);
    });
  });

  describe("calculateRewardMultiplier", () => {
    it("should return 1.0 for recruit tier", () => {
      expect(calculateRewardMultiplier("recruit")).toBe(1.0);
    });

    it("should return 1.1 for analyst tier", () => {
      expect(calculateRewardMultiplier("analyst")).toBe(1.1);
    });

    it("should return 1.25 for sentinel tier", () => {
      expect(calculateRewardMultiplier("sentinel")).toBe(1.25);
    });

    it("should return 1.5 for architect tier", () => {
      expect(calculateRewardMultiplier("architect")).toBe(1.5);
    });

    it("should return 2.0 for witness tier", () => {
      expect(calculateRewardMultiplier("witness")).toBe(2.0);
    });
  });

  describe("Tier Progression Constants", () => {
    it("should have all tiers defined", () => {
      expect(TIER_PROGRESSION.recruit).toBeDefined();
      expect(TIER_PROGRESSION.analyst).toBeDefined();
      expect(TIER_PROGRESSION.sentinel).toBeDefined();
      expect(TIER_PROGRESSION.architect).toBeDefined();
      expect(TIER_PROGRESSION.witness).toBeDefined();
    });

    it("should have non-overlapping XP ranges", () => {
      expect(TIER_PROGRESSION.recruit.maxXp).toBe(TIER_PROGRESSION.analyst.minXp - 1);
      expect(TIER_PROGRESSION.analyst.maxXp).toBe(TIER_PROGRESSION.sentinel.minXp - 1);
      expect(TIER_PROGRESSION.sentinel.maxXp).toBe(TIER_PROGRESSION.architect.minXp - 1);
      expect(TIER_PROGRESSION.architect.maxXp).toBe(TIER_PROGRESSION.witness.minXp - 1);
    });

    it("should have display names for all tiers", () => {
      expect(TIER_PROGRESSION.recruit.displayName).toBe("Recruit");
      expect(TIER_PROGRESSION.analyst.displayName).toBe("Analyst");
      expect(TIER_PROGRESSION.sentinel.displayName).toBe("Sentinel");
      expect(TIER_PROGRESSION.architect.displayName).toBe("Architect");
      expect(TIER_PROGRESSION.witness.displayName).toBe("Witness");
    });

    it("should have colors for all tiers", () => {
      expect(TIER_PROGRESSION.recruit.color).toBe("gray");
      expect(TIER_PROGRESSION.analyst.color).toBe("cyan");
      expect(TIER_PROGRESSION.sentinel.color).toBe("purple");
      expect(TIER_PROGRESSION.architect.color).toBe("pink");
      expect(TIER_PROGRESSION.witness.color).toBe("amber");
    });
  });

  describe("Tier Benefits Constants", () => {
    it("should have benefits for all tiers", () => {
      expect(TIER_BENEFITS.recruit).toBeDefined();
      expect(TIER_BENEFITS.analyst).toBeDefined();
      expect(TIER_BENEFITS.sentinel).toBeDefined();
      expect(TIER_BENEFITS.architect).toBeDefined();
      expect(TIER_BENEFITS.witness).toBeDefined();
    });

    it("should have all required benefit properties", () => {
      const tiers = ["recruit", "analyst", "sentinel", "architect", "witness"] as const;
      tiers.forEach((tier) => {
        const benefits = TIER_BENEFITS[tier];
        expect(benefits).toHaveProperty("missionRewardMultiplier");
        expect(benefits).toHaveProperty("dailyMissionLimit");
        expect(benefits).toHaveProperty("maxTruthCredits");
        expect(benefits).toHaveProperty("badgeSlots");
      });
    });
  });

  describe("XP Progression Validation", () => {
    it("should validate XP progression is continuous", () => {
      const tiers = ["recruit", "analyst", "sentinel", "architect", "witness"] as const;
      for (let xp = 0; xp <= 10000; xp += 100) {
        const tier = calculateTier(xp);
        expect(tiers).toContain(tier);
      }
    });

    it("should handle large XP values", () => {
      expect(calculateTier(1000000)).toBe("witness");
      const progress = getXpProgress(1000000);
      expect(progress.currentTier).toBe("witness");
      expect(progress.progressPercent).toBe(100);
    });
  });
});
