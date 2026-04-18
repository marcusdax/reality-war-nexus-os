import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Eye, Shield, Network, Skull, Building2, Lock, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";

type Alignment = "allied" | "contested" | "adversary";
type Threat = "minimal" | "moderate" | "elevated" | "critical" | "existential";

interface FactionDossier {
  id: string;
  name: string;
  codename: string;
  sigil: string;
  alignment: Alignment;
  threat: Threat;
  requiredLevel: 1 | 2 | 3;
  doctrine: string;
  methodology: string[];
  knownOperations: string[];
  engagementGuidance: string;
  accentColor: string;
  borderColor: string;
  bgColor: string;
}

const ALIGNMENT_CONFIG: Record<Alignment, { label: string; color: string; border: string }> = {
  allied: { label: "ALLIED", color: "text-cyan-400", border: "border-cyan-400/40" },
  contested: { label: "CONTESTED ACCORD", color: "text-amber-400", border: "border-amber-400/40" },
  adversary: { label: "ADVERSARY", color: "text-red-400", border: "border-red-400/40" },
};

const THREAT_CONFIG: Record<Threat, { label: string; color: string; bars: number }> = {
  minimal: { label: "MINIMAL", color: "text-green-400", bars: 1 },
  moderate: { label: "MODERATE", color: "text-cyan-400", bars: 2 },
  elevated: { label: "ELEVATED", color: "text-amber-400", bars: 3 },
  critical: { label: "CRITICAL", color: "text-orange-400", bars: 4 },
  existential: { label: "EXISTENTIAL", color: "text-red-400", bars: 5 },
};

