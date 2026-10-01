import { AiPrediction, HourlyForecastItem, ParkingSpot } from '../types/parking';

export type PredictionTimeHorizon = '30m' | '1h' | '2h' | 'evening';

export interface HorizonOption {
  id: PredictionTimeHorizon;
  label: string;
  sublabel: string;
}

export const PREDICTION_HORIZONS: HorizonOption[] = [
  { id: '30m', label: 'Next 30 Mins', sublabel: 'Immediate Arrival' },
  { id: '1h', label: 'Next 1 Hour', sublabel: 'Short Window' },
  { id: '2h', label: 'Next 2 Hours', sublabel: 'Mid-Day Forecast' },
  { id: 'evening', label: 'Evening Peak', sublabel: '5:30 PM Rush' },
];

/**
 * Calculates a simulated heuristic AI parking prediction for a given facility or aggregate area.
 *
 * NOTE FOR ARCHITECTURE & FUTURE INTEGRATION:
 * This is an AI-powered simulation engine for prototype demonstration.
 * In a production release, this function connects to a trained Machine Learning /
 * Deep Neural Network inference endpoint (e.g. PyTorch/TensorFlow serving model)
 * fed by real-time IoT magnetic road sensors and computer-vision camera telemetry.
 */
export function generateFacilityPrediction(
  spot: ParkingSpot,
  horizon: PredictionTimeHorizon = '1h'
): AiPrediction {
  const currentAvailable = spot.availableSpots;
  const total = spot.totalSpots;
  const currentPct = Math.round((currentAvailable / total) * 100);

  let predictedPct: number;
  let predictedAvailable: number;
  let confidence: number;
  let targetTimeLabel: string;
  let action: string;
  let reasoning: string;
  let warning: string | undefined;

  switch (horizon) {
    case '30m':
      targetTimeLabel = 'Next 30 Mins';
      confidence = 94;
      // Slight delta from current
      predictedPct = Math.max(8, Math.min(95, currentPct - (spot.aiOccupancyTrend === 'Rapidly Filling' ? 8 : 2)));
      predictedAvailable = Math.round((predictedPct / 100) * total);
      action = predictedPct < 25 
        ? 'High urgency: Reserve now to guarantee entry before bays reach zero.' 
        : 'Steady intake: Reserve within 15 minutes for prime ground floor positioning.';
      reasoning = 'Short-term ingress telemetry detects incoming turn-ins consistent with lunch commuter patterns.';
      break;

    case '2h':
      targetTimeLabel = 'Next 2 Hours';
      confidence = 86;
      predictedPct = Math.max(12, Math.min(90, currentPct - 15));
      predictedAvailable = Math.round((predictedPct / 100) * total);
      action = 'Book ahead: Demand expected to crest as afternoon commercial visits peak.';
      reasoning = 'Historical weekday traffic models project increased curbside congestion and lot turnover slowdown.';
      warning = 'Expect up to 10 min gate queue between 4:00 PM and 5:00 PM.';
      break;

    case 'evening':
      targetTimeLabel = 'Evening Peak (5:30 PM - 7:00 PM)';
      confidence = 88;
      predictedPct = 22; // evening rush
      predictedAvailable = Math.round((predictedPct / 100) * total);
      action = 'Peak Surge: Lock in a reserved bay now before surge pricing & limited slot allocation.';
      reasoning = 'Downtown restaurant reservations and theater corridor schedules produce high vehicle concentration.';
      warning = 'Severe capacity bottleneck expected after 5:30 PM.';
      break;

    case '1h':
    default:
      targetTimeLabel = 'Next 1 Hour';
      confidence = 91;
      predictedPct = Math.max(10, Math.min(92, currentPct - (spot.aiOccupancyTrend === 'Declining' ? -5 : 6)));
      predictedAvailable = Math.round((predictedPct / 100) * total);
      action = 'Recommended: Reserve your slot now to avoid peak hour rush and secure closest exit access.';
      reasoning = 'Multi-variable trend analysis (local calendar events, historical weekday turnover) shows steady fill rate.';
      if (spot.availableSpots < 20) {
        warning = 'Capacity approaching threshold (< 20 bays left).';
      }
      break;
  }

  // Generate hourly forecast curve for the day
  const hourlyTrend: HourlyForecastItem[] = [
    { hour: '1 PM', availabilityPct: Math.min(95, currentPct + 10), availableSpots: Math.round(total * 0.75), status: 'High' },
    { hour: '2 PM', availabilityPct: currentPct, availableSpots: currentAvailable, status: currentPct > 50 ? 'High' : 'Moderate' },
    { hour: '3 PM', availabilityPct: Math.max(15, currentPct - 8), availableSpots: Math.max(5, currentAvailable - 10), status: 'Moderate' },
    { hour: '4 PM', availabilityPct: Math.max(12, currentPct - 18), availableSpots: Math.max(4, currentAvailable - 22), status: 'Moderate' },
    { hour: '5 PM', availabilityPct: 24, availableSpots: Math.round(total * 0.24), status: 'Critical' },
    { hour: '6 PM', availabilityPct: 18, availableSpots: Math.round(total * 0.18), status: 'Critical' },
    { hour: '7 PM', availabilityPct: 48, availableSpots: Math.round(total * 0.48), status: 'Moderate' },
  ];

  return {
    id: `pred-${spot.id}-${horizon}`,
    spotId: spot.id,
    locationName: spot.name,
    targetTime: targetTimeLabel,
    confidenceScore: confidence,
    currentAvailableSpots: currentAvailable,
    totalSpots: total,
    currentAvailabilityPct: currentPct,
    predictedAvailableSpots: predictedAvailable,
    predictedAvailabilityPct: predictedPct,
    suggestedAction: action,
    reasoning: reasoning,
    peakHourWarning: warning,
    bestTimeToPark: {
      timeWindow: '1:15 PM – 2:45 PM',
      occupancyEstimate: 'Low (65%+ free bays available)',
      advantage: 'Fastest gate passage, widest bay selection, and lowest surge rate.',
    },
    hourlyTrend,
    isDemoSimulation: true,
  };
}

