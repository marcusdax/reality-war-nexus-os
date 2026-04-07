import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Lock } from "lucide-react";

interface BadgeItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  earned: boolean;
  earnedAt?: Date;
}

interface BadgeShowcaseProps {
  badges: BadgeItem[];
  maxDisplay?: number;
}

const RARITY_COLORS = {
  common: { bg: "bg-gray-600", text: "text-gray-200", border: "border-gray-500" },
  rare: { bg: "bg-blue-600", text: "text-blue-200", border: "border-blue-500" },
  epic: { bg: "bg-purple-600", text: "text-purple-200", border: "border-purple-500" },
  legendary: { bg: "bg-amber-600", text: "text-amber-200", border: "border-amber-500" },
};

const BADGE_ICONS = {
  mission_master: "🎯",
  truth_seeker: "🔍",
  reality_warden: "🛡️",
  shadow_operative: "👁️",
  nexus_pioneer: "🚀",
  community_guardian: "🤝",
  evidence_collector: "📸",
  verification_expert: "✓",
};

export function BadgeShowcase({ badges, maxDisplay = 6 }: BadgeShowcaseProps) {
  const earnedBadges = badges.filter((b) => b.earned);
  const lockedBadges = badges.filter((b) => !b.earned).slice(0, maxDisplay - earnedBadges.length);
  const displayBadges = [...earnedBadges.slice(0, maxDisplay), ...lockedBadges];

  return (
    <Card className="card-sacred">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white">Achievements</h3>
          </div>
          <Badge variant="secondary" className="text-xs">
            {earnedBadges.length} / {badges.length}
          </Badge>
        </div>

        {/* Badge Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {displayBadges.map((badge) => {
            const rarityColor = RARITY_COLORS[badge.rarity];
            const badgeIcon = BADGE_ICONS[badge.icon as keyof typeof BADGE_ICONS] || "⭐";

            return (
              <div
                key={badge.id}
                className={`relative group cursor-pointer transition-transform hover:scale-110 ${
                  !badge.earned ? "opacity-50" : ""
                }`}
              >
                {/* Badge */}
                <div
                  className={`${rarityColor.bg} rounded-lg p-3 flex flex-col items-center justify-center aspect-square border-2 ${rarityColor.border} relative overflow-hidden`}
                >
                  {/* Background glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Icon */}
                  <div className="text-2xl mb-1 relative z-10">{badgeIcon}</div>

                  {/* Lock overlay */}
                  {!badge.earned && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                  <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-center whitespace-nowrap">
                    <p className={`font-bold ${rarityColor.text}`}>{badge.name}</p>
                    <p className="text-gray-400 text-xs">{badge.description}</p>
                    {badge.earnedAt && (
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(badge.earnedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Info */}
        <div className="pt-2 border-t border-slate-700">
          <p className="text-xs text-gray-400">
            Earn badges by completing missions, reaching milestones, and contributing to the community.
          </p>
        </div>
      </div>
    </Card>
  );
}
