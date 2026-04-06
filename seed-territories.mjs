import mysql from "mysql2/promise";

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "reality_war",
});

// ============================================================================
// TERRITORIES — San Francisco + surrounding areas
// Factions: truth_seekers | reality_architects | shadow_corps | neutral
// ============================================================================

const territories = [
  // Shadow Corps strongholds
  {
    name: "Downtown Core",
    faction: "shadow_corps",
    centerLatitude: 37.7749,
    centerLongitude: -122.4194,
    radiusMeters: 1500,
    signalStrength: 91,
    memberCount: 58,
    description:
      "The nerve center of Shadow Corps operations. Ghost Relay nodes embedded in every block. Signal dominance: uncontested.",
  },
  {
    name: "North Beach Enclave",
    faction: "shadow_corps",
    centerLatitude: 37.8044,
    centerLongitude: -122.4107,
    radiusMeters: 1100,
    signalStrength: 82,
    memberCount: 41,
    description:
      "Historic bohemian district repurposed as a shadow intelligence hub. The alleys know things the databases do not.",
  },
  {
    name: "Tenderloin Ops Node",
    faction: "shadow_corps",
    centerLatitude: 37.7835,
    centerLongitude: -122.4133,
    radiusMeters: 900,
    signalStrength: 74,
    memberCount: 29,
    description:
      "A contested urban node where Shadow Corps runs counter-intelligence ops. High anomaly density. Handle with care.",
  },
  {
    name: "SOMA Relay Station",
    faction: "shadow_corps",
    centerLatitude: 37.7785,
    centerLongitude: -122.3986,
    radiusMeters: 1200,
    signalStrength: 68,
    memberCount: 24,
    description:
      "Tech corridor repurposed for shadow signal routing. Ghost Audits originate here nightly.",
  },

  // Truth Seekers territories
  {
    name: "Mission District Watchtower",
    faction: "truth_seekers",
    centerLatitude: 37.7599,
    centerLongitude: -122.4148,
    radiusMeters: 1200,
    signalStrength: 79,
    memberCount: 36,
    description:
      "Truth Seekers stronghold. Cross-referencing datasets 24/7. No claim enters this zone unverified.",
  },
  {
    name: "Castro Archive",
    faction: "truth_seekers",
    centerLatitude: 37.7609,
    centerLongitude: -122.435,
    radiusMeters: 800,
    signalStrength: 85,
    memberCount: 43,
    description:
      "Community-built verification archive spanning 4 city blocks. The index here is immutable — Truth Syncing runs every hour.",
  },
  {
    name: "Civic Center Index",
    faction: "truth_seekers",
    centerLatitude: 37.7793,
    centerLongitude: -122.4193,
    radiusMeters: 1000,
    signalStrength: 71,
    memberCount: 31,
    description:
      "Government-adjacent verification hub. Every public record within 1km has been cross-indexed by DataSentinels.",
  },
  {
    name: "Noe Valley Signal Post",
    faction: "truth_seekers",
    centerLatitude: 37.7509,
    centerLongitude: -122.4319,
    radiusMeters: 750,
    signalStrength: 62,
    memberCount: 19,
    description:
      "Quiet residential node with deep community roots. Slow signal growth — but the data quality is the highest in the sector.",
  },

  // Reality Architects territories
  {
    name: "Financial District Forge",
    faction: "reality_architects",
    centerLatitude: 37.7913,
    centerLongitude: -122.3996,
    radiusMeters: 1300,
    signalStrength: 87,
    memberCount: 47,
    description:
      "Architects Builders Guild primary node. Digital Twins of 12 city blocks under active construction. LiDAR arrays scanning continuously.",
  },
  {
    name: "Sunset Heights Workshop",
    faction: "reality_architects",
    centerLatitude: 37.7614,
    centerLongitude: -122.458,
    radiusMeters: 1000,
    signalStrength: 70,
    memberCount: 22,
    description:
      "Infrastructure fault reporting hub. Highway Pulse resonance is strong here — 4 major arterials intersect overhead.",
  },
  {
    name: "Potrero Innovation Cluster",
    faction: "reality_architects",
    centerLatitude: 37.756,
    centerLongitude: -122.4006,
    radiusMeters: 950,
    signalStrength: 76,
    memberCount: 28,
    description:
      "Collaborative Digital Twin construction zone. WiFi dead-zone mapping completed for 8 surrounding blocks. Builders Guild meets Thursdays.",
  },
  {
    name: "Dogpatch Fabrication Node",
    faction: "reality_architects",
    centerLatitude: 37.7587,
    centerLongitude: -122.387,
    radiusMeters: 850,
    signalStrength: 58,
    memberCount: 16,
    description:
      "Emerging Architects outpost. Industrial zone undergoing 3D model capture. Raw signal — high potential.",
  },

  // Neutral / Contested zones
  {
    name: "Bay View Junction",
    faction: "neutral",
    centerLatitude: 37.7399,
    centerLongitude: -122.3874,
    radiusMeters: 1400,
    signalStrength: 41,
    memberCount: 14,
    description:
      "Unclaimed convergence point. All factions have scouts here. First to establish dominance will reshape the south sector.",
  },
  {
    name: "Richmond Frontier",
    faction: "neutral",
    centerLatitude: 37.7793,
    centerLongitude: -122.464,
    radiusMeters: 1600,
    signalStrength: 33,
    memberCount: 9,
    description:
      "Low-density outer district. Signal weak but territory wide. A patient faction could flip this with a coordinated push.",
  },
  {
    name: "Excelsior Crossroads",
    faction: "neutral",
    centerLatitude: 37.7235,
    centerLongitude: -122.4254,
    radiusMeters: 1100,
    signalStrength: 28,
    memberCount: 7,
    description:
      "Southern neutral zone. Community engagement low. High potential for EcoGuardians cleanup verification blitz.",
  },
  {
    name: "Visitacion Valley Gap",
    faction: "neutral",
    centerLatitude: 37.7124,
    centerLongitude: -122.4076,
    radiusMeters: 900,
    signalStrength: 22,
    memberCount: 5,
    description:
      "The southernmost verified node in the SF sector. Almost completely uncontested. The first operative to plant a flag here writes their own lore.",
  },
  {
    name: "Haight-Ashbury Flux Zone",
    faction: "neutral",
    centerLatitude: 37.7699,
    centerLongitude: -122.4469,
    radiusMeters: 800,
    signalStrength: 47,
    memberCount: 18,
    description:
      "Signal fluctuates wildly — rumored to be a consequence of overlapping faction interference. Anomaly hunters report strange readings nightly.",
  },
  {
    name: "Embarcadero Threshold",
    faction: "neutral",
    centerLatitude: 37.7955,
    centerLongitude: -122.3937,
    radiusMeters: 700,
    signalStrength: 55,
    memberCount: 21,
    description:
      "Waterfront gateway. Heavy foot traffic. Three factions have attempted to plant anchors here. All three were disrupted. The node remains sovereign.",
  },
];

