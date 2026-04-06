import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { MapPin, ArrowLeft, Zap, Users, Shield, Loader2, Radio } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

const FACTION_CONFIG: Record<string, { label: string; textColor: string; bgColor: string; borderColor: string; barColor: string }> = {
  shadow_corps: {
    label: "Shadow Corps",
    textColor: "text-fuchsia-400",
    bgColor: "bg-fuchsia-950/40",
    borderColor: "border-fuchsia-400/40",
    barColor: "bg-fuchsia-400",
  },
  truth_seekers: {
    label: "Truth Seekers",
    textColor: "text-cyan-400",
    bgColor: "bg-cyan-950/40",
    borderColor: "border-cyan-400/40",
    barColor: "bg-cyan-400",
  },
  reality_architects: {
    label: "Reality Architects",
    textColor: "text-amber-400",
    bgColor: "bg-amber-950/40",
    borderColor: "border-amber-400/40",
    barColor: "bg-amber-400",
  },
  neutral: {
    label: "Unclaimed",
    textColor: "text-gray-400",
    bgColor: "bg-slate-800/40",
    borderColor: "border-slate-600/40",
    barColor: "bg-gray-500",
  },
};

function SignalBar({ strength, barColor }: { strength: number; barColor: string }) {
  return (
    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
        style={{ width: `${strength}%` }}
      />
    </div>
  );
}

export default function TerritoryMap() {
  const [_location, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

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
    } else if (isAuthenticated) {
      setUserLocation({ lat: 37.7749, lng: -122.4194 });
    }
  }, [isAuthenticated]);

  // Fetch nearby territories from tRPC
  const territoriesQuery = trpc.territories.getNearby.useQuery(
    userLocation
      ? { latitude: userLocation.lat, longitude: userLocation.lng, radiusKm: 15 }
      : { latitude: 37.7749, longitude: -122.4194, radiusKm: 15 },
    { enabled: isAuthenticated }
  );

  const territories = territoriesQuery.data ?? [];

  // Compute faction totals for overview
  const factionTotals = territories.reduce<Record<string, { count: number; members: number; avgSignal: number; total: number }>>((acc, t) => {
    const f = t.faction;
    if (!acc[f]) acc[f] = { count: 0, members: 0, avgSignal: 0, total: 0 };
    acc[f].count += 1;
    acc[f].members += t.memberCount;
    acc[f].total += t.signalStrength;
    acc[f].avgSignal = Math.round(acc[f].total / acc[f].count);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/")} className="mr-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">Territory Map</h1>
              <p className="text-xs text-gray-400">Nexus OS · {territories.length} zones active</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-gray-400">{user?.role}</p>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Map Placeholder */}
        <div className="mb-10">
          <Card className="card-sacred h-72 flex items-center justify-center border-2 border-dashed border-slate-600 relative overflow-hidden">
            {/* Background grid effect */}
            <div className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: "linear-gradient(#00bcd4 1px, transparent 1px), linear-gradient(90deg, #00bcd4 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            <div className="text-center relative z-10">
              <Radio className="w-14 h-14 text-cyan-400/40 mx-auto mb-3" />
              <p className="text-gray-300 font-medium mb-1">Interactive Nexus Map</p>
              <p className="text-sm text-gray-500">Real-time territory visualization — coming in Phase 2</p>
              {userLocation && (
                <p className="text-xs text-cyan-500/60 mt-2">
                  Signal lock: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Faction Overview */}
        {territories.length > 0 && (
          <div className="mb-10">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              Faction Control
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(["shadow_corps", "truth_seekers", "reality_architects", "neutral"] as const).map((factionId) => {
                const cfg = FACTION_CONFIG[factionId];
                const stats = factionTotals[factionId] ?? { count: 0, members: 0, avgSignal: 0 };
                return (
                  <Card
                    key={factionId}
                    className={`card-sacred border ${cfg.borderColor} ${cfg.bgColor}`}
                  >
                    <p className={`text-xs font-bold ${cfg.textColor} mb-2`}>{cfg.label.toUpperCase()}</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Zones</span>
                        <span className="text-white font-bold">{stats.count}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Operatives</span>
                        <span className="text-white font-bold">{stats.members}</span>
                      </div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Avg Signal</span>
                        <span className={`font-bold ${cfg.textColor}`}>{stats.avgSignal || 0}%</span>
                      </div>
                      <SignalBar strength={stats.avgSignal || 0} barColor={cfg.barColor} />
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Territories Grid */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-cyan-400" />
            Nearby Territories
          </h3>

          {territoriesQuery.isLoading ? (
            <div className="text-center py-16">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
              <p className="text-gray-400">Scanning for territory signals...</p>
            </div>
          ) : territories.length === 0 ? (
            <div className="text-center py-16">
              <Radio className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No territories detected in range.</p>
              <p className="text-sm text-gray-500 mt-1">Expand radius or check back after a seed run.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {territories
                .slice()
                .sort((a, b) => b.signalStrength - a.signalStrength)
                .map((territory) => {
                  const cfg = FACTION_CONFIG[territory.faction] ?? FACTION_CONFIG.neutral;
                  return (
                    <Card
                      key={territory.id}
                      className={`card-sacred border ${cfg.borderColor} hover:shadow-md transition-all duration-200`}
                    >
                      <div className="mb-3">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-bold text-white text-sm leading-tight">{territory.name}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${cfg.borderColor} ${cfg.bgColor} ${cfg.textColor} font-semibold flex-shrink-0`}>
                            {cfg.label}
                          </span>
                        </div>
                        {territory.description && (
                          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mt-1">
                            {territory.description}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2.5 mb-3 text-xs">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-500">Signal Strength</span>
                            <span className={`font-bold ${cfg.textColor}`}>{territory.signalStrength}%</span>
                          </div>
                          <SignalBar strength={territory.signalStrength} barColor={cfg.barColor} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Active Operatives</span>
                          <span className="text-white font-bold">{territory.memberCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Radius</span>
                          <span className="text-gray-300">{(territory.radiusMeters / 1000).toFixed(1)} km</span>
                        </div>
                      </div>

                      <Button size="sm" variant="outline" className="w-full text-xs h-7">
                        Scout Territory
                      </Button>
                    </Card>
                  );
                })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
