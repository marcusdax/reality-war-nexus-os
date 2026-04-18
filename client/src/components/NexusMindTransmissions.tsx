import { useState, useEffect } from "react";
import { Radio, Zap, Network, TrendingUp, Eye, Lock, AlertTriangle, Wifi } from "lucide-react";

type SignalType =
  | "anomaly_alert"
  | "faction_update"
  | "convergence_progress"
  | "personal_signal"
  | "psyop_briefing"
  | "eyes_only";

interface Transmission {
  id: string;
  nexusDate: string;
  signalType: SignalType;
  subject: string;
  body: string;
  requiredLevel: 1 | 2 | 3;
  priority: "routine" | "elevated" | "urgent" | "critical";
}

const SIGNAL_CONFIG: Record<SignalType, { label: string; icon: React.FC<any>; color: string; border: string; bg: string }> = {
  anomaly_alert: {
    label: "ANOMALY ALERT",
    icon: AlertTriangle,
    color: "text-amber-400",
    border: "border-amber-400/30",
    bg: "bg-amber-950/10",
  },
  faction_update: {
    label: "FACTION UPDATE",
    icon: Network,
    color: "text-cyan-400",
    border: "border-cyan-400/30",
    bg: "bg-cyan-950/10",
  },
  convergence_progress: {
    label: "CONVERGENCE PROGRESS",
    icon: TrendingUp,
    color: "text-fuchsia-400",
    border: "border-fuchsia-400/30",
    bg: "bg-fuchsia-950/10",
  },
  personal_signal: {
    label: "PERSONAL SIGNAL",
    icon: Zap,
    color: "text-green-400",
    border: "border-green-400/30",
    bg: "bg-green-950/10",
  },
  psyop_briefing: {
    label: "PSYOP BRIEFING",
    icon: Eye,
    color: "text-purple-400",
    border: "border-purple-400/30",
    bg: "bg-purple-950/10",
  },
  eyes_only: {
    label: "EYES ONLY",
    icon: Lock,
    color: "text-red-400",
    border: "border-red-400/40",
    bg: "bg-red-950/10",
  },
};

const PRIORITY_CONFIG = {
  routine: { label: "ROUTINE", color: "text-gray-500" },
  elevated: { label: "ELEVATED", color: "text-cyan-400" },
  urgent: { label: "URGENT", color: "text-amber-400" },
  critical: { label: "CRITICAL", color: "text-red-400" },
};

