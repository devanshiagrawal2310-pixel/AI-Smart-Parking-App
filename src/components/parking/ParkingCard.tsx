import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ParkingSpot } from '../../types/parking';
import { Colors, BorderRadius, Spacing, Typography } from '../../constants/theme';
import { Badge } from '../common/Badge';

interface ParkingCardProps {
  spot: ParkingSpot;
  isNearest?: boolean;
  onPress: () => void;
  onQuickReserve: () => void;
}

export const ParkingCard: React.FC<ParkingCardProps> = ({
  spot,
  isNearest,
  onPress,
  onQuickReserve,
}) => {
  const occupancyRatio = (spot.totalSpots - spot.availableSpots) / spot.totalSpots;
  const isNearlyFull = spot.availableSpots < 15;
  const isHealthy = spot.availableSpots > 35;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.88}
      onPress={onPress}
    >
      <View style={styles.topRow}>
        <View style={styles.categoryBadgeRow}>
          {isNearest ? (
            <Badge label="Nearest to You" variant="success" size="sm" />
          ) : null}
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
          <Badge
            label={spot.category}
            variant="neutral"
            size="sm"
          />
        </View>

        <View style={styles.ratingBox}>
          <Ionicons name="star" size={12} color="#EAB308" />
          <Text style={styles.ratingText}>{spot.rating.toFixed(1)}</Text>
        </View>
      </View>

      <Text style={styles.spotName}>{spot.name}</Text>
      <Text style={styles.addressText} numberOfLines={1}>
        {spot.address}
      </Text>

      {/* Availability Meter */}
      <View style={styles.meterContainer}>
        <View style={styles.meterHeader}>
          <View style={styles.availabilityPill}>
            <View
              style={[
                styles.statusIndicator,
                {
                  backgroundColor: isNearlyFull
                    ? Colors.danger
                    : isHealthy
                    ? Colors.success
                    : Colors.warning,
                },
              ]}
            />
            <Text style={styles.availableSpotsCount}>
              {spot.availableSpots}{' '}
              <Text style={styles.totalSpotsText}>/ {spot.totalSpots} spots free</Text>
            </Text>
          </View>

          <Text style={styles.distanceText}>
            <Ionicons name="navigate-outline" size={11} color={Colors.textSecondary} /> {spot.distance} ({spot.walkingTime})
          </Text>
        </View>

        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.min(100, Math.round(occupancyRatio * 100))}%`,
                backgroundColor: isNearlyFull
                  ? Colors.danger
                  : isHealthy
                  ? Colors.success
                  : Colors.warning,
              },
            ]}
          />
        </View>
      </View>

      {/* AI Spot Predictor indicator */}
      <View style={styles.aiPredictionBar}>
        <Ionicons name="sparkles" size={12} color={Colors.accentAI} />
        <Text style={styles.aiPredictionText}>
          AI Availability Score: <Text style={styles.aiBold}>{spot.aiPredictiveScore}%</Text> •{' '}
          <Text
            style={{
              color:
                spot.aiOccupancyTrend === 'Rapidly Filling'
                  ? Colors.dangerDark
                  : Colors.successDark,
              fontWeight: Typography.weights.semibold,
            }}
          >
            {spot.aiOccupancyTrend}
          </Text>
        </Text>
      </View>

      {/* Bottom Action Footer */}
      <View style={styles.footerRow}>
        <View style={styles.priceContainer}>
          <Text style={styles.pricePrefix}>From</Text>
          <Text style={styles.priceValue}>
            ${spot.hourlyRate.toFixed(2)}
            <Text style={styles.priceUnit}>/hr</Text>
          </Text>
        </View>

        <TouchableOpacity
          style={styles.quickReserveBtn}
          onPress={(e) => {
            e.stopPropagation();
            onQuickReserve();
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="flash-outline" size={14} color={Colors.white} />
          <Text style={styles.quickReserveBtnText}>Quick Reserve</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs + 2,
  },
  categoryBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    gap: 3,
  },
  ratingText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: '#854D0E',
  },
  spotName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginTop: 4,
  },
  addressText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  meterContainer: {
    marginTop: Spacing.md,
    backgroundColor: Colors.surfaceSubtle,
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
  },
  meterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  availabilityPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  availableSpotsCount: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  totalSpotsText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.regular,
    color: Colors.textMuted,
  },
  distanceText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  aiPredictionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentAILight,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.accentAIBorder,
    gap: 6,
  },
  aiPredictionText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    flex: 1,
  },
  aiBold: {
    fontWeight: Typography.weights.bold,
    color: Colors.accentAI,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  priceContainer: {
    flexDirection: 'column',
  },
  pricePrefix: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  priceValue: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
  },
  priceUnit: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.regular,
    color: Colors.textSecondary,
  },
  quickReserveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 9,
    paddingHorizontal: Spacing.md + 2,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  quickReserveBtnText: {
    color: Colors.white,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
});
