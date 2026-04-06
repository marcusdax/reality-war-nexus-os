import { ChevronDown, ChevronUp, Zap } from "lucide-react";
import { useState } from "react";

export type FactionId = "eco" | "data" | "tech" | "shadow";

export interface FactionDef {
  id: FactionId;
  name: string;
  tagline: string;
  symbol: string;
  textColor: string;
  borderColor: string;
  bgColor: string;
  glowColor: string;
  playstyle: string;
  signatureAbility: string;
  abilityDesc: string;
  description: string;
  missions: string[];
  dataOutput: string;
  ritual: string;
  loreLine: string;
}

export const FACTIONS: FactionDef[] = [
  {
    id: "eco",
    name: "EcoGuardians",
    tagline: "Heal the wound. Let the green reclaim what was taken.",
    symbol: "✦",
    textColor: "text-emerald-400",
    borderColor: "border-emerald-400/40",
    bgColor: "bg-emerald-950/40",
    glowColor: "shadow-emerald-400/20",
    playstyle: "Cooperative · Restorative · Patient",
    signatureAbility: "Root Weaver",
    abilityDesc:
      "Summon digital vines that slow enemy capture. Near trees or parks, range and duration double.",
    description:
      "EcoGuardians see the Convergence as a chance to restore balance. They map environmental damage, verify cleanups, and document the living world — turning civic restoration into territory control. Where others see ruins, they see a garden waiting to grow back.",
    missions: ["Cleanup verification", "Green space documentation", "Carbon credit auditing"],
    dataOutput: "Environmental metrics, urban heat island analysis, carbon credit data",
    ritual: "Cleanup Blitzes — community-coordinated neighborhood restoration events",
    loreLine:
      '"The first lie the world told was that nature was separate from the city. We are here to correct the record."',
  },
  {
    id: "data",
    name: "DataSentinels",
    tagline: "Order is truth. Chaos is the enemy.",
    symbol: "⬡",
    textColor: "text-blue-400",
    borderColor: "border-blue-400/40",
    bgColor: "bg-blue-950/40",
    glowColor: "shadow-blue-400/20",
    playstyle: "Methodical · Thorough · Analytical",
    signatureAbility: "Cityscape Shield",
    abilityDesc:
      "A barrier whose strength scales with unique building facades scanned in the last hour. Rewards deep exploration before battle.",
    description:
      "DataSentinels view the Convergence with suspicion and build unassailable libraries of absolute truth. Their hyper-structured cyan grids lock reality into verified certainty. Every storefront, every sign, every address — all of it must be confirmed and catalogued.",
    missions: ["Signage audits", "Business verification", "Property condition assessment"],
    dataOutput: "Security audits, property assessments, insurance fraud prevention data",
    ritual: "Truth Syncing — cross-referencing datasets to build verification chains no one can break",
    loreLine:
      '"The database is not the truth. But the truth lives nowhere else. We are the keepers of the index."',
  },
  {
    id: "tech",
    name: "Architects",
    tagline: "Upgrade reality. Why accept the world when you can build it better?",
    symbol: "◈",
    textColor: "text-amber-400",
    borderColor: "border-amber-400/40",
    bgColor: "bg-amber-950/40",
    glowColor: "shadow-amber-400/20",
    playstyle: "Progressive · Creative · Ambitious",
    signatureAbility: "Highway Pulse",
    abilityDesc:
      "Deals amplified energy near recognized highway signs — damage scales with the number of lanes detected by the scanner.",
    description:
      "Architects see the Convergence as the greatest opportunity in human history. They map infrastructure, build Digital Twins of city blocks, and see every crumbling bridge as a blueprint waiting to be improved. The city is not broken — it is unfinished.",
    missions: ["WiFi dead-zone mapping", "Infrastructure fault reporting", "LiDAR 3D modeling"],
    dataOutput: "Infrastructure data, 3D city models, traffic flow, telecom planning datasets",
    ritual: "Builders' Guild — collaborative missions to construct high-fidelity Digital Twins",
    loreLine:
      '"We do not accept the world as given. We accept it as a first draft."',
  },
  {
    id: "shadow",
    name: "TruthSeekers",
    tagline: "Nothing is as it seems. Everything can be rewritten.",
    symbol: "◬",
    textColor: "text-violet-400",
    borderColor: "border-violet-400/40",
    bgColor: "bg-violet-950/40",
    glowColor: "shadow-violet-400/20",
    playstyle: "Investigative · Subversive · Mysterious",
    signatureAbility: "Reality Anchor",
    abilityDesc:
      "Challenge any player with suspicious signal. They must scan a real object in 30 seconds — or lose an hour of territory presence. Anti-cheat is core gameplay.",
    description:
      "TruthSeekers question everything, seeing the Convergence as a cosmic puzzle. They are anomaly hunters — the system's immune response against spoofers and those who exploit the cracks in reality. They do not seek order. They seek the raw, unfiltered signal beneath it.",
    missions: ["Anomaly hunting", "Signal scrambling", "Shadow Corps qualification missions"],
    dataOutput: "Anomaly clusters, behavioral flags, edge-case AI training data, Ghost Audit intelligence",
    ritual: "Shadow Councils — coordination through Ghost Relay (Tor-routed) encrypted channels",
    loreLine:
      '"I am the shadow that detaches from the wall and walks toward you. I am armed with the truth and shielded by the covenant."',
  },
];