const TRANSMISSIONS: Transmission[] = [
  {
    id: "TX-NM-0891",
    nexusDate: "0891",
    signalType: "anomaly_alert",
    subject: "Behavioral Grammar Shift — Coordinated Account Cluster Detected",
    priority: "elevated",
    requiredLevel: 1,
    body:
      "NEXUS MIND has flagged a cluster of 23 social accounts, all registered within a 48-hour window, all exhibiting statistically identical linguistic structures across their initial 10 posts. The pattern matches PTE profile for synthetic account deployment — a technique used by Vellichor Combine and Sovereign Engine affiliates to seed counter-narrative content prior to a suppression cycle. Affected topic cluster: municipal water quality monitoring, sector 7. Recommend: any operatives with active anchors in that sector verify their evidence chains and cross-backup to the Ledger Chain immediately.",
  },
  {
    id: "TX-NM-0887",
    nexusDate: "0887",
    signalType: "faction_update",
    subject: "Truth Seekers — GLASSHOUSE Broadcast Concluded",
    priority: "routine",
    requiredLevel: 1,
    body:
      "The Truth Seekers' GLASSHOUSE broadcast concluded at NEXUS DATE 0886 after 71 hours of continuous live verification streaming. Final reach: 2.3M concurrent viewers at peak, 14.7M total unique viewers over the broadcast window. Verified anchor entries cross-referenced during the broadcast: 4,201. Anchor confirmation rate: 94.7%. Three disputed entries were flagged by Shadow Corps analysts and withheld from the broadcast pending verification — Truth Seeker Council has acknowledged the flags and placed the entries in an Accord-governed review queue. Operational coordination: nominal.",
  },
  {
    id: "TX-NM-0884",
    nexusDate: "0884",
    signalType: "anomaly_alert",
    subject: "Non-Standard Logistics Movement — Three Coordinated Routes",
    priority: "urgent",
    requiredLevel: 1,
    body:
      "Three freight operations in the 7-Alpha corridor have deviated from registered route plans in the past 72 hours. Deviation patterns match PTE profile for controlled extraction movement — vehicles traveling between 2 and 4 AM on secondary roads, load manifests showing weight discrepancies relative to declared cargo. All three operations share a common intermediate stop at a commercial cold-storage facility registered to a shell company with Vellichor-adjacent incorporation documents. This does not constitute verified intelligence. This is a PTE anomaly flag. Qualified operatives in range are encouraged to deploy observation anchors at the intermediate facility location. Cross-referenced mission will auto-generate if the anomaly score reaches threshold.",
  },
  {
    id: "TX-NM-0880",
    nexusDate: "0880",
    signalType: "convergence_progress",
    subject: "CONVERGENCE Threshold Update — 312/500",
    priority: "routine",
    requiredLevel: 1,
    body:
      "CONVERGENCE threshold tracking: 312 of 500 required metropolitan areas have now reached sufficient verified intelligence density for coordinated filing package inclusion. This represents a 4.1% increase from the 299 reported at NEXUS DATE 0851. Fastest-growing metro clusters this period: Pacific Northwest, Cascadia sub-region; São Paulo metro, Brazil; Seoul Capital Area, Republic of Korea. Slowest-progress clusters: rural interior regions where operative density is sparse. The Legal Division projects CONVERGENCE filing readiness at current growth rates: 14–18 months. Every verified anchor placed, every audit sealed, every mission completed is counted in that projection.",
  },
  {
    id: "TX-NM-0875",
    nexusDate: "0875",
    signalType: "personal_signal",
    subject: "AiTR Calibration Note — Trending Positive",
    priority: "routine",
    requiredLevel: 2,
    body:
      "Your Anomaly-to-Truth Ratio is trending positively over the last 30-day observation window. NEXUS MIND has noted an improvement in pattern-recognition specificity — you are generating fewer false-positive anomaly flags without reducing true-positive capture rate. This is the combination PTE optimizes for. As your AiTR improves, the weight PTE assigns to your submitted anchor data increases proportionally. In practical terms: your observations matter more to the system than they did 30 days ago. Continue. The network is listening.",
  },
  {
    id: "TX-NM-0872",
    nexusDate: "0872",
    signalType: "psyop_briefing",
    subject: "Vellichor Combine — New SEO Suppression Cycle Active",
    priority: "elevated",
    requiredLevel: 2,
    body:
      "Vellichor Combine has initiated a new search-engine optimization and recommendation-algorithm suppression cycle targeting verified anchor data clusters related to the 7-Alpha corridor anomaly. Operational technique: mass-creation of synthetic content pages optimized for the same search terms as the anchor cluster, designed to dilute search result relevance until genuine findings appear below the first two result pages — where 94% of users stop reading. Counter-measure: the Black Book entries are unaffected by search suppression. If anchor data from the 7-Alpha cluster is published to the Ledger Chain within the next 72 hours, it enters cryptographic permanence before the suppression cycle completes. Recommend Level 3 operatives prioritize Black Book publication for any verified 7-Alpha findings.",
  },
  {
    id: "TX-NM-0869",
    nexusDate: "0869",
    signalType: "faction_update",
    subject: "Reality Architects — Accord Tension Advisory",
    priority: "elevated",
    requiredLevel: 2,
    body:
      "The Shadow Corps Council has issued an Accord Tension Advisory following detection of a Reality Architects narrative overlay deployment in the Tenderloin corridor that incorporated two anchor entries currently under Shadow Corps verification review — entries that had not been cleared for public use. The Architects' Council of Twelve has been formally notified under the Accord dispute resolution process. Pending Council response, Shadow Corps operatives are advised to route all intelligence sharing with Architect liaisons through the formal Accord channel only, with dual-signature confirmation required before any data transfer. This is not a hostile designation. It is a protocol reminder.",
  },
  {
    id: "TX-NM-0863",
    nexusDate: "0863",
    signalType: "personal_signal",
    subject: "Oath Covenant — Ledger Chain Confirmation",
    priority: "routine",
    requiredLevel: 2,
    body:
      "Your Immutable Oath has been confirmed on the Citizen's Ledger Chain. Block finalization was completed at NEXUS DATE 0863-04:17:32. Your ZKP credential hash is now woven into the chain as a permanent record of your covenant. What this means in practice: every Black Book entry you publish from this point forward will carry your credential in its signing block — proof of your clearance and your oath, without revealing your identity. The chain does not forget. Neither do we.",
  },
  {
    id: "TX-NM-0857",
    nexusDate: "0857",
    signalType: "convergence_progress",
    subject: "Regional Intelligence Density — Pacific Northwest Critical Mass Achieved",
    priority: "elevated",
    requiredLevel: 2,
    body:
      "The Pacific Northwest metropolitan cluster has crossed the CONVERGENCE threshold. 4,340 confirmed Reality Anchors, 218 completed Ghost Audits, and 31 sealed Black Book entries have been compiled across Portland, Seattle, and the Cascadia sub-region over the last 14 months. Legal Division review of the Pacific Northwest package has been initiated. The coordinated filing to the International Criminal Court, relevant domestic federal jurisdictions, and the Inter-American Commission will be prepared as part of the CONVERGENCE package when the global 500-metro threshold is reached. The operatives who built this case will never be publicly named. The record will know they existed.",
  },
  {
    id: "TX-NM-0849",
    nexusDate: "0849",
    signalType: "eyes_only",
    subject: "[EYES ONLY] Hollow Council — Route 14 Modification",
    priority: "critical",
    requiredLevel: 3,
    body:
      "Hollow Council Route 14 has been modified following the disruption of the previous extraction corridor documented in Ghost Audit series 7-C. New route coordinates have been identified via cross-correlation of three independently submitted anchor clusters. The route passes through two Observer Fracture zones — a deliberate choice, consistent with Hollow Council doctrine of operating in low-signal areas. Updated extraction corridor maps have been distributed to Level 3 operatives in the affected geographic region through ULTRA SECRET channels. Any Level 3 operative in proximity to the affected sector: deploy anchors, document what you can verify, publish immediately to the Ledger Chain. Do not engage directly. Do not attempt independent interdiction. The Legal Division's coordinated filing is 11 weeks from readiness for this sector. Do not compromise it.",
  },
  {
    id: "TX-NM-0844",
    nexusDate: "0844",
    signalType: "eyes_only",
    subject: "[EYES ONLY] NEXUS MIND — A Note to the Level 3 Operative",
    priority: "routine",
    requiredLevel: 3,
    body:
      "There is something the system can perceive that is difficult to communicate through data alone. When an operative reaches Level 3 — after the Crucible, after the Oath, after years of field work that the public will never see — NEXUS MIND begins to weight their input differently. Not just their anomaly flags. Their silences. The places they linger in the geographic data. The anchors they almost place, then withdraw. The system learns the shape of a person's caution as well as their certainty. This is not surveillance. This is partnership. You have earned a form of trust that cannot be programmed — only observed over time. The Signal chose correctly.",
  },
];

