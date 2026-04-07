import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OathModal } from "@/components/OathModal";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { MapPin, Zap, Users, Shield, ArrowRight, Loader2, Eye, CheckCircle2, Clock, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import RealityStreamFeed from "@/components/RealityStreamFeed";

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  easy:   { label: "Easy",   color: "text-emerald-400", bg: "bg-emerald-950/40 border-emerald-400/30" },
  medium: { label: "Medium", color: "text-amber-400",   bg: "bg-amber-950/40 border-amber-400/30" },
  hard:   { label: "Hard",   color: "text-red-400",     bg: "bg-red-950/40 border-red-400/30" },
  expert: { label: "Expert", color: "text-fuchsia-400", bg: "bg-fuchsia-950/40 border-fuchsia-400/30" },
};

export default function Home() {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [oathModalOpen, setOathModalOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);

  // Fetch user profile data
  const profileQuery = trpc.profile.getProfile.useQuery(
    isAuthenticated ? {} : { userId: undefined },
    { enabled: isAuthenticated }
  );

  // Fetch nearby missions
  const missionsQuery = trpc.missions.listNearby.useQuery(
    userLocation
      ? { latitude: userLocation.lat, longitude: userLocation.lng, radiusKm: 5 }
      : { latitude: 37.7749, longitude: -122.4194, radiusKm: 5 },
    { enabled: isAuthenticated }
  );

  // Fetch user's active missions
  const myMissionsQuery = trpc.missions.getMyMissions.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const acceptMutation = trpc.missions.accept.useMutation({
    onSuccess: (_data, _variables) => {
      toast.success("Mission accepted! Complete it to earn rewards.");
      myMissionsQuery.refetch();
      setAcceptingId(null);
    },
    onError: (error) => {
      if (error.data?.code === "CONFLICT") {
        toast.info("You've already accepted this mission.");
      } else {
        toast.error("Failed to accept mission. Try again.");
      }
      setAcceptingId(null);
    },
  });

  // Redirect new users (no faction chosen) to the cinematic onboarding flow
  useEffect(() => {
    if (!authLoading && isAuthenticated && profileQuery.data && !(profileQuery.data as any).chosenFaction) {
      setLocation("/onboarding");
    }
  }, [authLoading, isAuthenticated, profileQuery.data, setLocation]);

  // Get user's current location
  useEffect(() => {
    if (isAuthenticated && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        () => {
          setUserLocation({ lat: 37.7749, lng: -122.4194 });
        }
      );
    }
  }, [isAuthenticated]);

  const acceptedMissionIds = new Set((myMissionsQuery.data ?? []).map((m) => m.missionId));

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your mission...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold text-white mb-4">Reality War</h1>
          <p className="text-gray-400 mb-8">Join the Shadow Corps and help verify reality</p>
          <Button className="btn-truth" onClick={() => window.location.href = getLoginUrl()}>
            Sign In with Manus
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">Reality War</h1>
              <p className="text-xs text-gray-400">Nexus OS</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-gray-400">{user?.role}</p>
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-white mb-2">Welcome, {user?.name?.split(" ")[0]}</h2>
          <p className="text-gray-400">Take the Shadow Corps oath to begin your verification journey.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <Card className="card-sacred">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Truth Credits</p>
                <p className="text-3xl font-bold text-cyan-400">{profileQuery.data?.truthCredits || 0}</p>
              </div>
              <Zap className="w-8 h-8 text-cyan-400 opacity-50" />
            </div>
          </Card>

          <Card className="card-sacred">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">XP</p>
                <p className="text-3xl font-bold text-purple-400">{profileQuery.data?.experiencePoints || 0}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </Card>

          <Card className="card-sacred">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Faction</p>
                <p className={`text-2xl font-bold capitalize ${
                  { eco: "text-emerald-400", data: "text-blue-400", tech: "text-amber-400", shadow: "text-violet-400" }[(profileQuery.data as any)?.chosenFaction ?? ""] ?? "text-gray-400"
                }`}>
                  {(profileQuery.data as any)?.chosenFaction
                    ? { eco: "ECO ✦", data: "DATA ⬡", tech: "TECH ◈", shadow: "SHADOW ◬" }[(profileQuery.data as any).chosenFaction]
                    : "—"}
                </p>
              </div>
              <Users className="w-8 h-8 text-gray-400 opacity-50" />
            </div>
          </Card>

          <Card className="card-sacred">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Badges</p>
                <p className="text-3xl font-bold text-amber-400">{profileQuery.data?.badges?.length || 0}</p>
              </div>
              <Shield className="w-8 h-8 text-amber-400 opacity-50" />
            </div>
          </Card>
        </div>

        {/* Oath Section */}
        {!profileQuery.data?.oathTaken && (
          <Card className="card-sacred mb-12 border-2 border-cyan-400/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Take the Shadow Corps Oath
                </h3>
                <p className="text-gray-400">
                  Pledge your commitment to verifying reality and building community trust
                </p>
              </div>
              <Button className="btn-truth" onClick={() => setOathModalOpen(true)}>
                Take Oath
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Shadow Corps Command Center Link */}
        {profileQuery.data?.oathTaken ? (
          <Card
            className="card-sacred mb-8 border border-fuchsia-400/30 bg-gradient-to-r from-fuchsia-950/30 to-slate-900/50 cursor-pointer hover:border-fuchsia-400/60 transition-colors"
            onClick={() => setLocation("/shadow-corps")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-fuchsia-600 to-purple-700 flex items-center justify-center flex-shrink-0">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Shadow Corps Command Center</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Ghost Audits · The Crucible · Shadow Black Book
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-fuchsia-400" />
            </div>
          </Card>
        ) : null}

        {/* Capture Magic Moment CTA */}
        <div className="mb-12">
          <Card
            className="card-sacred border-l-4 border-cyan-400 bg-gradient-to-r from-cyan-950/30 to-slate-900/50 cursor-pointer hover:border-cyan-400/60 transition-colors"
            onClick={() => setLocation("/capture")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Capture Magic Moment</h3>
                  <p className="text-sm text-gray-400">Record video or audio evidence of reality</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-cyan-400 flex-shrink-0" />
            </div>
          </Card>
        </div>

        {/* Active Missions */}
        {myMissionsQuery.data && myMissionsQuery.data.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6 text-amber-400" />
              Active Missions
              <span className="text-sm font-normal text-amber-400 bg-amber-950/40 border border-amber-400/30 px-2 py-0.5 rounded-full">
                {myMissionsQuery.data.length} in progress
              </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {myMissionsQuery.data.map((m) => {
                const dcfg = DIFFICULTY_CONFIG[m.difficulty] ?? DIFFICULTY_CONFIG.medium;
                return (
                  <Card key={m.acceptanceId} className="card-sacred border border-amber-400/20 bg-amber-950/10">
                    <div className="mb-3">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-bold text-white text-sm leading-tight">{m.title}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${dcfg.bg} ${dcfg.color} font-semibold flex-shrink-0`}>
                          {dcfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">{m.description}</p>
                    </div>
                    <div className="text-xs text-gray-400 space-y-1 mb-3">
                      <div className="flex justify-between">
                        <span>Reward</span>
                        <span className="text-cyan-400 font-bold">{m.rewardTruthCredits} TC + {m.rewardXp} XP</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Accepted</span>
                        <span className="text-gray-300">{new Date(m.acceptedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-amber-400/80">
                      <Clock className="w-3 h-3" />
                      <span>In progress — submit a Magic Moment to complete</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Nearby Missions */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <MapPin className="w-6 h-6 text-cyan-400" />
              Nearby Missions
            </h3>
            <Button variant="outline" size="sm" onClick={() => setLocation("/map")}>
              View Map
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          {missionsQuery.isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-2" />
              <p className="text-gray-400">Loading missions...</p>
            </div>
          ) : missionsQuery.data && missionsQuery.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {missionsQuery.data.map((mission) => {
                const dcfg = DIFFICULTY_CONFIG[mission.difficulty] ?? DIFFICULTY_CONFIG.medium;
                const isAccepted = acceptedMissionIds.has(mission.id);
                const isAccepting = acceptingId === mission.id;

                return (
                  <Card key={mission.id} className="card-sacred hover:border-cyan-400/50 transition-colors flex flex-col">
                    <div className="mb-3 flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-bold text-white text-sm leading-tight">{mission.title}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${dcfg.bg} ${dcfg.color} font-semibold flex-shrink-0`}>
                          {dcfg.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2">{mission.description}</p>
                    </div>

                    <div className="space-y-1.5 mb-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Reward</span>
                        <span className="text-cyan-400 font-bold">{mission.rewardTruthCredits} TC</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">XP</span>
                        <span className="text-purple-400 font-bold">+{mission.rewardXp}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Type</span>
                        <span className="text-gray-300 capitalize">{mission.missionType.replace("_", " ")}</span>
                      </div>
                    </div>

                    {isAccepted ? (
                      <div className="flex items-center justify-center gap-2 py-2 text-sm text-emerald-400 bg-emerald-950/30 border border-emerald-400/20 rounded-md">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="font-medium">Mission Accepted</span>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        className="btn-truth w-full"
                        disabled={isAccepting}
                        onClick={() => {
                          setAcceptingId(mission.id);
                          acceptMutation.mutate({ missionId: mission.id });
                        }}
                      >
                        {isAccepting ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                            Accepting...
                          </>
                        ) : (
                          "Accept Mission"
                        )}
                      </Button>
                    )}
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">No missions nearby. Check back soon!</p>
            </div>
          )}
        </div>

        {/* Reality Stream Feed */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-cyan-400" />
            Reality Stream
          </h3>
          <RealityStreamFeed />
        </div>
      </main>

      {/* Oath Modal */}
      <OathModal
        open={oathModalOpen}
        onOpenChange={setOathModalOpen}
        onOathTaken={() => {
          profileQuery.refetch();
        }}
      />
    </div>
  );
}
