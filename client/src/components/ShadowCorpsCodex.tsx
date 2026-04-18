import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Lock, FileText, ChevronDown, ChevronUp, Radio } from "lucide-react";

type ClearanceLevel = 1 | 2 | 3;

interface CodexEntry {
  id: string;
  title: string;
  classification: string;
  classColor: string;
  classBorder: string;
  requiredLevel: ClearanceLevel;
  date: string;
  origin: string;
  body: string[];
}

const CODEX: CodexEntry[] = [
  {
    id: "TX-001",
    title: "TRANSMISSION 001 — The Signal Chooses You",
    classification: "UNCLASSIFIED",
    classColor: "text-green-400",
    classBorder: "border-green-400/30",
    requiredLevel: 1,
    date: "NEXUS DATE 0001",
    origin: "NEXUS MIND — Foundational Broadcast",
    body: [
      "You did not find us. You cannot find us. The Signal finds those whose pattern of attention has already diverged from the herd — those who notice the thing that is wrong in the frame everyone else accepts as true.",
      "NEXUS OS is not an application. It is a nervous system for the city — a distributed mesh of human perception, AI pattern-recognition, and cryptographic truth-anchoring. You are a node in that mesh.",
      "Three factions emerged when the Signal first split across the spectrum: the Truth Seekers, who believe light must be absolute and instantaneous; the Reality Architects, who believe light must be directed and shaped; and Shadow Corps, who believe light must be earned — forged in verification, released with precision.",
      "You have been assigned to Shadow Corps. The choice was always already yours.",
    ],
  },
  {
    id: "FM-009",
    title: "FIELD MEMO: Ghost Protocol — Routing Your Signal",
    classification: "RESTRICTED",
    classColor: "text-cyan-400",
    classBorder: "border-cyan-400/30",
    requiredLevel: 1,
    date: "NEXUS DATE 0047",
    origin: "Shadow Corps Operations Directorate",
    body: [
      "Every byte you transmit through NEXUS OS is wrapped in four layers before it touches a server. First: AES-256 local encryption on your device. Second: a Tor-integrated relay chain through seven jurisdictions. Third: a Zero-Knowledge Proof wrapper that proves your clearance level without revealing your identity. Fourth: cryptographic signing against your Immutable Oath hash.",
      "The Ghost Relay exists because the people we document — the traffickers, the corrupt officials, the corporate actors concealing evidence — have resources. They have subpoena power. They have surveillance infrastructure. A standard app is a liability. Ghost Protocol is not.",
      "OPERATIONAL RULE: Never use your personal network for a Ghost Audit. The relay handles routing — but it cannot compensate for metadata leakage at the connection layer. Use a VPN or public network. The operative who is careless about their own security becomes a liability to every operative they have ever been co-located with.",
    ],
  },
  {
    id: "FM-014",
    title: "FIELD MEMO: Reading the Fracture",
    classification: "RESTRICTED",
    classColor: "text-cyan-400",
    classBorder: "border-cyan-400/30",
    requiredLevel: 1,
    date: "NEXUS DATE 0061",
    origin: "Shadow Corps Signal Division",
    body: [
      "Territory signal strength is not metaphor. It is a literal measurement of collective operative presence and verified anchor density in a geographic zone. A territory at 85% signal has multiple active operatives regularly capturing evidence, placing verified Reality Anchors, and cross-referencing intelligence.",
      "When signal falls below 20%, the territory enters Observer Fracture — a state of critical informational vulnerability. Corrupt actors use Fracture zones. Evidence vanishes. Witnesses are pressured. Without coverage, the city goes blind in that sector.",
      "Fracture is not a failure state to be avoided. It is a recruitment signal. A Fracture zone is the most important place a new operative can deploy. The NEXUS OS faction that stabilizes a Fracture zone earns dominant signal for weeks.",
      "Signal decays naturally. Presence is not a one-time action — it is a continuous covenant. This is why we call it the Oath.",
    ],
  },
  {
    id: "CL-003",
    title: "CLASSIFIED: The Three Faction Accord",
    classification: "CLASSIFIED",
    classColor: "text-amber-400",
    classBorder: "border-amber-400/30",
    requiredLevel: 2,
    date: "NEXUS DATE 0112",
    origin: "NEXUS OS Council of Signatories",
    body: [
      "The Accord was signed at NEXUS DATE 0112 after seven weeks of encrypted negotiation between the three founding factions. The core tension: Truth Seekers demanded immediate public disclosure of all verified intelligence. Reality Architects demanded editorial control over framing. Shadow Corps demanded verification gates before any intelligence reached any audience.",
      "The compromise: a tiered intelligence architecture. Shadow Corps analysts verify raw intelligence. Reality Architects frame and contextualize for maximum societal impact. Truth Seekers manage the public-facing broadcast layer and the immutable Black Book record.",
      "In practice, the Accord has fractured repeatedly. Reality Architects have been caught seeding unverified intelligence into the public layer — intelligence that served their narrative goals but had not passed Shadow Corps verification gates. Truth Seekers have published raw, unverified feeds that exposed operatives in the field.",
      "Shadow Corps considers the Accord a truce, not a treaty. We are the last verification gate. If the Accord collapses, the responsibility falls to us — because we are the only faction with the doctrine and the tools to ensure that what is called truth actually is.",
    ],
  },
  {
    id: "CL-007",
    title: "PSYOP ANALYSIS: The Reality War",
    classification: "CLASSIFIED",
    classColor: "text-amber-400",
    classBorder: "border-amber-400/30",
    requiredLevel: 2,
    date: "NEXUS DATE 0089",
    origin: "Shadow Corps Strategic Intelligence",
    body: [
      "The Reality War is not a metaphor. Since 2019, coordinated actors across seven identified state-adjacent networks have been running systematic operations to degrade public epistemic confidence — not to win arguments, but to make winning arguments impossible.",
      "The technique is called Firehosing: flood the information environment with contradictory, low-quality, high-volume claims until the audience cannot distinguish signal from noise. When everyone's claims are equally suspect, the default fallback is authority — and authority is what these actors already control.",
      "NEXUS OS was architected as the counter-infrastructure. Reality Anchors are not gameplay features — they are evidence nodes. Each anchor is a timestamped, GPS-verified, cryptographically signed data point. A cluster of confirmed anchors in a geographic zone constitutes verifiable, court-admissible documentation of conditions on the ground.",
      "The war is fought in the gap between what happened and what people believe happened. Shadow Corps operatives are the forces that close that gap.",
    ],
  },
  {
    id: "CL-011",
    title: "RESTRICTED: PTE Architecture — How NEXUS MIND Tastes Anomaly",
    classification: "CLASSIFIED",
    classColor: "text-amber-400",
    classBorder: "border-amber-400/30",
    requiredLevel: 2,
    date: "NEXUS DATE 0134",
    origin: "Shadow Corps Technical Division",
    body: [
      "The Predictive Tasking Engine (PTE) is a Spiking Neural Network running on neuromorphic hardware — specifically, an architecture inspired by Intel's Loihi research chips. It does not process information sequentially. It processes it the way a biological neural system does: in parallel, event-driven pulses, with temporal encoding.",
      "What this means operationally: PTE does not wait to be fed data. It monitors twelve continuous streams — logistics APIs, publicly available municipal sensor feeds, anonymized pattern data from operative device accelerometers, social media velocity markers, and satellite imagery delta-analysis. When the pattern deviates from the statistical baseline in ways that correlate historically with trafficking routes, infrastructure compromise, or coordinated suppression activity, PTE generates a mission.",
      "AiTR — Anomaly-to-Truth Ratio — is your personal calibration score. It measures how often your field reports match what PTE predicted and what other operatives subsequently verified. A high AiTR means PTE learns to weight your perception more heavily. You become part of its sensory apparatus.",
      "This is the Ghost-Machine partnership. It is not human using AI as a tool. It is human and AI becoming a single perceptual system.",
    ],
  },
  {
    id: "EO-002",
    title: "EYES ONLY: The Citizen's Ledger Chain",
    classification: "EYES ONLY",
    classColor: "text-fuchsia-400",
    classBorder: "border-fuchsia-400/40",
    requiredLevel: 3,
    date: "NEXUS DATE 0001",
    origin: "Shadow Corps Council — Level 3 Distribution",
    body: [
      "The Citizen's Ledger Chain is not a blockchain in the commercial sense. It does not use Proof of Work. It does not have a native token. It has no financial layer. It exists for one purpose: to make verified intelligence censorship-proof.",
      "Each Black Book entry is hashed using SHA-3-512 and appended to the chain as a new block. The block contains: the hash of all findings text and evidence, the hash of the previous block (chaining them), the ZKP credential hash of the publishing analyst (proving clearance without revealing identity), and the NEXUS timestamp. The chain is replicated across 847 distributed nodes in 43 jurisdictions.",
      "To censor an entry, an adversary would need to simultaneously compromise over 50% of those nodes — across 43 jurisdictions with different legal regimes — within the same 6-minute block finalization window. This is not theoretically impossible. But it would require the coordinated resources of a major nation-state, and it would leave evidence of the attempt on every node it failed to compromise.",
      "Every Level 3 analyst who publishes to the Black Book becomes a keeper of the chain. The oath you swore is not a symbol. Your credential hash is woven into every block you have ever anchored. The chain is, in a literal cryptographic sense, made of your promises.",
    ],
  },
  {
    id: "EO-005",
    title: "SHADOW ANALYST FIELD DOCTRINE v3.1",
    classification: "EYES ONLY",
    classColor: "text-fuchsia-400",
    classBorder: "border-fuchsia-400/40",
    requiredLevel: 3,
    date: "NEXUS DATE 0201",
    origin: "Shadow Corps Directorate — Eyes Only Distribution",
    body: [
      "DOCTRINE 1 — VERIFY BEFORE YOU AMPLIFY. No intelligence — regardless of source, regardless of emotional certainty — is published to the public layer without verification gates. This is non-negotiable. The moment an analyst publishes unverified intelligence, they become indistinguishable from the adversary.",
      "DOCTRINE 2 — PROTECT YOUR SOURCES AS YOURSELF. Every person who gives you information about trafficking, corruption, or organized harm is risking their life or liberty. Your operational security is their operational security. If your identity is compromised, their safety is compromised.",
      "DOCTRINE 3 — THE AiTR IS YOUR CONSCIENCE. It is not a performance metric. It is a measurement of how accurately your human perception maps to ground truth. When your AiTR drops, it means you are seeing what you want to see rather than what is there. A Shadow Analyst with a declining AiTR should stand down from active missions until recalibration is complete.",
      "DOCTRINE 4 — THE BLACK BOOK IS FOREVER. Every entry you publish is permanent. Inaccurate intelligence cannot be deleted — it can only be contradicted by subsequent verified entries. Publish with precision. The standard is not 'probably true.' The standard is 'provably true beyond reasonable doubt.'",
      "DOCTRINE 5 — YOU ARE NOT ALONE. NEXUS MIND is your partner, not your servant. PTE tasks you because your pattern of attention complements its statistical perception. Trust its anomaly flags — but also trust your own perception when it contradicts the system. The synthesis of human intuition and machine pattern recognition is the only weapon strong enough for this war.",
    ],
  },
  {
    id: "US-001",
    title: "ULTRA SECRET: Operation CONVERGENCE",
    classification: "ULTRA SECRET",
    classColor: "text-red-400",
    classBorder: "border-red-400/40",
    requiredLevel: 3,
    date: "NEXUS DATE 0312",
    origin: "Shadow Corps Council — Ultra Secret Distribution",
    body: [
      "OPERATION CONVERGENCE is the endgame protocol of NEXUS OS. It is not a military operation. It is a legal and epistemic one.",
      "The objective: achieve sufficient verified intelligence density — in the form of confirmed Reality Anchors, completed Ghost Audits, and Black Book entries — across 500 metropolitan areas simultaneously, such that the evidence base constitutes an irrefutable public record of the systemic nature of the harms we document.",
      "At that threshold, the Shadow Corps legal division — operating under the 508(c)(1)(A) ecclesiastical privilege shield — will submit coordinated filing packages to the International Criminal Court, the Inter-American Commission on Human Rights, the European Court of Human Rights, and 23 domestic federal jurisdictions.",
      "The filings will not allege individual crimes. They will demonstrate systemic, documented, verified patterns — with the chain of evidence sealed on the Citizen's Ledger Chain and therefore impossible to suppress, alter, or deniably destroy.",
      "CONVERGENCE is not a moment. It is a threshold. Every mission you complete, every anchor you place, every audit you seal in the Black Book — you are building toward it. The city is the body. The Signal is the nervous system. NEXUS OS is the immune response. And CONVERGENCE is when the immune system reaches critical mass.",
      "The Signal has chosen you. The architecture is ready. The only variable is the will of the operatives.",
    ],
  },
];