/**
 * Returns default district-wide AI prediction demo data
 */
export function getDistrictAiPrediction(horizon: PredictionTimeHorizon = '1h'): AiPrediction {
  const isEve = horizon === 'evening';
  const confidence = isEve ? 89 : horizon === '30m' ? 95 : 92;
  const currentPct = 68;
  const predPct = isEve ? 26 : horizon === '30m' ? 62 : 44;

  return {
    id: `pred-district-${horizon}`,
    locationName: 'Pune Central & Shivajinagar Hub (All Facilities)',
    targetTime: horizon === '30m' ? 'Next 30 Mins' : horizon === '2h' ? 'Next 2 Hours' : isEve ? 'Evening Peak (5:30 - 7:00 PM)' : 'Next 1 Hour',
    confidenceScore: confidence,
    currentAvailableSpots: 287,
    totalSpots: 720,
    currentAvailabilityPct: currentPct,
    predictedAvailableSpots: Math.round(720 * (predPct / 100)),
    predictedAvailabilityPct: predPct,
    suggestedAction: 'Reserve spot within 20 mins to secure best bay and bypass street parking congestion.',
    reasoning: 'AI occupancy neural heuristic projects a 38% drop in free spots as commercial IT parks & offices dismiss staff.',
    peakHourWarning: isEve ? 'Severe district-wide congestion between 5:15 PM and 6:45 PM' : undefined,
    bestTimeToPark: {
      timeWindow: '1:30 PM – 3:00 PM',
      occupancyEstimate: 'Optimal window (~65% bay availability)',
      advantage: 'Shortest search time (< 2 mins) and prime EV/covered spaces.',
    },
    hourlyTrend: [
      { hour: '12 PM', availabilityPct: 78, availableSpots: 560, status: 'High' },
      { hour: '1 PM', availabilityPct: 70, availableSpots: 504, status: 'High' },
      { hour: '2 PM', availabilityPct: 62, availableSpots: 446, status: 'Moderate' },
      { hour: '3 PM', availabilityPct: 54, availableSpots: 388, status: 'Moderate' },
      { hour: '4 PM', availabilityPct: 38, availableSpots: 273, status: 'Low' },
      { hour: '5 PM', availabilityPct: 22, availableSpots: 158, status: 'Critical' },
      { hour: '6 PM', availabilityPct: 19, availableSpots: 136, status: 'Critical' },
      { hour: '7 PM', availabilityPct: 51, availableSpots: 367, status: 'Moderate' },
    ],
    isDemoSimulation: true,
  };
}
