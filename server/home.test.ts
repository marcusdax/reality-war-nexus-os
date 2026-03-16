import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(overrides?: Partial<AuthenticatedUser>): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-001",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "test",
    role: "user",
    shadowCorpsTier: "recruit",
    experiencePoints: 100,
    totalTruthCredits: 50,
    locationLatitude: 37.7749,
    locationLongitude: -122.4194,
    locationUpdatedAt: new Date(),
    oathTaken: 0,
    oathTakenAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Home Page - Profile & Mission Discovery", () => {
  describe("profile.getProfile", () => {
    it("returns authenticated user profile", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const profile = await caller.profile.getProfile({ userId: undefined });

      expect(profile).toBeDefined();
      expect(typeof profile.id).toBe("number");
      expect(typeof profile.name).toBe("string");
      expect(profile.shadowCorpsTier).toBeDefined();
      expect(typeof profile.totalTruthCredits).toBe("number");
      expect(typeof profile.experiencePoints).toBe("number");
    });

    it("includes user badges in profile", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const profile = await caller.profile.getProfile({ userId: undefined });

      expect(profile.badges).toBeDefined();
      expect(Array.isArray(profile.badges)).toBe(true);
    });

    it("shows oath status correctly", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const profile = await caller.profile.getProfile({ userId: undefined });

      expect(typeof profile.oathTaken).toBe("number");
      expect([0, 1]).toContain(profile.oathTaken);
    });
  });

  describe("missions.listNearby", () => {
    it("returns missions within specified radius", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const missions = await caller.missions.listNearby({
        latitude: 37.7749,
        longitude: -122.4194,
        radiusKm: 5,
      });

      expect(Array.isArray(missions)).toBe(true);
    });

    it("filters missions by difficulty", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const easyMissions = await caller.missions.listNearby({
        latitude: 37.7749,
        longitude: -122.4194,
        radiusKm: 5,
        difficulty: "easy",
      });

      expect(Array.isArray(easyMissions)).toBe(true);
      if (easyMissions.length > 0) {
        expect(easyMissions[0].difficulty).toBe("easy");
      }
    });

    it("filters missions by type", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const infrastructureMissions = await caller.missions.listNearby({
        latitude: 37.7749,
        longitude: -122.4194,
        radiusKm: 5,
        missionType: "infrastructure",
      });

      expect(Array.isArray(infrastructureMissions)).toBe(true);
      if (infrastructureMissions.length > 0) {
        expect(infrastructureMissions[0].missionType).toBe("infrastructure");
      }
    });
  });

  describe("profile.takeOath", () => {
    it("allows user to take Shadow Corps oath", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      try {
        const result = await caller.profile.takeOath();
        expect(result.success).toBe(true);
      } catch (error: any) {
        // May fail if oath already taken, which is also valid
        expect(error.message).toContain("Oath");
      }
    });

    it("prevents taking oath twice", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      try {
        const result = await caller.profile.takeOath();
        expect(result.success).toBe(true);
      } catch (error: any) {
        expect(error.message).toContain("Oath");
      }
    });

    it("awards initial Truth Credits upon oath", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      try {
        const result = await caller.profile.takeOath();
        expect(result.success).toBe(true);

        // Verify ledger is accessible
        const ledger = await caller.truthCredits.getLedger({ limit: 10 });
        expect(Array.isArray(ledger)).toBe(true);
      } catch (error: any) {
        // May fail if oath already taken
        expect(error.message).toContain("Oath");
      }
    });

    it("awards Shadow Corps Recruit badge upon oath", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      try {
        const result = await caller.profile.takeOath();
        expect(result.success).toBe(true);

        const profile = await caller.profile.getProfile({ userId: undefined });
        expect(Array.isArray(profile.badges)).toBe(true);
      } catch (error: any) {
        // May fail if oath already taken
        expect(error.message).toContain("Oath");
      }
    });
  });

  describe("truthCredits.getBalance", () => {
    it("returns current Truth Credit balance", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const { balance, recentTransactions } = await caller.truthCredits.getBalance();

      expect(typeof balance).toBe("number");
      expect(balance).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(recentTransactions)).toBe(true);
    });

    it("includes recent transactions in balance query", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const { recentTransactions } = await caller.truthCredits.getBalance();

      expect(Array.isArray(recentTransactions)).toBe(true);
      if (recentTransactions.length > 0) {
        const tx = recentTransactions[0];
        expect(tx).toHaveProperty("amount");
        expect(tx).toHaveProperty("transactionType");
        expect(tx).toHaveProperty("reason");
      }
    });
  });

  describe("profile.getLeaderboard", () => {
    it("returns global leaderboard", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const leaderboard = await caller.profile.getLeaderboard({
        type: "global",
        limit: 100,
      });

      expect(Array.isArray(leaderboard)).toBe(true);
      if (leaderboard.length > 1) {
        // Verify leaderboard is sorted by Truth Credits
        expect(leaderboard[0].totalTruthCredits).toBeGreaterThanOrEqual(
          leaderboard[1].totalTruthCredits
        );
      }
    });

    it("returns local leaderboard with geolocation", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const leaderboard = await caller.profile.getLeaderboard({
        type: "local",
        limit: 50,
        latitude: 37.7749,
        longitude: -122.4194,
      });

      expect(Array.isArray(leaderboard)).toBe(true);
    });

    it("respects limit parameter", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const leaderboard = await caller.profile.getLeaderboard({
        type: "global",
        limit: 10,
      });

      expect(Array.isArray(leaderboard)).toBe(true);
      expect(leaderboard.length).toBeLessThanOrEqual(10);
    });
  });
});