// ============================================================================
// MISSIONS — diverse types, difficulties, and locations
// Types: infrastructure | environmental | civic | social | emergency
// Difficulties: easy | medium | hard | expert
// ============================================================================

const missions = [
  // Easy — civic
  {
    title: "Sidewalk Condition Survey",
    description:
      "Document the condition of sidewalks along Market Street between 5th and 8th. Photograph cracks, obstructions, and hazards. Upload geotagged images to the civic grid.",
    missionType: "civic",
    difficulty: "easy",
    locationLatitude: 37.7749,
    locationLongitude: -122.418,
    locationRadiusMeters: 400,
    rewardTruthCredits: 150,
    rewardXp: 75,
    validationCriteria: "Minimum 5 geotagged photos, 80% of sidewalk segment documented",
    createdBy: 1,
  },
  {
    title: "Streetlight Audit — Castro",
    description:
      "Survey Castro district streetlights between 18th and 22nd. Note outages, damaged fixtures, and non-functional pedestrian signals. Cross-reference against city grid data.",
    missionType: "civic",
    difficulty: "easy",
    locationLatitude: 37.7609,
    locationLongitude: -122.4349,
    locationRadiusMeters: 500,
    rewardTruthCredits: 120,
    rewardXp: 60,
    validationCriteria: "Minimum 3 operational anomalies documented with photos and cross-reference IDs",
    createdBy: 1,
  },
  {
    title: "Café Network Mapping",
    description:
      "Visit 5+ independent coffee shops in the Mission District and verify their operational status, signage accuracy, and WiFi availability. DataSentinels need ground-truth.",
    missionType: "civic",
    difficulty: "easy",
    locationLatitude: 37.7599,
    locationLongitude: -122.4148,
    locationRadiusMeters: 600,
    rewardTruthCredits: 100,
    rewardXp: 50,
    validationCriteria: "Minimum 5 business verifications with signage match score above 70%",
    createdBy: 1,
  },

  // Easy — environmental
  {
    title: "Green Space Verification — Dolores Park",
    description:
      "EcoGuardians need ground-truth on Dolores Park's current condition. Document plant health, trash levels, water runoff paths, and any encroachment on protected green zones.",
    missionType: "environmental",
    difficulty: "easy",
    locationLatitude: 37.7596,
    locationLongitude: -122.4269,
    locationRadiusMeters: 350,
    rewardTruthCredits: 130,
    rewardXp: 65,
    validationCriteria: "Full perimeter documented, plant health score submitted, any hazards flagged",
    createdBy: 1,
  },

  // Medium — infrastructure
  {
    title: "SOMA Fiber Conduit Audit",
    description:
      "Map exposed and damaged fiber conduits along Folsom Street in SOMA. Identify dead zones and conduit access points. Architects need this for the SOMA Digital Twin upgrade.",
    missionType: "infrastructure",
    difficulty: "medium",
    locationLatitude: 37.7785,
    locationLongitude: -122.3987,
    locationRadiusMeters: 600,
    rewardTruthCredits: 300,
    rewardXp: 150,
    validationCriteria: "3D scan data for at least 2 blocks, conduit damage classified by severity, dead zone coordinates logged",
    createdBy: 1,
  },
  {
    title: "Bay View Transit Dead Zone",
    description:
      "Identify cellular dead zones around the Bay View BART station and surrounding 3-block radius. DataSentinels report 4 unverified dead zone clusters. Confirm and geotag.",
    missionType: "infrastructure",
    difficulty: "medium",
    locationLatitude: 37.7399,
    locationLongitude: -122.3874,
    locationRadiusMeters: 500,
    rewardTruthCredits: 280,
    rewardXp: 140,
    validationCriteria: "Signal strength logged at 10+ test points, dead zones confirmed with 2 independent readings",
    createdBy: 1,
  },
  {
    title: "Embarcadero Bridge Stress Documentation",
    description:
      "Document visible structural wear on the Embarcadero pedestrian bridges. Cracks, erosion, salt damage, and load indicator readings. Architects need this for the coastal Digital Twin.",
    missionType: "infrastructure",
    difficulty: "medium",
    locationLatitude: 37.7955,
    locationLongitude: -122.3937,
    locationRadiusMeters: 400,
    rewardTruthCredits: 350,
    rewardXp: 175,
    validationCriteria: "Minimum 10 structural anomaly photos, GPS-tagged, damage severity rated 1-5",
    createdBy: 1,
  },

  // Medium — environmental
  {
    title: "Haight Urban Heat Island Mapping",
    description:
      "Use thermal imaging or ambient readings to document temperature variance across Haight-Ashbury's 8 sub-blocks. EcoGuardians suspect a 3°C drift anomaly near Buena Vista Park.",
    missionType: "environmental",
    difficulty: "medium",
    locationLatitude: 37.7699,
    locationLongitude: -122.4469,
    locationRadiusMeters: 600,
    rewardTruthCredits: 320,
    rewardXp: 160,
    validationCriteria: "Temperature readings at minimum 8 mapped points, anomaly zones highlighted, timestamp verified",
    createdBy: 1,
  },
  {
    title: "Richmond Street Tree Inventory",
    description:
      "Conduct a street tree health audit in the outer Richmond. Document species, trunk diameter, canopy spread, and disease markers. Carbon credit verification requires ground-truth.",
    missionType: "environmental",
    difficulty: "medium",
    locationLatitude: 37.7793,
    locationLongitude: -122.464,
    locationRadiusMeters: 800,
    rewardTruthCredits: 260,
    rewardXp: 130,
    validationCriteria: "Minimum 20 trees documented, species verified, health score 1-5 assigned",
    createdBy: 1,
  },

  // Medium — social
  {
    title: "Shadow Corps Oath Witness Drive",
    description:
      "Recruit and witness 3 new operatives taking the Shadow Corps oath in person. Document the ceremony, capture the ZKP hash exchange, and submit witness reports to the Black Book.",
    missionType: "social",
    difficulty: "medium",
    locationLatitude: 37.7749,
    locationLongitude: -122.4194,
    locationRadiusMeters: 2000,
    rewardTruthCredits: 400,
    rewardXp: 200,
    validationCriteria: "3 witnessed oath hashes submitted, all verifiable on the Shadow Black Book",
    createdBy: 1,
  },

  // Hard — infrastructure
  {
    title: "Downtown LiDAR 3D Block Capture",
    description:
      "Complete a full LiDAR 3D scan of the downtown core between Market, Montgomery, Pine, and Kearny. The Architects Builders Guild is constructing a high-fidelity Digital Twin and needs a complete 360° model of all 14 buildings in the block.",
    missionType: "infrastructure",
    difficulty: "hard",
    locationLatitude: 37.791,
    locationLongitude: -122.403,
    locationRadiusMeters: 300,
    rewardTruthCredits: 750,
    rewardXp: 375,
    validationCriteria: "Full 3D model at minimum 5cm resolution, all 14 buildings captured, model file submitted to Architects Guild server",
    createdBy: 1,
  },
  {
    title: "SOMA Power Grid Fault Analysis",
    description:
      "Investigate 6 reported power grid faults in the SOMA district. Cross-reference with city maintenance logs, photograph transformer access points, and file a formal anomaly report with DataSentinels for Black Book consideration.",
    missionType: "infrastructure",
    difficulty: "hard",
    locationLatitude: 37.778,
    locationLongitude: -122.3985,
    locationRadiusMeters: 700,
    rewardTruthCredits: 680,
    rewardXp: 340,
    validationCriteria: "All 6 faults documented with photo evidence, city log cross-reference submitted, DataSentinel verification chain initiated",
    createdBy: 1,
  },

  // Hard — environmental
  {
    title: "Excelsior Brownfield Verification",
    description:
      "The Excelsior Crossroads neutral zone shows signs of industrial contamination in historical maps. EcoGuardians need ground-truth soil and runoff documentation to file a carbon credit dispute claim. Requires 6+ hours on-site.",
    missionType: "environmental",
    difficulty: "hard",
    locationLatitude: 37.7235,
    locationLongitude: -122.4254,
    locationRadiusMeters: 500,
    rewardTruthCredits: 800,
    rewardXp: 400,
    validationCriteria: "Soil sample coordinates submitted, 10+ runoff path photos, contamination level estimated and flagged to city environmental board",
    createdBy: 1,
  },

  // Expert — shadow / anomaly hunting
  {
    title: "Ghost Audit: Financial District Signal Spoofer",
    description:
      "Shadow Corps intelligence indicates a GPS spoofing array operating from within a 200m radius of the Financial District node. Locate and document the array. Do not confront — observe and report. This is a Level 2 Shadow Corps operation. Coordinate with your Ghost Relay cell before deployment.",
    missionType: "social",
    difficulty: "expert",
    locationLatitude: 37.7913,
    locationLongitude: -122.3996,
    locationRadiusMeters: 200,
    rewardTruthCredits: 1500,
    rewardXp: 750,
    validationCriteria: "Array location within 20m accuracy, signal pattern documented, cryptographic evidence package submitted to Shadow Black Book at Level 2 clearance",
    createdBy: 1,
  },
  {
    title: "The Crucible Field Op: Reality Anchor Deployment",
    description:
      "Phase 2 Crucible qualification requires deployment of a Reality Anchor challenge in the contested Haight-Ashbury Flux Zone. Challenge 3 operatives with suspicious signal patterns. Document responses, log ZKP verification outcomes, and submit full report to your Crucible handler.",
    missionType: "social",
    difficulty: "expert",
    locationLatitude: 37.7699,
    locationLongitude: -122.4469,
    locationRadiusMeters: 300,
    rewardTruthCredits: 2000,
    rewardXp: 1000,
    validationCriteria: "3 Reality Anchor challenges issued, all outcomes logged with ZKP verification hashes, Crucible handler signature required",
    createdBy: 1,
  },
  {
    title: "Convergence Anomaly: Embarcadero Signal Rift",
    description:
      "Anomaly cluster detected at the Embarcadero Threshold — 7 overlapping signal spikes over 48 hours suggest a Convergence Rift event. TruthSeekers and Shadow Corps are both investigating. Document the rift characteristics, capture baseline signal readings before the event decays, and submit your findings before the anomaly window closes.",
    missionType: "emergency",
    difficulty: "expert",
    locationLatitude: 37.7955,
    locationLongitude: -122.3937,
    locationRadiusMeters: 150,
    rewardTruthCredits: 2500,
    rewardXp: 1250,
    validationCriteria: "Signal rift documented within the 6-hour anomaly window, baseline vs spike readings compared, emergency anomaly report filed to DataSentinels with cryptographic timestamp",
    createdBy: 1,
  },
];

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

