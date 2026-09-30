import * as Location from 'expo-location';
import { Coordinates, DemoLocationPreset, ParkingSpot } from '../types/parking';

// Earth radius in miles
const EARTH_RADIUS_MILES = 3958.8;

// Demo location presets for testing or when device location is not granted
export const DEMO_LOCATION_PRESETS: DemoLocationPreset[] = [
  {
    id: 'sf-downtown',
    name: 'Downtown Financial Hub',
    description: '450 Innovation Blvd (Default SF Center)',
    coordinates: { latitude: 37.7749, longitude: -122.4194 },
  },
  {
    id: 'sf-union-square',
    name: 'Union Square Retail District',
    description: 'Market & Powell St Shopping',
    coordinates: { latitude: 37.7879, longitude: -122.4074 },
  },
  {
    id: 'sf-civic-center',
    name: 'Civic Center & City Hall',
    description: '355 McAllister & Van Ness',
    coordinates: { latitude: 37.7793, longitude: -122.4192 },
  },
  {
    id: 'sf-airport',
    name: 'SFO International Airport',
    description: 'Terminal 2 Skyway Connect',
    coordinates: { latitude: 37.6213, longitude: -122.3790 },
  },
];

export const DEFAULT_DEMO_COORDINATES: Coordinates = DEMO_LOCATION_PRESETS[0].coordinates;

/**
 * Calculates geodesic distance between two coordinate pairs using the Haversine formula
 * @returns distance in miles
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
  const distanceMiles = EARTH_RADIUS_MILES * c;

  return Math.round(distanceMiles * 100) / 100;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Formats a distance in miles into user-friendly text
 */
export function formatDistance(miles: number): string {
  if (miles < 0.1) {
    const feet = Math.round(miles * 5280);
    return `${feet} ft`;
  }
  return `${miles.toFixed(1)} mi`;
}

/**
 * Estimates walking time (assumes 3.0 mph / 20 min per mile)
 */
export function estimateWalkingTime(miles: number): string {
  const minutes = Math.max(1, Math.round(miles * 20));
  if (minutes < 60) {
    return `${minutes} min walk`;
  }
  const hrs = Math.floor(minutes / 60);
  const remMins = minutes % 60;
  return `${hrs}h ${remMins}m walk`;
}

/**
 * Estimates driving time (assumes 15.0 mph city traffic / 4 min per mile)
 */
export function estimateDrivingTime(miles: number): string {
  const minutes = Math.max(1, Math.round(miles * 4));
  return `${minutes} min drive`;
}

export interface DeviceLocationResult {
  coordinates: Coordinates;
  isLiveDevice: boolean;
  status: 'granted' | 'denied' | 'unavailable' | 'demo';
  message: string;
}

/**
 * Requests device GPS location with graceful fallback to demo coordinates
 * - Requests user permission via expo-location
 * - If granted, fetches current position with balanced accuracy and timeout
 * - If denied or error, falls back to demo coordinates without crashing
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
        message: 'Location permission not granted. Switched to Demo Downtown SF location.',
      };
    }

    // Try obtaining current device location
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      coordinates: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      isLiveDevice: true,
      status: 'granted',
      message: 'Live GPS location detected successfully.',
    };
  } catch {
    return {
      coordinates: DEFAULT_DEMO_COORDINATES,
      isLiveDevice: false,
      status: 'unavailable',
      message: 'Device GPS unavailable or timed out. Using Demo Downtown SF coordinates.',
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
