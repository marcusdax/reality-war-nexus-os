/**
 * ONBOARDING: "The Signal Chooses You"
 *
 * Five-panel cinematic sequence:
 *  0 – The Awakening       (logo glitch + Reality Crisis stats)
 *  1 – The Four Visions    (faction quadrant preview)
 *  2 – The Choice          (faction carousel with full lore)
 *  3 – The Oath            (oath affirmation + ZKP hash)
 *  4 – Observer Whisper    (easter egg flash → redirect)
 */

import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { FactionCard, FACTIONS, type FactionId } from "@/components/FactionCard";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Loader2, ChevronRight } from "lucide-react";
import { toast } from "sonner";

// ─────────────────────────────────────────────────────────
// PANEL 0 — THE AWAKENING
// ─────────────────────────────────────────────────────────

const CRISIS_LINES = [
  { label: "Data latency", value: "8 months", color: "text-red-400" },
  { label: "Accuracy rate", value: "< 40%", color: "text-orange-400" },
  { label: "Annual waste", value: "$205 billion", color: "text-red-500" },
  { label: "Decisions made in the dark", value: "billions", color: "text-red-300" },
];

function AwakeningPanel({ onNext }: { onNext: () => void }) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [showBottom, setShowBottom] = useState(false);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    // Reveal stats one by one
    const timers = CRISIS_LINES.map((_, i) =>
      setTimeout(() => setVisibleLines(i + 1), 800 + i * 700)
    );

    // Show bottom CTA after all lines
    const bottomTimer = setTimeout(() => setShowBottom(true), 800 + CRISIS_LINES.length * 700 + 600);

    // Glitch pulse
    const glitchInterval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 120);
    }, 2800);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(bottomTimer);
      clearInterval(glitchInterval);
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-black px-6 text-center overflow-hidden">
      {/* Background noise texture */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Four-color leak from corners */}
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-amber-500/8 blur-3xl -translate-x-1/2 translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-violet-500/10 blur-3xl translate-x-1/2 translate-y-1/2" />

      {/* Logo */}
      <div className="relative mb-12">
        <div
          className={`transition-all duration-100 ${glitch ? "translate-x-[2px] opacity-70" : "translate-x-0 opacity-100"}`}
        >
          <h1
            className="text-5xl md:text-7xl font-black tracking-tighter text-white"
            style={{ textShadow: glitch ? "3px 0 #06b6d4, -3px 0 #a855f7" : "none" }}
          >
            NEXUS OS
          </h1>
        </div>
        <p className="text-xs text-gray-600 tracking-[0.4em] uppercase mt-2">
          Reality War · Ground Truth Engine
        </p>
        {/* Crack lines (simulated) */}
        <div className="absolute -inset-4 pointer-events-none">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
        </div>
      </div>

      {/* The Reality Crisis */}
      <div className="w-full max-w-md space-y-1 mb-10">
        <p className="text-gray-500 text-sm mb-4 uppercase tracking-widest">The Reality Crisis</p>
        {CRISIS_LINES.map((line, i) => (
          <div
            key={line.label}
            className={`flex items-center justify-between py-2 px-4 rounded border border-slate-800/50 transition-all duration-500 ${
              i < visibleLines ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <span className="text-sm text-gray-400">{line.label}</span>
            <span className={`text-sm font-bold font-mono ${line.color}`}>{line.value}</span>
          </div>
        ))}
      </div>

      {showBottom && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6">
          <p className="text-gray-300 text-base max-w-sm">
            Billions of decisions made in the dark.
            <br />
            <span className="text-white font-semibold">You can change that.</span>
          </p>
          <Button
            className="btn-truth px-8 py-3 text-base"
            onClick={onNext}
          >
            Enter the LumiVerse
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// PANEL 1 — THE FOUR VISIONS
// ─────────────────────────────────────────────────────────

const QUADRANTS = [
  {
    faction: "ECO",
    color: "from-emerald-950/80",
    border: "border-emerald-400/20",
    text: "text-emerald-400",
    symbol: "✦",
    tagline: "Heal the wound.",
    visual: "Digital vines reclaim the concrete. Every cleanup a territory.",
    sounds: "Birds. Water. Growth.",
    delay: "delay-0",
  },
  {
    faction: "DATA",
    color: "from-blue-950/80",
    border: "border-blue-400/20",
    text: "text-blue-400",
    symbol: "⬡",
    tagline: "Order is truth.",
    visual: "Grid lines snap over every surface. Truth: 98%.",
    sounds: "Data chimes. Precision.",
    delay: "delay-100",
  },
  {
    faction: "TECH",
    color: "from-amber-950/80",
    border: "border-amber-400/20",
    text: "text-amber-400",
    symbol: "◈",
    tagline: "Upgrade reality.",
    visual: "Holographic blueprints hover over infrastructure. LiDAR pulses.",
    sounds: "Heavy hum. Impact.",
    delay: "delay-200",
  },
  {
    faction: "SHADOW",
    color: "from-violet-950/80",
    border: "border-violet-400/20",
    text: "text-violet-400",
    symbol: "◬",
    tagline: "Nothing is as it seems.",
    visual: "The street glitches. A hidden code appears on the lamppost.",
    sounds: "Reversed audio. Whispers.",
    delay: "delay-300",
  },
];

function FourVisionsPanel({ onNext }: { onNext: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="text-center pt-10 pb-6 px-4">
        <p className="text-gray-500 text-xs tracking-[0.3em] uppercase mb-2">
          Four philosophies. One question.
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          How will you heal the map?
        </h2>
      </div>

      {/* 2×2 quadrant grid */}
      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-0.5 bg-slate-800/30 mx-4 mb-4 rounded-xl overflow-hidden">
        {QUADRANTS.map((q, i) => (
          <div
            key={q.faction}
            className={`relative flex flex-col justify-end p-4 bg-gradient-to-t ${q.color} to-slate-950 border ${q.border} transition-all duration-700 ${
              visible ? "opacity-100" : "opacity-0"
            } ${q.delay}`}
            style={{ transitionDelay: `${i * 150}ms` }}
          >
            {/* Symbol watermark */}
            <span
              className={`absolute top-3 right-3 text-4xl opacity-10 ${q.text}`}
              style={{ fontFamily: "monospace" }}
            >
              {q.symbol}
            </span>

            <div>
              <p className={`text-xs font-bold tracking-widest uppercase ${q.text} mb-1`}>
                {q.faction}
              </p>
              <p className="text-sm font-semibold text-white leading-tight">{q.tagline}</p>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed hidden sm:block">{q.visual}</p>
              <p className={`text-xs mt-1 opacity-60 ${q.text} hidden sm:block`}>{q.sounds}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center pb-8 px-4">
        <Button className="btn-truth px-8" onClick={onNext}>
          Choose Your Philosophy
          <ChevronRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// PANEL 2 — THE FACTION CHOICE
// ─────────────────────────────────────────────────────────

function FactionSelectPanel({
  selected,
  onSelect,
  onConfirm,
}: {
  selected: FactionId | null;
  onSelect: (id: FactionId) => void;
  onConfirm: () => void;
}) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800 px-4 py-4">
        <p className="text-xs text-gray-500 tracking-widest uppercase text-center">
          The Signal Chooses You
        </p>
        <h2 className="text-xl font-bold text-white text-center mt-1">
          Choose Your Faction
        </h2>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-32">
        <p className="text-sm text-gray-400 text-center mb-2">
          Tap a faction to preview. Expand for full lore.
        </p>
        {FACTIONS.map((faction) => (
          <FactionCard
            key={faction.id}
            faction={faction}
            selected={selected === faction.id}
            onSelect={onSelect}
          />
        ))}

        {/* Observer tease */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 text-center opacity-40">
          <p className="text-xs text-gray-600 italic">
            "There is… another path."
          </p>
          <p className="text-xs text-gray-700 mt-1">[ after 50,000 verified truths ]</p>
        </div>
      </div>

      {/* Confirm bar */}
      {selected && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-950/95 backdrop-blur-sm border-t border-slate-800 animate-in slide-in-from-bottom-2 duration-300">
          {(() => {
            const f = FACTIONS.find((f) => f.id === selected)!;
            return (
              <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
                <div>
                  <p className="text-xs text-gray-500">You have chosen</p>
                  <p className={`font-bold ${f.textColor}`}>{f.name}</p>
                </div>
                <Button className="btn-truth" onClick={onConfirm}>
                  Affirm &amp; Take the Oath
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// PANEL 3 — THE OATH
// ─────────────────────────────────────────────────────────

const OATH_TEXT =
  "I will verify only what is real. I will protect the dignity of the innocent. I will expose the corruption of the powerful. My judgment shall be the bridge between the machine's pattern and humanity's truth.";

function OathPanel({
  faction,
  onComplete,
}: {
  faction: FactionId;
  onComplete: () => void;
}) {
  const f = FACTIONS.find((f) => f.id === faction)!;
  const [revealed, setRevealed] = useState(0);
  const [ready, setReady] = useState(false);
  const completeMutation = trpc.profile.completeOnboarding.useMutation();

  useEffect(() => {
    // Reveal oath word by word
    const words = OATH_TEXT.split(" ");
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setRevealed(i);
      if (i >= words.length) {
        clearInterval(interval);
        setTimeout(() => setReady(true), 600);
      }
    }, 60);
    return () => clearInterval(interval);
  }, []);

  const words = OATH_TEXT.split(" ");

  const handleAffirm = async () => {
    try {
      await completeMutation.mutateAsync({ faction });
      onComplete();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to record oath. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      {/* Faction ambient glow */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          background: `radial-gradient(ellipse at center, ${
            { eco: "#10b981", data: "#3b82f6", tech: "#f59e0b", shadow: "#8b5cf6" }[faction]
          } 0%, transparent 70%)`,
        }}
      />

      {/* Faction symbol */}
      <div
        className={`text-7xl mb-6 ${f.textColor} opacity-30`}
        style={{ fontFamily: "monospace" }}
      >
        {f.symbol}
      </div>

      <p className="text-xs text-gray-600 tracking-[0.4em] uppercase mb-6">
        The Immutable Oath — {f.name}
      </p>

      {/* Oath text (word-by-word reveal) */}
      <div className="max-w-md mb-10">
        <p className="text-lg md:text-xl text-white leading-relaxed font-light italic">
          "
          {words.map((word, i) => (
            <span
              key={i}
              className={`transition-opacity duration-200 ${
                i < revealed ? "opacity-100" : "opacity-0"
              }`}
            >
              {word}
              {i < words.length - 1 ? " " : ""}
            </span>
          ))}
          "
        </p>
      </div>

      {/* ZKP credential preview */}
      {ready && (
        <div className="animate-in fade-in duration-700 max-w-sm w-full mb-8">
          <div className={`rounded-lg border ${f.borderColor} ${f.bgColor} p-3 text-left`}>
            <p className="text-xs text-gray-500 mb-1">ZKP Credential (preview)</p>
            <p className="text-xs text-gray-400 font-mono break-all opacity-60">
              {Array.from({ length: 48 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              The system knows you are cleared. It will never know who you are.
            </p>
          </div>
        </div>
      )}

      {/* Affirm button */}
      {ready && (
        <div className="animate-in fade-in duration-500 delay-300">
          <Button
            className={`px-10 py-3 text-base font-bold ${
              { eco: "bg-emerald-600 hover:bg-emerald-500", data: "bg-blue-600 hover:bg-blue-500", tech: "bg-amber-600 hover:bg-amber-500", shadow: "bg-violet-600 hover:bg-violet-500" }[faction]
            } text-white border-0`}
            disabled={completeMutation.isPending}
            onClick={handleAffirm}
          >
            {completeMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>I Affirm. I Am {f.name}.</>
            )}
          </Button>
          <p className="text-xs text-gray-600 mt-3">
            This covenant is recorded on the Citizen's Ledger Chain.
          </p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// PANEL 4 — OBSERVER WHISPER (easter egg flash)
// ─────────────────────────────────────────────────────────

function ObserverWhisperPanel({ faction, onDone }: { faction: FactionId; onDone: () => void }) {
  const f = FACTIONS.find((f) => f.id === faction)!;
  const [phase, setPhase] = useState<"faction" | "glitch" | "whisper" | "fade">("faction");

  useEffect(() => {
    // faction welcome → glitch → observer whisper → fade to black → done
    const t1 = setTimeout(() => setPhase("glitch"), 1800);
    const t2 = setTimeout(() => setPhase("whisper"), 2000);
    const t3 = setTimeout(() => setPhase("fade"), 3200);
    const t4 = setTimeout(() => onDone(), 3800);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center transition-opacity duration-700 ${
        phase === "fade" ? "opacity-0" : "opacity-100"
      } ${phase === "glitch" ? "bg-white" : "bg-black"}`}
    >
      {phase === "faction" && (
        <div className="text-center animate-in fade-in duration-500 space-y-3">
          <span className={`text-6xl ${f.textColor}`} style={{ fontFamily: "monospace" }}>
            {f.symbol}
          </span>
          <p className="text-2xl font-bold text-white">Welcome to {f.name}.</p>
          <p className="text-sm text-gray-400 max-w-xs">
            Your first territory awaits. Walk to it. Reality begins now.
          </p>
          <div className="flex justify-center gap-1 mt-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${f.textColor} animate-pulse`}
                style={{ animationDelay: `${i * 200}ms`, background: "currentColor" }}
              />
            ))}
          </div>
        </div>
      )}

      {(phase === "glitch" || phase === "whisper") && (
        <div className={`text-center transition-colors duration-100 ${phase === "glitch" ? "bg-white" : "bg-black"}`}>
          {phase === "whisper" && (
            <div className="animate-in fade-in duration-200">
              <p
                className="text-xs text-gray-500 tracking-[0.5em] uppercase"
                style={{ fontFamily: "monospace" }}
              >
                OBSERVER THRESHOLD
              </p>
              <p className="text-sm text-gray-400 italic mt-2">
                "There is another path…
              </p>
              <p className="text-xs text-gray-600 mt-1">
                after 50,000 truths."
              </p>
            </div>
          )}
        </div>
      )}

      {phase === "fade" && null}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN ORCHESTRATOR
