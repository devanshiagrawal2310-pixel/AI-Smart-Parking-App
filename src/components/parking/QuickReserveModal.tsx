import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ParkingSpot, Booking } from '../../types/parking';
import { Colors, BorderRadius, Spacing, Typography } from '../../constants/theme';
import { Button } from '../common/Button';

interface QuickReserveModalProps {
  visible: boolean;
  spot: ParkingSpot | null;
  preferredSlotNumber?: string;
  onClose: () => void;
  onConfirm: (hours: number, slotNumber?: string) => Booking | void;
}

const DURATION_OPTIONS = [
  { hours: 1, label: '1 Hour' },
  { hours: 2, label: '2 Hours' },
  { hours: 4, label: '4 Hours' },
  { hours: 8, label: 'Full Day' },
];

export const QuickReserveModal: React.FC<QuickReserveModalProps> = ({
  visible,
  spot,
  preferredSlotNumber,
  onClose,
  onConfirm,
}) => {
  const [selectedHours, setSelectedHours] = useState(2);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  if (!spot) return null;

  const totalCost = (spot.hourlyRate * selectedHours).toFixed(2);

  const handleReserve = () => {
    const booking = onConfirm(selectedHours, preferredSlotNumber);
    if (booking) {
      setCreatedBooking(booking);
      setIsSuccess(true);
    }
  };

  const handleDone = () => {
    setIsSuccess(false);
    setCreatedBooking(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleDone}
    >
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {isSuccess && createdBooking ? (
            /* Success confirmation screen */
            <View style={styles.successWrapper}>
              <View style={styles.successIconCircle}>
                <Ionicons name="checkmark-circle" size={54} color={Colors.success} />
              </View>

              <Text style={styles.successTitle}>Spot Reserved!</Text>
              <Text style={styles.successSubtitle}>
                Your spot has been held via simulated AI allocation.
              </Text>

              <View style={styles.ticketBox}>
                <View style={styles.ticketRow}>
                  <Text style={styles.ticketLabel}>Assigned Slot</Text>
                  <Text style={styles.ticketValueSlot}>{createdBooking.slotNumber}</Text>
                </View>

                <View style={styles.ticketDivider} />

                <View style={styles.ticketRow}>
                  <Text style={styles.ticketLabel}>Facility</Text>
                  <Text style={styles.ticketValue}>{spot.name}</Text>
                </View>

                <View style={styles.ticketRow}>
                  <Text style={styles.ticketLabel}>Duration</Text>
                  <Text style={styles.ticketValue}>
                    {selectedHours} hour{selectedHours > 1 ? 's' : ''}
                  </Text>
                </View>

                <View style={styles.ticketRow}>
                  <Text style={styles.ticketLabel}>Gate Access PIN</Text>
                  <Text style={styles.ticketValuePIN}>{createdBooking.pinCode}</Text>
                </View>

                <View style={styles.ticketRow}>
                  <Text style={styles.ticketLabel}>Total (Demo)</Text>
                  <Text style={styles.ticketValue}>₹{totalCost}</Text>
                </View>
              </View>

              <View style={styles.disclaimerPill}>
                <Ionicons name="information-circle-outline" size={14} color={Colors.textMuted} />
                <Text style={styles.disclaimerText}>
                  Prototype mode: No actual credit card or IoT barrier involved.
                </Text>
              </View>

              <Button
                title="View in Dashboard"
                onPress={handleDone}
                variant="primary"
                fullWidth
                style={styles.doneBtn}
              />
            </View>
          ) : (
            /* Reservation configuration screen */
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.sheetHeader}>
                <View style={styles.headerTitleGroup}>
                  <Text style={styles.sheetTitle}>Quick Spot Reservation</Text>
                  <Text style={styles.sheetSubtitle}>{spot.name}</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={22} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Spot Quick Specs */}
              <View style={styles.specBox}>
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>Available Now</Text>
                  <Text style={styles.specValueSuccess}>{spot.availableSpots} Free</Text>
                </View>
                <View style={styles.specDivider} />
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>AI Confidence</Text>
                  <Text style={styles.specValueAI}>{spot.aiPredictiveScore}% Match</Text>
                </View>
                <View style={styles.specDivider} />
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>Rate</Text>
                  <Text style={styles.specValue}>₹{spot.hourlyRate.toFixed(2)}/hr</Text>
                </View>
              </View>

              {/* Duration picker */}
              <Text style={styles.sectionLabel}>Select Parking Duration</Text>
              <View style={styles.durationOptionsGrid}>
                {DURATION_OPTIONS.map((item) => {
                  const isSelected = selectedHours === item.hours;
                  return (
                    <TouchableOpacity
                      key={item.hours}
                      style={[
                        styles.durationCard,
                        isSelected && styles.durationCardSelected,
                      ]}
                      onPress={() => setSelectedHours(item.hours)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.durationLabel,
                          isSelected && styles.durationLabelSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                      <Text
                        style={[
                          styles.durationPrice,
                          isSelected && styles.durationPriceSelected,
                        ]}
                      >
                        ₹{(spot.hourlyRate * item.hours).toFixed(2)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Price summary */}
              <View style={styles.summaryBox}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Base Rate</Text>
                  <Text style={styles.summaryValue}>
                    ₹{spot.hourlyRate.toFixed(2)} x {selectedHours} hrs
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Smart Allocation Fee</Text>
                  <Text style={styles.summaryValueFree}>₹0.00 (Free in Beta)</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryRowTotal}>
                  <Text style={styles.totalLabel}>Estimated Total</Text>
                  <Text style={styles.totalValue}>₹{totalCost}</Text>
                </View>
              </View>

              {/* Prototype notice */}
              <View style={styles.disclaimerPill}>
                <Ionicons name="shield-checkmark-outline" size={14} color={Colors.primary} />
                <Text style={styles.disclaimerText}>
                  Instant reservation with simulated AI smart lock pass (Demo).
                </Text>
              </View>

              <Button
                title={`Confirm & Reserve (₹${totalCost}) • Demo`}
                onPress={handleReserve}
                variant="primary"
                size="lg"
                fullWidth
                style={styles.reserveBtn}
              />
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    maxHeight: '90%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  headerTitleGroup: {
    flex: 1,
  },
  sheetTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  sheetSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specBox: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    justifyContent: 'space-between',
  },
  specItem: {
    alignItems: 'center',
    flex: 1,
  },
  specDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  specLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },
  specValue: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  specValueSuccess: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.successDark,
    marginTop: 2,
  },
  specValueAI: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.accentAI,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  durationOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: Spacing.lg,
  },
  durationCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  durationCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  durationLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
  },
  durationLabelSelected: {
    color: Colors.primary,
  },
  durationPrice: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginTop: 4,
  },
  durationPriceSelected: {
    color: Colors.primaryDark,
  },
  summaryBox: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
  },
  summaryValueFree: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.successDark,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  summaryRowTotal: {
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
  disclaimerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
    gap: 6,
  },
  disclaimerText: {
    fontSize: 11,
    color: Colors.textSecondary,
    flex: 1,
  },
  reserveBtn: {
    marginTop: Spacing.xs,
  },
  // Success states
  successWrapper: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  successIconCircle: {
    marginBottom: Spacing.sm,
  },
  successTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  successSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.lg,
  },
  ticketBox: {
    width: '100%',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  ticketLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },
  ticketValue: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  ticketValueSlot: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  ticketValuePIN: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.accentAI,
  },
  doneBtn: {
    marginTop: Spacing.sm,
  },
});
