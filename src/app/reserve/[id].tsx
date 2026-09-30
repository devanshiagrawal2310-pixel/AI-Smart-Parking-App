import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Typography } from '../../constants/theme';
import { MOCK_PARKING_SPOTS, generateMockSlots } from '../../data/mockData';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { SlotLayoutMap } from '../../components/parking/SlotLayoutMap';
import { AiPredictionCard } from '../../components/parking/AiPredictionCard';
import { ParkingSlot } from '../../types/parking';
import { useLocation } from '../../context/LocationContext';
import { calculateHaversineDistance, formatDistance, estimateWalkingTime } from '../../services/locationService';

const DATE_OPTIONS = [
  { id: 'today', label: 'Today', sub: 'Oct 1' },
  { id: 'tomorrow', label: 'Tomorrow', sub: 'Oct 2' },
  { id: 'day_after', label: 'Friday', sub: 'Oct 3' },
];

const TIME_OPTIONS = [
  'Now (Instant)',
  '10:30 AM',
  '01:00 PM',
  '03:30 PM',
  '05:30 PM',
  '07:00 PM',
];

const DURATION_OPTIONS = [
  { hours: 1, label: '1 Hr' },
  { hours: 2, label: '2 Hrs' },
  { hours: 3, label: '3 Hrs' },
  { hours: 4, label: '4 Hrs' },
  { hours: 8, label: 'All Day' },
];

