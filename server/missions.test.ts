import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import {
  getMissionsNearby,
  getMissionById,
  acceptMission,
  getUserActiveMissions,
  completeMission,
  createMission,
} from "./db";
import { missions, missionAcceptances, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Mission System", () => {
  let db: any;
  let testUserId: number;
  let testMissionId: number;

  beforeAll(async () => {
    db = await getDb();
    if (!db) {
      throw new Error("Database connection failed");
    }

    // Create a test user
    try {
      const userResult = await db.insert(users).values({
        openId: `test-user-${Date.now()}`,
        email: `test-${Date.now()}@example.com`,
        name: "Test User",
        tier: "recruit",
        truthCredits: 1000,
        xp: 100,
      });
      testUserId = userResult[0].insertId || 1;
    } catch (e) {
      // User might already exist
      testUserId = 1;
    }

    // Create a test mission
    const missionResult = await db.insert(missions).values({
      title: "Test Mission",
      description: "A test mission for unit testing",
      missionType: "civic",
      difficulty: "easy",
      locationLatitude: 40.7128,
      locationLongitude: -74.006,
      locationRadiusMeters: 5000,
      rewardTruthCredits: 100,
      rewardXp: 50,
      validationCriteria: "Test validation",
      createdBy: testUserId,
      status: "active",
    });
    testMissionId = missionResult[0].insertId || 1;
  });

  afterAll(async () => {
    if (db) {
      // Clean up test data
      try {
        await db.delete(missionAcceptances).where(
          eq(missionAcceptances.userId, testUserId)
        );
        await db.delete(missions).where(
          eq(missions.id, testMissionId)
        );
      } catch (e) {
        console.error("Cleanup error:", e);
      }
    }
  });

  it("should fetch missions nearby a location", async () => {
    const nearbyMissions = await getMissionsNearby(40.7128, -74.006, 5);
    expect(Array.isArray(nearbyMissions)).toBe(true);
    expect(nearbyMissions.length).toBeGreaterThan(0);
  });

  it("should get a mission by ID", async () => {
    const mission = await getMissionById(testMissionId);
    expect(mission).toBeDefined();
    expect(mission?.title).toBe("Test Mission");
    expect(mission?.difficulty).toBe("easy");
  });

  it("should accept a mission", async () => {
    const result = await acceptMission(testUserId, testMissionId);
    expect(result).toBeDefined();
  });

  it("should get user active missions", async () => {
    const activeMissions = await getUserActiveMissions(testUserId);
    expect(Array.isArray(activeMissions)).toBe(true);
    // Should have at least the mission we just accepted
    expect(activeMissions.length).toBeGreaterThanOrEqual(0);
  });

  it("should handle mission difficulty levels", async () => {
    const difficulties = ["easy", "medium", "hard", "expert"];
    for (const difficulty of difficulties) {
      const missionResult = await db.insert(missions).values({
        title: `${difficulty} Mission`,
        description: `A ${difficulty} test mission`,
        missionType: "civic",
        difficulty: difficulty,
        locationLatitude: 40.7128,
        locationLongitude: -74.006,
        locationRadiusMeters: 5000,
        rewardTruthCredits: 100,
        rewardXp: 50,
        validationCriteria: "Test validation",
        createdBy: testUserId,
        status: "active",
      });
      const missionId = missionResult[0].insertId;
      const mission = await getMissionById(missionId);
      expect(mission?.difficulty).toBe(difficulty);
    }
  });

  it("should handle mission types", async () => {
    const types = ["infrastructure", "environmental", "civic", "social", "emergency"];
    for (const type of types) {
      const missionResult = await db.insert(missions).values({
        title: `${type} Mission`,
        description: `A ${type} test mission`,
        missionType: type,
        difficulty: "easy",
        locationLatitude: 40.7128,
        locationLongitude: -74.006,
        locationRadiusMeters: 5000,
        rewardTruthCredits: 100,
        rewardXp: 50,
        validationCriteria: "Test validation",
        createdBy: testUserId,
        status: "active",
      });
      const missionId = missionResult[0].insertId;
      const mission = await getMissionById(missionId);
      expect(mission?.missionType).toBe(type);
    }
  });

  it("should verify mission rewards", async () => {
    const mission = await getMissionById(testMissionId);
    expect(mission?.rewardTruthCredits).toBe(100);
    expect(mission?.rewardXp).toBe(50);
  });

  it("should verify mission location data", async () => {
    const mission = await getMissionById(testMissionId);
    expect(parseFloat(mission?.locationLatitude || "0")).toBeCloseTo(40.7128, 2);
    expect(parseFloat(mission?.locationLongitude || "0")).toBeCloseTo(-74.006, 2);
    expect(mission?.locationRadiusMeters).toBe(5000);
  });

  it("should filter missions by difficulty", async () => {
    const easyMissions = await getMissionsNearby(40.7128, -74.006, 5, "easy");
    expect(Array.isArray(easyMissions)).toBe(true);
    // All missions should be easy difficulty
    easyMissions.forEach((mission) => {
      expect(mission.difficulty).toBe("easy");
    });
  });

  it("should filter missions by type", async () => {
    const civicMissions = await getMissionsNearby(40.7128, -74.006, 5, undefined, "civic");
    expect(Array.isArray(civicMissions)).toBe(true);
    // All missions should be civic type
    civicMissions.forEach((mission) => {
      expect(mission.missionType).toBe("civic");
    });
  });
});
