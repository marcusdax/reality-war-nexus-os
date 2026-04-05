import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "reality_war",
});

const db = drizzle(connection);

const sampleTerritories = [
  {
    name: "Downtown Core",
    faction: "shadow_corps",
    centerLatitude: 37.7749,
    centerLongitude: -122.4194,
    radiusMeters: 1500,
    signalStrength: 85,
    memberCount: 42,
    description: "The heart of Shadow Corps operations. High signal strength and active community."
  },
  {
    name: "Mission District",
    faction: "truth_seekers",
    centerLatitude: 37.7599,
    centerLongitude: -122.4148,
    radiusMeters: 1200,
    signalStrength: 72,
    memberCount: 28,
    description: "Truth Seekers stronghold. Focus on verification and documentation."
  },
  {
    name: "Sunset Heights",
    faction: "reality_architects",
    centerLatitude: 37.7614,
    centerLongitude: -122.4580,
    radiusMeters: 1000,
    signalStrength: 65,
    memberCount: 19,
    description: "Reality Architects territory. Building frameworks for truth."
  },
  {
    name: "Bay View",
    faction: "neutral",
    centerLatitude: 37.7399,
    centerLongitude: -122.3874,
    radiusMeters: 800,
    signalStrength: 45,
    memberCount: 12,
    description: "Neutral zone. Open to all factions for collaboration."
  },
  {
    name: "North Beach",
    faction: "shadow_corps",
    centerLatitude: 37.8044,
    centerLongitude: -122.4107,
    radiusMeters: 1100,
    signalStrength: 78,
    memberCount: 35,
    description: "Secondary Shadow Corps outpost. Growing influence."
  },
  {
    name: "Financial District",
    faction: "reality_architects",
    centerLatitude: 37.7913,
    centerLongitude: -122.3996,
    radiusMeters: 900,
    signalStrength: 68,
    memberCount: 22,
    description: "Reality Architects research hub. Data analysis and modeling."
  },
];

async function seed() {
  try {
    console.log("Seeding territories...");
    
    for (const territory of sampleTerritories) {
      await connection.execute(
        `INSERT INTO territories (name, faction, centerLatitude, centerLongitude, radiusMeters, signalStrength, memberCount, description) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          territory.name,
          territory.faction,
          territory.centerLatitude,
          territory.centerLongitude,
          territory.radiusMeters,
          territory.signalStrength,
          territory.memberCount,
          territory.description
        ]
      );
      console.log(`✓ Created territory: ${territory.name}`);
    }
    
    console.log("✓ Territories seeded successfully!");
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding territories:", error);
    process.exit(1);
  }
}

seed();
