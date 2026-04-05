import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Zap, Shield, Heart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface OathModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOathTaken?: () => void;
}

export function OathModal({ open, onOpenChange, onOathTaken }: OathModalProps) {
  const [step, setStep] = useState<"confirm" | "ceremony" | "complete">("confirm");
  const takeOathMutation = trpc.profile.takeOath.useMutation();

  const handleConfirm = async () => {
    setStep("ceremony");
  };

  const handleTakeOath = async () => {
    try {
      await takeOathMutation.mutateAsync();
      setStep("complete");
      toast.success("You have taken the Shadow Corps Oath!");
      
      // Close modal after celebration
      setTimeout(() => {
        onOpenChange(false);
        setStep("confirm");
        onOathTaken?.();
      }, 2000);
    } catch (error) {
      toast.error("Failed to record oath. Please try again.");
      console.error("Oath error:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-400/30">
        {step === "confirm" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">
                Take the Shadow Corps Oath
              </DialogTitle>
              <DialogDescription className="text-gray-300 mt-2">
                Pledge your commitment to verifying reality and building community trust
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Verify Reality</p>
                    <p className="text-sm text-gray-400">
                      You commit to investigating anomalies and verifying the truth
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Build Community Trust</p>
                    <p className="text-sm text-gray-400">
                      You pledge to act with integrity and support fellow Shadow Corps members
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-magenta-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Embrace the Mission</p>
                    <p className="text-sm text-gray-400">
                      You dedicate yourself to uncovering truth in a world of deception
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <p className="text-sm text-gray-300 italic">
                  "In the shadow of uncertainty, we seek the light of truth. Together, we verify reality and build a community of trust."
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                className="btn-truth flex-1"
                onClick={handleConfirm}
              >
                I Accept
              </Button>
            </div>
          </>
        )}

        {step === "ceremony" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white text-center">
                Shadow Corps Oath Ceremony
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="space-y-4 text-center">
                <p className="text-lg font-semibold text-white">
                  Repeat the oath:
                </p>
                <p className="text-gray-300 leading-relaxed">
                  "I pledge to verify reality with integrity and courage. I commit to building community trust through honest investigation and transparent verification. I embrace the mission of uncovering truth in a world of deception. I am Shadow Corps."
                </p>
              </div>

              <div className="bg-slate-800/50 border border-cyan-400/30 rounded-lg p-4">
                <p className="text-sm text-cyan-300 text-center font-semibold">
                  ✨ You are about to become a member of the Shadow Corps ✨
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep("confirm")}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                className="btn-truth flex-1"
                onClick={handleTakeOath}
                disabled={takeOathMutation.isPending}
              >
                {takeOathMutation.isPending ? "Taking Oath..." : "Take the Oath"}
              </Button>
            </div>
          </>
        )}

        {step === "complete" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white text-center">
                Welcome to Shadow Corps
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 mb-4 animate-pulse">
                  <Shield className="w-10 h-10 text-white" />
                </div>
              </div>

              <div className="space-y-3 text-center">
                <p className="text-lg font-semibold text-white">
                  You are now a member of the Shadow Corps
                </p>
                <p className="text-gray-400">
                  Your oath has been recorded and verified. Welcome to the mission.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-cyan-400 font-bold text-lg">+500</p>
                  <p className="text-xs text-gray-400">Truth Credits</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-purple-400 font-bold text-lg">+100</p>
                  <p className="text-xs text-gray-400">XP</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-magenta-400 font-bold text-lg">1</p>
                  <p className="text-xs text-gray-400">Badge</p>
                </div>
              </div>
            </div>

            <Button
              className="btn-truth w-full"
              onClick={() => onOpenChange(false)}
            >
              Begin Your Mission
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
