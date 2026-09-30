import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AiPrediction } from '../../types/parking';
import { Colors, BorderRadius, Spacing, Typography } from '../../constants/theme';
import { Badge } from '../common/Badge';
import { PREDICTION_HORIZONS, PredictionTimeHorizon, generateFacilityPrediction, getDistrictAiPrediction } from '../../services/aiPredictionService';

interface AiPredictionCardProps {
  prediction?: AiPrediction;
  facilitySpot?: any; // optional if displaying for a specific spot
  onHorizonChange?: (horizon: PredictionTimeHorizon) => void;
}

export const AiPredictionCard: React.FC<AiPredictionCardProps> = ({
  prediction: initialPrediction,
  facilitySpot,
  onHorizonChange,
}) => {
  const [selectedHorizon, setSelectedHorizon] = useState<PredictionTimeHorizon>('1h');

  // Compute active prediction based on selected horizon
  const activePrediction: AiPrediction = React.useMemo(() => {
    if (facilitySpot) {
      return generateFacilityPrediction(facilitySpot, selectedHorizon);
    }
    if (initialPrediction) {
      // Re-evaluate if user clicks another horizon for district
      return getDistrictAiPrediction(selectedHorizon);
    }
    return getDistrictAiPrediction(selectedHorizon);
  }, [facilitySpot, initialPrediction, selectedHorizon]);

  const handleSelectHorizon = (horizon: PredictionTimeHorizon) => {
    setSelectedHorizon(horizon);
    if (onHorizonChange) {
      onHorizonChange(horizon);
    }
  };

  const isCritical = activePrediction.predictedAvailabilityPct < 25;
  const isHealthy = activePrediction.predictedAvailabilityPct > 60;

  return (
    <View style={styles.card}>
      {/* Top Prototype Badge Banner */}
      <View style={styles.protoBanner}>
        <Ionicons name="sparkles" size={13} color={Colors.accentAI} />
        <Text style={styles.protoBannerText}>AI PREDICTION DEMO • PROTOTYPE SIMULATION</Text>
      </View>

      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={styles.aiIconBubble}>
            <Ionicons name="hardware-chip" size={20} color={Colors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.headlineWithBadge}>
              <Text style={styles.title}>Spot Intelligence</Text>
              <Badge label="Simulated AI" variant="ai" size="sm" />
            </View>
            <Text style={styles.subtitle} numberOfLines={1}>
              {activePrediction.locationName}
            </Text>
          </View>
        </View>

        <View style={styles.confidenceBadge}>
          <Text style={styles.confidenceNum}>{activePrediction.confidenceScore}%</Text>
          <Text style={styles.confidenceLabel}>Confidence</Text>
        </View>
      </View>

      {/* Time Horizon Selector Chips */}
      <View style={styles.horizonContainer}>
        <Text style={styles.horizonHeaderLabel}>Forecast Time Horizon:</Text>
        <View style={styles.horizonChipsRow}>
          {PREDICTION_HORIZONS.map((h) => {
            const isSelected = selectedHorizon === h.id;
            return (
              <TouchableOpacity
                key={h.id}
                style={[styles.horizonChip, isSelected && styles.horizonChipActive]}
                onPress={() => handleSelectHorizon(h.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.horizonChipText, isSelected && styles.horizonChipTextActive]}>
                  {h.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Current vs Predicted Comparison Grid */}
      <View style={styles.comparisonGrid}>
        {/* Current Availability */}
        <View style={styles.gridBox}>
          <View style={styles.gridBoxHeader}>
            <Ionicons name="radio-button-on" size={12} color={Colors.primary} />
            <Text style={styles.gridBoxLabel}>Current Availability</Text>
          </View>
          <Text style={styles.gridBoxStat}>
            {activePrediction.currentAvailableSpots}{' '}
            <Text style={styles.gridBoxTotal}>/ {activePrediction.totalSpots} spots</Text>
          </Text>
          <Text style={styles.gridBoxPct}>{activePrediction.currentAvailabilityPct}% Free</Text>
        </View>

        {/* Arrow Divider */}
        <View style={styles.gridArrowContainer}>
          <Ionicons name="arrow-forward" size={16} color={Colors.textMuted} />
          <Text style={styles.targetTimeText}>{activePrediction.targetTime}</Text>
        </View>

        {/* Predicted Availability */}
        <View
          style={[
            styles.gridBox,
            styles.gridBoxPredicted,
            { borderColor: isCritical ? Colors.dangerLight : Colors.accentAIBorder },
          ]}
        >
          <View style={styles.gridBoxHeader}>
            <Ionicons
              name={isCritical ? 'alert-circle' : 'trending-up'}
              size={13}
              color={isCritical ? Colors.dangerDark : Colors.accentAI}
            />
            <Text
              style={[
                styles.gridBoxLabel,
                { color: isCritical ? Colors.dangerDark : Colors.accentAI },
              ]}
            >
              Predicted
            </Text>
          </View>
          <Text style={styles.gridBoxStat}>
            {activePrediction.predictedAvailableSpots}{' '}
            <Text style={styles.gridBoxTotal}>/ {activePrediction.totalSpots} spots</Text>
          </Text>
          <Text
            style={[
              styles.gridBoxPct,
              { color: isCritical ? Colors.dangerDark : isHealthy ? Colors.successDark : Colors.warningDark },
            ]}
          >
            {activePrediction.predictedAvailabilityPct}% Free
          </Text>
        </View>
      </View>

      {/* Best Time to Park Section */}
      <View style={styles.bestTimeCard}>
        <View style={styles.bestTimeHeader}>
          <Ionicons name="alarm-outline" size={16} color="#0D9488" />
          <Text style={styles.bestTimeTitle}>Best Time to Park</Text>
          <Badge label="Recommended" variant="success" size="sm" />
        </View>
        <Text style={styles.bestTimeWindow}>{activePrediction.bestTimeToPark.timeWindow}</Text>
        <Text style={styles.bestTimeSub}>
          Occupancy: <Text style={styles.boldText}>{activePrediction.bestTimeToPark.occupancyEstimate}</Text>
        </Text>
        <Text style={styles.bestTimeAdvantage}>💡 {activePrediction.bestTimeToPark.advantage}</Text>
      </View>

      {/* Hourly Availability Trend Bar Forecast */}
      <View style={styles.trendSection}>
        <View style={styles.trendHeaderRow}>
          <Text style={styles.trendTitle}>Hourly Availability Trend</Text>
          <Text style={styles.trendSub}>Projected Occupancy</Text>
        </View>

        <View style={styles.barsContainer}>
          {activePrediction.hourlyTrend.map((item, index) => {
            const isCrit = item.availabilityPct < 25;
            const isHighAvail = item.availabilityPct > 55;
            const barHeight = Math.max(14, (item.availabilityPct / 100) * 44);

            return (
              <View key={index} style={styles.barColumn}>
                <Text style={styles.barPctText}>{item.availabilityPct}%</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: barHeight,
                        backgroundColor: isCrit
                          ? Colors.danger
                          : isHighAvail
                          ? Colors.success
                          : Colors.warning,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barHourText}>{item.hour}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Peak hour warning if applicable */}
      {activePrediction.peakHourWarning ? (
        <View style={styles.warningBox}>
          <Ionicons name="warning-outline" size={15} color={Colors.warningDark} />
          <Text style={styles.warningText}>{activePrediction.peakHourWarning}</Text>
        </View>
      ) : null}

      {/* AI Recommendation notice */}
      <View style={styles.recommendationBox}>
        <Ionicons name="bulb-outline" size={16} color={Colors.primary} />
        <View style={styles.recommendationTextGroup}>
          <Text style={styles.recommendationTitle}>Smart Parking Guidance</Text>
          <Text style={styles.recommendationBody}>{activePrediction.suggestedAction}</Text>
          <Text style={styles.reasoningText}>{activePrediction.reasoning}</Text>
        </View>
      </View>

      {/* Prototype Disclaimer */}
      <View style={styles.disclaimerFooter}>
        <Ionicons name="information-circle-outline" size={13} color={Colors.textMuted} />
        <Text style={styles.disclaimerText}>
          Prototype Demo: Predictions are calculated using simulation heuristics for concept testing.
          Not connected to trained neural networks or live IoT sensors.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.accentAIBorder,
    shadowColor: Colors.accentAI,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  protoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentAILight,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.md,
    gap: 6,
  },
  protoBannerText: {
    fontSize: 9,
    fontWeight: Typography.weights.bold,
    color: Colors.accentAI,
    letterSpacing: 0.4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: Spacing.sm,
  },
  aiIconBubble: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.accentAI,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm + 2,
  },
  headlineWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  title: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  confidenceBadge: {
    alignItems: 'center',
    backgroundColor: Colors.accentAILight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.accentAIBorder,
  },
  confidenceNum: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.accentAI,
  },
  confidenceLabel: {
    fontSize: 9,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  horizonContainer: {
    marginBottom: Spacing.md,
  },
  horizonHeaderLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  horizonChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  horizonChip: {
    backgroundColor: Colors.surfaceSubtle,
    paddingVertical: 5,
    paddingHorizontal: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  horizonChipActive: {
    backgroundColor: Colors.accentAI,
    borderColor: Colors.accentAI,
  },
  horizonChipText: {
    fontSize: 11,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
  },
  horizonChipTextActive: {
    color: Colors.white,
    fontWeight: Typography.weights.bold,
  },
  comparisonGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: 6,
  },
  gridBox: {
    flex: 1,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm + 2,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  gridBoxPredicted: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
  },
  gridBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  gridBoxLabel: {
    fontSize: 10,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
  },
  gridBoxStat: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  gridBoxTotal: {
    fontSize: 10,
    fontWeight: Typography.weights.regular,
    color: Colors.textMuted,
  },
  gridBoxPct: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
    marginTop: 2,
  },
  gridArrowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    maxWidth: 70,
  },
  targetTimeText: {
    fontSize: 8,
    fontWeight: Typography.weights.medium,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  bestTimeCard: {
    backgroundColor: '#F0FDFA',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  bestTimeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  bestTimeTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: '#0F766E',
    flex: 1,
  },
  bestTimeWindow: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: '#134E4A',
    marginBottom: 2,
  },
  bestTimeSub: {
    fontSize: Typography.sizes.xs,
    color: '#047857',
    marginBottom: 4,
  },
  bestTimeAdvantage: {
    fontSize: Typography.sizes.xs,
    color: '#0F766E',
  },
  boldText: {
    fontWeight: Typography.weights.bold,
  },
  trendSection: {
    marginBottom: Spacing.md,
  },
  trendHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  trendTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  trendSub: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 75,
    paddingTop: 8,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barPctText: {
    fontSize: 9,
    color: Colors.textMuted,
    marginBottom: 4,
    fontWeight: Typography.weights.semibold,
  },
  barTrack: {
    width: 14,
    height: 44,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  barHourText: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: Typography.weights.medium,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 6,
    marginBottom: Spacing.md,
  },
  warningText: {
    fontSize: Typography.sizes.xs,
    color: Colors.warningDark,
    fontWeight: Typography.weights.medium,
    flex: 1,
  },
  recommendationBox: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryMuted,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  recommendationTextGroup: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
  },
  recommendationBody: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  reasoningText: {
    fontSize: Typography.sizes.xs - 1,
    color: Colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  disclaimerFooter: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surfaceSubtle,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: 6,
  },
  disclaimerText: {
    fontSize: 10,
    color: Colors.textMuted,
    flex: 1,
    lineHeight: 14,
  },
});
