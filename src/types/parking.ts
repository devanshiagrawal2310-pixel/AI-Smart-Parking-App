export interface ParkingSpot {
  id: string;
  name: string;
  category: 'Commercial Garage' | 'Street Spot' | 'Shopping Mall' | 'Tech Park' | 'Airport';
  address: string;
  distance: string; // e.g. "0.3 miles"
  walkingTime: string; // e.g. "3 mins walk"
  totalSpots: number;
  availableSpots: number;
  hourlyRate: number; // in USD
  rating: number; // e.g. 4.8
  reviewCount: number;
  features: {
    evCharging: boolean;
    covered: boolean;
    valet: boolean;
    cctvSecurity: boolean;
    disabledAccess: boolean;
  };
  aiPredictiveScore: number; // 0-100 (Chance of quick spot find)
  aiOccupancyTrend: 'Declining' | 'Steady' | 'Rapidly Filling';
  availabilityStatus: 'High Availability' | 'Limited Slots' | 'Nearly Full';
  isPopular?: boolean;
  slots?: ParkingSlot[];
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export type SlotStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'DISABLED';
export type SlotType = 'STANDARD' | 'EV_CHARGING' | 'COMPACT' | 'ACCESSIBLE';

export interface ParkingSlot {
  id: string;
  slotNumber: string;
  floor: string;
  status: SlotStatus;
  type: SlotType;
  priceModifier?: number;
}

export interface AiPrediction {
  id: string;
  locationName: string;
  targetTime: string;
  confidenceScore: number; // percentage
  predictedAvailabilityPct: number;
  suggestedAction: string;
  reasoning: string;
  peakHourWarning?: string;
  hourlyTrend: {
    hour: string;
    availabilityPct: number;
  }[];
}

export interface Booking {
  id: string;
  spotId: string;
  spotName: string;
  locationAddress: string;
  slotNumber: string;
  floor?: string;
  slotType?: string;
  vehiclePlate: string;
  vehicleModel: string;
  date?: string;
  startTime: string;
  endTime: string;
  durationHours?: number;
  totalCost: number;
  status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
  qrAccessCode: string;
  pinCode: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehiclePlate: string;
  vehicleModel: string;
  isAiAutoReserveEnabled: boolean;
  preferredSpotType: string;
}
