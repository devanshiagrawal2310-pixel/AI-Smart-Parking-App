import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Typography } from '../../constants/theme';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';

export default function ReservationSummaryScreen() {
  const router = useRouter();
  const { user, createBooking } = useAuth();
  const params = useLocalSearchParams<{
    spotId: string;
    spotName: string;
    address: string;
    slotNumber: string;
    floor?: string;
    slotType?: string;
    date: string;
    startTime: string;
    durationHours: string;
    hourlyRate: string;
    estimatedFee: string;
  }>();

  const [isConfirming, setIsConfirming] = useState(false);

  const durationHours = parseInt(params.durationHours || '2', 10);
  const hourlyRate = parseFloat(params.hourlyRate || '40.0');
  const totalCost = parseFloat(params.estimatedFee || (durationHours * hourlyRate).toFixed(2));

  const handleConfirmReservation = async () => {
    setIsConfirming(true);

    try {
      const newBooking = createBooking({
        spotId: params.spotId || 'spot-1',
        spotName: params.spotName || 'FC Road Smart Garage',
        address: params.address || 'Fergusson College Road, Shivajinagar, Pune',
        rate: hourlyRate,
        hours: durationHours,
        preferredSlotNumber: params.slotNumber,
        floor: params.floor,
        slotType: params.slotType,
        date: params.date,
        startTime: params.startTime,
        endTime: `After ${durationHours} hour${durationHours > 1 ? 's' : ''}`,
        paymentStatus: 'PENDING',
      });

      // Navigate to Reservation Confirmation Screen
      router.replace({
        pathname: '/booking/confirmation',
        params: { bookingId: newBooking.id },
      });
    } catch {
      setIsConfirming(false);
      Alert.alert('Error', 'Unable to complete reservation. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Verification Banner */}
        <View style={styles.verificationBanner}>
          <Ionicons name="shield-checkmark" size={18} color={Colors.primary} />
          <Text style={styles.verificationText}>
            Review your reservation details before confirming gate barrier pass.
          </Text>
        </View>

        {/* 1. Parking Location Details */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="business-outline" size={18} color={Colors.primary} />
            <Text style={styles.cardTitle}>Parking Location</Text>
          </View>
          <Text style={styles.facilityName}>{params.spotName}</Text>
          <Text style={styles.facilityAddress}>{params.address}</Text>

          <View style={styles.locationMetaRow}>
            <Badge label="Downtown Zone" variant="neutral" size="sm" />
            <Badge label="24/7 Automated Access" variant="info" size="sm" />
          </View>
        </View>

        {/* 2. Selected Slot & Floor Details */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="car-outline" size={18} color={Colors.primary} />
            <Text style={styles.cardTitle}>Assigned Parking Slot</Text>
          </View>

          <View style={styles.slotHeroRow}>
            <View style={styles.slotBadgeBox}>
              <Text style={styles.slotBadgeLabel}>BAY</Text>
              <Text style={styles.slotBadgeNum}>{params.slotNumber || 'A-01'}</Text>
            </View>

            <View style={styles.slotHeroText}>
              <Text style={styles.slotFloor}>{params.floor || 'Level 1 (Ground)'}</Text>
              <Badge
                label={params.slotType === 'EV_CHARGING' ? 'EV Charging Ready' : 'Standard Covered Bay'}
                variant={params.slotType === 'EV_CHARGING' ? 'ai' : 'success'}
                size="sm"
                style={{ marginTop: 4 }}
              />
            </View>
          </View>

          <View style={styles.slotFeaturePill}>
            <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
            <Text style={styles.slotFeatureText}>
              Held exclusively for your vehicle with digital lock barrier.
            </Text>
          </View>
        </View>

        {/* 3. Date, Time & Duration */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="time-outline" size={18} color={Colors.primary} />
            <Text style={styles.cardTitle}>Schedule & Duration</Text>
          </View>

          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Date</Text>
            <Text style={styles.specValue}>{params.date}</Text>
          </View>

          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Arrival Time</Text>
            <Text style={styles.specValue}>{params.startTime}</Text>
          </View>

          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Duration</Text>
            <Text style={styles.specValue}>
              {durationHours} hour{durationHours > 1 ? 's' : ''}
            </Text>
          </View>

          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Grace Period</Text>
            <Text style={styles.specValue}>15 mins complimentary</Text>
          </View>
        </View>

        {/* 4. Registered Vehicle */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="barcode-outline" size={18} color={Colors.primary} />
            <Text style={styles.cardTitle}>Vehicle Recognition</Text>
          </View>

          <View style={styles.specRow}>
            <Text style={styles.specLabel}>License Plate</Text>
            <Text style={styles.specValuePlate}>{user?.vehiclePlate || 'MH-12-PQ-9021'}</Text>
          </View>

          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Vehicle Model</Text>
            <Text style={styles.specValue}>{user?.vehicleModel || 'Tata Nexon EV'}</Text>
          </View>
        </View>

        {/* 5. Pricing & Fee Breakdown */}
        <View style={[styles.card, styles.feeCard]}>
          <View style={styles.cardHeader}>
            <Ionicons name="receipt-outline" size={18} color={Colors.primary} />
            <Text style={styles.cardTitle}>Estimated Fee</Text>
          </View>

          <View style={styles.specRow}>
            <Text style={styles.specLabel}>
              Base Rate (₹{hourlyRate.toFixed(2)} x {durationHours} hrs)
            </Text>
            <Text style={styles.specValue}>₹{totalCost.toFixed(2)}</Text>
          </View>

          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Smart Reservation Fee</Text>
            <Text style={styles.freeBadge}>₹0.00 (Free in Beta)</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Estimated Price</Text>
            <Text style={styles.totalValue}>₹{totalCost.toFixed(2)}</Text>
          </View>
        </View>

        {/* Demo Disclaimer */}
        <View style={styles.demoPill}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
          <Text style={styles.demoPillText}>
            Local prototype demo: No real payment method or credit card will be charged.
          </Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar with Confirm Reservation Button */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomFeeCol}>
          <Text style={styles.bottomFeeLabel}>Total Due</Text>
          <Text style={styles.bottomFeeValue}>₹{totalCost.toFixed(2)}</Text>
        </View>

        <Button
          title="Confirm Reservation (Demo)"
          onPress={handleConfirmReservation}
          variant="primary"
          size="lg"
          loading={isConfirming}
          rightIcon={<Ionicons name="checkmark-circle" size={18} color={Colors.white} />}
          style={styles.confirmBtn}
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
  verificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryMuted,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 8,
    marginBottom: Spacing.md,
  },
  verificationText: {
    fontSize: Typography.sizes.xs,
    color: Colors.primaryDark,
    flex: 1,
    lineHeight: 18,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md + 2,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  feeCard: {
    borderColor: Colors.borderFocus,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  facilityName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  facilityAddress: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  locationMetaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: Spacing.sm,
  },
  slotHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  slotBadgeBox: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotBadgeLabel: {
    fontSize: 9,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
    opacity: 0.8,
  },
  slotBadgeNum: {
    fontSize: Typography.sizes.lg,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
  },
  slotHeroText: {
    flex: 1,
  },
  slotFloor: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  slotFeaturePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
  },
  slotFeatureText: {
    fontSize: Typography.sizes.xs - 1,
    color: Colors.textSecondary,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  specLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },
  specValue: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  specValuePlate: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  freeBadge: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.successDark,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  totalValue: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  demoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    gap: 8,
    marginTop: Spacing.xs,
  },
  demoPillText: {
    fontSize: 11,
    color: Colors.textMuted,
    flex: 1,
    lineHeight: 16,
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
  bottomFeeCol: {
    flexDirection: 'column',
  },
  bottomFeeLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  bottomFeeValue: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
  },
  confirmBtn: {
    flex: 1,
    marginLeft: Spacing.lg,
  },
});