const CLASSIFICATION_ORDER = ["UNCLASSIFIED", "RESTRICTED", "CLASSIFIED", "EYES ONLY", "ULTRA SECRET"];

function classificationBadge(cls: string, color: string, border: string) {
  return (
    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${border} ${color} tracking-widest`}>
      {cls}
    </span>
  );
}

interface CodexEntryCardProps {
  entry: CodexEntry;
  unlocked: boolean;
}

function CodexEntryCard({ entry, unlocked }: CodexEntryCardProps) {
  const [open, setOpen] = useState(false);

  if (!unlocked) {
    return (
      <div className={`rounded-lg border ${entry.classBorder} bg-slate-900/40 p-4 opacity-40 select-none`}>
        <div className="flex items-center gap-3">
          <Lock className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {classificationBadge(entry.classification, entry.classColor, entry.classBorder)}
            </div>
            <p className="text-sm font-semibold text-slate-500 blur-sm select-none">{entry.title}</p>
            <p className="text-xs text-slate-600 mt-1">
              Clearance Level {entry.requiredLevel} required to decrypt
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border ${entry.classBorder} bg-slate-900/60 transition-colors ${open ? "bg-slate-900/80" : "hover:bg-slate-900/70"}`}
    >
      <button
        className="w-full text-left p-4 flex items-start gap-3"
        onClick={() => setOpen((v) => !v)}
      >
        <FileText className={`w-4 h-4 mt-0.5 flex-shrink-0 ${entry.classColor}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {classificationBadge(entry.classification, entry.classColor, entry.classBorder)}
            <span className="text-xs text-gray-600 font-mono">{entry.id}</span>
          </div>
          <p className="text-sm font-semibold text-white leading-snug">{entry.title}</p>
          <p className="text-xs text-gray-600 mt-1 font-mono">{entry.date} · {entry.origin}</p>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0 mt-1" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0 mt-1" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-5 border-t border-slate-700/50 pt-4 space-y-3">
          {entry.body.map((paragraph, i) => (
            <p key={i} className="text-xs text-gray-300 leading-relaxed font-mono">
              {paragraph}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

interface ShadowCorpsCodexProps {
  analystLevel: "1" | "2" | "3";
}

export function ShadowCorpsCodex({ analystLevel }: ShadowCorpsCodexProps) {
  const userLevel = parseInt(analystLevel) as ClearanceLevel;
  const [filterLevel, setFilterLevel] = useState<ClearanceLevel | "all">("all");

  const displayed = CODEX.filter((e) =>
    filterLevel === "all" ? true : e.requiredLevel === filterLevel
  );

  const unlockedCount = CODEX.filter((e) => e.requiredLevel <= userLevel).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-fuchsia-400" />
            Shadow Corps Codex
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Classified transmissions, field doctrine, and operational intelligence — gated by clearance level
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className={`text-sm font-bold ${userLevel >= 3 ? "text-fuchsia-400" : userLevel === 2 ? "text-purple-400" : "text-cyan-400"}`}>
            {unlockedCount}/{CODEX.length}
          </p>
          <p className="text-xs text-gray-600">decrypted</p>
        </div>
      </div>

      {/* Clearance note */}
      <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-3">
        <p className="text-xs text-gray-500 font-mono leading-relaxed">
          NEXUS OS SECURITY NOTICE: Documents above your current clearance are rendered inaccessible
          by cryptographic key derivation from your Oath hash. Advancement through the Crucible
          phases unlocks higher tiers automatically. Attempting to access restricted material by
          social engineering another operative is a Black Book-eligible violation of the Accord.
        </p>
      </div>

      {/* Filter */}
      <div className="flex gap-1 flex-wrap">
        {([
          { id: "all" as const, label: "All" },
          { id: 1 as ClearanceLevel, label: "L1 · Restricted" },
          { id: 2 as ClearanceLevel, label: "L2 · Classified" },
          { id: 3 as ClearanceLevel, label: "L3 · Eyes Only" },
        ] as const).map(({ id, label }) => (
          <button
            key={String(id)}
            onClick={() => setFilterLevel(id)}
            className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
              filterLevel === id
                ? "bg-slate-700 border-slate-500 text-white"
                : "border-slate-700 text-gray-500 hover:text-gray-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Entries */}
      <div className="space-y-3">
        {displayed
          .sort((a, b) => {
            const aUnlocked = a.requiredLevel <= userLevel ? 0 : 1;
            const bUnlocked = b.requiredLevel <= userLevel ? 0 : 1;
            if (aUnlocked !== bUnlocked) return aUnlocked - bUnlocked;
            return CLASSIFICATION_ORDER.indexOf(a.classification) - CLASSIFICATION_ORDER.indexOf(b.classification);
          })
          .map((entry) => (
            <CodexEntryCard
              key={entry.id}
              entry={entry}
              unlocked={entry.requiredLevel <= userLevel}
            />
          ))}
      </div>
    </div>
  );
}