export default function ParkingDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userCoordinates, locationSource } = useLocation();

  const spot = MOCK_PARKING_SPOTS.find((s) => s.id === id) || MOCK_PARKING_SPOTS[0];
  const facilitySlots = spot.slots || generateMockSlots(spot.id);

  // Dynamic distance based on user reference location
  const numericDistance = calculateHaversineDistance(userCoordinates, spot.coordinates);
  const displayDistance = formatDistance(numericDistance);
  const displayWalkingTime = estimateWalkingTime(numericDistance);

  // Slot Selection
  const defaultSlot = facilitySlots.find((s) => s.status === 'AVAILABLE') || null;
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(defaultSlot);

  // Date & Time & Duration
  const [selectedDate, setSelectedDate] = useState('Today (Oct 1)');
  const [selectedTime, setSelectedTime] = useState('Now (Instant)');
  const [selectedDurationHours, setSelectedDurationHours] = useState(2);

  const handleSelectSlot = (slot: ParkingSlot) => {
    setSelectedSlot(slot);
  };

  // Fee calculation
  const baseRate = spot.hourlyRate;
  const estimatedFee = (baseRate * selectedDurationHours).toFixed(2);

  const handleProceedToSummary = () => {
    if (!selectedSlot) {
      Alert.alert('Please select a slot', 'Please tap on an available green slot on the layout map.');
      return;
    }

    router.push({
      pathname: '/booking/summary',
      params: {
        spotId: spot.id,
        spotName: spot.name,
        address: spot.address,
        slotNumber: selectedSlot.slotNumber,
        floor: selectedSlot.floor,
        slotType: selectedSlot.type,
        date: selectedDate,
        startTime: selectedTime,
        durationHours: selectedDurationHours.toString(),
        hourlyRate: spot.hourlyRate.toString(),
        estimatedFee: estimatedFee,
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Details Hero Card */}
        <View style={styles.headerCard}>
          <View style={styles.badgeRow}>
            <Badge
              label={spot.availabilityStatus}
              variant={
                spot.availabilityStatus === 'High Availability'
                  ? 'success'
                  : spot.availabilityStatus === 'Limited Slots'
                  ? 'warning'
                  : 'danger'
              }
              size="sm"
            />
            <Badge label={spot.category} variant="neutral" size="sm" />
            {spot.isPopular ? <Badge label="AI Recommended" variant="ai" size="sm" /> : null}
            <Badge
              label={locationSource === 'device' ? 'From GPS' : 'From Demo Hub'}
              variant="neutral"
              size="sm"
            />
          </View>

          <Text style={styles.spotName}>{spot.name}</Text>
          <Text style={styles.address}>{spot.address}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Distance</Text>
              <Text style={styles.statVal}>{displayDistance}</Text>
              <Text style={styles.statSub}>{displayWalkingTime}</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Available</Text>
              <Text style={styles.statValSuccess}>{spot.availableSpots}</Text>
              <Text style={styles.statSub}>of {spot.totalSpots} spots</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Hourly Rate</Text>
              <Text style={styles.statVal}>${spot.hourlyRate.toFixed(2)}</Text>
              <Text style={styles.statSub}>per hour</Text>
            </View>
          </View>
        </View>

        {/* AI Predictive Intelligence & Best Time to Park for this Facility */}
        <AiPredictionCard facilitySpot={spot} />

        {/* Section 1: Visual Parking-Slot Layout */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleWithIcon}>
            <Ionicons name="grid-outline" size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>1. Select Your Parking Slot</Text>
          </View>
          <Badge label="Interactive Layout" variant="info" size="sm" />
        </View>

        <Text style={styles.sectionSubDesc}>
          Tap any green <Text style={styles.boldSuccess}>FREE</Text> bay to select. Occupied bays with cars cannot be selected.
        </Text>

        <SlotLayoutMap
          slots={facilitySlots}
          selectedSlotId={selectedSlot?.id || null}
          onSelectSlot={handleSelectSlot}
          hourlyRate={spot.hourlyRate}
        />

        {/* Section 2: Date & Time Selection */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleWithIcon}>
            <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>2. Reservation Schedule</Text>
          </View>
        </View>

        <View style={styles.scheduleCard}>
          {/* Date Picker */}
          <Text style={styles.pickerLabel}>Arrival Date</Text>
          <View style={styles.chipRow}>
            {DATE_OPTIONS.map((item) => {
              const fullLabel = `${item.label} (${item.sub})`;
              const isSelected = selectedDate === fullLabel;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.dateChip, isSelected && styles.dateChipSelected]}
                  onPress={() => setSelectedDate(fullLabel)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dateChipTitle, isSelected && styles.dateChipTitleSelected]}>
                    {item.label}
                  </Text>
                  <Text style={[styles.dateChipSub, isSelected && styles.dateChipSubSelected]}>
                    {item.sub}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Start Time Picker */}
          <Text style={[styles.pickerLabel, { marginTop: Spacing.md }]}>Arrival Time</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.timeScroll}
          >
            {TIME_OPTIONS.map((time) => {
              const isSelected = selectedTime === time;
              return (
                <TouchableOpacity
                  key={time}
                  style={[styles.timeChip, isSelected && styles.timeChipSelected]}
                  onPress={() => setSelectedTime(time)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="time-outline"
                    size={12}
                    color={isSelected ? Colors.white : Colors.textSecondary}
                  />
                  <Text style={[styles.timeChipText, isSelected && styles.timeChipTextSelected]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Duration Picker */}
          <Text style={[styles.pickerLabel, { marginTop: Spacing.md }]}>Duration</Text>
          <View style={styles.chipRow}>
            {DURATION_OPTIONS.map((item) => {
              const isSelected = selectedDurationHours === item.hours;
              return (
                <TouchableOpacity
                  key={item.hours}
                  style={[styles.durationChip, isSelected && styles.durationChipSelected]}
                  onPress={() => setSelectedDurationHours(item.hours)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.durationChipText, isSelected && styles.durationChipTextSelected]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section 3: Estimated Fee Breakdown */}
        <View style={styles.feeBreakdownCard}>
          <View style={styles.feeHeader}>
            <Ionicons name="receipt-outline" size={16} color={Colors.primary} />
            <Text style={styles.feeTitle}>Estimated Parking Fee</Text>
          </View>

          <View style={styles.feeRow}>
            <Text style={styles.feeRowLabel}>
              Hourly Rate (${spot.hourlyRate.toFixed(2)} x {selectedDurationHours} hrs)
            </Text>
            <Text style={styles.feeRowValue}>${estimatedFee}</Text>
          </View>

          <View style={styles.feeRow}>
            <Text style={styles.feeRowLabel}>Slot Reservation Guarantee</Text>
            <Text style={styles.feeRowFree}>$0.00 (Demo Free)</Text>
          </View>

          <View style={styles.feeDivider} />

          <View style={styles.feeTotalRow}>
            <Text style={styles.feeTotalLabel}>Total Estimated Price</Text>
            <Text style={styles.feeTotalValue}>${estimatedFee}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomSummary}>
          <Text style={styles.bottomSlotLabel}>
            Slot: <Text style={styles.bottomSlotBold}>{selectedSlot?.slotNumber || 'Select Bay'}</Text>
          </Text>
          <Text style={styles.bottomPriceValue}>${estimatedFee} <Text style={styles.bottomHours}>({selectedDurationHours}h)</Text></Text>
        </View>

        <Button
          title="Proceed to Summary"
          onPress={handleProceedToSummary}
          variant="primary"
          size="lg"
          rightIcon={<Ionicons name="arrow-forward" size={16} color={Colors.white} />}
          style={styles.proceedBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 110,
  },
  headerCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  spotName: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  address: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  statCol: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  statLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },
  statVal: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  statValSuccess: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.successDark,
    marginTop: 2,
  },
  statSub: {
    fontSize: Typography.sizes.xs - 1,
    color: Colors.textMuted,
    marginTop: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: 4,
  },
  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  sectionSubDesc: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  boldSuccess: {
    fontWeight: Typography.weights.bold,
    color: Colors.successDark,
  },
  scheduleCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: Spacing.md,
  },
  pickerLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dateChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  dateChipSelected: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  dateChipTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  dateChipTitleSelected: {
    color: Colors.primary,
  },
  dateChipSub: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  dateChipSubSelected: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  timeScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  timeChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeChipText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  timeChipTextSelected: {
    color: Colors.white,
    fontWeight: Typography.weights.bold,
  },
  durationChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  durationChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  durationChipText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
  },
  durationChipTextSelected: {
    color: Colors.white,
  },
  feeBreakdownCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  feeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  feeTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  feeRowLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },
  feeRowValue: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  feeRowFree: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.successDark,
  },
  feeDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  feeTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feeTotalLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  feeTotalValue: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomSummary: {
    flexDirection: 'column',
  },
  bottomSlotLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  bottomSlotBold: {
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  bottomPriceValue: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
  },
  bottomHours: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.regular,
    color: Colors.textSecondary,
  },
  proceedBtn: {
    flex: 1,
    marginLeft: Spacing.lg,
  },
});
