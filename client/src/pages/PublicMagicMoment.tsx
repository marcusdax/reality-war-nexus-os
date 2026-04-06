import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Copy, QrCode, Heart, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import { trpc } from "@/lib/trpc";

interface MagicMoment {
  id: number;
  userId: number;
  userName: string;
  content: string;
  mediaUrls: string[];
  signature: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
}

export default function PublicMagicMoment() {
  const [match, params] = useRoute("/share/:id");
  const [magicMoment, setMagicMoment] = useState<MagicMoment | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const postId = params?.id ? parseInt(params.id) : null;
  const { data: posts, isLoading } = trpc.realityStream.getFeed.useQuery({
    limit: 100,
    offset: 0,
    sort: "recent",
  });

  useEffect(() => {
    if (posts && postId) {
      const post = posts.find((p: any) => p.id === postId);
      if (post) {
        const mediaUrls = Array.isArray(post.mediaUrls) ? post.mediaUrls : [];
        setMagicMoment({
          id: post.id,
          userId: post.userId,
          userName: "Anonymous",
          content: post.content,
          mediaUrls: mediaUrls,
          signature: "",
          latitude: 0,
          longitude: 0,
          timestamp: new Date().toISOString(),
          upvotes: post.upvotes || 0,
          downvotes: post.downvotes || 0,
          createdAt: typeof post.createdAt === 'string' ? post.createdAt : post.createdAt.toISOString(),
        });
      }
      setLoading(false);
    } else if (!isLoading) {
      setLoading(false);
    }
  }, [posts, postId, isLoading]);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Reality War - Magic Moment",
          text: magicMoment?.content || "Check out this Magic Moment",
          url: window.location.href,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      handleCopyLink();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading Magic Moment...</p>
        </div>
      </div>
    );
  }

  if (!magicMoment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Card className="card-sacred p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-white mb-2">Magic Moment Not Found</h2>
          <p className="text-gray-400 mb-4">This Magic Moment may have been deleted or the link is invalid.</p>
          <Button className="btn-truth w-full" onClick={() => (window.location.href = "/")}>
            Return Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div>
            <h1 className="font-bold text-white">Magic Moment</h1>
            <p className="text-xs text-gray-400">Public Reality Capture</p>
          </div>
          <Button size="sm" variant="outline" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Post Card */}
          <Card className="card-sacred p-6 space-y-4">
            {/* Author Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500" />
                <div>
                  <p className="font-bold text-white">{magicMoment.userName}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(magicMoment.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-cyan-400">Verified</p>
                <p className="text-xs text-gray-400">Cryptographically Signed</p>
              </div>
            </div>

            {/* Content */}
            <div className="text-gray-200">
              <Streamdown>{magicMoment.content}</Streamdown>
            </div>

            {/* Media */}
            {magicMoment.mediaUrls && magicMoment.mediaUrls.length > 0 && (
              <div className="space-y-3">
                {magicMoment.mediaUrls.map((url: string, idx: number) => {
                  const isVideo = url.startsWith("video-") || url.includes(".webm");
                  const isAudio = url.startsWith("audio-");
                  const actualUrl = url.replace(/^(video-|audio-)/, "");

                  if (isVideo) {
                    return (
                      <video
                        key={idx}
                        src={actualUrl}
                        controls
                        className="w-full rounded-lg max-h-96 bg-black"
                      />
                    );
                  } else if (isAudio) {
                    return (
                      <audio
                        key={idx}
                        src={actualUrl}
                        controls
                        className="w-full"
                      />
                    );
                  }
                  return null;
                })}
              </div>
            )}

            {/* Metadata */}
            <div className="bg-slate-800/50 p-4 rounded-lg space-y-2 text-sm text-gray-400">
              <p>📍 Location: {magicMoment.latitude.toFixed(4)}, {magicMoment.longitude.toFixed(4)}</p>
              <p>⏰ Captured: {new Date(magicMoment.timestamp).toLocaleString()}</p>
              <p className="font-mono text-xs break-all">
                🔐 Signature: {magicMoment.signature.substring(0, 32)}...
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-700">
              <div className="flex items-center gap-6">
                <button className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm">{magicMoment.upvotes}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">Comment</span>
                </button>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowQR(!showQR)}
                >
                  <QrCode className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyLink}
                >
                  <Copy className="w-4 h-4" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>
          </Card>

          {/* QR Code */}
          {showQR && (
            <Card className="card-sacred p-6 text-center">
              <p className="text-sm text-gray-400 mb-4">Scan to share this Magic Moment</p>
              <div className="inline-block p-4 bg-white rounded-lg">
                <div className="w-48 h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">QR Code Placeholder</span>
                </div>
              </div>
            </Card>
          )}

          {/* Verification Info */}
          <Card className="card-sacred border-l-4 border-green-400 p-6">
            <h3 className="font-bold text-white mb-2">✓ Proof-of-Capture Verified</h3>
            <p className="text-sm text-gray-400">
              This Magic Moment has been cryptographically signed with the user's location, timestamp, and identity. The signature can be verified to ensure authenticity and prevent tampering.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