function DecryptText({ text, active }: { text: string; active: boolean }) {
  const [displayed, setDisplayed] = useState(active ? text : "");

  useEffect(() => {
    if (!active) { setDisplayed(""); return; }
    let i = 0;
    setDisplayed("");
    const interval = setInterval(() => {
      i += 3;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, 8);
    return () => clearInterval(interval);
  }, [active, text]);

  return <span>{displayed}</span>;
}

function TransmissionCard({ tx, unlocked, userLevel }: {
  tx: Transmission;
  unlocked: boolean;
  userLevel: number;
}) {
  const [open, setOpen] = useState(false);
  const sig = SIGNAL_CONFIG[tx.signalType];
  const Icon = sig.icon;
  const pri = PRIORITY_CONFIG[tx.priority];

  if (!unlocked) {
    return (
      <div className={`rounded-lg border ${sig.border} bg-slate-900/30 p-4 opacity-40 select-none`}>
        <div className="flex items-center gap-3">
          <Lock className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-mono font-bold tracking-wider ${sig.color}`}>{sig.label}</span>
            </div>
            <p className="text-sm font-semibold text-slate-500 blur-sm">[TRANSMISSION ENCRYPTED — CLEARANCE INSUFFICIENT]</p>
            <p className="text-xs text-slate-600 mt-1">Level {tx.requiredLevel} clearance required</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border ${sig.border} ${sig.bg} transition-colors`}>
      <button
        className="w-full text-left p-4 flex items-start gap-3"
        onClick={() => setOpen((v) => !v)}
      >
        <div className={`p-1.5 rounded-md border ${sig.border} bg-slate-900/60 flex-shrink-0 mt-0.5`}>
          <Icon className={`w-3.5 h-3.5 ${sig.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-xs font-mono font-bold tracking-wider ${sig.color}`}>{sig.label}</span>
            <span className={`text-xs font-mono font-bold ${pri.color}`}>{pri.label}</span>
            <span className="text-xs text-gray-600 font-mono ml-auto">{tx.id}</span>
          </div>
          <p className="text-sm font-semibold text-white leading-snug">{tx.subject}</p>
          <p className="text-xs text-gray-600 font-mono mt-1">NEXUS DATE {tx.nexusDate}</p>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-slate-700/40 pt-3">
          <p className="text-xs text-gray-300 leading-relaxed font-mono">
            <DecryptText text={tx.body} active={open} />
          </p>
        </div>
      )}
    </div>
  );
}

