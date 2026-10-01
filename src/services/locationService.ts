import * as Location from 'expo-location';
import { Coordinates, DemoLocationPreset, ParkingSpot } from '../types/parking';

// Earth radius in kilometers
const EARTH_RADIUS_KM = 6371;

/**
 * Calculates geodesic distance between two coordinate pairs using the Haversine formula
 * @returns distance in kilometers
 */
export function calculateHaversineDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const dLat = toRad(coord2.latitude - coord1.latitude);
  const dLon = toRad(coord2.longitude - coord1.longitude);

  const lat1 = toRad(coord1.latitude);
  const lat2 = toRad(coord2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = EARTH_RADIUS_KM * c;

  return Math.round(distanceKm * 100) / 100;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Formats a distance in kilometers into user-friendly text (m or km)
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    const meters = Math.round(km * 1000);
    return `${meters} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Estimates walking time (assumes 4.8 km/h / ~12.5 min per km)
 */
export function estimateWalkingTime(km: number): string {
  const minutes = Math.max(1, Math.round(km * 12.5));
  if (minutes < 60) {
    return `${minutes} min walk`;
  }
  const hrs = Math.floor(minutes / 60);
  const remMins = minutes % 60;
  return `${hrs}h ${remMins}m walk`;
}

/**
 * Estimates driving time (assumes 25 km/h city traffic / ~2.4 min per km)
 */
export function estimateDrivingTime(km: number): string {
  const minutes = Math.max(1, Math.round(km * 2.4));
  return `${minutes} min drive`;
}

// Pune demo coordinates when device location is not granted or unavailable
export const PUNE_DEMO_COORDINATES: Coordinates = {
  latitude: 18.5204,
  longitude: 73.8567,
};

// Demo location presets for testing or when device location is not granted
export const DEMO_LOCATION_PRESETS: DemoLocationPreset[] = [
  {
    id: 'pune-central',
    name: 'Pune Central (Demo Fallback)',
    description: 'FC Road / Shivajinagar (Pune Demo Fallback)',
    coordinates: PUNE_DEMO_COORDINATES,
  },
  {
    id: 'pune-hinjewadi',
    name: 'Hinjewadi Tech Park (Demo)',
    description: 'Phase 1 Infotech Zone, Pune',
    coordinates: { latitude: 18.5913, longitude: 73.7389 },
  },
  {
    id: 'pune-viman-nagar',
    name: 'Viman Nagar Hub (Demo)',
    description: 'Viman Nagar & Airport Area, Pune',
    coordinates: { latitude: 18.5679, longitude: 73.9143 },
  },
  {
    id: 'pune-kothrud',
    name: 'Kothrud Hub (Demo)',
    description: 'Paud Road Commercial Area, Pune',
    coordinates: { latitude: 18.5074, longitude: 73.8077 },
  },
];

export const DEFAULT_DEMO_COORDINATES: Coordinates = DEMO_LOCATION_PRESETS[0].coordinates;


export interface DeviceLocationResult {
  coordinates: Coordinates;
  isLiveDevice: boolean;
  status: 'granted' | 'denied' | 'unavailable' | 'demo';
  message: string;
  locationName?: string;
}

/**
 * Requests device GPS location with graceful fallback to demo coordinates
 * - Requests user permission via expo-location
 * - If granted, fetches current position with balanced accuracy
 * - Performs reverse geocoding to resolve a friendly name for the user's location
 * - If denied or error, falls back to Pune demo coordinates clearly labeled as demo/fallback
 */
export async function getDeviceOrFallbackLocation(): Promise<DeviceLocationResult> {
  try {
    // Check if permission is already granted or request it
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      return {
        coordinates: DEFAULT_DEMO_COORDINATES,
        isLiveDevice: false,
        status: 'denied',
        message: 'Foreground location permission not granted. Using Pune demo coordinates (Demo Fallback).',
        locationName: 'Pune Central (Demo Fallback)',
      };
    }

    // Try obtaining current device location
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    let locationName = 'Live GPS Location (Active)';
    try {
      const reverse = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      if (reverse && reverse.length > 0) {
        const place = reverse[0];
        const parts = [place.name || place.street, place.city || place.subregion].filter(Boolean);
        if (parts.length > 0) {
          locationName = parts.join(', ');
        } else if (place.city || place.region) {
          locationName = place.city || place.region || 'Current Location';
        }
      }
    } catch {
      // Keep default if reverse geocoding is unavailable offline
    }

    return {
      coordinates: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      isLiveDevice: true,
      status: 'granted',
      message: 'Live GPS location detected successfully.',
      locationName,
    };
  } catch {
    return {
      coordinates: DEFAULT_DEMO_COORDINATES,
      isLiveDevice: false,
      status: 'unavailable',
      message: 'Device GPS unavailable or timed out. Using Pune demo coordinates (Demo Fallback).',
      locationName: 'Pune Central (Demo Fallback)',
    };
  }
}

/**
 * Enriches parking spots with dynamic distances and walking times calculated
 * relative to the user's active coordinates (live or demo).
 * Returns parking spots sorted by nearest distance first.
 */
export function sortSpotsByProximity(
  spots: ParkingSpot[],
  userCoords: Coordinates
): ParkingSpot[] {
  return [...spots]
    .map((spot) => {
      const distanceNumeric = calculateHaversineDistance(userCoords, spot.coordinates);
      return {
        ...spot,
        distanceNumeric,
        distance: formatDistance(distanceNumeric),
        walkingTime: estimateWalkingTime(distanceNumeric),
        drivingTime: estimateDrivingTime(distanceNumeric),
      };
    })
    .sort((a, b) => (a.distanceNumeric ?? 0) - (b.distanceNumeric ?? 0));
}
