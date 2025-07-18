import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow } from 'date-fns';
import { pt, enUS, es } from 'date-fns/locale';

// Map of supported locales
const locales = {
  'pt-PT': pt,
  'en-US': enUS,
  'es-ES': es
};

// Get current locale from localStorage or default to Portuguese
export function getCurrentLocale(): 'pt-PT' | 'en-US' | 'es-ES' {
  if (typeof window === 'undefined') return 'pt-PT';
  return (localStorage.getItem('pixel-universe-locale') as 'pt-PT' | 'en-US' | 'es-ES') || 'pt-PT';
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date to a human-readable string
 * @param date The date to format
 * @param formatStr The format string to use
 * @returns The formatted date string
 */
export function formatDate(date: Date | string, formatStr: string = 'PPP', locale?: 'pt-PT' | 'en-US' | 'es-ES'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const selectedLocale = locale || getCurrentLocale();
  return format(dateObj, formatStr, { locale: locales[selectedLocale] });
}

/**
 * Returns a human-readable string representing the time elapsed since the given date
 * @param date The date to calculate the time from
 * @returns A string like "2 minutos atrás", "3 horas atrás", etc.
 */
export function timeAgo(date: Date | string, locale?: 'pt-PT' | 'en-US' | 'es-ES'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const selectedLocale = locale || getCurrentLocale();
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: locales[selectedLocale] });
}

/**
 * Formats a number to a human-readable string with K, M, B suffixes
 * @param num The number to format
 * @returns The formatted number string
 */
export function formatNumber(num: number): string {
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

/**
 * Generates a random color in hex format
 * @returns A random hex color string
 */
export function getRandomColor(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}

/**
 * Calculates the contrast ratio between two colors
 * @param color1 The first color in hex format
 * @param color2 The second color in hex format
 * @returns The contrast ratio
 */
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    const rgb = [r, g, b].map(v => {
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  };
  
  const luminance1 = getLuminance(color1);
  const luminance2 = getLuminance(color2);
  
  const brightest = Math.max(luminance1, luminance2);
  const darkest = Math.min(luminance1, luminance2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Determines if a color is light or dark
 * @param color The color in hex format
 * @returns true if the color is light, false if it's dark
 */
export function isLightColor(color: string): boolean {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate the perceived brightness using the formula
  // (0.299*R + 0.587*G + 0.114*B)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  return brightness > 128;
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

/**
 * Debounces a function call
 * @param func The function to debounce
 * @param wait The time to wait in milliseconds
 * @returns A debounced function
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttles a function call
 * @param func The function to throttle
 * @param limit The time limit in milliseconds
 * @returns A throttled function
 */
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastFunc: ReturnType<typeof setTimeout>;
  let lastRan: number;
  
  return function(...args: Parameters<T>): void {
    const context = this;
    
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      lastRan = Date.now();
      setTimeout(() => {
        inThrottle = false;
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit);
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

/**
 * Checks if the device is a mobile device
 * @returns true if the device is mobile, false otherwise
 */
export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Checks if the device has low performance capabilities
 * @returns true if the device has low performance, false otherwise
 */
export function isLowPerformanceDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (
    navigator.hardwareConcurrency <= 4 || 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (navigator as any).deviceMemory < 4
  );
}

/**
 * Generates a unique ID
 * @returns A unique string ID
 */
export function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Safely parses JSON with error handling
 * @param json The JSON string to parse
 * @param fallback The fallback value if parsing fails
 * @returns The parsed JSON or the fallback value
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return fallback;
  }
}