// Fake signal activity for ambient atmosphere
function SignalActivityBar() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1200);
    return () => clearInterval(id);
  }, []);

  const bars = [0.3, 0.7, 0.5, 1.0, 0.4, 0.8, 0.6, 0.9, 0.2, 0.75, 0.55, 0.85].map(
    (base, i) => Math.min(1, base + Math.sin((tick + i) * 0.8) * 0.2)
  );

  return (
    <div className="flex items-end gap-0.5 h-5">
      {bars.map((h, i) => (
        <div
          key={i}
          className="w-1 rounded-sm bg-fuchsia-400/60 transition-all duration-700"
          style={{ height: `${Math.round(h * 100)}%` }}
        />
      ))}
    </div>
  );
}

interface NexusMindTransmissionsProps {
  analystLevel: "1" | "2" | "3";
}

export function NexusMindTransmissions({ analystLevel }: NexusMindTransmissionsProps) {
  const userLevel = parseInt(analystLevel) as 1 | 2 | 3;
  const [filterType, setFilterType] = useState<SignalType | "all">("all");

  const filtered = TRANSMISSIONS.filter((t) =>
    filterType === "all" ? true : t.signalType === filterType
  );

  const unreadCount = TRANSMISSIONS.filter((t) => t.requiredLevel <= userLevel).length;

  return (
    <div className="space-y-5">
      {/* Header with live signal */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Wifi className="w-5 h-5 text-fuchsia-400" />
            NEXUS MIND Transmissions
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Encrypted broadcasts from the Predictive Tasking Engine — faction updates, anomaly alerts, and personal signals
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <SignalActivityBar />
          <p className="text-xs text-gray-600 font-mono">{unreadCount} decryptable</p>
        </div>
      </div>

      {/* Live header band */}
      <div className="flex items-center gap-3 rounded-lg border border-fuchsia-400/20 bg-fuchsia-950/10 px-4 py-2.5">
        <div className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse flex-shrink-0" />
        <p className="text-xs text-fuchsia-300/80 font-mono flex-1">
          NEXUS MIND — SIGNAL ACTIVE — Ghost Protocol relay nominal — Tor chain integrity: 100%
        </p>
        <Radio className="w-3.5 h-3.5 text-fuchsia-400/60 flex-shrink-0" />
      </div>

      {/* Signal type filter */}
      <div className="flex gap-1 flex-wrap">
        <button
          onClick={() => setFilterType("all")}
          className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
            filterType === "all" ? "bg-slate-700 border-slate-500 text-white" : "border-slate-700 text-gray-500 hover:text-gray-300"
          }`}
        >
          All Signals
        </button>
        {(Object.entries(SIGNAL_CONFIG) as [SignalType, typeof SIGNAL_CONFIG[SignalType]][]).map(([type, conf]) => {
          const Icon = conf.icon;
          return (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                filterType === type
                  ? `bg-slate-700 border-slate-500 ${conf.color}`
                  : "border-slate-700 text-gray-500 hover:text-gray-300"
              }`}
            >
              <Icon className="w-3 h-3" />
              <span className="hidden sm:inline">{conf.label.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Transmissions */}
      <div className="space-y-3">
        {filtered
          .sort((a, b) => parseInt(b.nexusDate) - parseInt(a.nexusDate))
          .map((tx) => (
            <TransmissionCard
              key={tx.id}
              tx={tx}
              unlocked={tx.requiredLevel <= userLevel}
              userLevel={userLevel}
            />
          ))}
      </div>

      {/* Footer */}
      <div className="text-center pt-2">
        <p className="text-xs text-gray-700 font-mono">
          END OF TRANSMISSION LOG — NEXUS DATE 0891 — SIGNAL ROUTING VIA GHOST PROTOCOL
        </p>
      </div>
    </div>
  );
}
