import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { Coordinates, DemoLocationPreset, LocationSource, ParkingSpot } from '../types/parking';
import {
  DEMO_LOCATION_PRESETS,
  DEFAULT_DEMO_COORDINATES,
  getDeviceOrFallbackLocation,
  sortSpotsByProximity,
} from '../services/locationService';
import { MOCK_PARKING_SPOTS } from '../data/mockData';

interface LocationContextType {
  userCoordinates: Coordinates;
  locationSource: LocationSource;
  locationName: string;
  isLocating: boolean;
  statusMessage: string;
  activePresetId: string | null;
  demoPresets: DemoLocationPreset[];
  sortedSpots: ParkingSpot[];
  nearestSpot: ParkingSpot;
  requestDeviceLocation: () => Promise<boolean>;
  setDemoPreset: (presetId: string) => void;
  recalculateProximity: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userCoordinates, setUserCoordinates] = useState<Coordinates>(DEFAULT_DEMO_COORDINATES);
  const [locationSource, setLocationSource] = useState<LocationSource>('demo');
  const [activePresetId, setActivePresetId] = useState<string | null>('pune-central');
  const [locationName, setLocationName] = useState<string>('Pune Central (Demo Fallback)');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>(
    'Detecting location or using Pune demo fallback...'
  );

  // Dynamically calculate and sort parking spots relative to active user coordinates
  const sortedSpots = useMemo(() => {
    return sortSpotsByProximity(MOCK_PARKING_SPOTS, userCoordinates);
  }, [userCoordinates]);

  const nearestSpot = useMemo(() => {
    return sortedSpots[0] || MOCK_PARKING_SPOTS[0];
  }, [sortedSpots]);

  /**
   * Requests device location with foreground permission.
   * If permission is granted, updates coordinates to live device GPS and calculates proximity.
   * If denied or unavailable, falls back to Pune demo coordinates labeled as demo/fallback.
   */
  const requestDeviceLocation = useCallback(async (): Promise<boolean> => {
    setIsLocating(true);
    setStatusMessage('Requesting foreground location permission & GPS coordinates...');
    try {
      const result = await getDeviceOrFallbackLocation();
      setUserCoordinates(result.coordinates);
      setStatusMessage(result.message);

      if (result.isLiveDevice) {
        setLocationSource('device');
        setActivePresetId(null);
        setLocationName(result.locationName || 'Live GPS Location (Active)');
        return true;
      } else {
        setLocationSource('demo');
        setActivePresetId('pune-central');
        setLocationName(result.locationName || 'Pune Central (Demo Fallback)');
        return false;
      }
    } catch {
      setUserCoordinates(DEFAULT_DEMO_COORDINATES);
      setLocationSource('demo');
      setActivePresetId('pune-central');
      setLocationName('Pune Central (Demo Fallback)');
      setStatusMessage('Location request timed out. Using Pune demo coordinates (Demo Fallback).');
      return false;
    } finally {
      setIsLocating(false);
    }
  }, []);

  // Request foreground location on initial mount so actual device coordinates are used
  useEffect(() => {
    requestDeviceLocation();
  }, [requestDeviceLocation]);

  /**
   * Sets the active location to one of the demo presets for simulation
   */
  const setDemoPreset = useCallback((presetId: string) => {
    const preset = DEMO_LOCATION_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setUserCoordinates(preset.coordinates);
      setLocationSource('demo');
      setActivePresetId(preset.id);
      setLocationName(`${preset.name} (Demo)`);
      setStatusMessage(`Switched location to: ${preset.name}`);
    }
  }, []);

  const recalculateProximity = useCallback(() => {
    // Force a re-calculation by setting the coordinates copy
    setUserCoordinates((prev) => ({ ...prev }));
  }, []);

  const value = useMemo(
    () => ({
      userCoordinates,
      locationSource,
      locationName,
      isLocating,
      statusMessage,
      activePresetId,
      demoPresets: DEMO_LOCATION_PRESETS,
      sortedSpots,
      nearestSpot,
      requestDeviceLocation,
      setDemoPreset,
      recalculateProximity,
    }),
    [
      userCoordinates,
      locationSource,
      locationName,
      isLocating,
      statusMessage,
      activePresetId,
      sortedSpots,
      nearestSpot,
      requestDeviceLocation,
      setDemoPreset,
      recalculateProximity,
    ]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
