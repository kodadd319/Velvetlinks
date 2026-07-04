export interface CityCoords {
  name: string;
  lat: number;
  lng: number;
}

export const CITIES_REGISTRY: CityCoords[] = [
  { name: 'Miami, FL', lat: 25.7617, lng: -80.1918 },
  { name: 'New York, NY', lat: 40.7128, lng: -74.0060 },
  { name: 'Los Angeles, CA', lat: 34.0522, lng: -118.2437 },
  { name: 'Chicago, IL', lat: 41.8781, lng: -87.6298 },
  { name: 'Houston, TX', lat: 29.7604, lng: -95.3698 },
  { name: 'Phoenix, AZ', lat: 33.4484, lng: -112.0740 },
  { name: 'Philadelphia, PA', lat: 39.9526, lng: -75.1652 },
  { name: 'San Antonio, TX', lat: 29.4241, lng: -98.4936 },
  { name: 'San Diego, CA', lat: 32.7157, lng: -117.1611 },
  { name: 'Dallas, TX', lat: 32.7767, lng: -96.7970 },
  { name: 'Austin, TX', lat: 30.2672, lng: -97.7431 },
  { name: 'Las Vegas, NV', lat: 36.1716, lng: -115.1398 },
  { name: 'Atlanta, GA', lat: 33.7490, lng: -84.3880 },
  { name: 'Boston, MA', lat: 42.3601, lng: -71.0589 },
  { name: 'San Francisco, CA', lat: 37.7749, lng: -122.4194 },
  { name: 'Seattle, WA', lat: 47.6062, lng: -122.3321 }
];

/**
 * Calculates distance between two points in miles using Haversine formula
 */
export function getDistanceMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Radius of earth in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // round to 1 decimal place
}

/**
 * Find coordinates for a city name or return closest match
 */
export function resolveCityCoords(query: string): CityCoords | null {
  const cleaned = query.trim().toLowerCase();
  if (!cleaned) return null;

  // Exact match
  const exact = CITIES_REGISTRY.find(c => c.name.toLowerCase() === cleaned);
  if (exact) return exact;

  // Prefix or partial match
  const partial = CITIES_REGISTRY.find(c => c.name.toLowerCase().includes(cleaned));
  if (partial) return partial;

  return null;
}
