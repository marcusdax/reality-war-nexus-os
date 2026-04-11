import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Users, Plus, LogOut, Crown, Shield, Swords, Loader2, ChevronDown, ChevronUp, Trophy } from "lucide-react";
import { useState } from "react";

const FACTION_COLORS: Record<string, { text: string; border: string; bg: string }> = {
  shadow_corps:       { text: "text-fuchsia-400", border: "border-fuchsia-400/40", bg: "bg-fuchsia-950/30" },
  truth_seekers:      { text: "text-cyan-400",    border: "border-cyan-400/40",    bg: "bg-cyan-950/30" },
  reality_architects: { text: "text-amber-400",   border: "border-amber-400/40",   bg: "bg-amber-950/30" },
  neutral:            { text: "text-gray-400",    border: "border-gray-500/40",    bg: "bg-slate-800/30" },
};

const FACTION_LABELS: Record<string, string> = {
  shadow_corps: "Shadow Corps",
  truth_seekers: "Truth Seekers",
  reality_architects: "Reality Architects",
  neutral: "Neutral",
};

const ROLE_ICONS: Record<string, React.ReactNode> = {
  leader:  <Crown className="w-3 h-3 text-yellow-400" />,
  officer: <Shield className="w-3 h-3 text-blue-400" />,
  member:  <Swords className="w-3 h-3 text-gray-500" />,
};

