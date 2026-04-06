import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Crown, Zap, TrendingUp } from "lucide-react";

interface TierProgressCardProps {
  currentXp: number;
  currentTier: string;
  nextTier: string | null;
  currentTierXp: number;
  nextTierXp: number;
  progressPercent: number;
}

const TIER_COLORS = {
  recruit: { bg: "bg-gray-600", text: "text-gray-400", border: "border-gray-500" },
  analyst: { bg: "bg-cyan-600", text: "text-cyan-400", border: "border-cyan-500" },
  sentinel: { bg: "bg-purple-600", text: "text-purple-400", border: "border-purple-500" },
  architect: { bg: "bg-pink-600", text: "text-pink-400", border: "border-pink-500" },
  witness: { bg: "bg-amber-600", text: "text-amber-400", border: "border-amber-500" },
};

export function TierProgressCard({
  currentXp,
  currentTier,
  nextTier,
  currentTierXp,
  nextTierXp,
  progressPercent,
}: TierProgressCardProps) {
  const tierColor = TIER_COLORS[currentTier as keyof typeof TIER_COLORS] || TIER_COLORS.recruit;
  const xpUntilNextTier = nextTierXp === Infinity ? "∞" : nextTierXp - currentXp;

  return (
    <Card className={`card-sacred border-2 ${tierColor.border} overflow-hidden`}>
      <div className="space-y-4">
        {/* Tier Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${tierColor.bg} rounded-lg p-2`}>
              <Crown className={`w-5 h-5 ${tierColor.text}`} />
            </div>
            <div>
              <p className="text-xs text-gray-400">Current Tier</p>
              <p className={`text-lg font-bold capitalize ${tierColor.text}`}>{currentTier}</p>
            </div>
          </div>
          {nextTier && (
            <div className="text-right">
              <p className="text-xs text-gray-400">Next Tier</p>
              <p className="text-sm font-semibold text-white capitalize">{nextTier}</p>
            </div>
          )}
        </div>

        {/* XP Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-gray-400">Experience Progress</span>
            </div>
            <span className="text-sm font-semibold text-white">{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{currentXp} XP</span>
            <span>{xpUntilNextTier} XP to next tier</span>
          </div>
        </div>

        {/* Tier Benefits Preview */}
        <div className="pt-2 border-t border-slate-700">
          <p className="text-xs text-gray-400 mb-2">Tier Benefits</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-800/50 rounded p-2">
              <Zap className="w-3 h-3 text-cyan-400 mb-1" />
              <p className="text-gray-400">Reward Boost</p>
              <p className="font-semibold text-white">+10-100%</p>
            </div>
            <div className="bg-slate-800/50 rounded p-2">
              <TrendingUp className="w-3 h-3 text-purple-400 mb-1" />
              <p className="text-gray-400">Daily Limit</p>
              <p className="font-semibold text-white">5-∞</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
