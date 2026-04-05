import React, { useState } from "react";
import { LoadScript } from "@react-google-maps/api";
import { useAuth } from "@/_core/hooks/useAuth";
import { TerritoryMap } from "@/components/TerritoryMap";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MapPin, Users, Zap } from "lucide-react";
import { useLocation } from "wouter";
import { FACTIONS } from "@shared/factions";

// Define libraries outside component to prevent re-renders
const GOOGLE_MAPS_LIBRARIES: ("places" | "drawing" | "geometry")[] = ["places", "drawing", "geometry"];

interface TerritoryData {
  id: number;
  gridId: string;
  centerLatitude: string | number;
  centerLongitude: string | number;
  controllingFactionId: number | null;
  signalStrengthEco: number;
  signalStrengthData: number;
  signalStrengthTech: number;
  signalStrengthShadow: number;
  capturePointsRequired: number;
  lastCapturedAt: Date | null;
}

export default function MapPage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedTerritory, setSelectedTerritory] = useState<TerritoryData | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please log in to view the map</p>
          <Button onClick={() => setLocation("/")} variant="default">
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            className="hover:bg-muted"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Territory Map</h1>
            <p className="text-sm text-muted-foreground">Explore faction-controlled territories</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Map */}
        <div className="flex-1 bg-card rounded-lg border border-border overflow-hidden">
          <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyDummyKeyForDevelopment"} libraries={GOOGLE_MAPS_LIBRARIES}>
            <TerritoryMap onTerritorySelect={setSelectedTerritory} />
          </LoadScript>
        </div>

        {/* Sidebar */}
        <div className="w-80 flex flex-col gap-4 overflow-y-auto">
          {/* Territory Details */}
          {selectedTerritory && (
            <Card className="p-4 border-primary/50 bg-card">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Territory Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Grid ID:</span>
                      <span className="font-mono text-xs">{selectedTerritory.gridId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Capture Points:</span>
                      <span className="font-semibold">{selectedTerritory.capturePointsRequired}</span>
                    </div>
                  </div>
                </div>

                {/* Signal Strength Breakdown */}
                <div>
                  <h4 className="font-semibold text-foreground mb-2 text-sm">Signal Strength</h4>
                  <div className="space-y-2">
                    {[
                      { faction: "ECO", value: selectedTerritory.signalStrengthEco },
                      { faction: "DATA", value: selectedTerritory.signalStrengthData },
                      { faction: "TECH", value: selectedTerritory.signalStrengthTech },
                      { faction: "SHADOW", value: selectedTerritory.signalStrengthShadow },
                    ].map(({ faction, value }) => (
                      <div key={faction} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: FACTIONS[faction as keyof typeof FACTIONS].color }}
                        />
                        <span className="text-xs text-muted-foreground flex-1">{faction}</span>
                        <span className="text-xs font-semibold">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Control Status */}
                <div>
                  <h4 className="font-semibold text-foreground mb-2 text-sm">Control Status</h4>
                  {selectedTerritory.controllingFactionId ? (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="text-sm">Controlled by faction</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">Unclaimed Territory</span>
                    </div>
                  )}
                </div>

                <Button className="w-full" variant="default">
                  Capture Territory
                </Button>
              </div>
            </Card>
          )}

          {/* Faction Stats */}
          <Card className="p-4 bg-card">
            <h3 className="font-semibold text-foreground mb-3">Faction Overview</h3>
            <div className="space-y-2">
              {Object.values(FACTIONS).map((faction) => (
                <div
                  key={faction.id}
                  className="flex items-center justify-between p-2 rounded border border-border hover:bg-muted transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: faction.color }}
                    />
                    <span className="text-sm font-medium">{faction.displayName}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{faction.icon}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Map Legend */}
          <Card className="p-4 bg-card">
            <h3 className="font-semibold text-foreground mb-3">Legend</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: "#3B82F6" }} />
                <span className="text-muted-foreground">Your Location</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded opacity-70" style={{ backgroundColor: "#10B981" }} />
                <span className="text-muted-foreground">Controlled Territory</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded opacity-40" style={{ backgroundColor: "#6B7280" }} />
                <span className="text-muted-foreground">Unclaimed Territory</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
