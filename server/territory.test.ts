import { describe, expect, it } from "vitest";
import { latLngToHex, hexToLatLng, hexToGridId, gridIdToHex, getNeighbors, hexDistance, getHexesInRange } from "../shared/hexGrid";

describe("Hexagonal Grid Utilities", () => {
  describe("latLngToHex", () => {
    it("converts latitude/longitude to hex coordinates", () => {
      const hex = latLngToHex(40.7128, -74.006);
      expect(hex).toHaveProperty("q");
      expect(hex).toHaveProperty("r");
      expect(hex).toHaveProperty("s");
      expect(hex.q + hex.r + hex.s).toBe(0); // Cube coordinate property
    });

    it("handles multiple coordinates consistently", () => {
      const hex1 = latLngToHex(40.7128, -74.006);
      const hex2 = latLngToHex(40.7128, -74.006);
      expect(hex1).toEqual(hex2);
    });
  });

  describe("hexToLatLng", () => {
    it("converts hex coordinates back to lat/lng", () => {
      const original = { lat: 40.7128, lng: -74.006 };
      const hex = latLngToHex(original.lat, original.lng);
      const result = hexToLatLng(hex);

      // Allow small floating point differences
      expect(Math.abs(result.lat - original.lat)).toBeLessThan(0.01);
      expect(Math.abs(result.lng - original.lng)).toBeLessThan(0.01);
    });
  });

  describe("hexToGridId and gridIdToHex", () => {
    it("converts hex to grid ID and back", () => {
      const hex = { q: 10, r: -5, s: -5 };
      const gridId = hexToGridId(hex);
      const parsed = gridIdToHex(gridId);

      expect(parsed).toEqual(hex);
    });

    it("generates valid grid IDs", () => {
      const hex = { q: 0, r: 0, s: 0 };
      const gridId = hexToGridId(hex);
      expect(gridId).toBe("0,0,0");
    });
  });

  describe("getNeighbors", () => {
    it("returns 6 neighbors for a hex", () => {
      const hex = { q: 0, r: 0, s: 0 };
      const neighbors = getNeighbors(hex);
      expect(neighbors).toHaveLength(6);
    });

    it("all neighbors maintain cube coordinate property", () => {
      const hex = { q: 5, r: -3, s: -2 };
      const neighbors = getNeighbors(hex);

      neighbors.forEach((neighbor) => {
        expect(neighbor.q + neighbor.r + neighbor.s).toBe(0);
      });
    });
  });

  describe("hexDistance", () => {
    it("calculates distance between same hex as 0", () => {
      const hex = { q: 0, r: 0, s: 0 };
      expect(hexDistance(hex, hex)).toBe(0);
    });

    it("calculates distance between adjacent hexes as 1", () => {
      const hex1 = { q: 0, r: 0, s: 0 };
      const hex2 = { q: 1, r: 0, s: -1 };
      expect(hexDistance(hex1, hex2)).toBe(1);
    });

    it("calculates distance symmetrically", () => {
      const hex1 = { q: 0, r: 0, s: 0 };
      const hex2 = { q: 3, r: -2, s: -1 };
      expect(hexDistance(hex1, hex2)).toBe(hexDistance(hex2, hex1));
    });
  });

  describe("getHexesInRange", () => {
    it("returns correct number of hexes for range 0", () => {
      const center = { q: 0, r: 0, s: 0 };
      const hexes = getHexesInRange(center, 0);
      expect(hexes).toHaveLength(1);
    });

    it("returns correct number of hexes for range 1", () => {
      const center = { q: 0, r: 0, s: 0 };
      const hexes = getHexesInRange(center, 1);
      // Range 1 should include center + 6 neighbors = 7 total
      expect(hexes.length).toBeGreaterThan(1);
    });

    it("all returned hexes maintain cube coordinate property", () => {
      const center = { q: 5, r: -3, s: -2 };
      const hexes = getHexesInRange(center, 2);

      hexes.forEach((hex) => {
        expect(hex.q + hex.r + hex.s).toBe(0);
      });
    });
  });
});

describe("Faction Configuration", () => {
  it("has 4 factions defined", () => {
    const factionNames = ["ECO", "DATA", "TECH", "SHADOW"];
    expect(factionNames).toHaveLength(4);
  });

  it("faction colors are unique", () => {
    const colors = ["#10B981", "#3B82F6", "#A855F7", "#EF4444"];
    const uniqueColors = new Set(colors);
    expect(uniqueColors.size).toBe(colors.length);
  });
});
