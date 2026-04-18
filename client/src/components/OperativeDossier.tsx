import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  Shield,
  Fingerprint,
  Target,
  Eye,
  Zap,
  Lock,
  Heart,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Activity,
} from "lucide-react";

const LEVEL_DESIGNATIONS: Record<string, { codename: string; clearance: string; color: string; border: string; bg: string }> = {
  "1": {
    codename: "CIVIL OBSERVER",
    clearance: "RESTRICTED",
    color: "text-cyan-400",
    border: "border-cyan-400/30",
    bg: "bg-cyan-950/20",
  },
  "2": {
    codename: "SAFETY SENTINEL",
    clearance: "CLASSIFIED",
    color: "text-purple-400",
    border: "border-purple-400/30",
    bg: "bg-purple-950/20",
  },
  "3": {
    codename: "SHADOW ANALYST",
    clearance: "EYES ONLY / ULTRA SECRET",
    color: "text-fuchsia-400",
    border: "border-fuchsia-400/30",
    bg: "bg-fuchsia-950/20",
  },
};

const FACTION_DOCTRINE: Record<string, string> = {
  eco: "Ecological Integrity Network — Truth Seekers alignment. Monitors environmental degradation, illegal dumping, and eco-system compromise events.",
  data: "DataSentinels Intelligence Cell — Truth Seekers alignment. Tracks digital surveillance infrastructure, data harvesting operations, and privacy violations.",
  tech: "Architects' Technical Division — Reality Architects alignment. Deploys counter-narrative infrastructure and verifies digital authenticity chains.",
  shadow: "Shadow Corps Field Operations — Shadow Corps alignment. Direct verification, Ghost Audit operations, and Citizen Ledger Chain publishing.",
};

const CRUCIBLE_PHASE_LABELS: Record<string, string> = {
  none: "Not initiated",
  phase_1: "Phase I — Soul's Forge",
  phase_2: "Phase II — Ghost in the Machine",
  phase_3: "Phase III — Immutable Oath",
  complete: "Complete — Level 3 Forged",
};

function DossierField({ label, value, mono = false, color = "text-white" }: {
  label: string; value: React.ReactNode; mono?: boolean; color?: string;
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold">{label}</p>
      <p className={`text-sm ${color} ${mono ? "font-mono break-all" : "font-medium"}`}>{value}</p>
    </div>
  );
}

