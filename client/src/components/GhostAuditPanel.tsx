import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import {
  Eye,
  FileSearch,
  TrendingUp,
  Scale,
  Activity,
  Truck,
  Plus,
  Loader2,
  CheckCircle,
  Clock,
  ArrowRight,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";

type AuditType =
  | "financial_forensics"
  | "physical_surveillance"
  | "legal_analysis"
  | "behavioral_pattern"
  | "supply_chain";

type AuditStatus = "initiated" | "active" | "synthesizing" | "complete" | "archived";

const AUDIT_TYPE_CONFIG: Record<AuditType, { label: string; icon: React.FC<any>; color: string }> = {
  financial_forensics: { label: "Financial Forensics", icon: TrendingUp, color: "text-cyan-400" },
  physical_surveillance: { label: "Physical Surveillance", icon: Eye, color: "text-purple-400" },
  legal_analysis: { label: "Legal Analysis", icon: Scale, color: "text-amber-400" },
  behavioral_pattern: { label: "Behavioral Pattern", icon: Activity, color: "text-green-400" },
  supply_chain: { label: "Supply Chain", icon: Truck, color: "text-fuchsia-400" },
};

const STATUS_CONFIG: Record<AuditStatus, { label: string; color: string; bg: string }> = {
  initiated: { label: "Initiated", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/30" },
  active: { label: "Active", color: "text-cyan-400", bg: "bg-cyan-400/10 border-cyan-400/30" },
  synthesizing: { label: "Synthesizing", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/30" },
  complete: { label: "Complete", color: "text-green-400", bg: "bg-green-400/10 border-green-400/30" },
  archived: { label: "Archived", color: "text-gray-400", bg: "bg-gray-400/10 border-gray-400/30" },
};

interface GhostAuditPanelProps {
  analystLevel: "1" | "2" | "3";
  onBlackBookPublish?: () => void;
}

export function GhostAuditPanel({ analystLevel, onBlackBookPublish }: GhostAuditPanelProps) {
  const [showNewAuditForm, setShowNewAuditForm] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<number | null>(null);
  const [newAudit, setNewAudit] = useState({
    auditTitle: "",
    targetEntity: "",
    auditType: "physical_surveillance" as AuditType,
    pteConfidenceScore: 0.65,
  });
  const [findingsInput, setFindingsInput] = useState("");
  const [publishTitle, setPublishTitle] = useState("");
  const [showPublishForm, setShowPublishForm] = useState(false);

  const auditsQuery = trpc.shadowCorps.getMyAudits.useQuery({ limit: 20 });
  const initiateMutation = trpc.shadowCorps.initiateGhostAudit.useMutation();
  const submitFindingsMutation = trpc.shadowCorps.submitAuditFindings.useMutation();
  const publishMutation = trpc.shadowCorps.publishToBlackBook.useMutation();

  const selectedAuditData = auditsQuery.data?.find((a) => a.id === selectedAudit);

  const handleInitiate = async () => {
    if (!newAudit.auditTitle || !newAudit.targetEntity) {
      toast.error("Title and target entity are required");
      return;
    }
    try {
      await initiateMutation.mutateAsync(newAudit);
      toast.success("Ghost Audit initiated. The shadows are watching.");
      setShowNewAuditForm(false);
      setNewAudit({ auditTitle: "", targetEntity: "", auditType: "physical_surveillance", pteConfidenceScore: 0.65 });
      auditsQuery.refetch();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to initiate audit");
    }
  };

  const handleSubmitFindings = async (auditId: number, status: "active" | "synthesizing" | "complete") => {
    if (!findingsInput.trim()) {
      toast.error("Findings are required");
      return;
    }
    try {
      await submitFindingsMutation.mutateAsync({ auditId, findings: findingsInput, newStatus: status });
      toast.success("Findings recorded to the Ghost Audit.");
      setFindingsInput("");
      auditsQuery.refetch();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to submit findings");
    }
  };

  const handlePublish = async (auditId: number) => {
    if (!publishTitle.trim()) {
      toast.error("A title is required for Black Book publication");
      return;
    }
    try {
      await publishMutation.mutateAsync({ auditId, title: publishTitle });
      toast.success("Entry sealed in the Shadow Black Book. The truth is now immutable.");
      setShowPublishForm(false);
      setPublishTitle("");
      auditsQuery.refetch();
      onBlackBookPublish?.();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to publish");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-fuchsia-400" />
            Ghost Audits
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            The constitutional immune system — documenting the state's physical footprint
          </p>
        </div>
        <Button
          size="sm"
          className="btn-truth"
          onClick={() => setShowNewAuditForm(true)}
        >
          <Plus className="w-4 h-4 mr-1" />
          New Audit
        </Button>
      </div>

      {/* Audit list */}
      {auditsQuery.isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
        </div>
      ) : auditsQuery.data && auditsQuery.data.length > 0 ? (
        <div className="space-y-3">
          {auditsQuery.data.map((audit) => {
            const typeConf = AUDIT_TYPE_CONFIG[audit.auditType as AuditType];
            const statusConf = STATUS_CONFIG[audit.status as AuditStatus];
            const Icon = typeConf?.icon ?? Eye;
            const isSelected = selectedAudit === audit.id;

            return (
              <Card
                key={audit.id}
                className={`p-4 border cursor-pointer transition-colors ${
                  isSelected
                    ? "border-fuchsia-400/40 bg-fuchsia-950/20"
                    : "border-slate-700 hover:border-slate-600 bg-slate-900/60"
                }`}
                onClick={() => setSelectedAudit(isSelected ? null : audit.id)}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${typeConf?.color ?? "text-gray-400"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-white text-sm truncate">{audit.auditTitle}</p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${statusConf?.bg} ${statusConf?.color}`}
                      >
                        {statusConf?.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{typeConf?.label}</p>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{audit.targetEntity}</p>

                    {Number(audit.pteConfidenceScore) > 0 && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        <span className="text-xs text-amber-400">
                          PTE Confidence: {(Number(audit.pteConfidenceScore) * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}

                    {/* Expanded detail */}
                    {isSelected && (
                      <div className="mt-3 space-y-3 border-t border-slate-700 pt-3">
                        {audit.findings && (
                          <div>
                            <p className="text-xs font-semibold text-gray-400 mb-1">Findings:</p>
                            <p className="text-xs text-gray-300 leading-relaxed">{audit.findings}</p>
                          </div>
                        )}

                        {audit.status !== "complete" && audit.status !== "archived" && (
                          <div className="space-y-2">
                            <textarea
                              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-xs text-white placeholder-gray-600 resize-none focus:outline-none focus:border-fuchsia-400/50"
                              rows={3}
                              placeholder="Document your findings..."
                              value={findingsInput}
                              onChange={(e) => setFindingsInput(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-7"
                                disabled={submitFindingsMutation.isPending}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSubmitFindings(audit.id, "active");
                                }}
                              >
                                Save Progress
                              </Button>
                              <Button
                                size="sm"
                                className="btn-truth text-xs h-7"
                                disabled={submitFindingsMutation.isPending}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSubmitFindings(audit.id, "complete");
                                }}
                              >
                                Complete Audit
                              </Button>
                            </div>
                          </div>
                        )}

                        {audit.status === "complete" && !audit.publishedToBlackBook && analystLevel === "3" && (
                          <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                            {showPublishForm && selectedAudit === audit.id ? (
                              <>
                                <input
                                  className="w-full bg-slate-800 border border-fuchsia-400/30 rounded-md px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-fuchsia-400"
                                  placeholder="Black Book entry title..."
                                  value={publishTitle}
                                  onChange={(e) => setPublishTitle(e.target.value)}
                                />
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setShowPublishForm(false)}>
                                    Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs h-7"
                                    disabled={publishMutation.isPending}
                                    onClick={() => handlePublish(audit.id)}
                                  >
                                    {publishMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Seal in Black Book"}
                                  </Button>
                                </div>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                className="bg-fuchsia-900/50 hover:bg-fuchsia-800/60 border border-fuchsia-400/30 text-fuchsia-300 text-xs h-7"
                                onClick={() => setShowPublishForm(true)}
                              >
                                <BookOpen className="w-3 h-3 mr-1" />
                                Publish to Black Book
                              </Button>
                            )}
                          </div>
                        )}

                        {audit.publishedToBlackBook === 1 && (
                          <div className="flex items-center gap-1.5 text-green-400">
                            <CheckCircle className="w-3 h-3" />
                            <span className="text-xs">Sealed in the Shadow Black Book</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10 border border-dashed border-slate-700 rounded-lg">
          <Eye className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No Ghost Audits initiated</p>
          <p className="text-xs text-gray-600 mt-1">
            Ghost Audits are covert operations to document what those in power try to hide.
          </p>
        </div>
      )}

      {/* New Audit Modal */}
      <Dialog open={showNewAuditForm} onOpenChange={setShowNewAuditForm}>
        <DialogContent className="sm:max-w-lg bg-slate-900 border-fuchsia-400/20">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-fuchsia-400" />
              Initiate Ghost Audit
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="bg-slate-800/50 border border-fuchsia-400/10 rounded-lg p-3">
              <p className="text-xs text-gray-400 italic">
                "When government agencies operate outside their mandate or behind classification barriers, Ghost Audits document their activities in public spaces — creating an irrefutable public record of the state's physical footprint."
              </p>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">Audit Title</label>
              <input
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-fuchsia-400/50"
                placeholder="e.g. Operation Transparent Shield"
                value={newAudit.auditTitle}
                onChange={(e) => setNewAudit((p) => ({ ...p, auditTitle: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">Target Entity</label>
              <textarea
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-fuchsia-400/50"
                rows={3}
                placeholder="Describe the entity or pattern being audited (public spaces only)..."
                value={newAudit.targetEntity}
                onChange={(e) => setNewAudit((p) => ({ ...p, targetEntity: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">Audit Type</label>
              <div className="grid grid-cols-1 gap-2">
                {(Object.entries(AUDIT_TYPE_CONFIG) as [AuditType, (typeof AUDIT_TYPE_CONFIG)[AuditType]][]).map(
                  ([type, conf]) => {
                    const Icon = conf.icon;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNewAudit((p) => ({ ...p, auditType: type }))}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md border text-left text-sm transition-colors ${
                          newAudit.auditType === type
                            ? "border-fuchsia-400/50 bg-fuchsia-950/30 text-white"
                            : "border-slate-700 bg-slate-800/50 text-gray-400 hover:border-slate-600"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${conf.color}`} />
                        {conf.label}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">
                PTE Confidence Score: {(newAudit.pteConfidenceScore * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={newAudit.pteConfidenceScore}
                onChange={(e) =>
                  setNewAudit((p) => ({ ...p, pteConfidenceScore: parseFloat(e.target.value) }))
                }
                className="w-full accent-fuchsia-500"
              />
              <p className="text-xs text-gray-600 mt-1">
                Estimated anomaly confidence from the Predictive Tasking Engine
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowNewAuditForm(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                className="flex-1 bg-fuchsia-700 hover:bg-fuchsia-600 text-white"
                disabled={initiateMutation.isPending}
                onClick={handleInitiate}
              >
                {initiateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Initiate Audit
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
