import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Swords, Trophy, Clock, Plus, Loader2, CheckCircle2, XCircle, Zap
} from "lucide-react";
import { useEffect, useState } from "react";

const FACTION_COLORS: Record<string, { text: string; border: string; bg: string }> = {
  shadow_corps:       { text: "text-fuchsia-400", border: "border-fuchsia-400/40", bg: "bg-fuchsia-950/20" },
  truth_seekers:      { text: "text-cyan-400",    border: "border-cyan-400/40",    bg: "bg-cyan-950/20" },
  reality_architects: { text: "text-amber-400",   border: "border-amber-400/40",   bg: "bg-amber-950/20" },
  neutral:            { text: "text-gray-400",    border: "border-gray-500/40",    bg: "bg-slate-800/20" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  open:      { label: "Open",      color: "text-cyan-400" },
  accepted:  { label: "Accepted",  color: "text-amber-400" },
  active:    { label: "Active",    color: "text-red-400" },
  concluded: { label: "Concluded", color: "text-gray-400" },
  cancelled: { label: "Cancelled", color: "text-gray-600" },
  expired:   { label: "Expired",   color: "text-gray-600" },
};

function useCountdown(endsAt: string | Date | null | undefined) {
  const [remaining, setRemaining] = useState("");
  useEffect(() => {
    if (!endsAt) return;
    const tick = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) { setRemaining("Ended"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(h > 0 ? `${h}h ${m}m` : `${m}:${s.toString().padStart(2, "0")}`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);
  return remaining;
}

interface Props {
  territoryId: number;
  territoryName: string;
  userId: number;
}

function DuelCard({ duel, userId, onAction }: { duel: any; userId: number; onAction: () => void }) {
  const countdown = useCountdown(duel.endsAt);
  const isChallenger = duel.challengerId === userId;
  const myCfg = FACTION_COLORS[isChallenger ? duel.challengerFaction : duel.defenderFaction] ?? FACTION_COLORS.neutral;
  const oppCfg = FACTION_COLORS[isChallenger ? duel.defenderFaction : duel.challengerFaction] ?? FACTION_COLORS.neutral;
  const statusCfg = STATUS_CONFIG[duel.status] ?? STATUS_CONFIG.open;

  const myPoints = isChallenger ? duel.challengerPoints : duel.defenderPoints;
  const oppPoints = isChallenger ? duel.defenderPoints : duel.challengerPoints;
  const winning = myPoints > oppPoints;

  const acceptMutation = trpc.duels.accept.useMutation({
    onSuccess: () => { toast.success("Duel accepted! The clock starts now."); onAction(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Card className={`card-sacred border ${myCfg.border}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-yellow-400" />
          <span className="font-bold text-white text-sm">
            {duel.tcWager} TC Duel
          </span>
        </div>
        <div className="flex items-center gap-2">
          {duel.status === "active" && countdown && (
            <span className="text-xs text-red-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {countdown}
            </span>
          )}
          <span className={`text-xs font-semibold ${statusCfg.color}`}>{statusCfg.label}</span>
        </div>
      </div>

      {/* Score (active/concluded) */}
      {(duel.status === "active" || duel.status === "concluded") && (
        <div className="flex items-center justify-between mb-3 py-2 px-3 rounded-lg bg-slate-800/50">
          <div className="text-center">
            <p className={`text-xl font-bold ${myCfg.text}`}>{myPoints}</p>
            <p className="text-xs text-gray-500">You</p>
          </div>
          <div className="text-center">
            <Swords className="w-5 h-5 text-gray-600 mx-auto" />
          </div>
          <div className="text-center">
            <p className={`text-xl font-bold ${oppCfg.text}`}>{oppPoints}</p>
            <p className="text-xs text-gray-500">Opponent</p>
          </div>
        </div>
      )}

      {/* Winner banner */}
      {duel.status === "concluded" && duel.winnerId === userId && (
        <div className="flex items-center gap-2 px-3 py-2 rounded bg-yellow-950/40 border border-yellow-400/30 mb-3">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-bold text-yellow-400">Victory! +{duel.tcWager * 2} TC</span>
        </div>
      )}
      {duel.status === "concluded" && duel.winnerId && duel.winnerId !== userId && (
        <div className="flex items-center gap-2 px-3 py-2 rounded bg-red-950/30 border border-red-400/20 mb-3">
          <XCircle className="w-4 h-4 text-red-400" />
          <span className="text-sm text-red-400">Defeated — better luck next time</span>
        </div>
      )}

      <div className="text-xs text-gray-500 mb-3 flex justify-between">
        <span>{duel.durationMinutes} min window</span>
        {duel.defenderId === null && (
          <span className="text-cyan-400">Waiting for challenger...</span>
        )}
      </div>

      {/* Accept button for open duels (not mine) */}
      {duel.status === "open" && !isChallenger && (
        <Button
          size="sm"
          className="w-full btn-truth"
          disabled={acceptMutation.isPending}
          onClick={() => acceptMutation.mutate({ duelId: duel.id })}
        >
          {acceptMutation.isPending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Accepting...</>
          ) : (
            <><Swords className="w-4 h-4 mr-2" />Accept Duel</>
          )}
        </Button>
      )}

      {duel.status === "active" && (
        <p className="text-xs text-center text-amber-400/80">
          Deploy capture actions on this territory to earn duel points
        </p>
      )}
    </Card>
  );
}

export function DuelPanel({ territoryId, territoryName, userId }: Props) {
  const [showChallenge, setShowChallenge] = useState(false);
  const [form, setForm] = useState({ tcWager: 100, duration: 60 });

  const openDuelsQuery = trpc.duels.getOpenForTerritory.useQuery({ territoryId }, { refetchInterval: 30_000 });
  const myDuelsQuery = trpc.duels.getMyDuels.useQuery(undefined, { refetchInterval: 30_000 });

  const challengeMutation = trpc.duels.challenge.useMutation({
    onSuccess: () => {
      toast.success(`Duel opened for ${form.tcWager} TC! Waiting for an opponent.`);
      setShowChallenge(false);
      openDuelsQuery.refetch();
      myDuelsQuery.refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const openDuels = (openDuelsQuery.data ?? []).filter((d) => d.challengerId !== userId);
  const myDuels = myDuelsQuery.data ?? [];
  const myActiveDuels = myDuels.filter((d) => d.status === "active" || d.status === "open");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <Swords className="w-4 h-4 text-yellow-400" />
            Operative Duels
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Challenge any operative to a 1v1 capture contest on <span className="text-white">{territoryName}</span>
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="border-yellow-400/30 text-yellow-400 hover:bg-yellow-950/30"
          onClick={() => setShowChallenge((v) => !v)}
        >
          <Plus className="w-4 h-4 mr-1" />
          Challenge
        </Button>
      </div>

      {/* Challenge Form */}
      {showChallenge && (
        <Card className="card-sacred border border-yellow-400/20 bg-yellow-950/10">
          <h4 className="font-bold text-white text-sm mb-4">Open Duel Challenge</h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 flex justify-between">
                <span>TC Wager</span>
                <span className="text-cyan-400 font-bold">{form.tcWager} TC</span>
              </label>
              <input
                type="range" min={50} max={2000} step={50}
                value={form.tcWager}
                onChange={(e) => setForm((f) => ({ ...f, tcWager: Number(e.target.value) }))}
                className="w-full accent-cyan-400"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-0.5">
                <span>50 TC</span><span>2000 TC</span>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 flex justify-between">
                <span>Duration</span>
                <span className="text-white font-bold">{form.duration} min</span>
              </label>
              <input
                type="range" min={30} max={180} step={30}
                value={form.duration}
                onChange={(e) => setForm((f) => ({ ...f, duration: Number(e.target.value) }))}
                className="w-full accent-yellow-400"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-0.5">
                <span>30 min</span><span>3 hours</span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs text-gray-500 bg-slate-800/50 rounded p-2">
              <Zap className="w-3 h-3 text-yellow-400 flex-shrink-0 mt-0.5" />
              <span>Both players put up {form.tcWager} TC. Winner takes {form.tcWager * 2} TC. Score is based on capture points earned on this territory during the window.</span>
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="flex-1 text-xs" onClick={() => setShowChallenge(false)}>Cancel</Button>
              <Button
                size="sm" className="flex-1 btn-truth"
                disabled={challengeMutation.isPending}
                onClick={() => challengeMutation.mutate({ territoryId, tcWager: form.tcWager, durationMinutes: form.duration })}
              >
                {challengeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post Challenge"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* My Active Duels */}
      {myActiveDuels.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2 font-medium">YOUR ACTIVE DUELS</p>
          <div className="space-y-2">
            {myActiveDuels.map((d) => (
              <DuelCard key={d.id} duel={d} userId={userId} onAction={() => { myDuelsQuery.refetch(); openDuelsQuery.refetch(); }} />
            ))}
          </div>
        </div>
      )}

      {/* Open Challenges (from others) */}
      {openDuels.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2 font-medium">OPEN CHALLENGES</p>
          <div className="space-y-2">
            {openDuels.map((d) => (
              <DuelCard key={d.id} duel={d} userId={userId} onAction={() => { myDuelsQuery.refetch(); openDuelsQuery.refetch(); }} />
            ))}
          </div>
        </div>
      )}

      {openDuels.length === 0 && myActiveDuels.length === 0 && (
        <div className="text-center py-8">
          <Swords className="w-10 h-10 text-gray-700 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No open duels on this territory.</p>
          <p className="text-xs text-gray-600 mt-1">Post a challenge to draw out an opponent.</p>
        </div>
      )}
    </div>
  );
}
