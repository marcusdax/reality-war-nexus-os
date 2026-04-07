import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Swords, Shield, Zap, TrendingUp, TrendingDown, Clock, ChevronRight, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface Territory {
  id: number;
  name: string;
  faction: string;
  signalStrength: number;
  memberCount: number;
  description?: string | null;
  radiusMeters: number;
}

interface Props {
  territory: Territory;
  userFactionLabel: string;
  onCaptureDone?: () => void;
}

const FACTION_COLORS: Record<string, { text: string; bar: string; border: string; bg: string }> = {
  shadow_corps:       { text: "text-fuchsia-400",  bar: "bg-fuchsia-400",  border: "border-fuchsia-400/50", bg: "bg-fuchsia-950/40" },
  truth_seekers:      { text: "text-cyan-400",     bar: "bg-cyan-400",     border: "border-cyan-400/50",    bg: "bg-cyan-950/40" },
  reality_architects: { text: "text-amber-400",    bar: "bg-amber-400",    border: "border-amber-400/50",   bg: "bg-amber-950/40" },
  neutral:            { text: "text-gray-400",     bar: "bg-gray-400",     border: "border-gray-500/50",    bg: "bg-slate-800/40" },
};

const FACTION_LABELS: Record<string, string> = {
  shadow_corps: "Shadow Corps",
  truth_seekers: "Truth Seekers",
  reality_architects: "Reality Architects",
  neutral: "Unclaimed",
};

const EVENT_ICONS: Record<string, React.ReactNode> = {
  reinforce: <TrendingUp className="w-4 h-4 text-emerald-400" />,
  contest:   <TrendingDown className="w-4 h-4 text-red-400" />,
  flip:      <Swords className="w-4 h-4 text-yellow-400" />,
};

// Observer Fracture visual — pulsing red warning when signal < 20
function FractureWarning() {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-red-950/50 border border-red-500/40 text-red-400 text-xs animate-pulse mb-4">
      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
      <span className="font-medium">Observer Fracture detected — this territory is destabilizing</span>
    </div>
  );
}

export function TerritoryCapture({ territory, userFactionLabel, onCaptureDone }: Props) {
  const [lastResult, setLastResult] = useState<{
    eventType: string;
    signalBefore: number;
    signalAfter: number;
    flipped: boolean;
    newFaction: string;
  } | null>(null);

  const cfg = FACTION_COLORS[territory.faction] ?? FACTION_COLORS.neutral;
  const isFracture = territory.signalStrength < 20;

  const captureMutation = trpc.territories.capture.useMutation({
    onSuccess: (data) => {
      if (data && "success" in data && data.success) {
        const res = data as any;
        setLastResult(res);

        if (res.flipped) {
          toast.success(`Territory flipped! ${FACTION_LABELS[res.newFaction]} now controls this zone.`);
        } else if (res.eventType === "reinforce") {
          toast.success(`Signal reinforced: ${res.signalBefore}% → ${res.signalAfter}%`);
        } else {
          toast.info(`Signal contested: ${res.signalBefore}% → ${res.signalAfter}%`);
        }

        onCaptureDone?.();
      }
    },
    onError: (err) => {
      toast.error(err.message ?? "Capture failed");
    },
  });

  const historyQuery = trpc.territories.getCaptureHistory.useQuery(
    { territoryId: territory.id, limit: 10 },
    { refetchInterval: 30_000 }
  );

  return (
    <div className="space-y-4">
      {/* Territory Header */}
      <div className={`rounded-lg p-4 border ${cfg.border} ${cfg.bg}`}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-white text-lg">{territory.name}</h3>
            <p className={`text-sm font-medium ${cfg.text}`}>{FACTION_LABELS[territory.faction]}</p>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${cfg.text}`}>{territory.signalStrength}%</p>
            <p className="text-xs text-gray-500">signal</p>
          </div>
        </div>

        {/* Signal bar */}
        <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all duration-700 ${cfg.bar} ${isFracture ? "animate-pulse" : ""}`}
            style={{ width: `${territory.signalStrength}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{territory.memberCount} operatives</span>
          <span>{(territory.radiusMeters / 1000).toFixed(1)} km radius</span>
        </div>
      </div>

      {/* Observer Fracture Warning */}
      {isFracture && <FractureWarning />}

      {/* Last Action Result */}
      {lastResult && (
        <div className={`rounded-md p-3 text-sm border flex items-center gap-3 ${
          lastResult.flipped
            ? "bg-yellow-950/40 border-yellow-400/30 text-yellow-300"
            : lastResult.eventType === "reinforce"
            ? "bg-emerald-950/40 border-emerald-400/30 text-emerald-300"
            : "bg-red-950/40 border-red-400/30 text-red-300"
        }`}>
          {EVENT_ICONS[lastResult.eventType]}
          <div>
            {lastResult.flipped ? (
              <span className="font-bold">Faction flip — {FACTION_LABELS[lastResult.newFaction]} takes control</span>
            ) : (
              <span>Signal {lastResult.eventType}: <strong>{lastResult.signalBefore}%</strong> → <strong>{lastResult.signalAfter}%</strong></span>
            )}
          </div>
        </div>
      )}

      {/* Capture Action */}
      <Card className="card-sacred">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center flex-shrink-0">
            <Swords className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">Deploy Signal Action</h4>
            <p className="text-xs text-gray-400 mt-0.5">
              Your faction: <span className="text-cyan-400 font-medium">{userFactionLabel}</span>
              {" · "}1 hour cooldown
            </p>
          </div>
        </div>

        <div className="text-xs text-gray-500 space-y-1 mb-4 pl-12">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span><strong className="text-emerald-400">Reinforce</strong> — same faction adds +10–25 signal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingDown className="w-3 h-3 text-red-400" />
            <span><strong className="text-red-400">Contest</strong> — opposing faction drains signal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span><strong className="text-yellow-400">Flip</strong> — signal at 0 triggers faction takeover (+500 TC)</span>
          </div>
        </div>

        <Button
          className="btn-truth w-full"
          disabled={captureMutation.isPending}
          onClick={() => captureMutation.mutate({ territoryId: territory.id })}
        >
          {captureMutation.isPending ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Deploying...
            </>
          ) : (
            <>
              <Swords className="w-4 h-4 mr-2" />
              Deploy Signal Action
            </>
          )}
        </Button>
      </Card>

      {/* Capture History */}
      {historyQuery.data && historyQuery.data.length > 0 && (
        <Card className="card-sacred">
          <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-gray-400" />
            Recent Activity
          </h4>
          <div className="space-y-2">
            {historyQuery.data.map((event) => {
              const evtCfg = FACTION_COLORS[event.faction] ?? FACTION_COLORS.neutral;
              const delta = event.signalAfter - event.signalBefore;
              return (
                <div key={event.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-700/50 last:border-0">
                  <div className="flex items-center gap-2">
                    {EVENT_ICONS[event.eventType] ?? <ChevronRight className="w-3 h-3 text-gray-500" />}
                    <span className={`font-medium ${evtCfg.text}`}>{FACTION_LABELS[event.faction]}</span>
                    <span className="text-gray-500">{event.eventType}</span>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <span className={delta >= 0 ? "text-emerald-400" : "text-red-400"}>
                      {delta >= 0 ? "+" : ""}{delta}%
                    </span>
                    <span className="text-gray-600">
                      {new Date(event.capturedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
