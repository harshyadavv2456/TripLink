// src/utils/geofencing.ts
// Geolocation tracking, Haversine proximity calculations, and Geofencing Alerts

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeofenceTarget {
  id: string;
  name: string;
  location: string;
  category: string;
  lat: number;
  lng: number;
  dayNumber?: number;
  time?: string;
  distanceMeters: number;
  distanceFormatted: string;
  isInsideGeofence: boolean; // < 500m
  isNearby: boolean; // < 1500m
}

/**
 * Calculate distance between two coordinates in meters using Haversine formula
 */
export function calculateDistanceMeters(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (coord1.lat * Math.PI) / 180;
  const phi2 = (coord2.lat * Math.PI) / 180;
  const deltaPhi = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const deltaLambda = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Format distance in meters to a human readable string (e.g., "350 m" or "2.4 km")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters} m`;
  }
  const km = (meters / 1000).toFixed(1);
  return `${km} km`;
}

/**
 * Known location coordinate fallbacks for common city landmarks
 */
export const CITY_COORDINATE_FALLBACKS: Record<string, Coordinates> = {
  tokyo: { lat: 35.6762, lng: 139.6503 },
  shinjuku: { lat: 35.6938, lng: 139.7034 },
  shibuya: { lat: 35.6580, lng: 139.7016 },
  kyoto: { lat: 35.0116, lng: 135.7681 },
  osaka: { lat: 34.6937, lng: 135.5023 },
  paris: { lat: 48.8566, lng: 2.3522 },
  rome: { lat: 41.9028, lng: 12.4964 },
  london: { lat: 51.5074, lng: -0.1278 },
  newyork: { lat: 40.7128, lng: -74.0060 },
  singapore: { lat: 1.3521, lng: 103.8198 },
  bangkok: { lat: 13.7563, lng: 100.5018 },
  bali: { lat: -8.4095, lng: 115.1889 },
  sydney: { lat: -33.8688, lng: 151.2093 },
  dubai: { lat: 25.2048, lng: 55.2708 },
  cairo: { lat: 30.0444, lng: 31.2357 },
  barcelona: { lat: 41.3879, lng: 2.1699 },
};

/**
 * Preset locations for testing the proximity radar anytime in the preview
 */
export const GPS_SIMULATION_PRESETS: { name: string; city: string; lat: number; lng: number; description: string }[] = [
  {
    name: 'Shinjuku Station, Tokyo',
    city: 'Tokyo',
    lat: 35.6909,
    lng: 139.7003,
    description: 'Busy transit hub, near Omoide Yokocho & Gyoen',
  },
  {
    name: 'Shibuya Crossing, Tokyo',
    city: 'Tokyo',
    lat: 35.6595,
    lng: 139.7004,
    description: 'Near Shibuya Sky & Hachiko statue',
  },
  {
    name: 'Kyoto Historic Gion',
    city: 'Kyoto',
    lat: 35.0037,
    lng: 135.7772,
    description: 'Near Kiyomizu-dera & Yasaka Shrine',
  },
  {
    name: 'Eiffel Tower / Champ de Mars, Paris',
    city: 'Paris',
    lat: 48.8584,
    lng: 2.2945,
    description: 'Near Seine River cruise & Trocadéro',
  },
  {
    name: 'Colosseum & Roman Forum, Rome',
    city: 'Rome',
    lat: 41.8902,
    lng: 12.4922,
    description: 'Near Monti quarter & historic center',
  },
  {
    name: 'Times Square, New York',
    city: 'New York',
    lat: 40.7580,
    lng: -73.9855,
    description: 'Near Broadway & Bryant Park',
  },
];

/**
 * Scan all activities in a trip to calculate distance from user's current GPS position
 */
export function scanTripGeofences(userCoord: Coordinates, trip: any): GeofenceTarget[] {
  if (!userCoord || !trip || !trip.days) return [];

  const targets: GeofenceTarget[] = [];

  trip.days.forEach((day: any) => {
    (day.activities || []).forEach((act: any) => {
      let lat = act.lat;
      let lng = act.lng;

      // If activity has no explicit lat/lng, derive from location/city heuristics
      if (!lat || !lng) {
        const lowerLoc = (act.location || act.name || '').toLowerCase();
        for (const [key, coord] of Object.entries(CITY_COORDINATE_FALLBACKS)) {
          if (lowerLoc.includes(key)) {
            lat = coord.lat + (Math.sin(act.orderIndex || 1) * 0.01);
            lng = coord.lng + (Math.cos(act.orderIndex || 1) * 0.01);
            break;
          }
        }
      }

      // Default to destination city fallback if still unset
      if (!lat || !lng) {
        const destCity = (trip.destinations?.[0]?.city || 'tokyo').toLowerCase().replace(/\s+/g, '');
        const fallback = CITY_COORDINATE_FALLBACKS[destCity] || CITY_COORDINATE_FALLBACKS.tokyo;
        const seed = (act.id || '').split('').reduce((a: number, b: string) => a + b.charCodeAt(0), 0);
        lat = fallback.lat + ((seed % 20) - 10) * 0.003;
        lng = fallback.lng + ((seed % 15) - 7) * 0.003;
      }

      const dist = calculateDistanceMeters(userCoord, { lat, lng });

      targets.push({
        id: act.id,
        name: act.name,
        location: act.location || 'Local Landmark',
        category: act.category || 'sightseeing',
        lat,
        lng,
        dayNumber: day.dayNumber,
        time: act.time,
        distanceMeters: dist,
        distanceFormatted: formatDistance(dist),
        isInsideGeofence: dist <= 500, // within 500m radius
        isNearby: dist <= 1500, // within 1.5km
      });
    });
  });

  // Sort by nearest first
  return targets.sort((a, b) => a.distanceMeters - b.distanceMeters);
}
