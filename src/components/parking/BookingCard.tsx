import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Booking } from '../../types/parking';
import { Colors, BorderRadius, Spacing, Typography } from '../../constants/theme';
import { Badge } from '../common/Badge';

interface BookingCardProps {
  booking: Booking;
  onPress?: () => void;
  onViewPass?: () => void;
  onCancel?: () => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onPress,
  onViewPass,
  onCancel,
}) => {
  const isNowActive = booking.status === 'ACTIVE';
  const isUpcoming = booking.status === 'UPCOMING';
  const isCancelled = booking.status === 'CANCELLED';

  const getStatusBadge = () => {
    switch (booking.status) {
      case 'ACTIVE':
        return <Badge label="Active Session" variant="success" size="sm" />;
      case 'UPCOMING':
        return <Badge label="Upcoming" variant="warning" size="sm" />;
      case 'COMPLETED':
        return <Badge label="Completed" variant="neutral" size="sm" />;
      case 'CANCELLED':
        return <Badge label="Cancelled" variant="danger" size="sm" />;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isNowActive && styles.cardActive,
      ]}
      activeOpacity={0.9}
      onPress={onPress}
    >
      {/* Top row */}
      <View style={styles.topRow}>
        <View style={styles.badgeRow}>
          {getStatusBadge()}
          <Text style={styles.bookingIdText}>#{booking.id}</Text>
        </View>

        <Text style={styles.costText}>${booking.totalCost.toFixed(2)}</Text>
      </View>

      {/* Spot & Slot info */}
      <Text style={styles.spotName}>{booking.spotName}</Text>
      <Text style={styles.addressText} numberOfLines={1}>
        {booking.locationAddress}
      </Text>

      {/* Slot & Vehicle pills */}
      <View style={styles.detailsRow}>
        <View style={styles.detailPill}>
          <Ionicons name="car-outline" size={13} color={Colors.primary} />
          <Text style={styles.detailPillText}>{booking.slotNumber}</Text>
        </View>

        <View style={styles.detailPill}>
          <Ionicons name="barcode-outline" size={13} color={Colors.textSecondary} />
          <Text style={styles.detailPillText}>{booking.vehiclePlate}</Text>
        </View>

        {booking.date ? (
          <View style={styles.detailPill}>
            <Ionicons name="calendar-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.detailPillText}>{booking.date}</Text>
          </View>
        ) : null}

        <View style={styles.detailPill}>
          <Ionicons name="time-outline" size={13} color={Colors.textSecondary} />
          <Text style={styles.detailPillText}>{booking.endTime}</Text>
        </View>
      </View>

      {/* Action buttons if Active or Upcoming */}
      {(isNowActive || isUpcoming) ? (
        <View style={styles.actionsFooter}>
          <TouchableOpacity
            style={styles.passButton}
            onPress={onViewPass}
            activeOpacity={0.8}
          >
            <Ionicons name="qr-code-outline" size={14} color={Colors.primary} />
            <Text style={styles.passButtonText}>Digital Gate Pass (PIN: {booking.pinCode})</Text>
          </TouchableOpacity>

          {onCancel && !isCancelled ? (
            <TouchableOpacity
              style={styles.cancelTextBtn}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md + 2,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardActive: {
    borderColor: Colors.success,
    backgroundColor: '#FBFDFB',
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookingIdText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    fontWeight: Typography.weights.medium,
  },
  costText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  spotName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginTop: 4,
  },
  addressText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: Spacing.sm,
  },
  detailPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  detailPillText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textPrimary,
    fontWeight: Typography.weights.medium,
  },
  actionsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: 12,
  },
  passButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryMuted,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    gap: 6,
    flex: 1,
  },
  passButtonText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
  },
  cancelTextBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  cancelText: {
    fontSize: Typography.sizes.xs,
    color: Colors.danger,
    fontWeight: Typography.weights.medium,
  },
});
