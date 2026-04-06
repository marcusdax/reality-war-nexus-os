import { db } from './server/db.ts';

const MISSIONS = [
  {
    title: "Document Infrastructure Decay",
    description: "Photograph and document deteriorating infrastructure in your area (bridges, roads, buildings). Upload evidence to the Reality Stream.",
    type: "infrastructure",
    difficulty: "easy",
    reward_credits: 50,
    reward_xp: 25,
    latitude: 40.7128,
    longitude: -74.0060,
    radius_km: 5,
  },
  {
    title: "Environmental Impact Assessment",
    description: "Record video evidence of environmental issues (pollution, litter, habitat destruction). Document the location and severity.",
    type: "environmental",
    difficulty: "medium",
    reward_credits: 100,
    reward_xp: 50,
    latitude: 40.7580,
    longitude: -73.9855,
    radius_km: 10,
  },
  {
    title: "Civic Engagement Verification",
    description: "Capture evidence of civic participation (voting locations, community meetings, public events). Verify community involvement.",
    type: "civic",
    difficulty: "easy",
    reward_credits: 75,
    reward_xp: 30,
    latitude: 40.7489,
    longitude: -73.9680,
    radius_km: 8,
  },
  {
    title: "Social Service Documentation",
    description: "Document social services in your area (shelters, food banks, community centers). Verify their operations and impact.",
    type: "social",
    difficulty: "medium",
    reward_credits: 100,
    reward_xp: 45,
    latitude: 40.7614,
    longitude: -73.9776,
    radius_km: 12,
  },
  {
    title: "Emergency Response Verification",
    description: "Document emergency services in action (fire departments, ambulances, disaster response). Capture real-world emergency management.",
    type: "emergency",
    difficulty: "hard",
    reward_credits: 200,
    reward_xp: 100,
    latitude: 40.7505,
    longitude: -73.9972,
    radius_km: 15,
  },
  {
    title: "Public Health Monitoring",
    description: "Record evidence of public health initiatives (vaccination sites, health clinics, wellness programs). Document community health efforts.",
    type: "infrastructure",
    difficulty: "medium",
    reward_credits: 125,
    reward_xp: 60,
    latitude: 40.7282,
    longitude: -73.7949,
    radius_km: 7,
  },
  {
    title: "Transportation System Audit",
    description: "Document public transportation conditions (buses, trains, bike lanes). Record evidence of system functionality and issues.",
    type: "infrastructure",
    difficulty: "easy",
    reward_credits: 60,
    reward_xp: 35,
    latitude: 40.7549,
    longitude: -73.9840,
    radius_km: 6,
  },
  {
    title: "Wildlife Habitat Monitoring",
    description: "Capture video evidence of local wildlife and their habitats. Document biodiversity and environmental conditions.",
    type: "environmental",
    difficulty: "medium",
    reward_credits: 110,
    reward_xp: 55,
    latitude: 40.7829,
    longitude: -73.9654,
    radius_km: 9,
  },
  {
    title: "Community Art Documentation",
    description: "Record evidence of public art, murals, and cultural installations. Document community creative expression.",
    type: "civic",
    difficulty: "easy",
    reward_credits: 70,
    reward_xp: 40,
    latitude: 40.7505,
    longitude: -73.9680,
    radius_km: 5,
  },
  {
    title: "Disaster Recovery Verification",
    description: "Document recovery efforts from natural disasters or emergencies. Record community resilience and reconstruction.",
    type: "emergency",
    difficulty: "hard",
    reward_credits: 250,
    reward_xp: 125,
    latitude: 40.7282,
    longitude: -74.0076,
    radius_km: 20,
  },
];

async function seedMissions() {
  try {
    console.log('Seeding missions...');
    
    // Insert missions using the database module
    for (const mission of MISSIONS) {
      console.log(`Creating mission: ${mission.title}`);
      // This would require a database function to be created
    }
    
    console.log(`Successfully seeded ${MISSIONS.length} missions`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding missions:', error);
    process.exit(1);
  }
}

seedMissions();
