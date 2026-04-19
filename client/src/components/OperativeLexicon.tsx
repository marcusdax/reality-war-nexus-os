import { useState } from "react";
import { BookOpen, Search } from "lucide-react";

type TermCategory = "system" | "faction" | "adversary" | "doctrine" | "technical" | "operative";

interface LexiconTerm {
  term: string;
  category: TermCategory;
  short: string;
  definition: string;
  seealso?: string[];
}

const CATEGORY_CONFIG: Record<TermCategory, { label: string; color: string }> = {
  system:    { label: "SYSTEM",    color: "text-cyan-400" },
  faction:   { label: "FACTION",   color: "text-fuchsia-400" },
  adversary: { label: "ADVERSARY", color: "text-red-400" },
  doctrine:  { label: "DOCTRINE",  color: "text-amber-400" },
  technical: { label: "TECHNICAL", color: "text-purple-400" },
  operative: { label: "OPERATIVE", color: "text-green-400" },
};

const TERMS: LexiconTerm[] = [
  {
    term: "AiTR",
    category: "system",
    short: "Anomaly-to-Truth Ratio",
    definition:
      "A personal calibration score measuring how accurately an operative's field reports match what the Predictive Tasking Engine predicted and what subsequent cross-verification confirmed. A high AiTR score causes NEXUS MIND to weight that operative's submitted anchor data more heavily in the broader intelligence synthesis. A declining AiTR is an operational warning sign — it indicates the operative is perceiving what they want to find rather than what is present. Level 3 Shadow Analyst designation requires sustained AiTR ≥ 98%.",
    seealso: ["PTE", "NEXUS MIND", "Reality Anchor"],
  },
  {
    term: "Anchor Investigation",
    category: "operative",
    short: "Peer-verification process for Reality Anchors",
    definition:
      "The process by which qualified operatives review and verify a deployed Reality Anchor. An anchor enters the 'investigating' status when three or more investigators join. Verdicts (confirmed / debunked / inconclusive) are tallied and a majority verdict is applied when sufficient investigators have submitted. Confirmed anchors become eligible for Black Book publication. Debunked anchors are flagged and excluded from intelligence synthesis.",
    seealso: ["Reality Anchor", "Black Book", "Shadow Black Book"],
  },
  {
    term: "Black Book",
    category: "system",
    short: "Shadow Black Book — the immutable intelligence ledger",
    definition:
      "The public-facing immutable record maintained on the Citizen's Ledger Chain. Each entry is SHA-3-512 hashed and chained to the previous block, making retroactive alteration computationally infeasible. Publishing to the Black Book requires Level 3 Shadow Analyst clearance. Entries are permanently accessible and replicated across 847 distributed nodes in 43 jurisdictions. The Black Book is the primary counter-measure against Vellichor Combine suppression operations.",
    seealso: ["Citizen's Ledger Chain", "Ghost Audit", "Vellichor Combine"],
  },
  {
    term: "Citizen's Ledger Chain",
    category: "technical",
    short: "The distributed cryptographic evidence chain",
    definition:
      "A distributed blockchain architecture designed specifically for evidence permanence rather than financial transactions. Uses no Proof of Work and has no native token. Each block contains a SHA-3-512 hash of intelligence content, the hash of the previous block, a ZKP credential hash of the publishing operative, and a NEXUS timestamp. The chain is replicated across 847 nodes in 43 jurisdictions. Genesis block was published in 2021. Compromise would require simultaneous control of >50% of nodes within a 6-minute finalization window.",
    seealso: ["ZKP", "Black Book", "Ghost Protocol"],
  },
  {
    term: "CONVERGENCE",
    category: "doctrine",
    short: "The NEXUS OS endgame protocol",
    definition:
      "Operation CONVERGENCE is the strategic objective of NEXUS OS: achieving sufficient verified intelligence density across 500 metropolitan areas simultaneously to constitute a legally irrefutable demonstration of systemic harm. At threshold, the Shadow Corps Legal Division submits coordinated filing packages to the ICC, Inter-American Commission, European Court of Human Rights, and 23 domestic federal jurisdictions. Current status: 312/500. Formally adopted by unanimous Council vote at NEXUS DATE 0312.",
    seealso: ["Citizen's Ledger Chain", "Black Book", "PTE"],
  },
  {
    term: "Crucible",
    category: "operative",
    short: "The three-phase Level 3 elevation program",
    definition:
      "A mandatory multi-phase program required for Level 3 Shadow Analyst designation. Phase I: Soul's Forge — psychological inoculation against traumatic intelligence exposure, Stress Inoculation Training and Dark Mirror Analysis. Phase II: Ghost in the Machine — Neural Interface Calibration establishing the operative's Bi-Directional Thought Partnership with NEXUS MIND. Phase III: Immutable Oath — the recording of the operative's oath as a cryptographic hash on the Citizen's Ledger Chain. The Crucible is described in Field Doctrine as 'not a promotion — a forging.'",
    seealso: ["Immutable Oath", "ZKP", "Shadow Analyst"],
  },
  {
    term: "Ghost Audit",
    category: "operative",
    short: "A covert intelligence documentation operation",
    definition:
      "A structured covert operation in which an operative systematically documents the activities, infrastructure, or behavioral patterns of an entity operating outside its mandate or concealing evidence of harm. Ghost Audits produce verified findings that can be submitted to the Black Book. Access to the Ghost Audit system requires Level 3 clearance. All Ghost Audit data is routed through the Ghost Protocol Tor relay chain. The methodology was described by the founding Council as 'the constitutional immune system — documenting the state's physical footprint in public spaces.'",
    seealso: ["Ghost Protocol", "Black Book", "Shadow Analyst"],
  },
  {
    term: "Ghost Protocol",
    category: "technical",
    short: "The encrypted multi-layer routing system for Shadow Corps data",
    definition:
      "The four-layer encryption and routing system that protects all Shadow Corps field intelligence: Layer 1 — AES-256 local encryption; Layer 2 — Tor-integrated relay chain through seven jurisdictions; Layer 3 — Zero-Knowledge Proof wrapper proving clearance level without identity disclosure; Layer 4 — cryptographic signing against the operative's Immutable Oath hash. Ghost Protocol was formalized in 2021 after a Sovereign Engine actor monitored operative network activity through conventional infrastructure.",
    seealso: ["ZKP", "Ghost Relay", "Immutable Oath"],
  },
  {
    term: "Ghost Relay",
    category: "technical",
    short: "The Tor-integrated routing layer of Ghost Protocol",
    definition:
      "The Tor-integrated proxy chain component of the Ghost Protocol. All mission data routes through a minimum of seven jurisdictional relay nodes. The relay does not compensate for metadata leakage at the connection layer — operatives are required to use VPN or public networks for field operations regardless of Ghost Relay protection. The relay chain is continuously audited by NEXUS MIND for integrity degradation.",
    seealso: ["Ghost Protocol", "Sovereign Engine"],
  },
  {
    term: "Hollow Council",
    category: "adversary",
    short: "Organized trafficking syndicate — the primary CONVERGENCE target",
    definition:
      "The primary verified adversary target of Operation CONVERGENCE. Not a single organization but a convergent operational network of regional cells sharing infrastructure, extraction routes, and money-laundering chains across 31 identified jurisdictions. The Hollow Council deliberately targets Observer Fracture zones — low-signal NEXUS OS areas — for extraction route operations. Maintains legal facades through Vellichor-adjacent shell corporations. Threat level: EXISTENTIAL. Direct engagement without Council authorization is prohibited. Codename: THE FACELESS QUORUM. Level 3 clearance required for full profile access.",
    seealso: ["Observer Fracture", "CONVERGENCE", "Vellichor Combine"],
  },
  {
    term: "Immutable Oath",
    category: "doctrine",
    short: "The Level 3 operative's cryptographic covenant",
    definition:
      "The oath sworn by Level 3 operatives during Crucible Phase III, recorded as a multi-signature cryptographic hash on the Citizen's Ledger Chain. The Immutable Oath is permanent — it cannot be deleted or altered. Every Black Book entry published by the operative after oath-taking carries their credential hash in its signing block. The oath commits the operative to the Five Doctrines: verify before amplifying, protect sources, heed the AiTR as conscience, publish with precision, and trust the NEXUS MIND partnership.",
    seealso: ["Crucible", "Citizen's Ledger Chain", "ZKP"],
  },
  {
    term: "NEXUS DATE",
    category: "system",
    short: "The internal calendar system of NEXUS OS",
    definition:
      "An operational timestamp system used throughout NEXUS OS in place of calendar dates, providing temporal reference without revealing specific real-world timeframes in documents that may be accessed by adversarial actors. NEXUS DATE 0001 corresponds to the publication of the Citizen's Ledger Chain genesis block. The current date is NEXUS DATE 0891. NEXUS DATEs are used in all official transmissions, Black Book entries, and Chronicle records.",
    seealso: ["Citizen's Ledger Chain", "Signal Chronicle"],
  },
  {
    term: "NEXUS MIND",
    category: "system",
    short: "The NEXUS OS artificial intelligence system",
    definition:
      "The AI system at the core of NEXUS OS, encompassing the Predictive Tasking Engine and the personal calibration layer that tracks individual operative AiTR scores. NEXUS MIND runs on a Spiking Neural Network architecture on neuromorphic hardware, processing information in event-driven pulses with temporal encoding rather than sequentially. The system monitors twelve continuous data streams and generates missions when patterns deviate from baseline in historically significant ways. NEXUS MIND is described in Field Doctrine as a partner, not a tool — 'a single perceptual system' in partnership with the operative.",
    seealso: ["PTE", "AiTR", "Spiking Neural Network"],
  },
  {
    term: "Observer Fracture",
    category: "system",
    short: "Critical low-signal territory state",
    definition:
      "A territory state triggered when signal strength falls below 20%. In Fracture, the informational coverage of an area has degraded to the point that evidence can disappear, witnesses can be pressured, and adversarial actors can operate with reduced risk of documentation. The Hollow Council actively monitors NEXUS OS signal data to identify Fracture zones for exploitation. A Fracture territory is displayed with pulsing red indicators in the NEXUS OS interface and is the highest-priority stabilization target for nearby operatives.",
    seealso: ["Signal Strength", "Signal Decay", "Hollow Council"],
  },
  {
    term: "PTE",
    category: "system",
    short: "Predictive Tasking Engine — the anomaly-detection core of NEXUS MIND",
    definition:
      "The component of NEXUS MIND responsible for anomaly detection and mission generation. Monitors twelve continuous data streams — logistics APIs, municipal sensor feeds, operative accelerometer pattern data, social media velocity markers, and satellite imagery delta-analysis — and generates operative missions when pattern deviations match historical profiles for trafficking routes, infrastructure compromise, or coordinated suppression activity. The PTE weights operative data by AiTR score. An operative with high AiTR becomes a more influential node in the PTE's sensory apparatus over time.",
    seealso: ["NEXUS MIND", "AiTR", "Spiking Neural Network"],
  },
  {
    term: "Reality Anchor",
    category: "operative",
    short: "A GPS-verified, cryptographically signed field evidence node",
    definition:
      "A field evidence record placed by an operative at a specific geographic location. Each anchor is timestamped, GPS-verified, and cryptographically signed on deployment. Anchor types include: identity_challenge, signal_anomaly, data_inconsistency, reality_fracture, and convergence_rift. Deploying an anchor costs 50 Truth Credits. Active anchors expire after 7 days unless verified by investigators. A cluster of confirmed anchors in a geographic zone constitutes verifiable, court-admissible documentation under the CONVERGENCE filing framework.",
    seealso: ["Anchor Investigation", "Signal Strength", "CONVERGENCE"],
  },
  {
    term: "Shadow Analyst",
    category: "operative",
    short: "Level 3 operative designation — the highest clearance in NEXUS OS",
    definition:
      "The highest operative clearance designation in NEXUS OS. Requires completion of all three Crucible phases, sustained AiTR ≥ 98%, and Rep Score in the top 5% of the global network. Shadow Analysts have access to the Ghost Audit system, Black Book publishing rights, full Codex access including ULTRA SECRET documents, and involvement in CONVERGENCE-track intelligence operations. Shadow Analysts cannot leave the network gracefully — their oath is recorded on the chain and their credential hash is woven into every Black Book entry they have ever sealed.",
    seealso: ["Crucible", "AiTR", "Ghost Audit"],
  },
  {
    term: "Signal Decay",
    category: "system",
    short: "The natural degradation of territory signal strength over time",
    definition:
      "Territories lose signal strength passively over time at a rate determined by their decay rate parameter. Decay is applied after a minimum of four hours since the last signal update. Decay reflects the natural consequence of reduced operative presence in a zone: without continuous documentation and anchor deployment, the informational coverage erodes. A territory that decays below 20% enters Observer Fracture. Signal decay is a design choice — NEXUS OS treats presence as a continuous obligation, not a one-time action.",
    seealso: ["Observer Fracture", "Signal Strength", "Territory Capture"],
  },
  {
    term: "Signal Strength",
    category: "system",
    short: "The measure of collective operative presence in a territory",
    definition:
      "A 0–100% metric measuring the density of verified intelligence coverage in a geographic territory. Signal strength increases through operative capture actions (reinforce: +10–25 points for same-faction operatives) and decreases through contest actions (opposing faction operatives) and natural decay. Signal strength is a factional measurement — a territory owned by Shadow Corps at 85% signal means Shadow Corps operatives have strong, recent, active coverage of that zone. Signal strength below 20% triggers Observer Fracture status.",
    seealso: ["Signal Decay", "Observer Fracture", "Territory Capture"],
  },
  {
    term: "Spiking Neural Network",
    category: "technical",
    short: "The neuromorphic AI architecture underlying NEXUS MIND",
    definition:
      "A neural network architecture that processes information as discrete spike events in time rather than continuous signals, analogous to how biological neural systems function. NEXUS MIND's PTE runs on a Spiking Neural Network on neuromorphic hardware (architecturally derived from Intel's Loihi research chips). The result is event-driven, temporally encoded processing: the system detects the shape of a deviation from baseline rather than simply measuring numeric thresholds. This allows it to identify trafficking route signatures from subtle patterns in timing, weight, and route deviation data.",
    seealso: ["PTE", "NEXUS MIND"],
  },
  {
    term: "Sovereign Engine",
    category: "adversary",
    short: "State-aligned surveillance and infiltration network",
    definition:
      "A network of former intelligence operatives, defense contractors, and embedded municipal officials who treat NEXUS OS as a hostile foreign intelligence service and seek to compromise, redirect, or capture it. The Sovereign Engine's strategy is long-horizon: deploy sleepers who complete legitimate missions for months before activation, use legal pressure to force data disclosure from peripheral services, and operate parallel infrastructure that mimics NEXUS OS aesthetics. Threat level: CRITICAL. Codename: WORM. Detected via NEXUS MIND behavioral shift analysis in the HOLLOWMAN operation, 2024.",
    seealso: ["HOLLOWMAN", "Ghost Protocol", "ZKP"],
  },
  {
    term: "Territory Capture",
    category: "system",
    short: "The faction-based geographic control mechanic",
    definition:
      "The primary gameplay mechanic of NEXUS OS territory control. Three action types: Reinforce (same-faction operative increases signal strength by 10–25 points, scaled by Crucible tier), Contest (opposing faction decreases signal strength), and Flip (signal reaches zero, territory changes faction ownership with signal reset to 15%). A 1-hour cooldown applies per operative per territory. Capture events are logged to the territory_capture_events chain with full faction and signal delta records.",
    seealso: ["Signal Strength", "Signal Decay", "Observer Fracture"],
  },
  {
    term: "Truth Credits",
    category: "system",
    short: "The NEXUS OS in-world currency (TC)",
    definition:
      "The primary currency unit of the NEXUS OS economy, abbreviated TC. Earned through mission completion (100–2500 TC depending on difficulty), territory capture actions, and verified anchor placements. Spent on deploying Reality Anchors (50 TC), duel wagers (50–2000 TC), battle event TC pots (0–1000 TC), and squad operations. Truth Credits are not transferable outside the NEXUS OS system and have no real-world monetary value.",
    seealso: ["Reality Anchor", "Duel", "Battle Event"],
  },
  {
    term: "Vellichor Combine",
    category: "adversary",
    short: "Corporate evidence-suppression consortium — The Editors",
    definition:
      "A private intelligence consortium contracting with corporations, real estate conglomerates, and high-net-worth individuals to systematically suppress public evidence of client activities. Vellichor does not commit harms — it erases documentation. Techniques include mass-purchase of adjacent digital real estate, synthetic witness networks, defamation litigation, and SEO flooding. Operations are entirely legal. The Black Book and Citizen's Ledger Chain are the primary NEXUS OS counter-measures, as cryptographically chained evidence cannot be search-suppressed. Threat level: ELEVATED. Codename: THE EDITORS.",
    seealso: ["Black Book", "Citizen's Ledger Chain", "Ghost Audit"],
  },
  {
    term: "ZKP",
    category: "technical",
    short: "Zero-Knowledge Proof — identity verification without disclosure",
    definition:
      "A cryptographic proof system that allows an operative to demonstrate they possess valid credentials (clearance level, Oath hash, faction membership) without revealing the underlying identity information. NEXUS OS uses ZKP wrappers as Layer 3 of the Ghost Protocol, ensuring that the system can verify an operative is cleared for a given operation without knowing who they are. The ZKP credential hash issued at Crucible Phase III completion is permanent and cannot be revoked without destroying the associated Black Book entries — a design choice made deliberately to prevent Council capture.",
    seealso: ["Ghost Protocol", "Immutable Oath", "Crucible"],
  },
];