const FACTIONS: FactionDossier[] = [
  {
    id: "truth_seekers",
    name: "Truth Seekers",
    codename: "THE LUMINOUS",
    sigil: "◆",
    alignment: "allied",
    threat: "minimal",
    requiredLevel: 1,
    doctrine:
      "Radical transparency. The Truth Seekers believe that any verified intelligence must be released to the public the moment verification completes — that delay is itself a form of suppression. They run the public broadcast layer of NEXUS OS and maintain the open Reality Stream feeds.",
    methodology: [
      "Operate the public-facing Reality Stream broadcasting platform",
      "Maintain the Citizen's Ledger Chain replication network across 847 distributed nodes",
      "Recruit primarily from environmental science, journalism, and digital rights backgrounds",
      "Decision-making structure is non-hierarchical consensus — slow but resistant to capture",
    ],
    knownOperations: [
      "BLUE CASCADE — exposed three coordinated municipal water-quality reporting frauds across the western seaboard",
      "OPEN LEDGER — published 12,000 verified anchor entries documenting an illegal logging operation in real time",
      "GLASSHOUSE — broadcast a 72-hour live verification stream during the 2024 election certification period",
    ],
    engagementGuidance:
      "Truth Seekers are reliable allies but their compulsion toward immediate disclosure has historically endangered Shadow Corps operatives in the field. NEVER share unfinalized Ghost Audit data with Truth Seeker contacts — they will publish reflexively. Coordinate through formal Accord channels only.",
    accentColor: "text-cyan-300",
    borderColor: "border-cyan-400/30",
    bgColor: "bg-cyan-950/20",
  },
  {
    id: "reality_architects",
    name: "Reality Architects",
    codename: "THE SHAPERS",
    sigil: "◈",
    alignment: "contested",
    threat: "moderate",
    requiredLevel: 1,
    doctrine:
      "Curated truth. Reality Architects believe that raw verified intelligence is insufficient — that without strategic framing, the truth is simply absorbed into the noise and forgotten. They build the narrative infrastructure: the AR overlays, the contextual storytelling layers, the counter-narrative campaigns.",
    methodology: [
      "Author and deploy AR overlay narratives on top of the geographic map layer",
      "Run the LumiMart creator marketplace for in-world script publishing",
      "Recruit from filmmaking, advertising, behavioral psychology, and game design backgrounds",
      "Decision-making is led by a rotating Council of Twelve elected by faction members",
    ],
    knownOperations: [
      "MIRROR PROTOCOL — countered a coordinated disinformation campaign by reframing 4.2M public messages within 18 hours",
      "INVERSE NARRATIVE — built an AR exhibit overlaying real trafficking corridor data onto luxury district storefronts",
      "SHARDS — deployed a nine-month narrative campaign that resulted in three federal trafficking indictments",
    ],
    engagementGuidance:
      "Reality Architects are formal Accord signatories, but the Shadow Corps Council classifies them as CONTESTED. Multiple incidents on record of Architects seeding unverified intelligence into the public layer to support their narrative campaigns. Every Architect liaison should be met with a parallel Shadow Corps verifier present. Trust the doctrine, audit the data.",
    accentColor: "text-amber-300",
    borderColor: "border-amber-400/30",
    bgColor: "bg-amber-950/20",
  },
  {
    id: "sovereign_engine",
    name: "The Sovereign Engine",
    codename: "WORM",
    sigil: "▼",
    alignment: "adversary",
    threat: "critical",
    requiredLevel: 2,
    doctrine:
      "State-aligned surveillance and information control. The Sovereign Engine is a network of ex-intelligence operatives, former defense contractors, and embedded municipal officials who treat NEXUS OS as a hostile foreign intelligence service. Their goal is not to destroy the network — it is to compromise it, redirect it, and ultimately operate it.",
    methodology: [
      "Deploy false operatives — sleeper accounts that complete legitimate missions for months before activation",
      "Use legal pressure (subpoenas, classification orders) to force data disclosure from peripheral services",
      "Run parallel infrastructure that mimics NEXUS OS aesthetics to confuse new recruits",
      "Coordinate with sympathetic municipal officials to deny operatives physical access to documentation sites",
    ],
    knownOperations: [
      "HOLLOWMAN — attempted infiltration of the Crucible Phase II program (detected, three operatives expelled)",
      "PROJECT MIRROR — operated a counterfeit Truth Seeker broadcast channel for 14 weeks before exposure",
      "QUIET ROOM — leveraged classified-information-protection statutes to attempt seizure of three Black Book replication nodes (seizures were jurisdictionally fragmented and ultimately failed)",
    ],
    engagementGuidance:
      "Assume Sovereign Engine surveillance on every public-facing Shadow Corps interaction. Verify all operative credentials through ZKP challenges before sensitive coordination. If an operative's pattern of activity changes abruptly — new devices, new networks, new locations without explanation — escalate immediately. The Engine plays long.",
    accentColor: "text-red-300",
    borderColor: "border-red-400/40",
    bgColor: "bg-red-950/20",
  },
  {
    id: "vellichor",
    name: "Vellichor Combine",
    codename: "THE EDITORS",
    sigil: "◢",
    alignment: "adversary",
    threat: "elevated",
    requiredLevel: 2,
    doctrine:
      "Corporate evidence suppression for hire. Vellichor is a private intelligence consortium that contracts with multinational corporations, real estate conglomerates, and high-net-worth individuals to systematically dismantle public evidence of their clients' activities. They do not commit the harms — they erase the documentation.",
    methodology: [
      "Mass-purchase domain names, social profiles, and search-result inventory adjacent to client controversies",
      "Operate networks of paid 'witnesses' who issue contradictory statements to muddy evidence chains",
      "Deploy SEO and recommendation-algorithm exploitation to bury investigative reporting",
      "Use defamation litigation strategically to force takedowns even of substantively true reporting",
    ],
    knownOperations: [
      "PAPER OCEAN — buried 200+ verified pollution reports under a flood of synthetic counter-narratives",
      "LADDER — successfully forced takedown of 47 Reality Anchor entries through coordinated legal pressure (entries restored after Black Book republication)",
      "MARGIN — operated a fake 'fact-checking' service that exclusively debunked accurate Truth Seeker reporting",
    ],
    engagementGuidance:
      "Vellichor's operations are legal, expensive, and asymmetric — they cost a target millions to defend against and them very little to deploy. The Black Book is the primary defense: cryptographically chained evidence cannot be silently disappeared. When you publish, publish to the chain. Anything that exists only on conventional infrastructure is vulnerable to a Vellichor erasure cycle.",
    accentColor: "text-orange-300",
    borderColor: "border-orange-400/30",
    bgColor: "bg-orange-950/20",
  },
  {
    id: "hollow_council",
    name: "The Hollow Council",
    codename: "THE FACELESS QUORUM",
    sigil: "✕",
    alignment: "adversary",
    threat: "existential",
    requiredLevel: 3,
    doctrine:
      "Organized human trafficking and forced labor syndicate operating across 31 identified jurisdictions. The Hollow Council is not a single organization — it is the convergent operational output of a network of regional cells that share infrastructure, extraction routes, and money-laundering chains. They are the primary verified target of Operation CONVERGENCE.",
    methodology: [
      "Use legitimate logistics infrastructure (shipping, hospitality, agricultural labor) as cover for extraction routes",
      "Embed in regions experiencing Observer Fracture — they actively monitor NEXUS OS signal data for vulnerable zones",
      "Maintain legal facades via shell corporations registered through Vellichor-adjacent firms",
      "Have demonstrated capacity to retaliate against operatives whose identity has been compromised — three confirmed assassination attempts on record (all targets survived; identity compromise traced to Sovereign Engine leak)",
    ],
    knownOperations: [
      "(CLASSIFIED) — extraction route disruption, 47 individuals recovered",
      "(CLASSIFIED) — financial chain documentation, 12 federal indictments pending",
      "(CLASSIFIED) — coordinated multi-jurisdictional Black Book filing currently building toward CONVERGENCE threshold",
    ],
    engagementGuidance:
      "The Hollow Council is the reason Shadow Corps exists. Every doctrine in the Field Manual — verification gates, ZKP credentials, Ghost Protocol routing, Black Book chaining — was designed against this adversary. Direct engagement is forbidden without Council-level authorization. Any operative who believes they have identified a Hollow Council node is to immediately escalate through ULTRA SECRET channels and stand down from independent action. They have killed for less.",
    accentColor: "text-fuchsia-300",
    borderColor: "border-fuchsia-400/40",
    bgColor: "bg-fuchsia-950/20",
  },
];

