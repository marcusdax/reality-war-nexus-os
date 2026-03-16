import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { MapPin, Zap, Users, Shield, ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const [location, setLocation] = useLocation();
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
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-cyan-400" />
          <p className="text-gray-300">Initializing Reality War...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-2xl">
          <div className="mb-8 animate-pulse">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full border-2 border-cyan-400 flex items-center justify-center">
              <Zap className="w-10 h-10 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 gradient-text-chakra">
            The Reality War
          </h1>
          <p className="text-xl text-gray-300 mb-2">Nexus OS</p>
          <p className="text-gray-400 mb-8 text-lg">
            Join the Shadow Corps. Verify reality. Earn Truth Credits.
          </p>
          <p className="text-gray-500 mb-12 max-w-xl mx-auto">
            A civic engagement platform where every verification matters. Document infrastructure, environmental data, and civic issues through Magic Moments. Build your Truth Score and help your community see reality clearly.
          </p>
          <a href={getLoginUrl()}>
            <Button className="btn-truth text-lg px-8 py-6 mb-8">
              Enter the Shadow Corps
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </a>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="card-sacred">
              <Shield className="w-8 h-8 text-chakra-throat mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">Verify Reality</h3>
              <p className="text-sm text-gray-400">
                Submit 15-second Magic Moments documenting civic conditions
              </p>
            </div>
            <div className="card-sacred">
              <Zap className="w-8 h-8 text-chakra-root mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">Earn Truth Credits</h3>
              <p className="text-sm text-gray-400">
                Get rewarded for verified contributions to community knowledge
              </p>
            </div>
            <div className="card-sacred">
              <Users className="w-8 h-8 text-chakra-heart mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">Build Community</h3>
              <p className="text-sm text-gray-400">
                Collaborate with others to create a verified reality ledger
              </p>
            </div>
          </div>
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
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-gray-400">{user?.role}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                logout();
                setLocation("/");
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome, {user?.name?.split(" ")[0]}
          </h2>
          <p className="text-gray-400">
            {profileQuery.data?.oathTaken
              ? "You are a member of the Shadow Corps. Continue your mission."
              : "Take the Shadow Corps oath to begin your verification journey."}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <Card className="card-sacred">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Truth Credits</p>
                <p className="text-2xl font-bold text-cyan-400">
                  {profileQuery.data?.truthCredits || 0}
                </p>
              </div>
              <Zap className="w-8 h-8 text-cyan-400 opacity-50" />
            </div>
          </Card>

          <Card className="card-sacred">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">XP</p>
                <p className="text-2xl font-bold text-green-400">
                  {profileQuery.data?.experiencePoints || 0}
                </p>
              </div>
              <Shield className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </Card>

          <Card className="card-sacred">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Tier</p>
                <p className="text-2xl font-bold text-purple-400 capitalize">
                  {profileQuery.data?.shadowCorpsTier || "recruit"}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </Card>

          <Card className="card-sacred">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Badges</p>
                <p className="text-2xl font-bold text-orange-400">
                  {profileQuery.data?.badges?.length || 0}
                </p>
              </div>
              <Shield className="w-8 h-8 text-orange-400 opacity-50" />
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
              <Button className="btn-truth">
                Take Oath
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Missions Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <MapPin className="w-6 h-6 text-cyan-400" />
              Nearby Missions
            </h3>
            <Button variant="outline" size="sm">
              View Map
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          {missionsQuery.isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-cyan-400 mb-2" />
              <p className="text-gray-400">Loading missions...</p>
            </div>
          ) : missionsQuery.data && missionsQuery.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {missionsQuery.data.slice(0, 6).map((mission) => (
                <Card key={mission.id} className="card-sacred hover:scale-105 transition-transform cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-white">{mission.title}</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        {mission.missionType}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      mission.difficulty === "easy" ? "bg-green-500/20 text-green-400" :
                      mission.difficulty === "medium" ? "bg-yellow-500/20 text-yellow-400" :
                      mission.difficulty === "hard" ? "bg-orange-500/20 text-orange-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>
                      {mission.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                    {mission.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                    <span className="text-sm font-bold text-cyan-400">
                      +{mission.rewardTruthCredits} Credits
                    </span>
                    <Button size="sm" className="btn-truth text-xs">
                      Accept
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="card-sacred text-center py-12">
              <MapPin className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No missions nearby. Check back soon!</p>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="card-sacred">
            <h4 className="font-bold text-white mb-3">Reality Stream</h4>
            <p className="text-sm text-gray-400 mb-4">
              View community verifications and contribute to the shared reality ledger
            </p>
            <Button variant="outline" size="sm" className="w-full">
              View Feed
            </Button>
          </Card>

          <Card className="card-sacred">
            <h4 className="font-bold text-white mb-3">Leaderboard</h4>
            <p className="text-sm text-gray-400 mb-4">
              See who's leading the Truth Credits rankings in your area
            </p>
            <Button variant="outline" size="sm" className="w-full">
              View Rankings
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
