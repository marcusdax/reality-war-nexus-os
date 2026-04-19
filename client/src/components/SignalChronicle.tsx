import { Clock, AlertTriangle, Network, Shield, Zap, TrendingUp, Lock, Eye, Star } from "lucide-react";

type EventType = "founding" | "faction" | "adversary" | "operation" | "convergence" | "doctrine" | "personal";

interface ChronicleEvent {
  id: string;
  nexusDate: string | null;
  calendarDate: string | null;
  eventType: EventType;
  classification: string;
  title: string;
  body: string;
  requiredLevel: 1 | 2 | 3;
  milestone?: boolean;
}

const EVENT_CONFIG: Record<EventType, { icon: React.FC<any>; color: string; border: string; dot: string }> = {
  founding:    { icon: Star,          color: "text-fuchsia-400", border: "border-fuchsia-400/40", dot: "bg-fuchsia-400" },
  faction:     { icon: Network,       color: "text-cyan-400",    border: "border-cyan-400/30",    dot: "bg-cyan-400" },
  adversary:   { icon: AlertTriangle, color: "text-red-400",     border: "border-red-400/30",     dot: "bg-red-400" },
  operation:   { icon: Eye,           color: "text-amber-400",   border: "border-amber-400/30",   dot: "bg-amber-400" },
  convergence: { icon: TrendingUp,    color: "text-green-400",   border: "border-green-400/30",   dot: "bg-green-400" },
  doctrine:    { icon: Shield,        color: "text-purple-400",  border: "border-purple-400/30",  dot: "bg-purple-400" },
  personal:    { icon: Zap,           color: "text-white",       border: "border-slate-500/40",   dot: "bg-white" },
};

