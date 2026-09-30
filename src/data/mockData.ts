import { ParkingSpot, AiPrediction, Booking, UserProfile, ParkingSlot } from '../types/parking';

export const DEMO_USER: UserProfile = {
  id: 'usr_demo_101',
  name: 'Alex Morgan',
  email: 'alex.morgan@smartpark.ai',
  phone: '+1 (555) 234-8901',
  vehiclePlate: 'CAL-9021',
  vehicleModel: 'Tesla Model 3 (Midnight Silver)',
  isAiAutoReserveEnabled: true,
  preferredSpotType: 'EV Charging + Covered',
};

// Generates an interactive visual slot layout for a facility
export const generateMockSlots = (facilityId: string): ParkingSlot[] => {
  const seed = facilityId.charCodeAt(facilityId.length - 1) || 1;
  const slots: ParkingSlot[] = [];

  // Level 1 (Ground)
  const l1Bays = ['A', 'B'];
  l1Bays.forEach((bay) => {
    for (let i = 1; i <= 8; i++) {
      const numStr = i < 10 ? `0${i}` : `${i}`;
      const slotNum = `${bay}-${numStr}`;
      const isOccupied = (i * seed + 3) % 3 === 0;
      const isEV = i <= 2 && bay === 'A';
      const isAccessible = i === 1 && bay === 'B';

      slots.push({
        id: `${facilityId}-L1-${slotNum}`,
        slotNumber: slotNum,
        floor: 'Level 1 (Ground)',
        status: isOccupied ? 'OCCUPIED' : 'AVAILABLE',
        type: isEV ? 'EV_CHARGING' : isAccessible ? 'ACCESSIBLE' : i % 4 === 0 ? 'COMPACT' : 'STANDARD',
      });
    }
  });

  // Level 2 (Upper Deck)
  const l2Bays = ['C', 'D'];
  l2Bays.forEach((bay) => {
    for (let i = 1; i <= 8; i++) {
      const numStr = i < 10 ? `0${i}` : `${i}`;
      const slotNum = `${bay}-${numStr}`;
      const isOccupied = (i * seed + 1) % 2 === 0;
      const isEV = i === 1 && bay === 'C';

      slots.push({
        id: `${facilityId}-L2-${slotNum}`,
        slotNumber: slotNum,
        floor: 'Level 2 (Upper Deck)',
        status: isOccupied ? 'OCCUPIED' : 'AVAILABLE',
        type: isEV ? 'EV_CHARGING' : i % 3 === 0 ? 'COMPACT' : 'STANDARD',
      });
    }
  });

  return slots;
};

export const MOCK_PARKING_SPOTS: ParkingSpot[] = [
  {
    id: 'spot-1',
    name: 'Metro Center Smart Garage',
    category: 'Commercial Garage',
    address: '450 Innovation Blvd, Downtown',
    distance: '0.2 mi',
    walkingTime: '3 min walk',
    totalSpots: 180,
    availableSpots: 42,
    hourlyRate: 4.5,
    rating: 4.9,
    reviewCount: 328,
    features: {
      evCharging: true,
      covered: true,
      valet: false,
      cctvSecurity: true,
      disabledAccess: true,
    },
    aiPredictiveScore: 94,
    aiOccupancyTrend: 'Steady',
    availabilityStatus: 'High Availability',
    isPopular: true,
    slots: generateMockSlots('spot-1'),
    coordinates: { latitude: 37.7749, longitude: -122.4194 },
  },
  {
    id: 'spot-2',
    name: 'Cyber Plaza Automated Pod',
    category: 'Tech Park',
    address: '120 Silicon Way, Financial Hub',
    distance: '0.4 mi',
    walkingTime: '5 min walk',
    totalSpots: 95,
    availableSpots: 18,
    hourlyRate: 6.0,
    rating: 4.8,
    reviewCount: 194,
    features: {
      evCharging: true,
      covered: true,
      valet: true,
      cctvSecurity: true,
      disabledAccess: true,
    },
    aiPredictiveScore: 88,
    aiOccupancyTrend: 'Rapidly Filling',
    availabilityStatus: 'Limited Slots',
    isPopular: true,
    slots: generateMockSlots('spot-2'),
    coordinates: { latitude: 37.7785, longitude: -122.4167 },
  },
  {
    id: 'spot-3',
    name: 'Union Square Express Lot',
    category: 'Shopping Mall',
    address: '780 Market Street, Shopping Arcade',
    distance: '0.7 mi',
    walkingTime: '8 min walk',
    totalSpots: 220,
    availableSpots: 84,
    hourlyRate: 3.5,
    rating: 4.6,
    reviewCount: 412,
    features: {
      evCharging: false,
      covered: true,
      valet: false,
      cctvSecurity: true,
      disabledAccess: true,
    },
    aiPredictiveScore: 78,
    aiOccupancyTrend: 'Declining',
    availabilityStatus: 'High Availability',
    isPopular: false,
    slots: generateMockSlots('spot-3'),
    coordinates: { latitude: 37.7858, longitude: -122.4065 },
  },
  {
    id: 'spot-4',
    name: 'Grand Station Surface Bay',
    category: 'Street Spot',
    address: '95 Transit Avenue, Transit Gateway',
    distance: '0.9 mi',
    walkingTime: '11 min walk',
    totalSpots: 60,
    availableSpots: 7,
    hourlyRate: 2.75,
    rating: 4.4,
    reviewCount: 92,
    features: {
      evCharging: false,
      covered: false,
      valet: false,
      cctvSecurity: true,
      disabledAccess: false,
    },
    aiPredictiveScore: 52,
    aiOccupancyTrend: 'Rapidly Filling',
    availabilityStatus: 'Nearly Full',
    isPopular: false,
    slots: generateMockSlots('spot-4'),
    coordinates: { latitude: 37.7801, longitude: -122.4289 },
  },
  {
    id: 'spot-5',
    name: 'Skyline Tower Valet Deck',
    category: 'Commercial Garage',
    address: '101 Horizon Heights, North Pier',
    distance: '1.2 mi',
    walkingTime: '15 min walk',
    totalSpots: 310,
    availableSpots: 142,
    hourlyRate: 5.5,
    rating: 4.9,
    reviewCount: 520,
    features: {
      evCharging: true,
      covered: true,
      valet: true,
      cctvSecurity: true,
      disabledAccess: true,
    },
    aiPredictiveScore: 96,
    aiOccupancyTrend: 'Steady',
    availabilityStatus: 'High Availability',
    isPopular: true,
    slots: generateMockSlots('spot-5'),
    coordinates: { latitude: 37.7915, longitude: -122.4012 },
  },
  {
    id: 'spot-6',
    name: 'Airport Skyway Terminal P4',
    category: 'Airport',
    address: '2000 Flight Way, Terminal 2 Connect',
    distance: '2.8 mi',
    walkingTime: 'Shuttle 4 min',
    totalSpots: 450,
    availableSpots: 19,
    hourlyRate: 7.5,
    rating: 4.7,
    reviewCount: 680,
    features: {
      evCharging: true,
      covered: true,
      valet: true,
      cctvSecurity: true,
      disabledAccess: true,
    },
    aiPredictiveScore: 82,
    aiOccupancyTrend: 'Rapidly Filling',
    availabilityStatus: 'Limited Slots',
    isPopular: true,
    slots: generateMockSlots('spot-6'),
    coordinates: { latitude: 37.6213, longitude: -122.3790 },
  },
  {
    id: 'spot-7',
    name: 'Civic Plaza Underground Park',
    category: 'Commercial Garage',
    address: '355 McAllister Street, Civic Center',
    distance: '1.5 mi',
    walkingTime: '18 min walk',
    totalSpots: 140,
    availableSpots: 5,
    hourlyRate: 3.25,
    rating: 4.3,
    reviewCount: 154,
    features: {
      evCharging: false,
      covered: true,
      valet: false,
      cctvSecurity: true,
      disabledAccess: true,
    },
    aiPredictiveScore: 61,
    aiOccupancyTrend: 'Rapidly Filling',
    availabilityStatus: 'Nearly Full',
    isPopular: false,
    slots: generateMockSlots('spot-7'),
    coordinates: { latitude: 37.7812, longitude: -122.4178 },
  },
];

