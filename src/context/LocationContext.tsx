import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
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
  const [activePresetId, setActivePresetId] = useState<string | null>('sf-downtown');
  const [locationName, setLocationName] = useState<string>('Downtown Financial Hub (Demo)');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>(
    'Default demo coordinates active. Tap "Find Nearby" to query device GPS.'
  );

  // Dynamically calculate and sort parking spots relative to active user coordinates
  const sortedSpots = useMemo(() => {
    return sortSpotsByProximity(MOCK_PARKING_SPOTS, userCoordinates);
  }, [userCoordinates]);

  const nearestSpot = useMemo(() => {
    return sortedSpots[0] || MOCK_PARKING_SPOTS[0];
  }, [sortedSpots]);

  /**
   * Requests device location with permission.
   * If permission is granted, updates coordinates to live GPS.
   * If denied or unavailable, falls back gracefully to demo coordinates.
   */
  const requestDeviceLocation = useCallback(async (): Promise<boolean> => {
    setIsLocating(true);
    setStatusMessage('Querying device GPS sensors...');
    try {
      const result = await getDeviceOrFallbackLocation();
      setUserCoordinates(result.coordinates);
      setStatusMessage(result.message);

      if (result.isLiveDevice) {
        setLocationSource('device');
        setActivePresetId(null);
        setLocationName('Live GPS Location (Active)');
        return true;
      } else {
        setLocationSource('demo');
        setActivePresetId('sf-downtown');
        setLocationName('Downtown Financial Hub (Demo)');
        return false;
      }
    } catch {
      setUserCoordinates(DEFAULT_DEMO_COORDINATES);
      setLocationSource('demo');
      setActivePresetId('sf-downtown');
      setLocationName('Downtown Financial Hub (Demo)');
      setStatusMessage('Location request timed out. Using Demo Downtown location.');
      return false;
    } finally {
      setIsLocating(false);
    }
  }, []);

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
