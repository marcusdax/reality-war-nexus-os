import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import {
  MapPin,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  Zap,
} from "lucide-react";



const difficultyColors: Record<string, string> = {
  easy: "bg-green-900 text-green-200",
  medium: "bg-yellow-900 text-yellow-200",
  hard: "bg-orange-900 text-orange-200",
  expert: "bg-red-900 text-red-200",
};

const missionTypeIcons: Record<string, string> = {
  infrastructure: "🏗️",
  environmental: "🌱",
  civic: "🏛️",
  social: "👥",
  emergency: "🚨",
};

export function MissionsDashboard() {
  const [, navigate] = useLocation();
  const [selectedTab, setSelectedTab] = useState("active");

  // Fetch active missions (using default coordinates)
  const { data: activeMissions = [] } = trpc.missions.listNearby.useQuery(
    {
      latitude: 40.7128,
      longitude: -74.006,
      radiusKm: 10,
    }
  );

  // Fetch user's active mission acceptances
  const { data: userMissions = [] } = trpc.missions.listNearby.useQuery(
    {
      latitude: 40.7128,
      longitude: -74.006,
      radiusKm: 50,
    }
  );

  const acceptMission = trpc.missions.accept.useMutation();

  const handleAcceptMission = async (missionId: number) => {
    try {
      await acceptMission.mutateAsync({ missionId });
    } catch (error) {
      console.error("Failed to accept mission:", error);
    }
  };



  const MissionCard = ({ mission, accepted = false }: { mission: any; accepted?: boolean }) => (
    <Card className="p-4 border border-cyan-500/30 bg-slate-900/50 hover:bg-slate-900/80 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-2xl">{missionTypeIcons[mission.missionType] || "📍"}</span>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-cyan-300">{mission.title}</h3>
            <p className="text-sm text-gray-400 mt-1">{mission.description}</p>
          </div>
        </div>
        <Badge className={difficultyColors[mission.difficulty]}>
          {mission.difficulty}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
        <div className="flex items-center gap-2 text-gray-300">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span>{mission.missionType}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <Award className="w-4 h-4 text-yellow-400" />
          <span>{mission.rewardTruthCredits} Credits</span>
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <Zap className="w-4 h-4 text-purple-400" />
          <span>{mission.rewardXp} XP</span>
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <Clock className="w-4 h-4 text-orange-400" />
          <span>Active</span>
        </div>
      </div>

      <div className="mb-4 p-2 bg-slate-800/50 rounded border border-slate-700">
        <p className="text-xs text-gray-400 font-semibold mb-1">Validation Criteria:</p>
        <p className="text-xs text-gray-300">{mission.validationCriteria}</p>
      </div>

      <div className="flex gap-2">
        {!accepted ? (
          <Button
            onClick={() => handleAcceptMission(mission.id)}
            disabled={acceptMission.isPending}
            className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            {acceptMission.isPending ? "Accepting..." : "Accept Mission"}
          </Button>
        ) : (
          <>
            <Button
              onClick={() => navigate("/capture")}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              Capture Proof
            </Button>

          </>
        )}
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-8 h-8 text-cyan-400" />
            <h1 className="text-3xl font-bold text-cyan-300">Mission Dashboard</h1>
          </div>
          <p className="text-gray-400">
            Accept missions to earn Truth Credits and XP. Complete them by capturing Magic Moments as proof.
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="active" className="data-[state=active]:bg-cyan-600">
              <AlertCircle className="w-4 h-4 mr-2" />
              Available ({activeMissions.length})
            </TabsTrigger>
            <TabsTrigger value="accepted" className="data-[state=active]:bg-cyan-600">
              <Clock className="w-4 h-4 mr-2" />
              In Progress
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-cyan-600">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Completed
            </TabsTrigger>
          </TabsList>

          {/* Available Missions */}
          <TabsContent value="active" className="space-y-4">
            {activeMissions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeMissions.map((mission) => (
                  <MissionCard key={mission.id} mission={mission} accepted={false} />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center border border-slate-700 bg-slate-900/50">
                <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No missions available nearby. Try moving to a different location.</p>
              </Card>
            )}
          </TabsContent>

          {/* In Progress Missions */}
          <TabsContent value="accepted" className="space-y-4">
            {userMissions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userMissions.map((mission) => (
                  <MissionCard key={mission.id} mission={mission} accepted={true} />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center border border-slate-700 bg-slate-900/50">
                <Clock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No missions in progress. Accept a mission to get started.</p>
              </Card>
            )}
          </TabsContent>

          {/* Completed Missions */}
          <TabsContent value="completed" className="space-y-4">
            <Card className="p-8 text-center border border-slate-700 bg-slate-900/50">
              <CheckCircle2 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No completed missions yet. Complete missions to earn rewards!</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