export function SquadPanel() {
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [joinTag, setJoinTag] = useState("");
  const [form, setForm] = useState({ name: "", tag: "", bio: "", emblem: "⚔" });

  const mySquadQuery = trpc.squads.getMySquad.useQuery();
  const leaderboardQuery = trpc.squads.getLeaderboard.useQuery();
  const membersQuery = trpc.squads.getMembers.useQuery(
    { squadId: mySquadQuery.data?.id ?? 0 },
    { enabled: !!mySquadQuery.data?.id && showMembers }
  );

  const createMutation = trpc.squads.create.useMutation({
    onSuccess: () => {
      toast.success("Squad created! Share your tag to recruit operatives.");
      setShowCreate(false);
      mySquadQuery.refetch();
    },
    onError: (e) => toast.error(e.message ?? "Failed to create squad"),
  });

  const joinMutation = trpc.squads.join.useMutation({
    onSuccess: () => {
      toast.success("Joined squad!");
      setShowJoin(false);
      mySquadQuery.refetch();
    },
    onError: (e) => toast.error(e.message ?? "Squad not found or full"),
  });

  const leaveMutation = trpc.squads.leave.useMutation({
    onSuccess: () => {
      toast.info("Left squad.");
      mySquadQuery.refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  // ── Enrolled in a squad ──────────────────────────────────────────────────
  if (mySquadQuery.data) {
    const squad = mySquadQuery.data;
    const cfg = FACTION_COLORS[squad.faction] ?? FACTION_COLORS.neutral;

    return (
      <div className="space-y-4">
        {/* Squad Card */}
        <Card className={`card-sacred border ${cfg.border} ${cfg.bg}`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center text-2xl select-none">
                {squad.emblem ?? "⚔"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-lg">{squad.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded border border-slate-600 text-gray-400 font-mono">
                    [{squad.tag}]
                  </span>
                </div>
                <p className={`text-sm ${cfg.text}`}>{FACTION_LABELS[squad.faction]}</p>
              </div>
            </div>
            {"userRole" in squad && squad.userRole === "leader" ? null : (
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-500 hover:text-red-400 text-xs"
                onClick={() => leaveMutation.mutate()}
                disabled={leaveMutation.isPending}
              >
                <LogOut className="w-3 h-3 mr-1" />
                Leave
              </Button>
            )}
          </div>

          {squad.bio && <p className="text-sm text-gray-400 mb-4">{squad.bio}</p>}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Members", value: squad.memberCount, color: "text-white" },
              { label: "Capture Pts", value: squad.totalCapturePoints.toLocaleString(), color: "text-cyan-400" },
              { label: "Flips", value: squad.totalFlips, color: "text-yellow-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <p className={`text-lg font-bold ${color}`}>{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-4">
            <div>W <span className="text-emerald-400 font-bold">{squad.wins}</span></div>
            <div>L <span className="text-red-400 font-bold">{squad.losses}</span></div>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs"
            onClick={() => setShowMembers((v) => !v)}
          >
            <Users className="w-3 h-3 mr-1.5" />
            {showMembers ? "Hide" : "Show"} Roster ({squad.memberCount})
            {showMembers ? <ChevronUp className="w-3 h-3 ml-1.5" /> : <ChevronDown className="w-3 h-3 ml-1.5" />}
          </Button>
        </Card>

        {/* Roster */}
        {showMembers && (
          <Card className="card-sacred">
            <h4 className="font-bold text-white text-sm mb-3">Squad Roster</h4>
            {membersQuery.isLoading ? (
              <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin text-gray-400 mx-auto" /></div>
            ) : (
              <div className="space-y-2">
                {membersQuery.data?.map((m) => (
                  <div key={m.id} className="flex items-center justify-between py-1.5 border-b border-slate-700/50 last:border-0 text-sm">
                    <div className="flex items-center gap-2">
                      {ROLE_ICONS[m.role]}
                      <span className="text-white font-medium">{m.name}</span>
                      <span className="text-xs text-gray-500 capitalize">{m.shadowCorpsTier?.replace("_", " ")}</span>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      <span className="text-cyan-400 font-bold">{m.capturePointsContributed}</span>
                      {" pts · "}
                      <span className="text-yellow-400 font-bold">{m.flipsContributed}</span>
                      {" flips"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    );
  }

  // ── Not in a squad ───────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 border-cyan-400/30 text-cyan-400 hover:bg-cyan-950/30"
          onClick={() => { setShowCreate((v) => !v); setShowJoin(false); }}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Create Squad
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={() => { setShowJoin((v) => !v); setShowCreate(false); }}
        >
          <Users className="w-4 h-4 mr-1.5" />
          Join by Tag
        </Button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <Card className="card-sacred border border-cyan-400/20">
          <h4 className="font-bold text-white text-sm mb-4">Create Squad</h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Squad Name *</label>
              <input
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400/50"
                placeholder="e.g. Ghost Relay Seven"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                maxLength={60}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Tag (2-6 chars) *</label>
                <input
                  className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400/50 uppercase"
                  placeholder="GR7"
                  value={form.tag}
                  onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") }))}
                  maxLength={6}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Emblem</label>
                <input
                  className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400/50"
                  placeholder="⚔"
                  value={form.emblem}
                  onChange={(e) => setForm((f) => ({ ...f, emblem: e.target.value.slice(0, 2) }))}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Bio</label>
              <textarea
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400/50 resize-none"
                placeholder="Squad mission statement..."
                rows={2}
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                maxLength={300}
              />
            </div>
            <Button
              className="w-full btn-truth"
              disabled={createMutation.isPending || !form.name.trim() || form.tag.length < 2}
              onClick={() => createMutation.mutate({ name: form.name, tag: form.tag, bio: form.bio || undefined, emblem: form.emblem })}
            >
              {createMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : "Found Squad"}
            </Button>
          </div>
        </Card>
      )}

      {/* Join Form */}
      {showJoin && (
        <Card className="card-sacred">
          <h4 className="font-bold text-white text-sm mb-3">Join by Tag</h4>
          <div className="flex gap-2">
            <input
              className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400/50 uppercase"
              placeholder="Enter squad tag..."
              value={joinTag}
              onChange={(e) => setJoinTag(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && joinMutation.mutate({ tag: joinTag })}
            />
            <Button
              size="sm"
              className="btn-truth"
              disabled={joinMutation.isPending || joinTag.length < 2}
              onClick={() => joinMutation.mutate({ tag: joinTag })}
            >
              {joinMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join"}
            </Button>
          </div>
        </Card>
      )}

      {/* Squad Leaderboard */}
      {leaderboardQuery.data && leaderboardQuery.data.length > 0 && (
        <Card className="card-sacred">
          <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            Squad Rankings
          </h4>
          <div className="space-y-2">
            {leaderboardQuery.data.slice(0, 8).map((squad, i) => {
              const cfg = FACTION_COLORS[squad.faction] ?? FACTION_COLORS.neutral;
              return (
                <div key={squad.id} className="flex items-center gap-3 py-1.5 border-b border-slate-700/50 last:border-0 text-sm">
                  <span className={`w-6 text-center font-bold text-xs ${i < 3 ? "text-yellow-400" : "text-gray-600"}`}>
                    {i + 1}
                  </span>
                  <span className="text-lg">{squad.emblem ?? "⚔"}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-white font-medium">{squad.name}</span>
                    <span className="text-xs text-gray-500 ml-1.5">[{squad.tag}]</span>
                  </div>
                  <div className="text-right text-xs">
                    <span className={`font-bold ${cfg.text}`}>{squad.totalCapturePoints.toLocaleString()}</span>
                    <span className="text-gray-600"> pts</span>
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
