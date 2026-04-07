import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Crosshair, AlertTriangle, Search, CheckCircle2, XCircle, HelpCircle,
  Loader2, Plus, ChevronDown, ChevronUp, Zap
} from "lucide-react";
import { useState } from "react";

const ANCHOR_TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string; border: string; description: string }> = {
  identity_challenge: {
    label: "Identity Challenge",
    icon: <Crosshair className="w-4 h-4" />,
    color: "text-amber-400",
    bg: "bg-amber-950/30",
    border: "border-amber-400/30",
    description: "Flag a suspected identity spoof or persona manipulation",
  },
  signal_anomaly: {
    label: "Signal Anomaly",
    icon: <Zap className="w-4 h-4" />,
    color: "text-cyan-400",
    bg: "bg-cyan-950/30",
    border: "border-cyan-400/30",
    description: "Document unexpected signal spikes or dead zones",
  },
  data_inconsistency: {
    label: "Data Inconsistency",
    icon: <AlertTriangle className="w-4 h-4" />,
    color: "text-red-400",
    bg: "bg-red-950/30",
    border: "border-red-400/30",
    description: "Report conflicting or falsified data patterns",
  },
  reality_fracture: {
    label: "Reality Fracture",
    icon: <AlertTriangle className="w-4 h-4" />,
    color: "text-fuchsia-400",
    bg: "bg-fuchsia-950/30",
    border: "border-fuchsia-400/30",
    description: "Mark locations where the consensus reality appears to break down",
  },
  convergence_rift: {
    label: "Convergence Rift",
    icon: <Zap className="w-4 h-4" />,
    color: "text-violet-400",
    bg: "bg-violet-950/30",
    border: "border-violet-400/30",
    description: "Emergency — overlapping anomaly clusters indicating imminent faction event",
  },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  active:       { label: "Active",       color: "text-cyan-400",    icon: <Search className="w-3 h-3" /> },
  investigating:{ label: "Investigating",color: "text-amber-400",   icon: <Loader2 className="w-3 h-3" /> },
  confirmed:    { label: "Confirmed",    color: "text-emerald-400", icon: <CheckCircle2 className="w-3 h-3" /> },
  debunked:     { label: "Debunked",     color: "text-red-400",     icon: <XCircle className="w-3 h-3" /> },
  expired:      { label: "Expired",      color: "text-gray-500",    icon: <HelpCircle className="w-3 h-3" /> },
};

interface Props {
  userLocation?: { lat: number; lng: number };
}