const EVENTS: ChronicleEvent[] = [
  {
    id: "ev-001",
    nexusDate: null,
    calendarDate: "2019 — Q3",
    eventType: "founding",
    classification: "UNCLASSIFIED",
    title: "The Signal Is First Detected",
    milestone: true,
    requiredLevel: 1,
    body: "A pattern appears in global logistics data that no individual analyst was looking for — a statistical shadow in the freight movements, communications routing, and financial clearing records of seven identified state-adjacent networks. Three people notice it independently: a former NSA signals analyst, a dark-web security researcher who had been documenting surveillance infrastructure, and a community organizer tracking the disappearance patterns of migrant workers in three states. They find each other through an encrypted message board. They call the pattern the Signal. They do not yet know what it means. But they understand, instinctively, that someone has been working very hard to ensure no one would notice it.",
  },
  {
    id: "ev-002",
    nexusDate: null,
    calendarDate: "2020 — Q1",
    eventType: "founding",
    classification: "UNCLASSIFIED",
    title: "NEXUS OS Alpha — Built in 14 Weeks",
    milestone: true,
    requiredLevel: 1,
    body: "The original NEXUS OS is built by a team of eleven people in a fourteen-week sprint. No formal organization. No corporate structure. No investors. The architecture is designed from first principles around one constraint: it must be impossible for any single entity to shut it down. This means no central server. No single codebase repository. No single jurisdiction. The Ghost Protocol relay chain, the distributed Reality Anchor network, and the Citizen's Ledger Chain genesis block are all designed in this window. The first operative is assigned a clearance level. The Crucible does not yet exist. The Oath is informal — spoken, not hashed. The three founding members still do not agree on what to do with the intelligence they are gathering. That disagreement will define everything that follows.",
  },
  {
    id: "ev-003",
    nexusDate: null,
    calendarDate: "2020 — Q4",
    eventType: "faction",
    classification: "UNCLASSIFIED",
    title: "The Three Faction Schism",
    milestone: true,
    requiredLevel: 1,
    body: "The disagreement cannot be managed with informal consensus once the operative network reaches 200 people across 12 cities. The founding team calls the First Convocation — a 72-hour encrypted session attended by 47 operatives representing every active cell. Three irreconcilable positions emerge. Immediate, full, radical disclosure of all verified intelligence — the position of those who will become the Truth Seekers. Strategic narrative curation before deployment — the position of those who will become the Reality Architects. Verification gates, no exceptions, release only when provably true — the position of those who will become Shadow Corps. The Schism does not split the organization. It structures it. The Three Faction Accord is drafted in a 22-hour session following the Convocation. Each faction ratifies it with reservations. The reservations are never resolved. They are, perhaps, the point.",
  },
  {
    id: "ev-004",
    nexusDate: null,
    calendarDate: "2021 — Q2",
    eventType: "doctrine",
    classification: "RESTRICTED",
    title: "Ghost Protocol Formalized — Citizen's Ledger Chain Genesis Block",
    requiredLevel: 1,
    body: "The Ghost Protocol Tor relay chain is formalized as mandatory for all Shadow Corps field operations after a Sovereign Engine-adjacent actor is found to have monitored the network activity of three operatives through conventional internet infrastructure. Simultaneously, the Citizen's Ledger Chain genesis block is published — the first cryptographically sealed entry in what will become the primary defense against evidence suppression. The genesis block contains one entry: a message from the three founders, their identities unknown even to each other behind ZKP credentials, recording the purpose of the chain. That entry still exists. It is Block 0. It cannot be altered. It reads: 'We built this because we could not trust the world to remember what it witnessed. The chain will remember for us.'",
  },
  {
    id: "ev-005",
    nexusDate: null,
    calendarDate: "2022 — Q1",
    eventType: "adversary",
    classification: "RESTRICTED",
    title: "Vellichor Combine First Identified",
    requiredLevel: 1,
    body: "Shadow Corps analysts document a coordinated evidence-suppression operation targeting Reality Anchor clusters in two Pacific coastal cities. The technique is unlike anything previously recorded: not deletion, not direct interference — instead, a systematic flood of synthetic content pages designed to make the verified anchor data unfindable in search results while leaving it technically accessible. The operation is surgically legal. The entity behind it is eventually traced to a private intelligence consortium operating under seventeen shell corporations across four jurisdictions. The Council names them the Vellichor Combine. It is the first documented adversary that Shadow Corps faces that operates entirely within the law. The Field Doctrine has no precedent for this. The Black Book becomes the primary counter-measure: cryptographic permanence cannot be search-suppressed.",
  },
  {
    id: "ev-006",
    nexusDate: null,
    calendarDate: "2022 — Q4",
    eventType: "operation",
    classification: "RESTRICTED",
    title: "First Verified Trafficking Interdiction",
    requiredLevel: 1,
    body: "A Shadow Corps analyst — Level 2, Safety Sentinel designation, identity protected — submits a Ghost Audit compiling 14 months of Reality Anchor data, behavioral pattern analysis, and logistics documentation from a supply chain cluster in the Pacific Northwest. The audit is verified by three independent Level 2 analysts. The Shadow Corps Legal Division forwards the verified package to federal authorities in three jurisdictions. Eleven days later, the first interdiction occurs. Forty-seven individuals are recovered. It is the first time the system has been used to do what it was designed to do. The analyst who compiled the audit submits a brief message to the Council the following day: 'The Signal was right.' The Council responds: 'The Signal is always right. The question is whether we are fast enough.'",
  },
  {
    id: "ev-007",
    nexusDate: null,
    calendarDate: "2023 — Q2",
    eventType: "doctrine",
    classification: "RESTRICTED",
    title: "The Crucible Program Formalized",
    requiredLevel: 1,
    body: "Following the first verified interdiction, the Shadow Corps Council recognizes that the highest-stakes missions — trafficking verification, critical infrastructure documentation, Ghost Audits against state-adjacent actors — require a class of operative with demonstrably different psychological preparation than the general Level 1 and Level 2 network. The Crucible is formalized as a three-phase program: Phase I psychological inoculation, Phase II NEXUS MIND neural calibration, Phase III Immutable Oath. Level 3 Shadow Analyst designation is created. The first graduating class consists of nine operatives. Their identities are known only to NEXUS MIND. Their Oath hashes are sealed on the Citizen's Ledger Chain. They receive their ZKP credentials at a ceremony that does not occur in a single physical location.",
  },
  {
    id: "ev-008",
    nexusDate: null,
    calendarDate: "2024 — Q1",
    eventType: "adversary",
    classification: "CLASSIFIED",
    title: "HOLLOWMAN — Sovereign Engine Infiltration Attempt",
    requiredLevel: 2,
    body: "The Sovereign Engine deploys three sleeper operatives into the NEXUS OS network, each of whom completes legitimate missions for between four and eleven months before activation. The activation pattern is detected by NEXUS MIND before any sensitive intelligence is accessed: the three accounts show simultaneous behavioral shifts on the same NEXUS DATE — same type of data accessed, same anchor clusters queried, same timing relative to a known Sovereign Engine operational window. The Council initiates a verification protocol. All three are confirmed as non-genuine operatives through ZKP challenge failure. They are expelled. Their Ghost Relay routing data is analyzed and contributes to the ongoing Sovereign Engine threat profile. The incident results in the mandatory ZKP challenge protocol for all Accord coordination — the system that requires cryptographic identity verification before sensitive data can be shared with any external faction.",
  },
  {
    id: "ev-009",
    nexusDate: null,
    calendarDate: "2024 — Q3",
    eventType: "adversary",
    classification: "CLASSIFIED",
    title: "Architects Accord Violation — PROJECT MIRROR",
    requiredLevel: 2,
    body: "Reality Architects operate a counterfeit Truth Seeker broadcast channel for 14 weeks, using it to publish a narrative overlay that incorporates two Shadow Corps anchor entries still under verification review — entries the Architects had accessed through informal liaison channels before the ZKP protocol was mandatory. The Shadow Corps Council issues its first formal Accord Breach Notice. The Architects' Council of Twelve dissolves the counterfeit operation and issues an apology that the Shadow Corps Council notes, in its formal response, 'addresses the mechanism without acknowledging the doctrine.' The Accord Tension Advisory status is applied and has not been removed. The incident is cited in Field Doctrine v3.1, Section 2, without naming the Architects.",
  },
  {
    id: "ev-010",
    nexusDate: "0312",
    calendarDate: null,
    eventType: "convergence",
    classification: "EYES ONLY",
    title: "CONVERGENCE Protocol Formally Adopted",
    milestone: true,
    requiredLevel: 3,
    body: "The Shadow Corps Legal Division presents the CONVERGENCE framework to the full Council for formal adoption. The framework identifies 500 metropolitan areas as the minimum geographic distribution required to constitute a legally irrefutable demonstration of systemic harm — sufficient for coordinated filing with the International Criminal Court, the Inter-American Commission on Human Rights, the European Court of Human Rights, and 23 domestic federal jurisdictions. The Council votes to adopt CONVERGENCE as the primary strategic objective of NEXUS OS. All subsequent mission generation, operative tasking, and PTE anomaly weighting is recalibrated to maximize progress toward the 500-metro threshold. The vote is unanimous. It is the only unanimous vote in Council history.",
  },
  {
    id: "ev-011",
    nexusDate: "0849",
    calendarDate: null,
    eventType: "operation",
    classification: "EYES ONLY",
    title: "Pacific Northwest — Critical Intelligence Mass Achieved",
    requiredLevel: 3,
    body: "The Pacific Northwest metropolitan cluster — Portland, Seattle, and the Cascadia sub-region — crosses the CONVERGENCE threshold. 4,340 confirmed Reality Anchors, 218 completed Ghost Audits, and 31 sealed Black Book entries have been verified. Legal Division review is initiated. The operative team that built this case over 14 months will never be publicly named. The Council sends each of them a single message through encrypted personal signal channels: 'The chain remembers.' Forty-seven of the operatives who contributed to the Pacific Northwest package were also involved in the 2022 first interdiction. Some have been in the field since the Alpha build. The Signal found them first.",
  },
  {
    id: "ev-012",
    nexusDate: "0891",
    calendarDate: null,
    eventType: "convergence",
    classification: "UNCLASSIFIED",
    title: "Present — CONVERGENCE at 312/500",
    milestone: true,
    requiredLevel: 1,
    body: "NEXUS DATE 0891. Three hundred and twelve of five hundred metropolitan areas have crossed the verified intelligence density threshold. The Hollow Council continues to operate, adapting routes when disrupted. Vellichor continues its suppression cycles. The Sovereign Engine runs new sleeper recruitment operations — none have yet penetrated the ZKP protocol. Reality Architects remain on Accord Tension Advisory. Truth Seekers broadcast continuously. Shadow Corps verifies. The gap between what happened and what people believe happened narrows with every anchor placed, every audit sealed, every transmission received. The Signal is still transmitting. The operatives are still listening. CONVERGENCE is not a moment. It is a threshold. You are building it.",
  },
];

