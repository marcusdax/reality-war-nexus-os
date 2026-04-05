import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { MapPin, ArrowLeft, Zap, Users, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function TerritoryMap() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Fetch nearby territories
  const territoriesQuery = trpc.territories.getNearby.useQuery(
    userLocation ? {
      latitude: userLocation.lat,
      longitude: userLocation.lng,
      radiusKm: 10,
    } : { latitude: 37.7749, longitude: -122.4194, radiusKm: 10 },
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

  const factionColors: Record<string, string> = {
    ECO: "text-green-400",
    DATA: "text-cyan-400",
    TECH: "text-amber-400",
    SHADOW: "text-magenta-400",
  };

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
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">Territory Map</h1>
              <p className="text-xs text-gray-400">Nexus OS</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-gray-400">{user?.role}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Map Placeholder */}
        <div className="mb-12">
          <Card className="card-sacred h-96 flex items-center justify-center border-2 border-dashed border-slate-600">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-cyan-400/50 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">Interactive Territory Map</p>
              <p className="text-sm text-gray-500">Map visualization coming soon</p>
            </div>
          </Card>
        </div>

        {/* Territories Grid */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-cyan-400" />
            Nearby Territories
          </h3>

          {territoriesQuery.isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Loading territories...</p>
            </div>
          ) : territoriesQuery.data && territoriesQuery.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {territoriesQuery.data.map((territory: any) => (
                <Card key={territory.id} className="card-sacred hover:border-cyan-400/50 transition-colors">
                  <div className="mb-4">
                    <h4 className="font-bold text-white mb-2">
                      Territory {territory.hexId}
                    </h4>
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-3 h-3 rounded-full ${factionColors[territory.controllingFaction] || "bg-gray-400"}`} />
                      <span className={`text-sm font-medium ${factionColors[territory.controllingFaction] || "text-gray-400"}`}>
                        {territory.controllingFaction}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Signal Strength:</span>
                      <span className="text-cyan-400 font-bold">{territory.signalStrength}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Members:</span>
                      <span className="text-white font-bold">{territory.memberCount || 0}</span>
                    </div>
                  </div>

                  <Button size="sm" className="btn-truth w-full">
                    View Details
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">No territories nearby. Explore the map to find new territories!</p>
            </div>
          )}
        </div>

        {/* Faction Overview */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" />
            Faction Overview
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="card-sacred border-l-4 border-green-400">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">ECO</p>
                  <p className="text-xl font-bold text-green-400">Environmental</p>
                </div>
                <Shield className="w-8 h-8 text-green-400 opacity-50" />
              </div>
            </Card>

            <Card className="card-sacred border-l-4 border-cyan-400">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">DATA</p>
                  <p className="text-xl font-bold text-cyan-400">Information</p>
                </div>
                <Shield className="w-8 h-8 text-cyan-400 opacity-50" />
              </div>
            </Card>

            <Card className="card-sacred border-l-4 border-amber-400">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">TECH</p>
                  <p className="text-xl font-bold text-amber-400">Technology</p>
                </div>
                <Shield className="w-8 h-8 text-amber-400 opacity-50" />
              </div>
            </Card>

            <Card className="card-sacred border-l-4 border-magenta-400">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">SHADOW</p>
                  <p className="text-xl font-bold text-magenta-400">Investigation</p>
                </div>
                <Shield className="w-8 h-8 text-magenta-400 opacity-50" />
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
