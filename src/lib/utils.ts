import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Approximate GPS bounding box for Portugal Continental
const PORTUGAL_GPS_BOUNDS = {
  MIN_LAT: 36.96, // Approximate minimum latitude
  MAX_LAT: 42.15, // Approximate maximum latitude
  MIN_LON: -9.5,  // Approximate minimum longitude (West is negative)
  MAX_LON: -6.18, // Approximate maximum longitude
};

/**
 * Maps logical pixel coordinates to approximate GPS coordinates using linear interpolation.
 * IMPORTANT: This is a highly simplified approximation and not geographically accurate.
 * It does not account for map projections or the Earth's curvature.
 *
 * @param logicalCol The column of the pixel in the logical grid.
 * @param logicalRow The row of the pixel in the logical grid.
 * @param totalLogicalCols The total number of columns in the logical grid.
 * @param totalLogicalRows The total number of rows in the logical grid.
 * @returns An object with approximate lat and lon, or null if inputs are invalid.
 */
export function mapPixelToApproxGps(
  logicalCol: number,
  logicalRow: number,
  totalLogicalCols: number,
  totalLogicalRows: number
): { lat: number; lon: number } | null {
  if (
    totalLogicalCols <= 0 ||
    totalLogicalRows <= 0 ||
    logicalCol < 0 ||
    logicalCol >= totalLogicalCols ||
    logicalRow < 0 ||
    logicalRow >= totalLogicalRows
  ) {
    return null; // Invalid input
  }

  // Calculate relative position (0.0 to 1.0)
  const relX = logicalCol / (totalLogicalCols -1); // Normalize to 0-1 range
  const relY = logicalRow / (totalLogicalRows - 1); // Normalize to 0-1 range

  // Interpolate longitude (more straightforward: left to right)
  const lon = PORTUGAL_GPS_BOUNDS.MIN_LON + relX * (PORTUGAL_GPS_BOUNDS.MAX_LON - PORTUGAL_GPS_BOUNDS.MIN_LON);

  // Interpolate latitude (inverted: SVG Y is top-to-bottom, Latitude is bottom-to-top)
  const lat = PORTUGAL_GPS_BOUNDS.MAX_LAT - relY * (PORTUGAL_GPS_BOUNDS.MAX_LAT - PORTUGAL_GPS_BOUNDS.MIN_LAT);
  // Or, if SVG top matches GPS North:
  // const lat = PORTUGAL_GPS_BOUNDS.MIN_LAT + (1 - relY) * (PORTUGAL_GPS_BOUNDS.MAX_LAT - PORTUGAL_GPS_BOUNDS.MIN_LAT);

  return {
    lat: parseFloat(lat.toFixed(6)), // Keep reasonable precision
    lon: parseFloat(lon.toFixed(6)),
  };
}
