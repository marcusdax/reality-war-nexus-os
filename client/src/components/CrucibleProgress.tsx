import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Brain, Cpu, Lock, CheckCircle, Circle, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

type CruciblePhase = "none" | "phase_1" | "phase_2" | "phase_3" | "complete";

interface CrucibleProgressProps {
  currentPhase: CruciblePhase;
  onPhaseAdvanced: () => void;
}

const PHASES = [
  {
    id: "phase_1" as CruciblePhase,
    label: "Phase I",
    name: "Soul's Forge",
    subtitle: "Psychological Inoculation",
    icon: Brain,
    color: "text-cyan-400",
    borderColor: "border-cyan-400/40",
    bgColor: "bg-cyan-400/10",
    description:
      "Deep ethical inoculation against the traumas you will witness. Stress Inoculation Training, Dark Mirror Analysis, and the Empathy Audit forge the psychological foundation of an elite analyst.",
    unlocks: "Access to Level 2 missions and Safety Sentinel designation",
  },
  {
    id: "phase_2" as CruciblePhase,
    label: "Phase II",
    name: "Ghost in the Machine",
    subtitle: "Technical Transcendence",
    icon: Cpu,
    color: "text-purple-400",
    borderColor: "border-purple-400/40",
    bgColor: "bg-purple-400/10",
    description:
      "Neural Interface Calibration creates a Bi-Directional Thought Partnership with NEXUS MIND. The AI feels the statistical anomaly; you sense the malevolent intent.",
    unlocks: "Ghost Mode, Field Commander app, AiTR score tracking",
  },
  {
    id: "phase_3" as CruciblePhase,
    label: "Phase III",
    name: "Immutable Oath",
    subtitle: "The Sacred Covenant",
    icon: Lock,
    color: "text-magenta-400",
    borderColor: "border-fuchsia-400/40",
    bgColor: "bg-fuchsia-400/10",
    description:
      "Your oath is recorded as a multi-signature cryptographic hash on the Citizen's Ledger Chain — a covenant written not in ink, but in immutable code. You are now a Level 3 Shadow Analyst.",
    unlocks: "Level 3 clearance: human trafficking operations, Ghost Audits, Black Book publishing",
  },
];

const PHASE_ORDER: CruciblePhase[] = ["none", "phase_1", "phase_2", "phase_3", "complete"];

function phaseIndex(phase: CruciblePhase): number {
  return PHASE_ORDER.indexOf(phase);
}

export function CrucibleProgress({ currentPhase, onPhaseAdvanced }: CrucibleProgressProps) {
  const advanceMutation = trpc.shadowCorps.advanceCruciblePhase.useMutation();

  const currentIdx = phaseIndex(currentPhase);

  const handleAdvance = async (targetPhase: CruciblePhase) => {
    try {
      const finalPhase = targetPhase === "phase_3" ? "complete" : targetPhase;
      await advanceMutation.mutateAsync({ phase: finalPhase });
      toast.success(
        finalPhase === "complete"
          ? "The Crucible is complete. You are now a Level 3 Shadow Analyst."
          : `Phase complete. The transformation continues.`
      );
      onPhaseAdvanced();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to advance phase");
    }
  };

  if (currentPhase === "complete") {
    return (
      <div className="rounded-lg border border-fuchsia-400/30 bg-gradient-to-br from-fuchsia-950/40 to-slate-900 p-6 text-center">
        <CheckCircle className="w-12 h-12 text-fuchsia-400 mx-auto mb-3" />
        <p className="text-lg font-bold text-white">The Crucible is Complete</p>
        <p className="text-sm text-gray-400 mt-1">
          Your oath is sealed on the Citizen's Ledger Chain. You are Level 3.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        {PHASES.map((phase, i) => (
          <div key={phase.id} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                currentIdx > i
                  ? "border-green-400/50 bg-green-400/10 text-green-400"
                  : currentIdx === i
                  ? `${phase.borderColor} ${phase.bgColor} ${phase.color}`
                  : "border-slate-700 bg-slate-800/50 text-gray-600"
              }`}
            >
              {currentIdx > i ? (
                <CheckCircle className="w-3 h-3" />
              ) : (
                <Circle className="w-3 h-3" />
              )}
              {phase.label}
            </div>
            {i < PHASES.length - 1 && (
              <ArrowRight className="w-3 h-3 text-gray-600" />
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-4">
        {PHASES.map((phase, i) => {
          const Icon = phase.icon;
          const isDone = currentIdx > i;
          const isActive = currentIdx === i;
          const isLocked = currentIdx < i;

          return (
            <Card
              key={phase.id}
              className={`p-5 border transition-colors ${
                isDone
                  ? "border-green-400/20 bg-green-950/20"
                  : isActive
                  ? `${phase.borderColor} bg-slate-900/80`
                  : "border-slate-800 bg-slate-900/40 opacity-50"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-2.5 rounded-lg flex-shrink-0 ${
                    isDone
                      ? "bg-green-400/10"
                      : isActive
                      ? phase.bgColor
                      : "bg-slate-800"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <Icon
                      className={`w-5 h-5 ${
                        isActive ? phase.color : "text-gray-600"
                      }`}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p
                        className={`font-bold text-sm ${
                          isDone
                            ? "text-green-400"
                            : isActive
                            ? "text-white"
                            : "text-gray-600"
                        }`}
                      >
                        {phase.name}
                      </p>
                      <p
                        className={`text-xs ${
                          isDone
                            ? "text-green-400/70"
                            : isActive
                            ? "text-gray-400"
                            : "text-gray-700"
                        }`}
                      >
                        {phase.subtitle}
                      </p>
                    </div>
                    {isActive && (
                      <Button
                        size="sm"
                        className="btn-truth text-xs px-3 py-1 h-auto flex-shrink-0"
                        disabled={advanceMutation.isPending}
                        onClick={() =>
                          handleAdvance(
                            i === 2 ? ("phase_3" as CruciblePhase) : phase.id
                          )
                        }
                      >
                        {advanceMutation.isPending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : i === 2 ? (
                          "Complete Crucible"
                        ) : (
                          "Complete Phase"
                        )}
                      </Button>
                    )}
                  </div>
                  {(isActive || isDone) && (
                    <>
                      <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                        {phase.description}
                      </p>
                      <p
                        className={`text-xs mt-2 font-medium ${
                          isDone ? "text-green-400/80" : phase.color
                        }`}
                      >
                        Unlocks: {phase.unlocks}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
