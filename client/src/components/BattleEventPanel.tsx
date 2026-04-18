import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Swords, Shield, Zap, Clock, Trophy, Loader2, Users,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2
} from "lucide-react";
import { useEffect, useState } from "react";

const FACTION_COLORS: Record<string, { text: string; bar: string; border: string; bg: string }> = {
  shadow_corps:       { text: "text-fuchsia-400",  bar: "bg-fuchsia-400",  border: "border-fuchsia-400/50", bg: "bg-fuchsia-950/30" },
  truth_seekers:      { text: "text-cyan-400",     bar: "bg-cyan-400",     border: "border-cyan-400/50",    bg: "bg-cyan-950/30" },
  reality_architects: { text: "text-amber-400",    bar: "bg-amber-400",    border: "border-amber-400/50",   bg: "bg-amber-950/30" },
  neutral:            { text: "text-gray-400",     bar: "bg-gray-400",     border: "border-gray-500/50",    bg: "bg-slate-800/30" },
};

const FACTION_LABELS: Record<string, string> = {
  shadow_corps: "Shadow Corps",
  truth_seekers: "Truth Seekers",
  reality_architects: "Reality Architects",
  neutral: "Unclaimed",
};

function useCountdown(endsAt: string | Date | null | undefined) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    if (!endsAt) return;
    const tick = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) { setRemaining("Ended"); return; }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${m}:${s.toString().padStart(2, "0")}`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  return remaining;
}

interface ActiveBattleCardProps {
  battle: {
    id: number;
    attackingFaction: string;
    defendingFaction: string;
    attackPoints: number;
    defendPoints: number;
    attackerCount: number;
    defenderCount: number;
    endsAt: Date | string | null;
    status: string;
    tcPot: number;
    winnerFaction?: string | null;
  };
  userFaction: string;
  onJoined?: () => void;
}

function ActiveBattleCard({ battle, userFaction, onJoined }: ActiveBattleCardProps) {
  const countdown = useCountdown(battle.endsAt);
  const attackCfg = FACTION_COLORS[battle.attackingFaction] ?? FACTION_COLORS.neutral;
  const defendCfg = FACTION_COLORS[battle.defendingFaction] ?? FACTION_COLORS.neutral;

  const total = battle.attackPoints + battle.defendPoints || 1;
  const attackPct = Math.round((battle.attackPoints / total) * 100);
  const defendPct = 100 - attackPct;

  const joinMutation = trpc.battles.join.useMutation({
    onSuccess: (data) => {
      toast.success(`Joined as ${(data as any)?.side} — deploy capture actions to contribute points!`);
      onJoined?.();
    },
    onError: (e) => toast.error(e.message ?? "Failed to join battle"),
  });

  const concludeMutation = trpc.battles.conclude.useMutation({
    onSuccess: (res) => {
      const r = res as any;
      if (r?.winnerFaction) {
        toast.success(`Battle concluded! ${FACTION_LABELS[r.winnerFaction]} wins${r.flipped ? " — territory flipped!" : "."}`);
      }
      onJoined?.();
    },
    onError: (e) => toast.error(e.message),
  });

  const isEnded = battle.status === "concluded" || countdown === "Ended";

  return (
    <Card className={`card-sacred border-2 ${isEnded ? "border-slate-600/50" : "border-yellow-500/40 animate-pulse-slow"}`}>
      {/* Live Badge */}
      {!isEnded && (
        <div className="flex items-center gap-2 mb-4">
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-xs text-red-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
            BATTLE LIVE
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
            <Clock className="w-3 h-3" />
            {countdown}
          </span>
          {battle.tcPot > 0 && (
            <span className="text-xs text-cyan-400 font-bold">{battle.tcPot} TC pot</span>
          )}
        </div>
      )}

      {/* VS Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-center flex-1">
          <p className={`text-xs font-bold ${attackCfg.text} mb-1`}>ATTACK</p>
          <p className={`text-sm font-bold ${attackCfg.text}`}>{FACTION_LABELS[battle.attackingFaction]}</p>
          <p className="text-lg font-bold text-white">{battle.attackPoints}</p>
          <p className="text-xs text-gray-500">{battle.attackerCount} ops</p>
        </div>

        <div className="text-center px-4">
          <Swords className="w-8 h-8 text-yellow-400 mx-auto" />
          <p className="text-xs text-gray-500 mt-1">VS</p>
        </div>

        <div className="text-center flex-1">
          <p className={`text-xs font-bold ${defendCfg.text} mb-1`}>DEFEND</p>
          <p className={`text-sm font-bold ${defendCfg.text}`}>{FACTION_LABELS[battle.defendingFaction]}</p>
          <p className="text-lg font-bold text-white">{battle.defendPoints}</p>
          <p className="text-xs text-gray-500">{battle.defenderCount} ops</p>
        </div>
      </div>

      {/* Battle Bar */}
      <div className="relative h-4 rounded-full overflow-hidden bg-slate-700 mb-2">
        <div
          className={`absolute left-0 top-0 h-full ${attackCfg.bar} transition-all duration-500`}
          style={{ width: `${attackPct}%` }}
        />
        <div
          className={`absolute right-0 top-0 h-full ${defendCfg.bar} transition-all duration-500`}
          style={{ width: `${defendPct}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white drop-shadow">
            {attackPct}% / {defendPct}%
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          <TrendingUp className={`w-3 h-3 ${attackCfg.text}`} />
          <span>Attack leading</span>
        </div>
        <div className="flex items-center gap-1">
          <Shield className={`w-3 h-3 ${defendCfg.text}`} />
          <span>Defenders hold</span>
        </div>
      </div>

      {/* Winner Banner */}
      {(isEnded || battle.winnerFaction) && battle.winnerFaction && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-3 ${
          FACTION_COLORS[battle.winnerFaction]?.bg ?? "bg-slate-700"
        } border ${FACTION_COLORS[battle.winnerFaction]?.border ?? "border-slate-600"}`}>
          <Trophy className={`w-4 h-4 ${FACTION_COLORS[battle.winnerFaction]?.text ?? "text-white"}`} />
          <span className={`text-sm font-bold ${FACTION_COLORS[battle.winnerFaction]?.text ?? "text-white"}`}>
            {FACTION_LABELS[battle.winnerFaction]} wins
          </span>
        </div>
      )}

      {/* Actions */}
      {!isEnded ? (
        <Button
          className="w-full btn-truth"
          disabled={joinMutation.isPending}
          onClick={() => joinMutation.mutate({ battleId: battle.id })}
        >
          {joinMutation.isPending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Joining...</>
          ) : (
            <><Swords className="w-4 h-4 mr-2" />Join Battle</>
          )}
        </Button>
      ) : !battle.winnerFaction ? (
        <Button
          variant="outline"
          className="w-full text-xs"
          disabled={concludeMutation.isPending}
          onClick={() => concludeMutation.mutate({ battleId: battle.id })}
        >
          {concludeMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
          Conclude Battle
        </Button>
      ) : null}
    </Card>
  );
}

interface Props {
  territoryId?: number;
  territoryName?: string;
  territoryFaction?: string;
  userFaction: string;
}

export function BattleEventPanel({ territoryId, territoryName, territoryFaction, userFaction }: Props) {
  const [showDeclare, setShowDeclare] = useState(false);
  const [declareForm, setDeclareForm] = useState({ duration: 30, tcBuyIn: 0 });

  const activeBattleQuery = trpc.battles.getActive.useQuery(
    { territoryId: territoryId ?? 0 },
    { enabled: !!territoryId, refetchInterval: 10_000 }
  );

  const recentQuery = trpc.battles.getRecent.useQuery(undefined, {
    refetchInterval: 30_000,
  });

  const declareMutation = trpc.battles.declare.useMutation({
    onSuccess: () => {
      toast.success("Battle declared! Allies will rally to your assault.");
      setShowDeclare(false);
      activeBattleQuery.refetch();
    },
    onError: (e) => toast.error(e.message ?? "Failed to declare battle"),
  });

  const activeBattle = activeBattleQuery.data;
  const canDeclare = territoryId && territoryFaction && userFaction !== territoryFaction && !activeBattle;

  return (
    <div className="space-y-4">
      {/* Active Battle for this territory */}
      {activeBattleQuery.isLoading ? (
        <div className="text-center py-6">
          <Loader2 className="w-6 h-6 text-yellow-400 animate-spin mx-auto" />
        </div>
      ) : activeBattle ? (
        <ActiveBattleCard
          battle={activeBattle}
          userFaction={userFaction}
          onJoined={() => activeBattleQuery.refetch()}
        />
      ) : (
        canDeclare && (
          <Card className="card-sacred border border-yellow-500/20 bg-yellow-950/10">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-600 to-orange-700 flex items-center justify-center flex-shrink-0">
                <Swords className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Declare Battle</h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Launch a timed assault on <span className="text-white font-medium">{territoryName}</span>. Rally allies before the window closes.
                </p>
              </div>
            </div>

            {!showDeclare ? (
              <Button
                className="w-full"
                variant="outline"
                size="sm"
                onClick={() => setShowDeclare(true)}
              >
                <Swords className="w-4 h-4 mr-2" />
                Declare Battle
              </Button>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 flex justify-between">
                    <span>Duration</span>
                    <span className="text-white font-bold">{declareForm.duration} min</span>
                  </label>
                  <input
                    type="range" min={15} max={120} step={15}
                    value={declareForm.duration}
                    onChange={(e) => setDeclareForm((f) => ({ ...f, duration: Number(e.target.value) }))}
                    className="w-full accent-yellow-400"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-0.5">
                    <span>15 min</span><span>2 hours</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 flex justify-between">
                    <span>TC Buy-in (winner split)</span>
                    <span className="text-cyan-400 font-bold">{declareForm.tcBuyIn} TC</span>
                  </label>
                  <input
                    type="range" min={0} max={1000} step={50}
                    value={declareForm.tcBuyIn}
                    onChange={(e) => setDeclareForm((f) => ({ ...f, tcBuyIn: Number(e.target.value) }))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost" size="sm" className="flex-1 text-xs"
                    onClick={() => setShowDeclare(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm" className="flex-1 btn-truth"
                    disabled={declareMutation.isPending}
                    onClick={() => declareMutation.mutate({
                      territoryId: territoryId!,
                      durationMinutes: declareForm.duration,
                      tcBuyIn: declareForm.tcBuyIn,
                    })}
                  >
                    {declareMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Launch Assault"}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )
      )}

      {/* Recent Battles Feed */}
      {recentQuery.data && recentQuery.data.length > 0 && (
        <Card className="card-sacred">
          <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Battle Feed
          </h4>
          <div className="space-y-2">
            {recentQuery.data.slice(0, 8).map((b) => {
              const atkCfg = FACTION_COLORS[b.attackingFaction] ?? FACTION_COLORS.neutral;
              const defCfg = FACTION_COLORS[b.defendingFaction] ?? FACTION_COLORS.neutral;
              const won = b.winnerFaction === b.attackingFaction;

              return (
                <div key={b.id} className="flex items-center gap-2 py-1.5 border-b border-slate-700/50 last:border-0 text-xs">
                  <span className={`font-semibold ${atkCfg.text}`}>
                    {FACTION_LABELS[b.attackingFaction].split(" ")[0]}
                  </span>
                  <Swords className="w-3 h-3 text-gray-600" />
                  <span className={`font-semibold ${defCfg.text}`}>
                    {FACTION_LABELS[b.defendingFaction].split(" ")[0]}
                  </span>
                  <span className="text-gray-600 mx-1">·</span>
                  {b.status === "concluded" ? (
                    <span className={`font-bold ${won ? atkCfg.text : defCfg.text}`}>
                      {won ? "ATK wins" : "DEF holds"}
                    </span>
                  ) : b.status === "active" ? (
                    <span className="text-red-400 font-bold animate-pulse">LIVE</span>
                  ) : (
                    <span className="text-gray-600">{b.status}</span>
                  )}
                  <span className="text-gray-600 ml-auto">
                    {new Date(b.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