interface FactionCardProps {
  faction: FactionDef;
  selected: boolean;
  onSelect: (id: FactionId) => void;
  compact?: boolean;
}

export function FactionCard({ faction, selected, onSelect, compact = false }: FactionCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`rounded-xl border transition-all duration-300 cursor-pointer ${
        selected
          ? `${faction.borderColor} ${faction.bgColor} shadow-lg ${faction.glowColor}`
          : "border-slate-700 bg-slate-900/60 hover:border-slate-600"
      }`}
      onClick={() => onSelect(faction.id)}
    >
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span
              className={`text-3xl leading-none mt-0.5 ${faction.textColor}`}
              style={{ fontFamily: "monospace" }}
            >
              {faction.symbol}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-bold text-lg ${selected ? faction.textColor : "text-white"}`}>
                  {faction.name}
                </h3>
                {selected && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${faction.borderColor} ${faction.bgColor} ${faction.textColor} font-semibold`}
                  >
                    Selected
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5 italic">{faction.tagline}</p>
            </div>
          </div>
          {!compact && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((v) => !v);
              }}
              className="text-gray-500 hover:text-gray-300 flex-shrink-0 mt-1"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>

        <p className={`text-xs mt-3 font-medium ${faction.textColor} opacity-80`}>
          {faction.playstyle}
        </p>

        {!compact && (
          <p className="text-sm text-gray-300 mt-2 leading-relaxed">{faction.description}</p>
        )}
      </div>

      {/* Expanded detail */}
      {!compact && expanded && (
        <div
          className="border-t border-slate-700/50 px-5 pb-5 space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Signature Ability */}
          <div className={`rounded-lg border ${faction.borderColor} ${faction.bgColor} p-3`}>
            <div className="flex items-center gap-2 mb-1">
              <Zap className={`w-3.5 h-3.5 ${faction.textColor}`} />
              <p className={`text-xs font-bold ${faction.textColor}`}>
                Signature: {faction.signatureAbility}
              </p>
            </div>
            <p className="text-xs text-gray-400">{faction.abilityDesc}</p>
          </div>

          {/* Missions */}
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-1.5">Real-World Missions</p>
            <ul className="space-y-1">
              {faction.missions.map((m) => (
                <li key={m} className="flex items-center gap-2 text-xs text-gray-300">
                  <span className={`w-1 h-1 rounded-full ${faction.textColor} flex-shrink-0`} style={{ background: "currentColor" }} />
                  {m}
                </li>
              ))}
            </ul>
          </div>

          {/* Data Output */}
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-1">Data Your Missions Feed</p>
            <p className="text-xs text-gray-400">{faction.dataOutput}</p>
          </div>

          {/* Ritual */}
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-1">Faction Ritual</p>
            <p className="text-xs text-gray-400">{faction.ritual}</p>
          </div>

          {/* Lore line */}
          <div className={`rounded-lg border ${faction.borderColor} p-3`}>
            <p className={`text-xs italic ${faction.textColor} opacity-80`}>{faction.loreLine}</p>
          </div>
        </div>
      )}
    </div>
  );
}