export function OperativeLexicon() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<TermCategory | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = TERMS.filter((t) => {
    const matchCat = category === "all" || t.category === category;
    const q = query.toLowerCase();
    const matchQuery = !q || t.term.toLowerCase().includes(q) || t.short.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q);
    return matchCat && matchQuery;
  }).sort((a, b) => a.term.localeCompare(b.term));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-fuchsia-400" />
          Operative Lexicon
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          The authoritative A–Z glossary of NEXUS OS terminology — for operatives learning the architecture of this war
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-fuchsia-400/50"
          placeholder="Search terms…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-1 flex-wrap">
        <button
          onClick={() => setCategory("all")}
          className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
            category === "all" ? "bg-slate-700 border-slate-500 text-white" : "border-slate-700 text-gray-500 hover:text-gray-300"
          }`}
        >
          All
        </button>
        {(Object.entries(CATEGORY_CONFIG) as [TermCategory, typeof CATEGORY_CONFIG[TermCategory]][]).map(([cat, conf]) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
              category === cat ? `bg-slate-700 border-slate-500 ${conf.color}` : "border-slate-700 text-gray-500 hover:text-gray-300"
            }`}
          >
            {conf.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-600">{filtered.length} term{filtered.length !== 1 ? "s" : ""}</p>

      {/* Terms */}
      <div className="space-y-1">
        {filtered.map((t) => {
          const catConf = CATEGORY_CONFIG[t.category];
          const isOpen = expanded === t.term;
          return (
            <div
              key={t.term}
              className={`rounded-lg border transition-colors ${isOpen ? "border-slate-600 bg-slate-800/60" : "border-slate-700/50 bg-slate-900/40 hover:border-slate-600"}`}
            >
              <button
                className="w-full text-left px-4 py-3 flex items-start gap-3"
                onClick={() => setExpanded(isOpen ? null : t.term)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white">{t.term}</span>
                    <span className={`text-xs font-mono font-bold tracking-wider ${catConf.color}`}>{catConf.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{t.short}</p>
                </div>
                <span className="text-gray-600 text-sm flex-shrink-0">{isOpen ? "−" : "+"}</span>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 border-t border-slate-700/40 pt-3 space-y-3">
                  <p className="text-xs text-gray-300 leading-relaxed">{t.definition}</p>
                  {t.seealso && t.seealso.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-600">See also:</span>
                      {t.seealso.map((s) => (
                        <button
                          key={s}
                          onClick={(e) => { e.stopPropagation(); setQuery(s); setExpanded(s); }}
                          className="text-xs text-fuchsia-400 hover:text-fuchsia-300 underline underline-offset-2"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-10">
            <BookOpen className="w-8 h-8 text-gray-700 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No terms match your query.</p>
          </div>
        )}
      </div>
    </div>
  );
}
