import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OathModal } from "@/components/OathModal";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { MapPin, Zap, Users, Shield, ArrowRight, Loader2, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import RealityStreamFeed from "@/components/RealityStreamFeed";

export default function Home() {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [oathModalOpen, setOathModalOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Fetch user profile data
  const profileQuery = trpc.profile.getProfile.useQuery(
    isAuthenticated ? {} : { userId: undefined },
    { enabled: isAuthenticated }
  );

  // Fetch nearby missions
  const missionsQuery = trpc.missions.listNearby.useQuery(
    userLocation ? {
      latitude: userLocation.lat,
      longitude: userLocation.lng,
      radiusKm: 5,
    } : { latitude: 37.7749, longitude: -122.4194, radiusKm: 5 },
    { enabled: isAuthenticated }
  );

  // Get user's current location
  useEffect(() => {
    if (isAuthenticated && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Default to San Francisco if geolocation fails
          setUserLocation({ lat: 37.7749, lng: -122.4194 });
        }
      );
    }
  }, [isAuthenticated]);

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
                <p className="text-sm text-gray-400">Tier</p>
                <p className="text-3xl font-bold text-magenta-400">{profileQuery.data?.shadowCorpsTier || "Recruit"}</p>
              </div>
              <Users className="w-8 h-8 text-magenta-400 opacity-50" />
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

        {/* Missions Section */}
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
              {missionsQuery.data.map((mission) => (
                <Card key={mission.id} className="card-sacred hover:border-cyan-400/50 transition-colors">
                  <div className="mb-4">
                    <h4 className="font-bold text-white mb-2">{mission.title}</h4>
                    <p className="text-sm text-gray-400 line-clamp-2">{mission.description}</p>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Difficulty:</span>
                      <span className="text-white font-bold capitalize">{mission.difficulty}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Reward:</span>
                      <span className="text-cyan-400 font-bold">{mission.rewardTruthCredits} Credits</span>
                    </div>
                  </div>

                  <Button size="sm" className="btn-truth w-full">
                    Accept Mission
                  </Button>
                </Card>
              ))}
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