async function seedTerritories() {
  console.log("\n📍 Seeding territories...");

  // Clear existing data first
  await connection.execute("DELETE FROM territories");
  console.log("  ✓ Cleared existing territories");

  for (const t of territories) {
    await connection.execute(
      `INSERT INTO territories (name, faction, centerLatitude, centerLongitude, radiusMeters, signalStrength, memberCount, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [t.name, t.faction, t.centerLatitude, t.centerLongitude, t.radiusMeters, t.signalStrength, t.memberCount, t.description]
    );
    console.log(`  ✓ ${t.faction.padEnd(20)} | ${String(t.signalStrength).padStart(3)}% signal | ${t.name}`);
  }

  console.log(`  → ${territories.length} territories seeded`);
}

async function seedMissions() {
  console.log("\n🎯 Seeding missions...");

  // Clear existing missions
  await connection.execute("DELETE FROM missions");
  console.log("  ✓ Cleared existing missions");

  for (const m of missions) {
    await connection.execute(
      `INSERT INTO missions (title, description, missionType, difficulty, locationLatitude, locationLongitude, locationRadiusMeters, rewardTruthCredits, rewardXp, validationCriteria, createdBy, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [
        m.title,
        m.description,
        m.missionType,
        m.difficulty,
        m.locationLatitude,
        m.locationLongitude,
        m.locationRadiusMeters,
        m.rewardTruthCredits,
        m.rewardXp,
        m.validationCriteria,
        m.createdBy,
      ]
    );
    const diffIcon = { easy: "🟢", medium: "🟡", hard: "🔴", expert: "⚫" }[m.difficulty];
    console.log(`  ${diffIcon} ${m.difficulty.padEnd(8)} | ${String(m.rewardTruthCredits).padStart(5)} TC | ${m.title}`);
  }

  console.log(`  → ${missions.length} missions seeded`);
}

async function seed() {
  try {
    console.log("🌐 Reality War Nexus OS — World Data Seed");
    console.log("==========================================");

    await seedTerritories();
    await seedMissions();

    console.log("\n✅ World data seeded successfully!");
    console.log(`   ${territories.length} territories | ${missions.length} missions`);

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Seed error:", error);
    await connection.end();
    process.exit(1);
  }
}

seed();
