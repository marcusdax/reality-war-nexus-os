import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

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
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'reality_war',
    });

    console.log('Connected to database');

    // Check if missions table exists
    const [tables] = await connection.query(
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'missions'"
    );

    if (tables.length === 0) {
      console.log('Creating missions table...');
      await connection.query(`
        CREATE TABLE missions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          type VARCHAR(50) NOT NULL,
          difficulty VARCHAR(20) NOT NULL,
          reward_credits INT NOT NULL,
          reward_xp INT NOT NULL,
          latitude DECIMAL(10, 8) NOT NULL,
          longitude DECIMAL(11, 8) NOT NULL,
          radius_km INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log('Missions table created');
    }

    // Clear existing missions
    await connection.query('DELETE FROM missions');
    console.log('Cleared existing missions');

    // Insert new missions
    for (const mission of MISSIONS) {
      await connection.query(
        'INSERT INTO missions (title, description, type, difficulty, reward_credits, reward_xp, latitude, longitude, radius_km) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          mission.title,
          mission.description,
          mission.type,
          mission.difficulty,
          mission.reward_credits,
          mission.reward_xp,
          mission.latitude,
          mission.longitude,
          mission.radius_km,
        ]
      );
    }

    console.log(`Successfully seeded ${MISSIONS.length} missions`);

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding missions:', error);
    process.exit(1);
  }
}

seedMissions();
