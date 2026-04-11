import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { BattleEventPanel } from "@/components/BattleEventPanel";
import { SquadPanel } from "@/components/SquadPanel";
import { DuelPanel } from "@/components/DuelPanel";
import { BattleLeaderboard } from "@/components/BattleLeaderboard";
import { ArrowLeft, Swords, Users, Trophy, Zap, Loader2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

const FACTION_MAP: Record<string, string> = {
  eco: "truth_seekers",
  data: "truth_seekers",
  tech: "reality_architects",
  shadow: "shadow_corps",
};

type Tab = "battles" | "squads" | "duels" | "leaderboard";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "battles", label: "Battles",     icon: <Swords className="w-4 h-4" /> },
  { id: "squads",  label: "Squads",      icon: <Users className="w-4 h-4" /> },
  { id: "duels",   label: "Duels",       icon: <Zap className="w-4 h-4" /> },
  { id: "leaderboard", label: "Rankings", icon: <Trophy className="w-4 h-4" /> },
];

export default function Battles() {
  const [_loc, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("battles");
  const [selectedTerritory, setSelectedTerritory] = useState<{
    id: number; name: string; faction: string;
  } | null>(null);

  const profileQuery = trpc.profile.getProfile.useQuery(
    isAuthenticated ? {} : { userId: undefined },
    { enabled: isAuthenticated }
  );

  const territoriesQuery = trpc.territories.getNearby.useQuery(
    { latitude: 37.7749, longitude: -122.4194, radiusKm: 15 },
    { enabled: isAuthenticated }
  );

  const userChosenFaction = (profileQuery.data as any)?.chosenFaction ?? "";
  const userTerritoryFaction = FACTION_MAP[userChosenFaction] ?? "neutral";

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-gray-400">Sign in to access battle systems.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/")} className="mr-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
              <Swords className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">Battle Command</h1>
              <p className="text-xs text-gray-400">Faction warfare · Duels · Squads</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-gray-400">{userChosenFaction ? `${userChosenFaction.toUpperCase()} faction` : "Unaffiliated"}</p>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Tab Bar */}
        <div className="flex gap-1 mb-8 bg-slate-800/50 rounded-lg p-1">
          {TABS.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === id
                  ? "bg-slate-700 text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* ── BATTLES TAB ─────────────────────────────────────── */}
        {activeTab === "battles" && (
          <div className="space-y-6">
            {/* Territory Selector */}
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">
                Select Battlefield
              </h3>
              {territoriesQuery.isLoading ? (
                <div className="text-center py-6">
                  <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
                </div>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {(territoriesQuery.data ?? [])
                    .filter((t) => t.faction !== userTerritoryFaction)
                    .slice(0, 8)
                    .map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTerritory({ id: t.id, name: t.name, faction: t.faction })}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                          selectedTerritory?.id === t.id
                            ? "bg-yellow-950/40 border-yellow-400/60 text-yellow-300"
                            : "border-slate-600 text-gray-400 hover:border-slate-500 hover:text-gray-200"
                        }`}
                      >
                        {t.name}
                        <span className="ml-1.5 opacity-50">{t.signalStrength}%</span>
                      </button>
                    ))}
                  {!selectedTerritory && (
                    <p className="text-xs text-gray-600 self-center ml-1">Select an enemy territory to declare battle</p>
                  )}
                </div>
              )}
            </div>

            <BattleEventPanel
              territoryId={selectedTerritory?.id}
              territoryName={selectedTerritory?.name}
              territoryFaction={selectedTerritory?.faction}
              userFaction={userTerritoryFaction}
            />
          </div>
        )}

        {/* ── SQUADS TAB ──────────────────────────────────────── */}
        {activeTab === "squads" && <SquadPanel />}

        {/* ── DUELS TAB ───────────────────────────────────────── */}
        {activeTab === "duels" && (
          <div className="space-y-4">
            {/* Territory Selector for Duels */}
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">
                Duel Territory
              </h3>
              <div className="flex gap-2 flex-wrap">
                {(territoriesQuery.data ?? []).slice(0, 8).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTerritory({ id: t.id, name: t.name, faction: t.faction })}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                      selectedTerritory?.id === t.id
                        ? "bg-cyan-950/40 border-cyan-400/60 text-cyan-300"
                        : "border-slate-600 text-gray-400 hover:border-slate-500"
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {selectedTerritory ? (
              <DuelPanel
                territoryId={selectedTerritory.id}
                territoryName={selectedTerritory.name}
                userId={user?.id ?? 0}
              />
            ) : (
              <div className="text-center py-10">
                <Swords className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500">Select a territory to view or post duel challenges.</p>
              </div>
            )}
          </div>
        )}

        {/* ── LEADERBOARD TAB ─────────────────────────────────── */}
        {activeTab === "leaderboard" && <BattleLeaderboard />}
      </main>
    </div>
  );
}
