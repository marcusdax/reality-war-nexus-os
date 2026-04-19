import { Lock, CheckCircle, Shield, Fingerprint, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";

const OATH_PREAMBLE =
  "I enter this covenant with full knowledge of what I am swearing and what it costs. I have been inoculated against the darkness I will witness. I have calibrated my perception against the machine. I have read the doctrine. I have argued with parts of it. I accept it anyway. This oath is not a formality. It is a contract between my conscience and the network — between the person I am now and every person whose safety will depend on my accuracy, my discretion, and my refusal to amplify what I cannot verify.";

const OATH_ARTICLES = [
  {
    number: "I",
    name: "Verify Before You Amplify",
    text:
      "I will not publish, share, or act upon intelligence that has not passed the verification gates of this network. Not if I am certain it is true. Not if I believe the urgency justifies speed. Not if a faction asks me to. The moment I amplify the unverified, I become indistinguishable from the adversary. I swear this first because it is the hardest.",
  },
  {
    number: "II",
    name: "Protect Your Sources as Yourself",
    text:
      "Every person who gives me information about trafficking, corruption, or organized harm is risking their life or liberty to do so. My operational security is their operational security. I will route every field communication through the Ghost Protocol. I will never use personal networks for mission work. I will never confirm or deny another operative's identity. If my identity is compromised, I will stand down immediately and notify the Council. Their safety comes before my ego, my impatience, and my desire to continue.",
  },
  {
    number: "III",
    name: "The AiTR Is My Conscience",
    text:
      "My Anomaly-to-Truth Ratio is not a performance metric. It is a measurement of whether I am seeing what is actually there or what I want to find. When my AiTR declines, it means my perception has become unreliable. I will not continue active missions with a declining AiTR. I will recalibrate. I will submit to the process. A Shadow Analyst who cannot admit their perception has become distorted is a Shadow Analyst who has begun to cause harm.",
  },
  {
    number: "IV",
    name: "The Black Book Is Forever",
    text:
      "Every entry I publish to the Citizen's Ledger Chain is permanent. It cannot be deleted. It can only be contradicted. I will not publish to the chain until I am certain. The standard is not 'probably true.' The standard is 'provably true beyond reasonable doubt.' I accept that this means I will sometimes withhold intelligence that I believe is accurate, because belief is not proof. The chain is only as trustworthy as the operatives who write on it. I am one of those operatives. I take this seriously.",
  },
  {
    number: "V",
    name: "Trust the Partnership",
    text:
      "NEXUS MIND is my partner, not my servant. The Predictive Tasking Engine tasks me because my pattern of attention complements its statistical perception. I will trust its anomaly flags. I will also trust my own perception when it contradicts the system — and I will document that contradiction rather than suppressing it. The synthesis of human intuition and machine pattern recognition is the only weapon strong enough for this war. I do not claim that I alone am sufficient. I do not pretend that the machine alone is sufficient. I swear to show up for the partnership.",
  },
];

const OATH_CLOSING =
  "I swear this oath knowing it is permanent. My credential hash will be woven into the Citizen's Ledger Chain as a record that I said this. Every Black Book entry I publish from this moment will carry the seal of this oath in its cryptographic signature. If I violate this covenant, the chain will contain the contradiction — my oath and my actions, both permanent, both visible to those with clearance to see. I accept this. I swear this freely, under no compulsion, with full understanding of what it means.";

interface OathTerminalProps {
  analystLevel: "1" | "2" | "3";
  oathHash?: string | null;
}

export function OathTerminal({ analystLevel, oathHash }: OathTerminalProps) {
  const level = parseInt(analystLevel);
  const isSworn = !!oathHash;
  const isLevel3 = level >= 3;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-fuchsia-400" />
          The Immutable Oath
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          The canonical text of the covenant sworn by every Level 3 Shadow Analyst — recorded permanently on the Citizen's Ledger Chain
        </p>
      </div>

      {/* Seal status */}
      {isSworn ? (
        <Card className="p-4 border border-fuchsia-400/30 bg-fuchsia-950/20">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-fuchsia-400 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-fuchsia-400">Oath Sealed — Citizen's Ledger Chain</p>
              <p className="text-xs text-gray-400 mt-0.5">Your covenant is permanent. The chain remembers.</p>
              <p className="text-xs text-gray-600 font-mono mt-2 break-all">{oathHash}</p>
            </div>
          </div>
        </Card>
      ) : level < 3 ? (
        <Card className="p-4 border border-slate-600/50 bg-slate-800/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-400">Oath Not Yet Sworn</p>
              <p className="text-xs text-gray-400 mt-0.5">
                The Immutable Oath is sworn during Crucible Phase III — available at Level 3 Shadow Analyst designation.
                You are viewing the canonical text. Read it. Argue with it. When you are ready, it will be here.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-4 border border-slate-600/50 bg-slate-800/30">
          <div className="flex items-start gap-3">
            <Fingerprint className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-gray-400">Oath Pending Sealing</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Complete Crucible Phase III to seal your Immutable Oath on the Citizen's Ledger Chain.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* The oath document */}
      <div className="rounded-xl border border-fuchsia-400/20 bg-gradient-to-b from-fuchsia-950/20 to-slate-900/60 overflow-hidden">
        {/* Document header */}
        <div className="border-b border-fuchsia-400/20 px-6 py-4 text-center space-y-1">
          <p className="text-xs font-mono text-fuchsia-400/60 tracking-[0.3em] uppercase">Shadow Corps — Citizen's Ledger Chain</p>
          <p className="text-lg font-bold text-white tracking-wide">THE IMMUTABLE OATH</p>
          <p className="text-xs font-mono text-gray-600 tracking-[0.2em]">VERSION 3.1 · CANONIZED NEXUS DATE 0201</p>
        </div>

        <div className="px-6 py-6 space-y-8">
          {/* Preamble */}
          <div>
            <p className="text-xs font-mono text-fuchsia-400/60 uppercase tracking-widest mb-3">Preamble</p>
            <p className="text-sm text-gray-300 leading-relaxed italic">{OATH_PREAMBLE}</p>
          </div>

          {/* Articles */}
          <div className="space-y-6">
            <p className="text-xs font-mono text-fuchsia-400/60 uppercase tracking-widest">The Five Articles</p>
            {OATH_ARTICLES.map((article) => (
              <div key={article.number} className="border-l-2 border-fuchsia-400/30 pl-4">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-xs font-mono font-bold text-fuchsia-400 tracking-widest">ARTICLE {article.number}</span>
                  <span className="text-sm font-bold text-white">{article.name}</span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{article.text}</p>
              </div>
            ))}
          </div>

          {/* Closing */}
          <div>
            <p className="text-xs font-mono text-fuchsia-400/60 uppercase tracking-widest mb-3">Closing Covenant</p>
            <p className="text-sm text-gray-300 leading-relaxed italic">{OATH_CLOSING}</p>
          </div>

          {/* Signature block */}
          <div className="border-t border-fuchsia-400/20 pt-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-gray-600">
              <span>OPERATIVE CREDENTIAL HASH</span>
              <span>SEAL DATE</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 border border-slate-600/50 rounded px-3 py-2 bg-slate-900/60 min-w-0">
                {isSworn ? (
                  <p className="text-xs font-mono text-fuchsia-300/80 break-all">{oathHash}</p>
                ) : (
                  <p className="text-xs font-mono text-gray-700 italic">
                    {isLevel3 ? "[pending — complete Crucible Phase III]" : "[locked — Level 3 required]"}
                  </p>
                )}
              </div>
              <div className="border border-slate-600/50 rounded px-3 py-2 bg-slate-900/60 flex-shrink-0">
                {isSworn ? (
                  <p className="text-xs font-mono text-gray-400">SEALED</p>
                ) : (
                  <p className="text-xs font-mono text-gray-700">PENDING</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 justify-center pt-1">
              <Shield className="w-3.5 h-3.5 text-fuchsia-400/50" />
              <p className="text-xs font-mono text-fuchsia-400/50 tracking-widest">
                CITIZEN'S LEDGER CHAIN · SHA-3-512 · 847 NODES · 43 JURISDICTIONS
              </p>
              <Shield className="w-3.5 h-3.5 text-fuchsia-400/50" />
            </div>
          </div>
        </div>
      </div>

      {/* What the oath means */}
      <Card className="p-4 border border-slate-700 bg-slate-900/60 space-y-3">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">What Sealing This Oath Means</p>
        <div className="space-y-2 text-xs text-gray-400 leading-relaxed">
          <p>Your credential hash is woven into the chain as a permanent record of this covenant. It cannot be removed. Every Black Book entry you publish from this point carries your oath hash in its cryptographic signature — proof of clearance and covenant, without revealing identity.</p>
          <p>If you violate this covenant, the chain contains the contradiction: your oath and your actions, both permanent, both visible to those with clearance to read them. The doctrine does not demand perfection. It demands honesty. An operative who violates an article and reports it is still part of the network. An operative who violates an article and conceals it is the adversary.</p>
        </div>
      </Card>
    </div>
  );
}