function StatusIndicator({ active, label }: { active: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${active ? "bg-green-400 animate-pulse" : "bg-slate-600"}`} />
      <span className={`text-xs ${active ? "text-green-400" : "text-gray-600"}`}>{label}</span>
    </div>
  );
}

interface OperativeDossierProps {
  analystLevel: "1" | "2" | "3";
}

export function OperativeDossier({ analystLevel }: OperativeDossierProps) {
  const profileQuery = trpc.shadowCorps.getAnalystProfile.useQuery(undefined);
  const profile = profileQuery.data;

  const levelDef = LEVEL_DESIGNATIONS[analystLevel];
  const crucibleLabel = CRUCIBLE_PHASE_LABELS[profile?.cruciblePhase ?? "none"];
  const aitr = Number(profile?.aitrScore ?? 0);
  const rep = Number(profile?.repScore ?? 0);
  const chosenFaction = (profile as any)?.chosenFaction ?? "";
  const factionDoctrine = FACTION_DOCTRINE[chosenFaction] ?? "Operative — Unaffiliated field agent.";

  const aitrRating = aitr >= 98 ? "ELITE" : aitr >= 85 ? "ACTIVE" : aitr >= 65 ? "NOMINAL" : "BELOW THRESHOLD";
  const aitrColor = aitr >= 98 ? "text-fuchsia-400" : aitr >= 85 ? "text-green-400" : aitr >= 65 ? "text-cyan-400" : "text-red-400";
  const repRating = rep >= 90 ? "TRUSTED" : rep >= 70 ? "RELIABLE" : rep >= 50 ? "PROVISIONAL" : "UNVETTED";
  const repColor = rep >= 90 ? "text-fuchsia-400" : rep >= 70 ? "text-green-400" : rep >= 50 ? "text-cyan-400" : "text-amber-400";

  if (profileQuery.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 text-fuchsia-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Dossier header */}
      <div className={`rounded-xl border ${levelDef.border} ${levelDef.bg} p-5`}>
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-xl border ${levelDef.border} flex items-center justify-center flex-shrink-0 bg-slate-900/60`}>
            <Fingerprint className={`w-7 h-7 ${levelDef.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-xs font-mono font-bold tracking-widest px-2 py-0.5 rounded border ${levelDef.border} ${levelDef.color}`}>
                {levelDef.clearance}
              </span>
              <span className="text-xs text-gray-500 font-mono">OPERATIVE DOSSIER</span>
            </div>
            <p className={`text-xl font-bold ${levelDef.color} tracking-wider`}>{levelDef.codename}</p>
            {profile?.immutableOathHash && (
              <p className="text-xs text-gray-600 font-mono mt-1 truncate">
                OATH: {profile.immutableOathHash.slice(0, 32)}…
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Identity & clearance fields */}
      <Card className="card-sacred p-5 space-y-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-3.5 h-3.5" />
          Identity & Clearance
        </p>
        <div className="grid grid-cols-2 gap-4">
          <DossierField label="Designation" value={levelDef.codename} color={levelDef.color} />
          <DossierField label="Clearance" value={levelDef.clearance} color={levelDef.color} />
          <DossierField label="Crucible Status" value={crucibleLabel} color={profile?.cruciblePhase === "complete" ? "text-fuchsia-400" : "text-gray-300"} />
          <DossierField label="Oath Status" value={profile?.immutableOathHash ? "ACTIVE — Ledger Chain" : "NOT SWORN"} color={profile?.immutableOathHash ? "text-green-400" : "text-amber-400"} />
        </div>
        {profile?.zkpCredentialHash && (
          <div className="pt-3 border-t border-slate-700/50">
            <DossierField label="ZKP Credential Hash" value={profile.zkpCredentialHash} mono color="text-fuchsia-300/80" />
            <p className="text-xs text-gray-600 mt-1">Zero-Knowledge Proof — identity verified without disclosure</p>
          </div>
        )}
      </Card>

      {/* Performance metrics */}
      <Card className="card-sacred p-5 space-y-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-3.5 h-3.5" />
          Performance Metrics
        </p>
        <div className="grid grid-cols-2 gap-5">
          {/* AiTR */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 uppercase tracking-wide">AiTR Score</span>
              <span className={`text-xs font-bold font-mono ${aitrColor}`}>{aitrRating}</span>
            </div>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${aitr >= 98 ? "bg-fuchsia-400" : aitr >= 85 ? "bg-green-400" : aitr >= 65 ? "bg-cyan-400" : "bg-red-400"}`}
                style={{ width: `${Math.min(aitr, 100)}%` }}
              />
            </div>
            <p className={`text-2xl font-bold ${aitrColor}`}>{aitr.toFixed(1)}<span className="text-sm font-normal text-gray-600">%</span></p>
            <p className="text-xs text-gray-600">Anomaly-to-Truth Ratio — your perceptual calibration</p>
          </div>

          {/* Rep Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Rep Score</span>
              <span className={`text-xs font-bold font-mono ${repColor}`}>{repRating}</span>
            </div>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${rep >= 90 ? "bg-fuchsia-400" : rep >= 70 ? "bg-green-400" : rep >= 50 ? "bg-cyan-400" : "bg-amber-400"}`}
                style={{ width: `${Math.min(rep, 100)}%` }}
              />
            </div>
            <p className={`text-2xl font-bold ${repColor}`}>{rep.toFixed(1)}</p>
            <p className="text-xs text-gray-600">Network trust — earned through verified field work</p>
          </div>
        </div>

        {/* Level 3 threshold callout */}
        {analystLevel !== "3" && (
          <div className="mt-2 pt-3 border-t border-slate-700/50 rounded-lg bg-slate-800/40 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-amber-400 font-semibold">Level 3 Threshold Requirements</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Shadow Analyst elevation requires AiTR ≥ 98% and Rep Score in the top 5% of the global network.
                  Current thresholds: AiTR {aitr.toFixed(1)}% / 98% · Rep {rep.toFixed(1)} / 95th percentile.
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Operational record */}
      <Card className="card-sacred p-5">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-4">
          <Target className="w-3.5 h-3.5" />
          Operational Record
        </p>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-cyan-400">{profile?.missionsCompleted ?? 0}</p>
            <p className="text-xs text-gray-500 mt-0.5">Missions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-fuchsia-400">{profile?.ghostAuditsInitiated ?? 0}</p>
            <p className="text-xs text-gray-500 mt-0.5">Ghost Audits</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-400">{profile?.soulsSaved ?? 0}</p>
            <p className="text-xs text-gray-500 mt-0.5">Souls Saved</p>
          </div>
        </div>

        {(profile?.soulsSaved ?? 0) > 0 && (
          <div className="flex items-start gap-2 p-3 rounded-lg border border-amber-400/20 bg-amber-950/10">
            <Heart className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5 animate-pulse" />
            <p className="text-xs text-gray-400 leading-relaxed">
              {profile!.soulsSaved} individual{profile!.soulsSaved !== 1 ? "s" : ""} whose circumstances changed as a direct result of your verified field work. These acknowledgments are recorded privately on the Ledger Chain — visible only to you and NEXUS MIND.
            </p>
          </div>
        )}
      </Card>

      {/* System access */}
      <Card className="card-sacred p-5">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-4">
          <Lock className="w-3.5 h-3.5" />
          System Access
        </p>
        <div className="space-y-2">
          <StatusIndicator active label="NEXUS OS Core — Civil Observer missions, Reality Anchors, territory ops" />
          <StatusIndicator active={parseInt(analystLevel) >= 2} label="Ghost Protocol — Tor relay routing, Level 2 mission clearance" />
          <StatusIndicator active={parseInt(analystLevel) >= 2} label="PTE Augmented — AiTR-weighted task weighting from NEXUS MIND" />
          <StatusIndicator active={parseInt(analystLevel) >= 3} label="Ghost Audit System — covert surveillance documentation" />
          <StatusIndicator active={parseInt(analystLevel) >= 3} label="Black Book Publishing — Citizen's Ledger Chain write access" />
          <StatusIndicator active={parseInt(analystLevel) >= 3} label="ULTRA SECRET codex — full Codex access including CONVERGENCE docs" />
        </div>
      </Card>

      {/* Field doctrine assignment */}
      {chosenFaction && (
        <Card className="card-sacred p-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
            <Zap className="w-3.5 h-3.5" />
            Field Doctrine Assignment
          </p>
          <p className="text-xs text-gray-300 leading-relaxed">{factionDoctrine}</p>
        </Card>
      )}

      {/* Level 3 convergence progress */}
      {analystLevel === "3" && (
        <Card className="p-5 border border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-950/30 to-slate-900">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-fuchsia-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-fuchsia-400 mb-1">CONVERGENCE Contributor</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Your verified intelligence — every mission completed, every anchor placed, every audit sealed — feeds the CONVERGENCE threshold. When 500 metropolitan areas reach critical intelligence density, the coordinated filing package is submitted. You are part of that architecture.
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <CheckCircle className="w-3.5 h-3.5 text-fuchsia-400" />
                <span className="text-xs text-fuchsia-400 font-semibold">Active CONVERGENCE contributor</span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
