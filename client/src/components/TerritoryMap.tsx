import React, { useEffect, useState, useRef, useCallback } from "react";
import { GoogleMap, Polygon, InfoWindow, Marker } from "@react-google-maps/api";
import { latLngToHex, getHexagonPolygon, LatLng } from "@shared/hexGrid";
import { FACTIONS, FactionName } from "@shared/factions";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

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

interface TerritoryMapProps {
  onTerritorySelect?: (territory: TerritoryData) => void;
  showNearbyOnly?: boolean;
  radiusKm?: number;
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "12px",
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.006,
};

const mapOptions = {
  zoom: 14,
  mapTypeId: "roadmap" as const,
  styles: [
    {
      elementType: "geometry",
      stylers: [{ color: "#1a1a1a" }],
    },
    {
      elementType: "labels.text.stroke",
      stylers: [{ color: "#1a1a1a" }],
    },
    {
      elementType: "labels.text.fill",
      stylers: [{ color: "#757575" }],
    },
  ],
};

export const TerritoryMap: React.FC<TerritoryMapProps> = ({
  onTerritorySelect,
  showNearbyOnly = false,
  radiusKm = 10,
}) => {
  const { user } = useAuth();
  const mapRef = useRef<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [selectedTerritory, setSelectedTerritory] = useState<TerritoryData | null>(null);
  const [territories, setTerritories] = useState<TerritoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get territories nearby
  const { data: nearbyTerritories } = trpc.territory.getNearby.useQuery(
    userLocation
      ? {
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          radiusKm,
        }
      : undefined as any,
    { enabled: !!userLocation }
  );

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setIsLoading(false);
        },
        () => {
          // Fallback to default location
          setUserLocation(defaultCenter);
          setIsLoading(false);
        }
      );
    } else {
      setUserLocation(defaultCenter);
      setIsLoading(false);
    }
  }, []);

  // Update territories when nearby data changes
  useEffect(() => {
    if (nearbyTerritories) {
      setTerritories(nearbyTerritories);
    }
  }, [nearbyTerritories]);

  // Center map on user location
  useEffect(() => {
    if (mapRef.current && userLocation) {
      mapRef.current.panTo(userLocation);
    }
  }, [userLocation]);

  const handleTerritoryClick = useCallback(
    (territory: TerritoryData) => {
      setSelectedTerritory(territory);
      if (onTerritorySelect) {
        onTerritorySelect(territory);
      }
    },
    [onTerritorySelect]
  );

  const getFactionColor = (territory: TerritoryData): string => {
    if (!territory.controllingFactionId) {
      return "#6B7280"; // Gray for unclaimed
    }

    // Determine which faction controls based on signal strength
    const strengths = {
      eco: territory.signalStrengthEco,
      data: territory.signalStrengthData,
      tech: territory.signalStrengthTech,
      shadow: territory.signalStrengthShadow,
    };

    const maxFaction = Object.entries(strengths).reduce((prev, current) =>
      current[1] > prev[1] ? current : prev
    );

    const factionMap: Record<string, FactionName> = {
      eco: "ECO",
      data: "DATA",
      tech: "TECH",
      shadow: "SHADOW",
    };

    return FACTIONS[factionMap[maxFaction[0]]].color;
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background rounded-lg">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={userLocation || defaultCenter}
        zoom={mapOptions.zoom}
        options={mapOptions}
      onLoad={(map: google.maps.Map) => {
        mapRef.current = map;
      }}
      >
        {/* User Location Marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              path: (google.maps.SymbolPath as any).CIRCLE,
              scale: 8,
              fillColor: "#3B82F6",
              fillOpacity: 1,
              strokeColor: "#fff",
              strokeWeight: 2,
            }}
            title="Your Location"
          />
        )}

        {/* Territory Hexagons */}
        {territories.map((territory) => {
          const polygon = getHexagonPolygon({
            q: parseInt(territory.gridId.split(",")[0]),
            r: parseInt(territory.gridId.split(",")[1]),
            s: parseInt(territory.gridId.split(",")[2]),
          });

          const factionColor = getFactionColor(territory);
          const isSelected = selectedTerritory?.id === territory.id;

          return (
            <Polygon
              key={territory.id}
              paths={polygon}
              options={{
                fillColor: factionColor,
                fillOpacity: isSelected ? 0.7 : 0.4,
                strokeColor: factionColor,
                strokeWeight: isSelected ? 3 : 1,
                strokeOpacity: 1,
                clickable: true,
              }}
              onClick={() => handleTerritoryClick(territory)}
            />
          );
        })}

        {/* Territory Info Window */}
        {selectedTerritory && (
          <InfoWindow
            position={{
              lat: parseFloat(selectedTerritory.centerLatitude.toString()),
              lng: parseFloat(selectedTerritory.centerLongitude.toString()),
            }}
            onCloseClick={() => setSelectedTerritory(null)}
          >
            <TerritoryInfoCard territory={selectedTerritory} />
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur border border-border rounded-lg p-3 shadow-lg z-10">
        <div className="text-xs font-semibold text-foreground mb-2">Faction Control</div>
        <div className="space-y-1">
          {Object.values(FACTIONS).map((faction) => (
            <div key={faction.id} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: faction.color }}
              />
              <span className="text-xs text-muted-foreground">{faction.displayName}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 mt-2">
            <div className="w-3 h-3 rounded-full bg-gray-500" />
            <span className="text-xs text-muted-foreground">Unclaimed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface TerritoryInfoCardProps {
  territory: TerritoryData;
}

const TerritoryInfoCard: React.FC<TerritoryInfoCardProps> = ({ territory }) => {
  const strengths = {
    ECO: territory.signalStrengthEco,
    DATA: territory.signalStrengthData,
    TECH: territory.signalStrengthTech,
    SHADOW: territory.signalStrengthShadow,
  };

  const totalStrength = Object.values(strengths).reduce((a, b) => a + b, 0);
  const controllingFaction = Object.entries(strengths).reduce((prev, current) =>
    current[1] > prev[1] ? current : prev
  )[0] as FactionName;

  return (
    <div className="bg-background p-3 rounded-lg shadow-lg max-w-xs">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-4 h-4 rounded"
          style={{ backgroundColor: FACTIONS[controllingFaction].color }}
        />
        <h3 className="font-semibold text-sm">{FACTIONS[controllingFaction].displayName}</h3>
      </div>

      <div className="space-y-1 text-xs mb-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Signal Strength:</span>
          <span className="font-medium">{totalStrength}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Capture Points:</span>
          <span className="font-medium">{territory.capturePointsRequired}</span>
        </div>
      </div>

      <div className="space-y-1 mb-3">
        {Object.entries(strengths).map(([faction, strength]) => (
          <div key={faction} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{faction}:</span>
            <div className="flex items-center gap-1">
              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${totalStrength > 0 ? (strength / totalStrength) * 100 : 0}%`,
                    backgroundColor: FACTIONS[faction as FactionName].color,
                  }}
                />
              </div>
              <span className="w-8 text-right font-medium">{strength}</span>
            </div>
          </div>
        ))}
      </div>

      <Button size="sm" className="w-full" variant="default">
        View Details
      </Button>
    </div>
  );
};
