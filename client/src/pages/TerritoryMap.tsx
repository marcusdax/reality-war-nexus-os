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

  // Sample territories for display
  const sampleTerritories = [
    { id: 1, name: "Downtown Core", faction: "shadow_corps", signalStrength: 85, memberCount: 42 },
    { id: 2, name: "Mission District", faction: "truth_seekers", signalStrength: 72, memberCount: 28 },
    { id: 3, name: "Sunset Heights", faction: "reality_architects", signalStrength: 65, memberCount: 19 },
    { id: 4, name: "Bay View", faction: "neutral", signalStrength: 45, memberCount: 12 },
    { id: 5, name: "North Beach", faction: "shadow_corps", signalStrength: 78, memberCount: 35 },
    { id: 6, name: "Financial District", faction: "reality_architects", signalStrength: 68, memberCount: 22 },
  ];

  const factionColors: Record<string, string> = {
    shadow_corps: "text-magenta-400",
    truth_seekers: "text-cyan-400",
    reality_architects: "text-amber-400",
    neutral: "text-gray-400",
  };

  const factionLabels: Record<string, string> = {
    shadow_corps: "Shadow Corps",
    truth_seekers: "Truth Seekers",
    reality_architects: "Reality Architects",
    neutral: "Neutral",
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleTerritories.map((territory) => (
              <Card key={territory.id} className="card-sacred hover:border-cyan-400/50 transition-colors">
                <div className="mb-4">
                  <h4 className="font-bold text-white mb-2">
                    {territory.name}
                  </h4>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-3 h-3 rounded-full ${factionColors[territory.faction] || "bg-gray-400"}`} />
                    <span className={`text-sm font-medium ${factionColors[territory.faction] || "text-gray-400"}`}>
                      {factionLabels[territory.faction] || territory.faction}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Signal Strength:</span>
                    <span className="text-cyan-400 font-bold">{territory.signalStrength}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Members:</span>
                    <span className="text-white font-bold">{territory.memberCount}</span>
                  </div>
                </div>

                <Button size="sm" className="btn-truth w-full">
                  View Details
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Faction Overview */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" />
            Faction Overview
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="card-sacred border-l-4 border-magenta-400">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">SHADOW CORPS</p>
                  <p className="text-xl font-bold text-magenta-400">Investigation</p>
                </div>
                <Shield className="w-8 h-8 text-magenta-400 opacity-50" />
              </div>
            </Card>

            <Card className="card-sacred border-l-4 border-cyan-400">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">TRUTH SEEKERS</p>
                  <p className="text-xl font-bold text-cyan-400">Verification</p>
                </div>
                <Shield className="w-8 h-8 text-cyan-400 opacity-50" />
              </div>
            </Card>

            <Card className="card-sacred border-l-4 border-amber-400">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">REALITY ARCHITECTS</p>
                  <p className="text-xl font-bold text-amber-400">Framework</p>
                </div>
                <Shield className="w-8 h-8 text-amber-400 opacity-50" />
              </div>
            </Card>

            <Card className="card-sacred border-l-4 border-gray-400">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">NEUTRAL</p>
                  <p className="text-xl font-bold text-gray-400">Collaboration</p>
                </div>
                <Shield className="w-8 h-8 text-gray-400 opacity-50" />
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
