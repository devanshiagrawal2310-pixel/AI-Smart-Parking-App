export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface DemoLocationPreset {
  id: string;
  name: string;
  description: string;
  coordinates: Coordinates;
}

export type LocationSource = 'device' | 'demo';

export interface ParkingSpot {
  id: string;
  name: string;
  category: 'Commercial Garage' | 'Street Spot' | 'Shopping Mall' | 'Tech Park' | 'Airport';
  address: string;
  distance: string; // e.g. "0.3 km"
  distanceNumeric?: number; // numeric kilometers from active location
  walkingTime: string; // e.g. "3 mins walk"
  drivingTime?: string; // e.g. "1 min drive"
  totalSpots: number;
  availableSpots: number;
  hourlyRate: number; // in INR (₹)
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
  coordinates: Coordinates;
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

export interface HourlyForecastItem {
  hour: string;
  availabilityPct: number;
  availableSpots: number;
  status: 'High' | 'Moderate' | 'Low' | 'Critical';
}

export interface BestTimeToPark {
  timeWindow: string; // e.g. "1:30 PM - 3:00 PM"
  occupancyEstimate: string; // e.g. "Low (under 40% full)"
  advantage: string; // e.g. "Optimal for EV charging and shortest walking distance"
}

export interface AiPrediction {
  id: string;
  spotId?: string;
  locationName: string;
  targetTime: string; // e.g. "Next 45 Mins (5:30 PM)"
  confidenceScore: number; // percentage (e.g. 89)
  currentAvailableSpots: number;
  totalSpots: number;
  currentAvailabilityPct: number;
  predictedAvailableSpots: number;
  predictedAvailabilityPct: number;
  suggestedAction: string;
  reasoning: string;
  peakHourWarning?: string;
  bestTimeToPark: BestTimeToPark;
  hourlyTrend: HourlyForecastItem[];
  isDemoSimulation: true; // prototype demo flag
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
  paymentStatus?: 'PAID' | 'PENDING' | 'REFUNDED';
  paymentMethod?: 'UPI' | 'CARD' | 'WALLET';
  paymentTransactionId?: string;
  paidAt?: string;
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

