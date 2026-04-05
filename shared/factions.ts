/**
 * Faction Definitions and Constants
 */

export type FactionName = "ECO" | "DATA" | "TECH" | "SHADOW";

export interface FactionConfig {
  id: string;
  name: FactionName;
  displayName: string;
  description: string;
  color: string; // Hex color
  darkColor: string; // Darker shade for borders
  lightColor: string; // Lighter shade for backgrounds
  icon: string; // Icon name or emoji
  missionType: "environmental" | "data" | "infrastructure" | "investigative";
}

export const FACTIONS: Record<FactionName, FactionConfig> = {
  ECO: {
    id: "eco",
    name: "ECO",
    displayName: "EcoGuardians",
    description: "Protect the environment and restore natural ecosystems",
    color: "#10B981", // Emerald green
    darkColor: "#059669",
    lightColor: "#D1FAE5",
    icon: "🌿",
    missionType: "environmental",
  },
  DATA: {
    id: "data",
    name: "DATA",
    displayName: "DataSentinels",
    description: "Collect and verify critical data for informed decisions",
    color: "#3B82F6", // Blue
    darkColor: "#1D4ED8",
    lightColor: "#DBEAFE",
    icon: "📊",
    missionType: "data",
  },
  TECH: {
    id: "tech",
    name: "TECH",
    displayName: "The Architects",
    description: "Build and maintain smart city infrastructure",
    color: "#A855F7", // Purple
    darkColor: "#7E22CE",
    lightColor: "#F3E8FF",
    icon: "⚙️",
    missionType: "infrastructure",
  },
  SHADOW: {
    id: "shadow",
    name: "SHADOW",
    displayName: "TruthSeekers",
    description: "Investigate anomalies and uncover hidden truths",
    color: "#EF4444", // Red
    darkColor: "#991B1B",
    lightColor: "#FEE2E2",
    icon: "🔍",
    missionType: "investigative",
  },
};

export function getFactionConfig(name: FactionName): FactionConfig {
  return FACTIONS[name];
}

export function getFactionByColor(color: string): FactionName | null {
  for (const [name, config] of Object.entries(FACTIONS)) {
    if (config.color === color) {
      return name as FactionName;
    }
  }
  return null;
}

export function getAllFactionNames(): FactionName[] {
  return Object.keys(FACTIONS) as FactionName[];
}