export const MOCK_AI_PREDICTION: AiPrediction = {
  id: 'pred-downtown-01',
  locationName: 'Downtown Commercial Corridor',
  targetTime: 'Next 2 Hours (Peak Transit)',
  confidenceScore: 92,
  predictedAvailabilityPct: 76,
  suggestedAction: 'Reserve spot within 15 mins to avoid 35% surge & slot competition.',
  reasoning: 'Historical Friday commuter patterns & local convention exit traffic indicate surge starting at 5:30 PM.',
  peakHourWarning: 'High congestion predicted between 5:30 PM - 7:00 PM',
  hourlyTrend: [
    { hour: '2 PM', availabilityPct: 82 },
    { hour: '3 PM', availabilityPct: 74 },
    { hour: '4 PM', availabilityPct: 65 },
    { hour: '5 PM', availabilityPct: 38 },
    { hour: '6 PM', availabilityPct: 24 },
    { hour: '7 PM', availabilityPct: 56 },
  ],
};

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'BK-8924',
    spotId: 'spot-1',
    spotName: 'Metro Center Smart Garage',
    locationAddress: '450 Innovation Blvd, Downtown',
    slotNumber: 'B-14 (Level 2)',
    vehiclePlate: 'CAL-9021',
    vehicleModel: 'Tesla Model 3',
    startTime: 'Today, 2:30 PM',
    endTime: 'Today, 5:30 PM',
    totalCost: 13.5,
    status: 'ACTIVE',
    qrAccessCode: 'SP-QR-98234-ACTIVE',
    pinCode: '4821',
  },
  {
    id: 'BK-7719',
    spotId: 'spot-2',
    spotName: 'Cyber Plaza Automated Pod',
    locationAddress: '120 Silicon Way, Financial Hub',
    slotNumber: 'Pod #09',
    vehiclePlate: 'CAL-9021',
    vehicleModel: 'Tesla Model 3',
    startTime: 'Tomorrow, 9:00 AM',
    endTime: 'Tomorrow, 1:00 PM',
    totalCost: 24.0,
    status: 'UPCOMING',
    qrAccessCode: 'SP-QR-11029-UPCOMING',
    pinCode: '8830',
  },
  {
    id: 'BK-6502',
    spotId: 'spot-3',
    spotName: 'Union Square Express Lot',
    locationAddress: '780 Market Street, Shopping Arcade',
    slotNumber: 'A-32',
    vehiclePlate: 'CAL-9021',
    vehicleModel: 'Tesla Model 3',
    startTime: 'Yesterday, 11:00 AM',
    endTime: 'Yesterday, 1:30 PM',
    totalCost: 8.75,
    status: 'COMPLETED',
    qrAccessCode: 'SP-QR-77402-PAST',
    pinCode: '1092',
  },
];
