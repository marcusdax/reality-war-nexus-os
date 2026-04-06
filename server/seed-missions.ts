import { getDb } from "./db";
import { missions } from "../drizzle/schema";

const MISSIONS_DATA = [
  {
    title: "Document Infrastructure Decay",
    description: "Photograph and document deteriorating infrastructure in your area (bridges, roads, buildings). Upload evidence to the Reality Stream.",
    missionType: "infrastructure",
    difficulty: "easy",
    rewardTruthCredits: 50,
    rewardXp: 25,
    locationLatitude: 40.7128,
    locationLongitude: -74.0060,
    locationRadiusMeters: 5000,
    validationCriteria: "Clear documentation of infrastructure condition with location verification",
  },
  {
    title: "Environmental Impact Assessment",
    description: "Record video evidence of environmental issues (pollution, litter, habitat destruction). Document the location and severity.",
    missionType: "environmental",
    difficulty: "medium",
    rewardTruthCredits: 100,
    rewardXp: 50,
    locationLatitude: 40.7580,
    locationLongitude: -73.9855,
    locationRadiusMeters: 10000,
    validationCriteria: "Video evidence with clear environmental impact and location data",
  },
  {
    title: "Civic Engagement Verification",
    description: "Capture evidence of civic participation (voting locations, community meetings, public events). Verify community involvement.",
    missionType: "civic",
    difficulty: "easy",
    rewardTruthCredits: 75,
    rewardXp: 30,
    locationLatitude: 40.7489,
    locationLongitude: -73.9680,
    locationRadiusMeters: 8000,
    validationCriteria: "Evidence of civic participation with timestamp and location",
  },
  {
    title: "Social Service Documentation",
    description: "Document social services in your area (shelters, food banks, community centers). Verify their operations and impact.",
    missionType: "social",
    difficulty: "medium",
    rewardTruthCredits: 100,
    rewardXp: 45,
    locationLatitude: 40.7614,
    locationLongitude: -73.9776,
    locationRadiusMeters: 12000,
    validationCriteria: "Documentation of social services with operational status",
  },
  {
    title: "Emergency Response Verification",
    description: "Document emergency services in action (fire departments, ambulances, disaster response). Capture real-world emergency management.",
    missionType: "emergency",
    difficulty: "hard",
    rewardTruthCredits: 200,
    rewardXp: 100,
    locationLatitude: 40.7505,
    locationLongitude: -73.9972,
    locationRadiusMeters: 15000,
    validationCriteria: "Real-time emergency response documentation with location verification",
  },
  {
    title: "Public Health Monitoring",
    description: "Record evidence of public health initiatives (vaccination sites, health clinics, wellness programs). Document community health efforts.",
    missionType: "infrastructure",
    difficulty: "medium",
    rewardTruthCredits: 125,
    rewardXp: 60,
    locationLatitude: 40.7282,
    locationLongitude: -73.7949,
    locationRadiusMeters: 7000,
    validationCriteria: "Evidence of public health services with location and operational status",
  },
  {
    title: "Transportation System Audit",
    description: "Document public transportation conditions (buses, trains, bike lanes). Record evidence of system functionality and issues.",
    missionType: "infrastructure",
    difficulty: "easy",
    rewardTruthCredits: 60,
    rewardXp: 35,
    locationLatitude: 40.7549,
    locationLongitude: -73.9840,
    locationRadiusMeters: 6000,
    validationCriteria: "Transportation system documentation with operational status",
  },
  {
    title: "Wildlife Habitat Monitoring",
    description: "Capture video evidence of local wildlife and their habitats. Document biodiversity and environmental conditions.",
    missionType: "environmental",
    difficulty: "medium",
    rewardTruthCredits: 110,
    rewardXp: 55,
    locationLatitude: 40.7829,
    locationLongitude: -73.9654,
    locationRadiusMeters: 9000,
    validationCriteria: "Wildlife documentation with habitat assessment and location",
  },
  {
    title: "Community Art Documentation",
    description: "Record evidence of public art, murals, and cultural installations. Document community creative expression.",
    missionType: "civic",
    difficulty: "easy",
    rewardTruthCredits: 70,
    rewardXp: 40,
    locationLatitude: 40.7505,
    locationLongitude: -73.9680,
    locationRadiusMeters: 5000,
    validationCriteria: "Clear documentation of public art with location verification",
  },
  {
    title: "Disaster Recovery Verification",
    description: "Document recovery efforts from natural disasters or emergencies. Record community resilience and reconstruction.",
    missionType: "emergency",
    difficulty: "hard",
    rewardTruthCredits: 250,
    rewardXp: 125,
    locationLatitude: 40.7282,
    locationLongitude: -74.0076,
    locationRadiusMeters: 20000,
    validationCriteria: "Comprehensive disaster recovery documentation with before/after evidence",
  },
];

export async function seedMissions() {
  try {
    const db = await getDb();
    if (!db) {
      console.error("Database connection failed");
      return;
    }

    console.log("Seeding missions...");

    // Clear existing missions
    await db.delete(missions);
    console.log("Cleared existing missions");

    // Insert new missions
    for (const mission of MISSIONS_DATA) {
      try {
        await db.insert(missions).values({
          title: mission.title,
          description: mission.description,
          missionType: mission.missionType as any,
          difficulty: mission.difficulty as any,
          locationLatitude: mission.locationLatitude as any,
          locationLongitude: mission.locationLongitude as any,
          locationRadiusMeters: mission.locationRadiusMeters,
          rewardTruthCredits: mission.rewardTruthCredits,
          rewardXp: mission.rewardXp,
          validationCriteria: mission.validationCriteria,
          createdBy: 1, // System admin
        });
        console.log(`✓ Created mission: ${mission.title}`);
      } catch (e) {
        console.error(`Failed to create mission ${mission.title}:`, e);
      }
    }

    console.log(`\n✅ Successfully seeded ${MISSIONS_DATA.length} missions`);
  } catch (error) {
    console.error("Error seeding missions:", error);
    throw error;
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  seedMissions()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