function ThreatBars({ threat }: { threat: Threat }) {
  const conf = THREAT_CONFIG[threat];
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`w-1.5 h-3 rounded-sm ${i <= conf.bars ? conf.color.replace("text-", "bg-") : "bg-slate-700"}`}
          />
        ))}
      </div>
      <span className={`text-xs font-bold font-mono tracking-wider ${conf.color}`}>{conf.label}</span>
    </div>
  );
}

interface FactionCardProps {
  dossier: FactionDossier;
  unlocked: boolean;
}

function FactionCard({ dossier, unlocked }: FactionCardProps) {
  const [open, setOpen] = useState(false);
  const align = ALIGNMENT_CONFIG[dossier.alignment];
  const Icon =
    dossier.alignment === "allied" ? Shield :
    dossier.alignment === "contested" ? Network :
    dossier.id === "hollow_council" ? Skull :
    dossier.id === "vellichor" ? Building2 :
    Eye;

  if (!unlocked) {
    return (
      <Card className={`p-4 border ${dossier.borderColor} bg-slate-900/40 opacity-40 select-none`}>
        <div className="flex items-center gap-3">
          <Lock className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-500 blur-sm select-none">[FACTION REDACTED]</p>
            <p className="text-xs text-slate-600 mt-1">
              Clearance Level {dossier.requiredLevel} required to decrypt this dossier
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`border ${dossier.borderColor} ${dossier.bgColor} transition-colors`}>
      <button
        className="w-full text-left p-5 flex items-start gap-4"
        onClick={() => setOpen((v) => !v)}
      >
        <div className={`w-12 h-12 rounded-lg border ${dossier.borderColor} flex items-center justify-center flex-shrink-0 bg-slate-900/60`}>
          <Icon className={`w-5 h-5 ${dossier.accentColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-xs font-mono font-bold tracking-widest px-2 py-0.5 rounded border ${align.border} ${align.color}`}>
              {align.label}
            </span>
            <span className={`text-2xl font-bold ${dossier.accentColor}`}>{dossier.sigil}</span>
          </div>
          <p className={`text-base font-bold ${dossier.accentColor}`}>{dossier.name}</p>
          <p className="text-xs text-gray-500 font-mono mt-0.5">CODENAME: {dossier.codename}</p>
          <div className="mt-2"><ThreatBars threat={dossier.threat} /></div>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0 mt-2" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0 mt-2" />
        )}
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-slate-700/40 pt-4 space-y-4">
          {/* Doctrine */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Doctrine</p>
            <p className="text-xs text-gray-300 leading-relaxed">{dossier.doctrine}</p>
          </div>

          {/* Methodology */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Methodology</p>
            <ul className="space-y-1.5">
              {dossier.methodology.map((m, i) => (
                <li key={i} className="text-xs text-gray-400 leading-relaxed flex gap-2">
                  <span className={`${dossier.accentColor} mt-0.5 flex-shrink-0`}>›</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Known Operations */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Known Operations</p>
            <ul className="space-y-1.5">
              {dossier.knownOperations.map((op, i) => (
                <li key={i} className="text-xs text-gray-400 leading-relaxed flex gap-2 font-mono">
                  <span className="text-gray-600 mt-0.5 flex-shrink-0">{String(i + 1).padStart(2, "0")}.</span>
                  <span>{op}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Engagement Guidance */}
          <div className={`rounded-lg border ${dossier.borderColor} bg-slate-900/40 p-3`}>
            <div className="flex items-start gap-2">
              <AlertTriangle className={`w-4 h-4 ${dossier.accentColor} flex-shrink-0 mt-0.5`} />
              <div>
                <p className={`text-xs font-bold ${dossier.accentColor} uppercase tracking-wider mb-1`}>Engagement Guidance</p>
                <p className="text-xs text-gray-300 leading-relaxed">{dossier.engagementGuidance}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

interface FactionIntelligenceProps {
  analystLevel: "1" | "2" | "3";
}

export function FactionIntelligence({ analystLevel }: FactionIntelligenceProps) {
  const userLevel = parseInt(analystLevel) as 1 | 2 | 3;
  const [filter, setFilter] = useState<Alignment | "all">("all");

  const filtered = FACTIONS.filter((f) => filter === "all" || f.alignment === filter);
  const unlockedCount = FACTIONS.filter((f) => f.requiredLevel <= userLevel).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Network className="w-5 h-5 text-fuchsia-400" />
            Faction Intelligence
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Allied, contested, and adversarial entities operating in the same geographic and informational space
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className={`text-sm font-bold ${userLevel >= 3 ? "text-fuchsia-400" : userLevel === 2 ? "text-purple-400" : "text-cyan-400"}`}>
            {unlockedCount}/{FACTIONS.length}
          </p>
          <p className="text-xs text-gray-600">profiled</p>
        </div>
      </div>

      {/* Operating principle */}
      <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-3">
        <p className="text-xs text-gray-500 font-mono leading-relaxed">
          NEXUS OS does not exist in a vacuum. Every operative must understand the ecosystem of forces
          competing to shape what is recorded, what is published, and what is allowed to be remembered.
          These dossiers are continuously updated by the Council. If you encounter conduct in the field
          that contradicts a profile, file a Ghost Audit.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-1 flex-wrap">
        {([
          { id: "all" as const, label: "All Factions" },
          { id: "allied" as const, label: "Allied" },
          { id: "contested" as const, label: "Contested" },
          { id: "adversary" as const, label: "Adversary" },
        ] as const).map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
              filter === id
                ? "bg-slate-700 border-slate-500 text-white"
                : "border-slate-700 text-gray-500 hover:text-gray-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {filtered
          .sort((a, b) => {
            const aUnlocked = a.requiredLevel <= userLevel ? 0 : 1;
            const bUnlocked = b.requiredLevel <= userLevel ? 0 : 1;
            if (aUnlocked !== bUnlocked) return aUnlocked - bUnlocked;
            const order: Alignment[] = ["allied", "contested", "adversary"];
            return order.indexOf(a.alignment) - order.indexOf(b.alignment);
          })
          .map((dossier) => (
            <FactionCard
              key={dossier.id}
              dossier={dossier}
              unlocked={dossier.requiredLevel <= userLevel}
            />
          ))}
      </div>
    </div>
  );
}
