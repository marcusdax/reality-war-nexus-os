import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Video, Mic, Square, Play, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";

interface MediaRecorderProps {
  onMediaCapture?: (blob: Blob, type: "video" | "audio", metadata: RecordingMetadata) => void;
  onClose?: () => void;
}

interface RecordingMetadata {
  duration: number;
  timestamp: Date;
  latitude?: number;
  longitude?: number;
  mimeType: string;
}

export default function MediaRecorder({ onMediaCapture, onClose }: MediaRecorderProps) {
  const [recordingMode, setRecordingMode] = useState<"video" | "audio" | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          console.log("Geolocation not available");
        }
      );
    }
  }, []);

  const startRecording = async (mode: "video" | "audio") => {
    try {
      const constraints =
        mode === "video"
          ? { video: { facingMode: "environment" }, audio: true }
          : { audio: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (mode === "video" && videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mimeType = mode === "video" ? "video/webm" : "audio/webm";
      const recorder = new (window.MediaRecorder as any)(stream, { mimeType });

      chunksRef.current = [];
      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setRecordedBlob(blob);
        setIsRecording(false);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecordingMode(mode);
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      toast.error("Failed to access camera/microphone. Please check permissions.");
      console.error(error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  const discardRecording = () => {
    setRecordedBlob(null);
    setRecordingTime(0);
    setRecordingMode(null);
  };

  const saveRecording = () => {
    if (recordedBlob && recordingMode && onMediaCapture) {
      const metadata: RecordingMetadata = {
        duration: recordingTime,
        timestamp: new Date(),
        latitude: location?.lat,
        longitude: location?.lng,
        mimeType: recordingMode === "video" ? "video/webm" : "audio/webm",
      };

      onMediaCapture(recordedBlob, recordingMode, metadata);
      discardRecording();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Recording UI
  if (isRecording) {
    return (
      <Card className="card-sacred p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">
            {recordingMode === "video" ? "Recording Video" : "Recording Audio"}
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 font-mono font-bold">{formatTime(recordingTime)}</span>
          </div>
        </div>

        {recordingMode === "video" && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full rounded-lg bg-black max-h-96 object-cover"
          />
        )}

        <div className="flex gap-3">
          <Button
            variant="destructive"
            size="lg"
            onClick={stopRecording}
            className="flex-1"
          >
            <Square className="w-4 h-4 mr-2" />
            Stop Recording
          </Button>
        </div>
      </Card>
    );
  }

  // Playback UI
  if (recordedBlob) {
    const mediaUrl = URL.createObjectURL(recordedBlob);

    return (
      <Card className="card-sacred p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">
            {recordingMode === "video" ? "Video Recorded" : "Audio Recorded"}
          </h3>
          <span className="text-sm text-gray-400">{formatTime(recordingTime)}</span>
        </div>

        {recordingMode === "video" ? (
          <video
            src={mediaUrl}
            controls
            className="w-full rounded-lg bg-black max-h-96"
          />
        ) : (
          <audio src={mediaUrl} controls className="w-full" />
        )}

        {location && (
          <div className="text-sm text-gray-400 bg-slate-800/50 p-3 rounded">
            <p>📍 Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
            <p>⏰ Recorded: {new Date().toLocaleString()}</p>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={discardRecording}
            className="flex-1"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Discard
          </Button>
          <Button
            className="btn-truth flex-1"
            size="lg"
            onClick={saveRecording}
          >
            <Upload className="w-4 h-4 mr-2" />
            Save to Reality Stream
          </Button>
        </div>
      </Card>
    );
  }

  // Mode selection UI
  return (
    <Card className="card-sacred p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Capture Reality</h3>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <p className="text-sm text-gray-400">
        Record video or audio to share your reality with the community. Your location and timestamp will be cryptographically signed.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <Button
          size="lg"
          onClick={() => startRecording("video")}
          className="btn-truth h-24 flex-col"
        >
          <Video className="w-8 h-8 mb-2" />
          <span>Record Video</span>
        </Button>
        <Button
          size="lg"
          onClick={() => startRecording("audio")}
          className="btn-truth h-24 flex-col"
        >
          <Mic className="w-8 h-8 mb-2" />
          <span>Record Audio</span>
        </Button>
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <p>✓ Video: Up to 5 minutes</p>
        <p>✓ Audio: Up to 10 minutes</p>
        <p>✓ Requires camera/microphone permissions</p>
        <p>✓ Location data captured automatically</p>
      </div>
    </Card>
  );
}
