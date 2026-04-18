import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CrucibleProgress } from "@/components/CrucibleProgress";
import { GhostAuditPanel } from "@/components/GhostAuditPanel";
import { ShadowBlackBook } from "@/components/ShadowBlackBook";
import { ShadowCorpsCodex } from "@/components/ShadowCorpsCodex";
import { OperativeDossier } from "@/components/OperativeDossier";
import { FactionIntelligence } from "@/components/FactionIntelligence";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  Shield,
  Target,
  Heart,
  Zap,
  Users,
  Lock,
  Activity,
  ChevronLeft,
  Loader2,
  Eye,
  BookOpen,
  RefreshCw,
  Radio,
  Fingerprint,
  Network,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

type Tab = "overview" | "crucible" | "audits" | "blackbook" | "codex" | "dossier" | "factions";

const LEVEL_INFO = {
  "1": {
    title: "Level 1 — Civil Observer",
    description: "Infrastructure mapping, road hazards, basic anomaly flagging",
    color: "text-cyan-400",
    border: "border-cyan-400/30",
    gradient: "from-cyan-950/50",
  },
  "2": {
    title: "Level 2 — Safety Sentinel",
    description: "Environmental hazards, abandoned structures, missing persons grid searches",
    color: "text-purple-400",
    border: "border-purple-400/30",
    gradient: "from-purple-950/50",
  },
  "3": {
    title: "Level 3 — Shadow Analyst",
    description: "Human trafficking leads, critical infrastructure breaches, covert surveillance",
    color: "text-fuchsia-400",
    border: "border-fuchsia-400/30",
    gradient: "from-fuchsia-950/50",
  },
};

