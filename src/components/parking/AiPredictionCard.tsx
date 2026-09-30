import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AiPrediction } from '../../types/parking';
import { Colors, BorderRadius, Spacing, Typography } from '../../constants/theme';
import { Badge } from '../common/Badge';

interface AiPredictionCardProps {
  prediction: AiPrediction;
}

export const AiPredictionCard: React.FC<AiPredictionCardProps> = ({ prediction }) => {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={styles.aiIconBubble}>
            <Ionicons name="hardware-chip-outline" size={18} color={Colors.white} />
          </View>
          <View>
            <View style={styles.headlineWithBadge}>
              <Text style={styles.title}>AI Spot Intelligence</Text>
              <Badge label="Simulated AI Demo" variant="ai" size="sm" />
            </View>
            <Text style={styles.subtitle}>{prediction.locationName}</Text>
          </View>
        </View>

        <View style={styles.confidenceBadge}>
          <Text style={styles.confidenceNum}>{prediction.confidenceScore}%</Text>
          <Text style={styles.confidenceLabel}>Confidence</Text>
        </View>
      </View>

      {/* Target forecast highlight */}
      <View style={styles.predictionHighlight}>
        <View style={styles.highlightLeft}>
          <Text style={styles.highlightLabel}>Expected Availability</Text>
          <Text style={styles.highlightStat}>
            {prediction.predictedAvailabilityPct}%{' '}
            <Text style={styles.highlightStatSub}>chance to find instant spot</Text>
          </Text>
        </View>
        <Ionicons
          name="trending-down"
          size={24}
          color={Colors.warningDark}
          style={styles.trendIcon}
        />
      </View>

      {/* Hourly Trend Bar Forecast */}
      <View style={styles.trendSection}>
        <Text style={styles.trendTitle}>Hourly Availability Forecast</Text>
        <View style={styles.barsContainer}>
          {prediction.hourlyTrend.map((item, index) => {
            const isCritical = item.availabilityPct < 40;
            const isHigh = item.availabilityPct > 70;
            const barHeight = Math.max(16, (item.availabilityPct / 100) * 44);

            return (
              <View key={index} style={styles.barColumn}>
                <Text style={styles.barPctText}>{item.availabilityPct}%</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: barHeight,
                        backgroundColor: isCritical
                          ? Colors.danger
                          : isHigh
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

      {/* AI Recommendation notice */}
      <View style={styles.recommendationBox}>
        <Ionicons name="bulb-outline" size={16} color={Colors.primary} />
        <View style={styles.recommendationTextGroup}>
          <Text style={styles.recommendationTitle}>Smart Recommendation</Text>
          <Text style={styles.recommendationBody}>{prediction.suggestedAction}</Text>
          <Text style={styles.reasoningText}>💡 {prediction.reasoning}</Text>
        </View>
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
  },
  aiIconBubble: {
    width: 36,
    height: 36,
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
  predictionHighlight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  highlightLeft: {
    flex: 1,
  },
  highlightLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  highlightStat: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  highlightStatSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    fontWeight: Typography.weights.regular,
  },
  trendIcon: {
    marginLeft: Spacing.sm,
  },
  trendSection: {
    marginBottom: Spacing.md,
  },
  trendTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  recommendationBox: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryMuted,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: Spacing.sm,
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
});