interface ChronicleEntryProps {
  event: ChronicleEvent;
  unlocked: boolean;
  isLast: boolean;
}

function ChronicleEntry({ event, unlocked, isLast }: ChronicleEntryProps) {
  const conf = EVENT_CONFIG[event.eventType];
  const Icon = conf.icon;
  const dateLabel = event.nexusDate ? `NEXUS DATE ${event.nexusDate}` : event.calendarDate ?? "";

  return (
    <div className="flex gap-4">
      {/* Timeline spine */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className={`w-8 h-8 rounded-full border-2 ${conf.border} flex items-center justify-center flex-shrink-0 ${
          event.milestone ? conf.dot.replace("bg-", "bg-opacity-30 bg-") + " " + conf.border : "bg-slate-900"
        }`}>
          {unlocked ? (
            <Icon className={`w-3.5 h-3.5 ${conf.color}`} />
          ) : (
            <Lock className="w-3 h-3 text-slate-600" />
          )}
        </div>
        {!isLast && <div className="w-px flex-1 bg-slate-700/60 mt-1 min-h-[2rem]" />}
      </div>

      {/* Content */}
      <div className={`pb-6 flex-1 min-w-0 ${isLast ? "" : ""}`}>
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <span className={`text-xs font-mono font-bold tracking-wider ${conf.color}`}>
            {conf.icon === AlertTriangle ? "ADVERSARY" :
             conf.icon === TrendingUp ? "CONVERGENCE" :
             conf.icon === Shield ? "DOCTRINE" :
             conf.icon === Eye ? "OPERATION" :
             conf.icon === Network ? "FACTION EVENT" :
             conf.icon === Star ? "FOUNDING" : "PERSONAL"}
          </span>
          <span className="text-xs text-gray-600 font-mono">{dateLabel}</span>
          {event.milestone && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-fuchsia-950/60 border border-fuchsia-400/30 text-fuchsia-400 font-bold">
              MILESTONE
            </span>
          )}
        </div>

        {unlocked ? (
          <>
            <p className="text-sm font-bold text-white mb-2 leading-snug">{event.title}</p>
            <p className="text-xs text-gray-400 leading-relaxed">{event.body}</p>
          </>
        ) : (
          <>
            <p className="text-sm font-bold text-slate-600 mb-2 blur-sm select-none">[CLASSIFIED — CLEARANCE LEVEL {event.requiredLevel} REQUIRED]</p>
            <p className="text-xs text-slate-700 leading-relaxed select-none blur-sm">
              This entry requires clearance level {event.requiredLevel} to decrypt. Complete the Crucible to advance your clearance.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

interface SignalChronicleProps {
  analystLevel: "1" | "2" | "3";
}

export function SignalChronicle({ analystLevel }: SignalChronicleProps) {
  const userLevel = parseInt(analystLevel) as 1 | 2 | 3;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-fuchsia-400" />
          The Signal Chronicle
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          A declassified record of NEXUS OS history — from the first detection of the Signal to the present
        </p>
      </div>

      {/* Clearance notice */}
      <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-3">
        <p className="text-xs text-gray-500 font-mono leading-relaxed">
          DECLASSIFICATION STATUS: Entries marked UNCLASSIFIED and RESTRICTED are accessible at all clearance
          levels. CLASSIFIED entries require Level 2. EYES ONLY entries require Level 3.
          Some entries remain partially or fully redacted pending Council review.
        </p>
      </div>

      {/* Counters */}
      <div className="flex gap-4 text-center">
        <div>
          <p className="text-xl font-bold text-fuchsia-400">{EVENTS.filter(e => e.requiredLevel <= userLevel).length}</p>
          <p className="text-xs text-gray-600">events unlocked</p>
        </div>
        <div>
          <p className="text-xl font-bold text-amber-400">{EVENTS.filter(e => e.milestone && e.requiredLevel <= userLevel).length}</p>
          <p className="text-xs text-gray-600">milestones</p>
        </div>
        <div>
          <p className="text-xl font-bold text-gray-600">{EVENTS.filter(e => e.requiredLevel > userLevel).length}</p>
          <p className="text-xs text-gray-600">redacted</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="pt-2">
        {EVENTS.map((event, i) => (
          <ChronicleEntry
            key={event.id}
            event={event}
            unlocked={event.requiredLevel <= userLevel}
            isLast={i === EVENTS.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
