import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface Territory {
  id: number;
  name: string;
  faction: string;
  centerLatitude: number;
  centerLongitude: number;
  signalStrength: number;
  memberCount: number;
}

interface LeafletMapProps {
  territories: Territory[];
  userLocation?: { lat: number; lng: number };
  onTerritoryClick?: (territory: Territory) => void;
}

const factionColors: Record<string, string> = {
  shadow_corps: "#ff00ff", // Magenta
  truth_seekers: "#00ffff", // Cyan
  reality_architects: "#ffaa00", // Amber
  neutral: "#888888", // Gray
};

const factionLabels: Record<string, string> = {
  shadow_corps: "Shadow Corps",
  truth_seekers: "Truth Seekers",
  reality_architects: "Reality Architects",
  neutral: "Neutral",
};

function MapUpdater({ userLocation }: { userLocation?: { lat: number; lng: number } }) {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 13);
    }
  }, [userLocation, map]);

  return null;
}

export default function LeafletMap({ territories, userLocation, onTerritoryClick }: LeafletMapProps) {
  const defaultCenter: [number, number] = [37.7749, -122.4194]; // San Francisco
  const defaultZoom = 13;

  const createFactionIcon = (faction: string, signalStrength: number) => {
    const color = factionColors[faction] || factionColors.neutral;
    const size = Math.max(24, Math.min(40, 24 + (signalStrength / 100) * 16));

    return L.divIcon({
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background-color: ${color};
          border: 2px solid ${color};
          border-radius: 50%;
          opacity: 0.8;
          box-shadow: 0 0 ${signalStrength / 10}px ${color};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          color: white;
          text-shadow: 0 0 2px black;
        ">
          ${Math.round(signalStrength)}%
        </div>
      `,
      className: "faction-marker",
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2],
    });
  };

  return (
    <MapContainer
      // @ts-ignore
      center={userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter}
      zoom={defaultZoom}
      style={{ height: "100%", width: "100%" }}
      className="rounded-lg"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        // @ts-ignore
        attribution={`&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`}
      />

      {/* User location marker */}
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]}>
          <Popup>
            <div className="text-sm">
              <p className="font-bold">Your Location</p>
              <p className="text-xs text-gray-600">
                {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Territory markers */}
      {territories.map((territory) => (
        // @ts-ignore
        <Marker
          key={territory.id}
          position={[territory.centerLatitude, territory.centerLongitude]}
          // @ts-ignore
          icon={createFactionIcon(territory.faction, territory.signalStrength) as any}
          eventHandlers={{
            click: () => onTerritoryClick?.(territory),
          }}
        >
          <Popup>
            <div className="text-sm w-48">
              <p className="font-bold text-white">{territory.name}</p>
              <p className="text-xs text-gray-300 mb-2">
                {factionLabels[territory.faction] || territory.faction}
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Signal Strength:</span>
                  <span className="text-cyan-400 font-bold">{territory.signalStrength}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Members:</span>
                  <span className="text-white font-bold">{territory.memberCount}</span>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      <MapUpdater userLocation={userLocation} />
    </MapContainer>
  );
}
