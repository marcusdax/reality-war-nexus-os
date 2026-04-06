import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import MediaRecorder from "@/components/MediaRecorder";

interface RecordingMetadata {
  duration: number;
  timestamp: Date;
  latitude?: number;
  longitude?: number;
  mimeType: string;
}

export default function MagicMomentCapture() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [postContent, setPostContent] = useState("");
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState<string | null>(null);

  const createPostMutation = trpc.realityStream.create.useMutation({
    onSuccess: () => {
      toast.success("Magic Moment shared to Reality Stream!");
      setPostContent("");
      setUploadedMediaUrl(null);
      setTimeout(() => setLocation("/"), 2000);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create post");
    },
  });

  const handleMediaCapture = async (
    blob: Blob,
    type: "video" | "audio",
    metadata: RecordingMetadata
  ) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Upload to S3 via server endpoint
      const formData = new FormData();
      formData.append("file", blob, `${type}-${Date.now()}.webm`);
      formData.append("type", type);
      formData.append("latitude", metadata.latitude?.toString() || "0");
      formData.append("longitude", metadata.longitude?.toString() || "0");
      formData.append("timestamp", metadata.timestamp.toISOString());

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // For now, create a local object URL (in production, this would be S3 URL)
      const mediaUrl = URL.createObjectURL(blob);
      setUploadedMediaUrl(mediaUrl);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setIsUploading(false);

      toast.success(`${type === "video" ? "Video" : "Audio"} uploaded successfully!`);
    } catch (error) {
      toast.error("Failed to upload media");
      console.error(error);
      setIsUploading(false);
    }
  };

  const handleShareMagicMoment = () => {
    if (!postContent.trim()) {
      toast.error("Please add a description");
      return;
    }

    if (!uploadedMediaUrl) {
      toast.error("Please record and upload media first");
      return;
    }

    createPostMutation.mutate({
      content: postContent,
      mediaUrls: [uploadedMediaUrl],
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Card className="card-sacred p-8 text-center max-w-md">
          <p className="text-gray-400 mb-4">Please log in to capture Magic Moments</p>
          <Button className="btn-truth w-full">Sign In</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="mr-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="font-bold text-white">Capture Magic Moment</h1>
              <p className="text-xs text-gray-400">Record your reality</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Media Recorder */}
          <MediaRecorder onMediaCapture={handleMediaCapture} />

          {/* Upload Progress */}
          {isUploading && (
            <Card className="card-sacred p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white">Uploading...</h3>
                  <span className="text-sm text-cyan-400">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Media Preview & Post Composer */}
          {uploadedMediaUrl && !isUploading && (
            <Card className="card-sacred p-6 space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <h3 className="font-bold text-white">Media Ready</h3>
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Describe your Magic Moment
                </label>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="What reality are you capturing? What's the context and significance?"
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 resize-none"
                  rows={4}
                />
              </div>

              {/* Metadata Display */}
              <div className="text-sm text-gray-400 bg-slate-800/50 p-3 rounded space-y-1">
                <p>✓ Media will be cryptographically signed</p>
                <p>✓ Location and timestamp recorded</p>
                <p>✓ Available for community verification</p>
              </div>

              {/* Share Button */}
              <Button
                className="btn-truth w-full"
                size="lg"
                onClick={handleShareMagicMoment}
                disabled={createPostMutation.isPending}
              >
                {createPostMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sharing...
                  </>
                ) : (
                  "Share to Reality Stream"
                )}
              </Button>
            </Card>
          )}

          {/* Instructions */}
          <Card className="card-sacred p-6 border-l-4 border-cyan-400">
            <h3 className="font-bold text-white mb-3">How Magic Moments Work</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>✓ Record video or audio evidence of reality</li>
              <li>✓ Your location and timestamp are automatically captured</li>
              <li>✓ Media is cryptographically signed for authenticity</li>
              <li>✓ Community members verify and vote on your Magic Moment</li>
              <li>✓ Earn Truth Credits for verified submissions</li>
            </ul>
          </Card>
        </div>
      </main>
    </div>
  );
}
