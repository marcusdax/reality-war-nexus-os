import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Trophy, Swords, TrendingUp, Shield, Loader2, Zap } from "lucide-react";

const TIER_LABELS: Record<string, string> = {
  civil_observer: "Observer",
  safety_sentinel: "Sentinel",
  shadow_analyst: "Analyst",
};

const RANK_STYLES = ["text-yellow-400", "text-gray-300", "text-amber-600"];

const MEDAL = ["🥇", "🥈", "🥉"];

export function BattleLeaderboard() {
  const leaderboardQuery = trpc.battles.getLeaderboard.useQuery(undefined, {
    refetchInterval: 60_000,
  });

  const data = leaderboardQuery.data ?? [];

  if (leaderboardQuery.isLoading) {
    return (
      <div className="text-center py-10">
        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mx-auto mb-2" />
        <p className="text-gray-500 text-sm">Computing battle rankings...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-10">
        <Trophy className="w-10 h-10 text-gray-700 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">No battle data yet — deploy capture actions to appear here.</p>
      </div>
    );
  }

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  return (
    <div className="space-y-4">
      {/* Podium */}
      <div className="grid grid-cols-3 gap-3">
        {top3.map((op, i) => (
          <Card key={op.userId} className={`card-sacred text-center border ${
            i === 0 ? "border-yellow-400/40 bg-yellow-950/20" :
            i === 1 ? "border-gray-400/30 bg-slate-800/30" :
            "border-amber-600/30 bg-amber-950/20"
          }`}>
            <div className="text-2xl mb-1">{MEDAL[i]}</div>
            <p className={`text-xs font-bold mb-1 ${RANK_STYLES[i]}`}>{op.name}</p>
            <p className="text-xs text-gray-500 mb-2">{TIER_LABELS[op.shadowCorpsTier] ?? op.shadowCorpsTier}</p>
            <p className={`text-lg font-bold ${RANK_STYLES[i]}`}>{Number(op.totalPoints).toLocaleString()}</p>
            <p className="text-xs text-gray-600">pts</p>
            <div className="mt-2 pt-2 border-t border-slate-700/50 grid grid-cols-2 gap-1 text-xs">
              <div>
                <span className="text-yellow-400 font-bold">{op.totalFlips}</span>
                <p className="text-gray-600">flips</p>
              </div>
              <div>
                <span className="text-red-400 font-bold">{op.totalContests}</span>
                <p className="text-gray-600">contests</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Full Table */}
      {rest.length > 0 && (
        <Card className="card-sacred">
          <div className="space-y-0">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 text-xs text-gray-600 font-medium pb-2 border-b border-slate-700/50 uppercase tracking-wide">
              <div className="col-span-1">#</div>
              <div className="col-span-4">Operative</div>
              <div className="col-span-2 text-right">Points</div>
              <div className="col-span-2 text-right">Flips</div>
              <div className="col-span-2 text-right">Actions</div>
              <div className="col-span-1" />
            </div>

            {rest.map((op, i) => (
              <div
                key={op.userId}
                className="grid grid-cols-12 gap-2 items-center py-2.5 border-b border-slate-700/30 last:border-0 text-sm"
              >
                <div className="col-span-1 text-gray-600 font-mono text-xs">{i + 4}</div>
                <div className="col-span-4">
                  <p className="text-white font-medium truncate">{op.name}</p>
                  <p className="text-xs text-gray-600">{TIER_LABELS[op.shadowCorpsTier] ?? op.shadowCorpsTier}</p>
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-cyan-400 font-bold">{Number(op.totalPoints).toLocaleString()}</span>
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-yellow-400 font-bold">{op.totalFlips}</span>
                </div>
                <div className="col-span-2 text-right text-gray-400">
                  {op.totalActions}
                </div>
                <div className="col-span-1" />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-600 justify-center">
        <span className="flex items-center gap-1"><Swords className="w-3 h-3 text-yellow-400" />Flips = territory taken</span>
        <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-cyan-400" />Points = all capture actions</span>
        <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-400" />Actions = total deployments</span>
      </div>
    </div>
  );
}