// ─────────────────────────────────────────────────────────

type Step = 0 | 1 | 2 | 3 | 4;

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<Step>(0);
  const [selectedFaction, setSelectedFaction] = useState<FactionId | null>(null);

  const goNext = () => setStep((s) => (s + 1) as Step);

  const handleOathComplete = () => setStep(4);

  const handleWhisperDone = () => setLocation("/");

  // Smooth scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  return (
    <div className="relative">
      {/* Step transition wrapper */}
      <div key={step} className="animate-in fade-in duration-500">
        {step === 0 && <AwakeningPanel onNext={goNext} />}
        {step === 1 && <FourVisionsPanel onNext={goNext} />}
        {step === 2 && (
          <FactionSelectPanel
            selected={selectedFaction}
            onSelect={setSelectedFaction}
            onConfirm={() => {
              if (selectedFaction) goNext();
            }}
          />
        )}
        {step === 3 && selectedFaction && (
          <OathPanel faction={selectedFaction} onComplete={handleOathComplete} />
        )}
        {step === 4 && selectedFaction && (
          <ObserverWhisperPanel faction={selectedFaction} onDone={handleWhisperDone} />
        )}
      </div>

      {/* Step indicator (panels 0-3 only) */}
      {step < 4 && (
        <div className="fixed top-4 right-4 flex gap-1.5 z-50">
          {([0, 1, 2, 3] as Step[]).map((s) => (
            <div
              key={s}
              className={`rounded-full transition-all duration-300 ${
                s === step
                  ? "w-4 h-1.5 bg-cyan-400"
                  : s < step
                  ? "w-1.5 h-1.5 bg-cyan-400/40"
                  : "w-1.5 h-1.5 bg-slate-700"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
