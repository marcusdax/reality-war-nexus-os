/**
 * Hexagonal Grid Utility Functions
 * Converts lat/lng coordinates to hexagonal grid IDs and vice versa
 * Uses a cube coordinate system for hexagonal grids
 */

export interface HexCoord {
  q: number;
  r: number;
  s: number;
}

export interface LatLng {
  lat: number;
  lng: number;
}

// Hexagon size in kilometers
const HEX_SIZE_KM = 0.5; // Each hexagon is approximately 0.5 km across
const EARTH_RADIUS_KM = 6371;

/**
 * Convert latitude/longitude to hex grid coordinates
 * Uses an offset coordinate system with axial coordinates
 */
export function latLngToHex(lat: number, lng: number): HexCoord {
  // Convert to radians
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;

  // Project to flat coordinates (simplified Mercator)
  const x = lngRad * EARTH_RADIUS_KM;
  const y = Math.log(Math.tan(Math.PI / 4 + latRad / 2)) * EARTH_RADIUS_KM;

  // Convert to hex coordinates
  const hexSize = HEX_SIZE_KM;
  const q = Math.round((2 / 3) * x / hexSize);
  const r = Math.round((-1 / 3) * x / hexSize + Math.sqrt(3) / 3 * y / hexSize);
  const s = -q - r;

  return { q, r, s };
}

/**
 * Convert hex grid coordinates to latitude/longitude
 */
export function hexToLatLng(hex: HexCoord): LatLng {
  const hexSize = HEX_SIZE_KM;
  const x = hexSize * (3 / 2 * hex.q);
  const y = hexSize * (Math.sqrt(3) / 2 * hex.q + Math.sqrt(3) * hex.r);

  const lng = (x / EARTH_RADIUS_KM) * (180 / Math.PI);
  const lat = (2 * Math.atan(Math.exp(y / EARTH_RADIUS_KM)) - Math.PI / 2) * (180 / Math.PI);

  return { lat, lng };
}

/**
 * Generate a grid ID from hex coordinates
 */
export function hexToGridId(hex: HexCoord): string {
  return `${hex.q},${hex.r},${hex.s}`;
}

/**
 * Parse a grid ID back to hex coordinates
 */
export function gridIdToHex(gridId: string): HexCoord {
  const [q, r, s] = gridId.split(',').map(Number);
  return { q, r, s };
}

/**
 * Get all neighboring hexagons (6 neighbors in a hex grid)
 */
export function getNeighbors(hex: HexCoord): HexCoord[] {
  const directions = [
    { q: 1, r: 0, s: -1 },
    { q: 1, r: -1, s: 0 },
    { q: 0, r: -1, s: 1 },
    { q: -1, r: 0, s: 1 },
    { q: -1, r: 1, s: 0 },
    { q: 0, r: 1, s: -1 },
  ];

  return directions.map(dir => ({
    q: hex.q + dir.q,
    r: hex.r + dir.r,
    s: hex.s + dir.s,
  }));
}

/**
 * Calculate distance between two hex coordinates
 */
export function hexDistance(hex1: HexCoord, hex2: HexCoord): number {
  return (Math.abs(hex1.q - hex2.q) + Math.abs(hex1.r - hex2.r) + Math.abs(hex1.s - hex2.s)) / 2;
}

/**
 * Get all hexagons within a certain distance
 */
export function getHexesInRange(center: HexCoord, range: number): HexCoord[] {
  const results: HexCoord[] = [];

  for (let q = -range; q <= range; q++) {
    for (let r = Math.max(-range, -q - range); r <= Math.min(range, -q + range); r++) {
      const s = -q - r;
      results.push({ q, r, s });
    }
  }

  return results.map(hex => ({
    q: center.q + hex.q,
    r: center.r + hex.r,
    s: center.s + hex.s,
  }));
}

/**
 * Get polygon points for drawing a hexagon on a map
 * Returns 6 corner points in lat/lng format
 */
export function getHexagonPolygon(hex: HexCoord): LatLng[] {
  const center = hexToLatLng(hex);
  const hexSize = HEX_SIZE_KM;

  // Approximate hexagon size in degrees
  const latOffset = (hexSize / EARTH_RADIUS_KM) * (180 / Math.PI);
  const lngOffset = latOffset / Math.cos((center.lat * Math.PI) / 180);

  const corners: LatLng[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const lat = center.lat + latOffset * Math.sin(angle);
    const lng = center.lng + lngOffset * Math.cos(angle);
    corners.push({ lat, lng });
  }

  return corners;
}

/**
 * Check if a point is inside a hexagon
 */
export function isPointInHexagon(point: LatLng, hex: HexCoord): boolean {
  const polygon = getHexagonPolygon(hex);
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;

    const intersect = yi > point.lat !== yj > point.lat && point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}
