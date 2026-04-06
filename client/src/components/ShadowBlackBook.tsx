import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { BookOpen, Link, ThumbsUp, Shield, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const LEVEL_CONFIG = {
  "1": { label: "Level 1 — Civil Observer", color: "text-cyan-400", bg: "bg-cyan-400/10 border-cyan-400/20" },
  "2": { label: "Level 2 — Safety Sentinel", color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/20" },
  "3": { label: "Level 3 — Shadow Analyst", color: "text-fuchsia-400", bg: "bg-fuchsia-400/10 border-fuchsia-400/20" },
};

function truncateHash(hash: string, chars = 10): string {
  if (hash.length <= chars * 2 + 3) return hash;
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
}

function timeSince(dateStr: string | Date): string {
  const date = new Date(dateStr);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface ShadowBlackBookProps {
  analystLevel?: "1" | "2" | "3";
}

export function ShadowBlackBook({ analystLevel }: ShadowBlackBookProps) {
  const entriesQuery = trpc.shadowCorps.getBlackBook.useQuery({ limit: 20, offset: 0 });
  const upvoteMutation = trpc.shadowCorps.upvoteBlackBookEntry.useMutation();

  const handleUpvote = async (entryId: number) => {
    try {
      await upvoteMutation.mutateAsync({ entryId });
      toast.success("Consensus vote recorded.");
      entriesQuery.refetch();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to vote");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-fuchsia-400" />
          Shadow Black Book
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          An immutable, censorship-proof ledger of verified intelligence — chained in cryptographic truth
        </p>
      </div>

      <div className="rounded-lg border border-fuchsia-400/10 bg-fuchsia-950/10 p-3">
        <p className="text-xs text-fuchsia-300/80 italic leading-relaxed">
          "Because it's on a blockchain, no single entity can delete it. Each new verified finding is added as a new block, chained to the last. To censor the book, you would have to shut down the entire distributed network."
        </p>
      </div>

      {entriesQuery.isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 text-fuchsia-400 animate-spin" />
        </div>
      ) : entriesQuery.data && entriesQuery.data.length > 0 ? (
        <div className="space-y-3">
          {entriesQuery.data.map((entry, i) => {
            const levelConf = LEVEL_CONFIG[entry.verificationLevel as "1" | "2" | "3"];
            const evidenceUrls = Array.isArray(entry.evidenceUrls)
              ? (entry.evidenceUrls as string[])
              : [];

            return (
              <Card
                key={entry.id}
                className="p-4 border border-slate-700 bg-slate-900/70 hover:border-fuchsia-400/20 transition-colors"
              >
                {/* Chain link indicator */}
                {i > 0 && (
                  <div className="flex items-center gap-1.5 mb-3 text-xs text-gray-600">
                    <Link className="w-3 h-3" />
                    <span className="font-mono">{entry.previousHash ? truncateHash(entry.previousHash) : "GENESIS"}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-white text-sm">{entry.title}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${levelConf?.bg} ${levelConf?.color}`}>
                      {levelConf?.label}
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed">{entry.content}</p>

                  {evidenceUrls.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {evidenceUrls.map((url, ei) => (
                        <a
                          key={ei}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-3 h-3" />
                          Evidence {ei + 1}
                        </a>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Shield className="w-3 h-3" />
                        <span className="font-mono">{truncateHash(entry.entryHash)}</span>
                      </div>
                      <p className="text-xs text-gray-600">{timeSince(entry.publishedAt)}</p>
                    </div>
                    <button
                      onClick={() => handleUpvote(entry.id)}
                      disabled={upvoteMutation.isPending}
                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-fuchsia-400 transition-colors disabled:opacity-50"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{entry.consensusVotes}</span>
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10 border border-dashed border-slate-700 rounded-lg">
          <BookOpen className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500">The Black Book is empty</p>
          <p className="text-xs text-gray-600 mt-1">
            Complete Ghost Audits and publish findings to build the immutable record.
          </p>
          {analystLevel !== "3" && (
            <p className="text-xs text-fuchsia-400/70 mt-2">
              Level 3 clearance required to publish entries.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