export function RealityAnchorPanel({ userLocation }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [form, setForm] = useState({
    anchorType: "signal_anomaly" as keyof typeof ANCHOR_TYPE_CONFIG,
    title: "",
    description: "",
    evidenceUrl: "",
    confidenceScore: 0.5,
  });

  const anchorsQuery = trpc.investigator.getNearbyAnchors.useQuery(
    userLocation
      ? { latitude: userLocation.lat, longitude: userLocation.lng, radiusKm: 10 }
      : { latitude: 37.7749, longitude: -122.4194, radiusKm: 10 },
    { refetchInterval: 30_000 }
  );

  const myAnchorsQuery = trpc.investigator.getMyAnchors.useQuery();

  const placeMutation = trpc.investigator.placeAnchor.useMutation({
    onSuccess: () => {
      toast.success("Reality Anchor deployed. 50 TC spent. Investigators will be notified.");
      setShowForm(false);
      setForm({ anchorType: "signal_anomaly", title: "", description: "", evidenceUrl: "", confidenceScore: 0.5 });
      anchorsQuery.refetch();
      myAnchorsQuery.refetch();
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to place anchor");
    },
  });

  const joinMutation = trpc.investigator.joinInvestigation.useMutation({
    onSuccess: (data) => {
      if (data && "alreadyJoined" in data && data.alreadyJoined) {
        toast.info("You're already investigating this anchor.");
      } else {
        toast.success("Joined investigation. Submit your verdict when ready.");
      }
      anchorsQuery.refetch();
    },
  });

  const verdictMutation = trpc.investigator.submitVerdict.useMutation({
    onSuccess: () => {
      toast.success("Verdict submitted. +100 TC awarded.");
      anchorsQuery.refetch();
    },
  });

  const handlePlace = () => {
    if (!form.title.trim()) {
      toast.error("Anchor title is required");
      return;
    }
    placeMutation.mutate({
      latitude: userLocation?.lat ?? 37.7749,
      longitude: userLocation?.lng ?? -122.4194,
      anchorType: form.anchorType,
      title: form.title,
      description: form.description || undefined,
      evidenceUrl: form.evidenceUrl || undefined,
      confidenceScore: form.confidenceScore,
    });
  };

  const anchors = anchorsQuery.data ?? [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-amber-400" />
            Reality Anchors
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Investigator-placed anomaly markers · costs 50 TC to deploy
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="border-amber-400/40 text-amber-400 hover:bg-amber-950/30"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? (
            <>
              <ChevronUp className="w-4 h-4 mr-1" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-1" />
              Place Anchor
            </>
          )}
        </Button>
      </div>

      {/* Place Anchor Form */}
      {showForm && (
        <Card className="card-sacred border border-amber-400/20 bg-amber-950/10">
          <h4 className="font-bold text-white text-sm mb-4">Deploy Reality Anchor</h4>

          {/* Anchor Type Selector */}
          <div className="mb-3">
            <label className="text-xs text-gray-400 mb-2 block">Anomaly Type</label>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(ANCHOR_TYPE_CONFIG).map(([type, cfg]) => (
                <button
                  key={type}
                  onClick={() => setForm((f) => ({ ...f, anchorType: type as any }))}
                  className={`flex items-start gap-3 p-2.5 rounded-lg border text-left transition-colors ${
                    form.anchorType === type
                      ? `${cfg.bg} ${cfg.border} ${cfg.color}`
                      : "border-slate-700/50 text-gray-500 hover:border-slate-600"
                  }`}
                >
                  <span className="mt-0.5 flex-shrink-0">{cfg.icon}</span>
                  <div>
                    <p className={`text-xs font-semibold ${form.anchorType === type ? cfg.color : "text-gray-400"}`}>
                      {cfg.label}
                    </p>
                    <p className="text-xs text-gray-600">{cfg.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="mb-3">
            <label className="text-xs text-gray-400 mb-1 block">Title *</label>
            <input
              type="text"
              className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-400/50"
              placeholder="Brief description of the anomaly"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              maxLength={255}
            />
          </div>

          {/* Description */}
          <div className="mb-3">
            <label className="text-xs text-gray-400 mb-1 block">Details</label>
            <textarea
              className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-400/50 resize-none"
              placeholder="What did you observe? Include timestamps, coordinates, patterns..."
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          {/* Confidence Slider */}
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-1 flex justify-between">
              <span>Confidence Score</span>
              <span className="text-amber-400 font-bold">{Math.round(form.confidenceScore * 100)}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={form.confidenceScore}
              onChange={(e) => setForm((f) => ({ ...f, confidenceScore: parseFloat(e.target.value) }))}
              className="w-full accent-amber-400"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-0.5">
              <span>Uncertain</span>
              <span>Certain</span>
            </div>
          </div>

          <Button
            className="w-full btn-truth"
            disabled={placeMutation.isPending || !form.title.trim()}
            onClick={handlePlace}
          >
            {placeMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <Crosshair className="w-4 h-4 mr-2" />
                Deploy Anchor (−50 TC)
              </>
            )}
          </Button>
        </Card>
      )}

      {/* Nearby Anchors */}
      {anchorsQuery.isLoading ? (
        <div className="text-center py-10">
          <Loader2 className="w-6 h-6 text-amber-400 animate-spin mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Scanning for anomalies...</p>
        </div>
      ) : anchors.length === 0 ? (
        <div className="text-center py-10">
          <Crosshair className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No active anomalies in your sector.</p>
          <p className="text-xs text-gray-600 mt-1">Deploy an anchor if you detect something irregular.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {anchors.map((anchor) => {
            const typeCfg = ANCHOR_TYPE_CONFIG[anchor.anchorType] ?? ANCHOR_TYPE_CONFIG.signal_anomaly;
            const statusCfg = STATUS_CONFIG[anchor.status] ?? STATUS_CONFIG.active;
            const expanded = expandedId === anchor.id;

            return (
              <Card
                key={anchor.id}
                className={`card-sacred border ${expanded ? typeCfg.border : "border-slate-700/50"} transition-colors`}
              >
                <button
                  className="w-full text-left"
                  onClick={() => setExpandedId(expanded ? null : anchor.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${typeCfg.bg} ${typeCfg.color}`}>
                      {typeCfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-white text-sm leading-tight">{anchor.title}</p>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className={`text-xs flex items-center gap-1 ${statusCfg.color}`}>
                            {statusCfg.icon}
                            {statusCfg.label}
                          </span>
                          {expanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className={typeCfg.color}>{typeCfg.label}</span>
                        <span>{Math.round(Number(anchor.confidenceScore) * 100)}% confidence</span>
                        <span>{anchor.investigatorCount} investigating</span>
                      </div>
                    </div>
                  </div>
                </button>

                {expanded && (
                  <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-3">
                    {anchor.description && (
                      <p className="text-sm text-gray-400">{anchor.description}</p>
                    )}

                    <div className="text-xs text-gray-500 space-y-1">
                      <div className="flex justify-between">
                        <span>Reward</span>
                        <span className="text-cyan-400 font-bold">{anchor.rewardTruthCredits} TC + {anchor.rewardXp} XP</span>
                      </div>
                      {anchor.expiresAt && (
                        <div className="flex justify-between">
                          <span>Expires</span>
                          <span className="text-gray-300">{new Date(anchor.expiresAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {anchor.status === "active" || anchor.status === "investigating" ? (
                      <div className="space-y-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs border-amber-400/30 text-amber-400 hover:bg-amber-950/30"
                          disabled={joinMutation.isPending}
                          onClick={() => joinMutation.mutate({ anchorId: anchor.id })}
                        >
                          <Search className="w-3 h-3 mr-1.5" />
                          Join Investigation
                        </Button>
                        <div className="grid grid-cols-3 gap-2">
                          {(["confirmed", "debunked", "inconclusive"] as const).map((v) => (
                            <Button
                              key={v}
                              size="sm"
                              variant="outline"
                              className={`text-xs ${
                                v === "confirmed" ? "border-emerald-400/30 text-emerald-400 hover:bg-emerald-950/30"
                                : v === "debunked" ? "border-red-400/30 text-red-400 hover:bg-red-950/30"
                                : "border-gray-500/30 text-gray-400 hover:bg-slate-800/30"
                              }`}
                              disabled={verdictMutation.isPending}
                              onClick={() =>
                                verdictMutation.mutate({ anchorId: anchor.id, verdict: v })
                              }
                            >
                              {v === "confirmed" ? <CheckCircle2 className="w-3 h-3 mr-1" /> :
                               v === "debunked" ? <XCircle className="w-3 h-3 mr-1" /> :
                               <HelpCircle className="w-3 h-3 mr-1" />}
                              {v.charAt(0).toUpperCase() + v.slice(1)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className={`text-center py-2 text-xs font-medium rounded ${statusCfg.color}`}>
                        {anchor.status === "confirmed" ? "✓ Anomaly confirmed by investigators" :
                         anchor.status === "debunked" ? "✗ Debunked — no anomaly detected" :
                         "Anchor expired"}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