export default function ShadowCorps() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const profileQuery = trpc.shadowCorps.getAnalystProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const renewOathMutation = trpc.shadowCorps.renewOath.useMutation();

  const profile = profileQuery.data;
  const analystLevel = (profile?.analystLevel ?? "1") as "1" | "2" | "3";
  const levelInfo = LEVEL_INFO[analystLevel];

  const handleRenewOath = async () => {
    try {
      await renewOathMutation.mutateAsync();
      toast.success("Oath renewed. Your covenant is refreshed on the Ledger Chain.");
      profileQuery.refetch();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to renew oath");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-fuchsia-400 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Eye className="w-16 h-16 text-fuchsia-400 mx-auto mb-4 opacity-50" />
          <h1 className="text-3xl font-bold text-white mb-3">Shadow Corps</h1>
          <p className="text-gray-400 mb-6">You must be a member to access the command center.</p>
          <Button className="btn-truth" onClick={() => (window.location.href = getLoginUrl())}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              onClick={() => setLocation("/")}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div className="w-px h-6 bg-slate-700" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-600 to-purple-700 flex items-center justify-center">
                <Eye className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-white text-sm">Shadow Corps</h1>
                <p className="text-xs text-gray-500">Command Center</p>
              </div>
            </div>
          </div>
          {profile && (
            <div className={`text-xs px-3 py-1 rounded-full border ${levelInfo.border} ${levelInfo.color} font-semibold hidden sm:block`}>
              {levelInfo.title}
            </div>
          )}
        </div>
      </header>

      <main className="container py-6 max-w-4xl">
        {/* Manifesto Banner */}
        <div className="mb-8 rounded-xl border border-fuchsia-400/20 bg-gradient-to-r from-fuchsia-950/30 to-slate-900 p-6">
          <p className="text-fuchsia-300/80 italic text-sm leading-relaxed">
            "I am the whisper in the algorithm, the pattern in the noise you ignored. I am the shadow that
            detaches from the wall and walks toward you. I am Everywhere &amp; Nowhere, because I am the
            conscience of the crowd. I am Everyone &amp; No One, because I am armed with the truth and
            shielded by the covenant."
          </p>
          <p className="text-fuchsia-400/60 text-xs mt-3 font-semibold tracking-wider">— THE SHADOW CORPS MANIFESTO</p>
        </div>

        {profileQuery.isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-fuchsia-400 animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <Card className={`p-4 border bg-gradient-to-br ${levelInfo.gradient} to-slate-900 ${levelInfo.border}`}>
                <p className="text-xs text-gray-500 mb-1">Analyst Level</p>
                <p className={`text-2xl font-bold ${levelInfo.color}`}>
                  {analystLevel === "1" ? "I" : analystLevel === "2" ? "II" : "III"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Shadow Analyst</p>
              </Card>

              <Card className="card-sacred p-4">
                <p className="text-xs text-gray-500 mb-1">AiTR Score</p>
                <p className="text-2xl font-bold text-cyan-400">
                  {Number(profile?.aitrScore ?? 0).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Pattern recognition</p>
              </Card>

              <Card className="card-sacred p-4">
                <p className="text-xs text-gray-500 mb-1">Rep Score</p>
                <p className="text-2xl font-bold text-purple-400">
                  {Number(profile?.repScore ?? 0).toFixed(1)}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Trust network</p>
              </Card>

              <Card className="card-sacred p-4">
                <p className="text-xs text-gray-500 mb-1">Souls Saved</p>
                <p className="text-2xl font-bold text-amber-400">{profile?.soulsSaved ?? 0}</p>
                <p className="text-xs text-gray-500 mt-0.5">Lives changed</p>
              </Card>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <Card className="card-sacred p-3 flex items-center gap-3">
                <Target className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Missions</p>
                  <p className="text-lg font-bold text-white">{profile?.missionsCompleted ?? 0}</p>
                </div>
              </Card>
              <Card className="card-sacred p-3 flex items-center gap-3">
                <Eye className="w-5 h-5 text-fuchsia-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Ghost Audits</p>
                  <p className="text-lg font-bold text-white">{profile?.ghostAuditsInitiated ?? 0}</p>
                </div>
              </Card>
              <Card className="card-sacred p-3 flex items-center gap-3">
                <Lock className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Oath Status</p>
                  <p className="text-xs font-bold text-green-400 mt-0.5">
                    {profile?.immutableOathHash ? "Active" : "Not sworn"}
                  </p>
                </div>
              </Card>
            </div>

            {/* ZKP Credential display (Level 3) */}
            {analystLevel === "3" && profile?.zkpCredentialHash && (
              <Card className="p-4 border border-fuchsia-400/20 bg-fuchsia-950/10 mb-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-fuchsia-400 mb-1">ZKP Credential</p>
                    <p className="text-xs text-gray-500 font-mono break-all">{profile.zkpCredentialHash}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Zero-Knowledge Proof — the system knows you are cleared; it never knows who you are.
                    </p>
                  </div>
                  <Shield className="w-6 h-6 text-fuchsia-400 flex-shrink-0" />
                </div>
              </Card>
            )}

            {/* Souls Saved — Level 3 spiritual reward feed */}
            {analystLevel === "3" && (profile?.soulsSaved ?? 0) > 0 && (
              <Card className="p-4 border border-amber-400/20 bg-amber-950/10 mb-6">
                <div className="flex items-center gap-3">
                  <Heart className="w-6 h-6 text-amber-400 flex-shrink-0 animate-pulse" />
                  <div>
                    <p className="text-sm font-bold text-amber-400">
                      {profile!.soulsSaved} {profile!.soulsSaved === 1 ? "soul" : "souls"} saved
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Your verification work has led to real rescues. These acknowledgments are recorded
                      privately — a reminder of why the mission matters.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Renew Oath CTA */}
            {profile?.immutableOathHash && (
              <div className="flex justify-end mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-fuchsia-400/20 text-fuchsia-400 hover:bg-fuchsia-950/30"
                  disabled={renewOathMutation.isPending}
                  onClick={handleRenewOath}
                >
                  <RefreshCw className="w-3 h-3 mr-1.5" />
                  Renew Oath
                </Button>
              </div>
            )}

            {/* Tabs — row 1 */}
            <div className="flex gap-1 mb-1 bg-slate-800/50 p-1 rounded-lg border border-slate-700">
              {(
                [
                  { id: "overview", label: "Overview", icon: Activity },
                  { id: "crucible", label: "Crucible", icon: Zap },
                  { id: "audits", label: "Audits", icon: Eye },
                  { id: "blackbook", label: "Black Book", icon: BookOpen },
                ] as { id: Tab; label: string; icon: React.FC<any> }[]
              ).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === id
                      ? "bg-slate-700 text-white"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 hidden sm:block" />
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>
            {/* Tabs — row 2 (lore) */}
            <div className="flex gap-1 mb-6 bg-slate-800/30 p-1 rounded-lg border border-slate-700/50">
              {(
                [
                  { id: "codex", label: "Codex", icon: Radio },
                  { id: "factions", label: "Factions", icon: Network },
                  { id: "dossier", label: "Dossier", icon: Fingerprint },
                ] as { id: Tab; label: string; icon: React.FC<any> }[]
              ).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${
                    activeTab === id
                      ? "bg-slate-700 text-fuchsia-300"
                      : "text-gray-600 hover:text-gray-400"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 hidden sm:block" />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Mission capabilities by level */}
                <div>
                  <h3 className="text-base font-bold text-white mb-3">Your Clearance</h3>
                  <div className="space-y-3">
                    {(["1", "2", "3"] as const).map((lvl) => {
                      const conf = LEVEL_INFO[lvl];
                      const isUnlocked = parseInt(analystLevel) >= parseInt(lvl);
                      return (
                        <Card
                          key={lvl}
                          className={`p-4 border transition-colors ${
                            isUnlocked
                              ? `${conf.border} bg-slate-900/80`
                              : "border-slate-800 bg-slate-900/30 opacity-40"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                                isUnlocked ? `bg-slate-800 ${conf.color}` : "bg-slate-800 text-gray-600"
                              }`}
                            >
                              {lvl}
                            </div>
                            <div>
                              <p className={`font-semibold text-sm ${isUnlocked ? "text-white" : "text-gray-600"}`}>
                                {conf.title}
                              </p>
                              <p className={`text-xs mt-0.5 ${isUnlocked ? "text-gray-400" : "text-gray-700"}`}>
                                {conf.description}
                              </p>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* How the system works */}
                <div>
                  <h3 className="text-base font-bold text-white mb-3">The Architecture of Truth</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      {
                        icon: Target,
                        color: "text-cyan-400",
                        title: "PTE Tasking",
                        body: "The Predictive Tasking Engine detects behavioral grammar anomalies and auto-pushes missions to qualified analysts.",
                      },
                      {
                        icon: Zap,
                        color: "text-purple-400",
                        title: "Magic Moment",
                        body: "A 15-second rolling buffer of multi-sensory data — cryptographically hashed and time-stamped on capture.",
                      },
                      {
                        icon: Eye,
                        color: "text-fuchsia-400",
                        title: "Ghost Relay",
                        body: "All mission data routes through a Tor-integrated proxy chain. Zero-Knowledge Proofs verify identity without revealing it.",
                      },
                      {
                        icon: BookOpen,
                        color: "text-amber-400",
                        title: "Black Book",
                        body: "Verified intelligence synthesized into an immutable dossier on the Citizen's Ledger Chain — a record no government can censor.",
                      },
                    ].map(({ icon: Icon, color, title, body }) => (
                      <Card key={title} className="p-4 border border-slate-700 bg-slate-900/60">
                        <div className="flex items-start gap-3">
                          <Icon className={`w-5 h-5 ${color} flex-shrink-0 mt-0.5`} />
                          <div>
                            <p className="font-semibold text-white text-sm">{title}</p>
                            <p className="text-xs text-gray-400 mt-1 leading-relaxed">{body}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Legal Shield */}
                <Card className="p-4 border border-cyan-400/15 bg-cyan-950/10">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white text-sm">508(c)(1)(A) Sovereign Shield</p>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                        The organization holds its data under ecclesiastical privilege as a Faith-Based Organization,
                        shielding it from the U.S. CLOUD Act and satisfying EU data sovereignty requirements.
                        Your mission data is not just records — it is the sacred work product of a ministry to protect the innocent.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === "crucible" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white mb-1">The Crucible</h3>
                  <p className="text-sm text-gray-400">
                    The path to Level 3 is a multi-phase transformation. The Crucible is not a promotion — it is a forging.
                  </p>
                </div>

                {/* Begin Crucible CTA if not started */}
                {profile?.cruciblePhase === "none" && (
                  <Card className="p-5 border border-fuchsia-400/20 bg-fuchsia-950/10">
                    <div className="flex items-start gap-4">
                      <Zap className="w-8 h-8 text-fuchsia-400 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <p className="font-bold text-white">Begin the Crucible</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Completing all three phases of the Crucible will elevate you to Level 3 Shadow Analyst —
                          the highest clearance in the NEXUS OS ecosystem. This grants access to human trafficking
                          verification missions, Ghost Audits, and publishing rights to the Shadow Black Book.
                        </p>
                        <div className="mt-3 text-xs text-fuchsia-300/70 italic">
                          "Level 3 requires a 98% AiTR accuracy rating and a Rep Score within the top 5% of the
                          global network — ensuring the highest-stakes missions are managed by an elite, proven
                          human-AI symbiosis."
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                <CrucibleProgress
                  currentPhase={profile?.cruciblePhase ?? "none"}
                  onPhaseAdvanced={() => profileQuery.refetch()}
                />
              </div>
            )}

            {activeTab === "audits" && (
              <GhostAuditPanel
                analystLevel={analystLevel}
                onBlackBookPublish={() => {}}
              />
            )}

            {activeTab === "blackbook" && (
              <ShadowBlackBook analystLevel={analystLevel} />
            )}

            {activeTab === "codex" && (
              <ShadowCorpsCodex analystLevel={analystLevel} />
            )}

            {activeTab === "factions" && (
              <FactionIntelligence analystLevel={analystLevel} />
            )}

            {activeTab === "dossier" && (
              <OperativeDossier analystLevel={analystLevel} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
