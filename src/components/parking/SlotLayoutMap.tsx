import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ParkingSlot } from '../../types/parking';
import { Colors, BorderRadius, Spacing, Typography } from '../../constants/theme';
import { Badge } from '../common/Badge';

interface SlotLayoutMapProps {
  slots: ParkingSlot[];
  selectedSlotId: string | null;
  onSelectSlot: (slot: ParkingSlot) => void;
  hourlyRate: number;
}

export const SlotLayoutMap: React.FC<SlotLayoutMapProps> = ({
  slots,
  selectedSlotId,
  onSelectSlot,
  hourlyRate,
}) => {
  // Discover available floors
  const floors = Array.from(new Set(slots.map((s) => s.floor)));
  const [activeFloor, setActiveFloor] = useState(floors[0] || 'Level 1 (Ground)');

  const floorSlots = slots.filter((s) => s.floor === activeFloor);
  const leftColumnSlots = floorSlots.filter((_, idx) => idx % 2 === 0);
  const rightColumnSlots = floorSlots.filter((_, idx) => idx % 2 === 1);

  const selectedSlot = slots.find((s) => s.id === selectedSlotId);

  const getSlotTypeBadge = (type: ParkingSlot['type']) => {
    switch (type) {
      case 'EV_CHARGING':
        return <Ionicons name="flash" size={10} color={Colors.accentAI} />;
      case 'ACCESSIBLE':
        return <Ionicons name="accessibility" size={10} color={Colors.secondary} />;
      case 'COMPACT':
        return <Text style={styles.compactIndicator}>C</Text>;
      default:
        return null;
    }
  };

  const renderSlotBay = (slot: ParkingSlot) => {
    const isSelected = slot.id === selectedSlotId;
    const isOccupied = slot.status === 'OCCUPIED';
    const isAvailable = slot.status === 'AVAILABLE';

    return (
      <TouchableOpacity
        key={slot.id}
        style={[
          styles.slotBay,
          isAvailable && styles.slotBayAvailable,
          isOccupied && styles.slotBayOccupied,
          isSelected && styles.slotBaySelected,
        ]}
        disabled={isOccupied}
        onPress={() => onSelectSlot(slot)}
        activeOpacity={0.7}
      >
        {/* Top tag / type icon */}
        <View style={styles.slotTopRow}>
          <Text
            style={[
              styles.slotNumberText,
              isOccupied && styles.slotTextOccupied,
              isSelected && styles.slotTextSelected,
            ]}
          >
            {slot.slotNumber}
          </Text>
          {getSlotTypeBadge(slot.type)}
        </View>

        {/* Visual Content: Car icon if occupied, checkmark if selected, or available bay lines */}
        <View style={styles.slotCenterGraphic}>
          {isOccupied ? (
            <View style={styles.occupiedCarGraphic}>
              <Ionicons name="car-sport" size={20} color={Colors.textMuted} />
              <Text style={styles.occupiedText}>PARKED</Text>
            </View>
          ) : isSelected ? (
            <View style={styles.selectedCheckWrap}>
              <Ionicons name="checkmark-circle" size={22} color={Colors.white} />
              <Text style={styles.selectedText}>YOUR SLOT</Text>
            </View>
          ) : (
            <View style={styles.availableBayOutline}>
              <Ionicons name="chevron-forward-circle-outline" size={16} color={Colors.success} />
              <Text style={styles.availableText}>FREE</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Floor Selector Tabs */}
      <View style={styles.floorTabsRow}>
        {floors.map((floor) => {
          const isActive = floor === activeFloor;
          const count = slots.filter((s) => s.floor === floor && s.status === 'AVAILABLE').length;

          return (
            <TouchableOpacity
              key={floor}
              style={[styles.floorTab, isActive && styles.floorTabActive]}
              onPress={() => setActiveFloor(floor)}
              activeOpacity={0.7}
            >
              <Text style={[styles.floorTabText, isActive && styles.floorTabTextActive]}>
                {floor}
              </Text>
              <View style={[styles.floorBadge, isActive && styles.floorBadgeActive]}>
                <Text style={[styles.floorBadgeText, isActive && styles.floorBadgeTextActive]}>
                  {count} Free
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend & Instructions */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColorBox, { backgroundColor: Colors.successLight, borderColor: Colors.success }]} />
          <Text style={styles.legendLabel}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColorBox, { backgroundColor: '#E2E8F0', borderColor: '#CBD5E1' }]} />
          <Text style={styles.legendLabel}>Occupied</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColorBox, { backgroundColor: Colors.primary, borderColor: Colors.primaryDark }]} />
          <Text style={styles.legendLabel}>Selected</Text>
        </View>
        <View style={styles.legendItem}>
          <Ionicons name="flash" size={12} color={Colors.accentAI} />
          <Text style={styles.legendLabel}>EV Ready</Text>
        </View>
      </View>

      {/* Driveway Entrance Marker */}
      <View style={styles.entranceMarker}>
        <Ionicons name="arrow-down" size={14} color={Colors.primary} />
        <Text style={styles.entranceText}>GATE ENTRANCE ──► MAIN CORRIDOR</Text>
        <Ionicons name="arrow-down" size={14} color={Colors.primary} />
      </View>

      {/* Two-Column Parking Lot Grid with Central Driveway */}
      <View style={styles.parkingDeckLayout}>
        {/* Left Column of Bays */}
        <View style={styles.baysColumn}>
          {leftColumnSlots.map(renderSlotBay)}
        </View>

        {/* Central Driveway */}
        <View style={styles.centralDriveway}>
          <View style={styles.laneDirectionHeader}>
            <Ionicons name="arrow-up" size={14} color="#64748B" />
            <Text style={styles.laneText}>ONE WAY</Text>
          </View>

          <View style={styles.dashedDivider} />

          <View style={styles.drivewayCenterBadge}>
            <Ionicons name="car" size={14} color="#94A3B8" />
            <Text style={styles.drivewayBadgeText}>LANE</Text>
          </View>

          <View style={styles.dashedDivider} />

          <View style={styles.laneDirectionFooter}>
            <Ionicons name="arrow-down" size={14} color="#64748B" />
            <Text style={styles.laneText}>EXIT ──►</Text>
          </View>
        </View>

        {/* Right Column of Bays */}
        <View style={styles.baysColumn}>
          {rightColumnSlots.map(renderSlotBay)}
        </View>
      </View>

      {/* Selected Slot Information Sheet/Card */}
      {selectedSlot ? (
        <View style={styles.selectionPreviewCard}>
          <View style={styles.selectionIconWrap}>
            <Ionicons name="checkmark-done-circle" size={24} color={Colors.primary} />
          </View>
          <View style={styles.selectionTextCol}>
            <View style={styles.selectionTitleRow}>
              <Text style={styles.selectionTitle}>Slot {selectedSlot.slotNumber}</Text>
              <Badge
                label={selectedSlot.type.replace('_', ' ')}
                variant={selectedSlot.type === 'EV_CHARGING' ? 'ai' : 'info'}
                size="sm"
              />
            </View>
            <Text style={styles.selectionFloor}>{selectedSlot.floor} • Guaranteed Clean Bay</Text>
          </View>
          <View style={styles.selectionRateCol}>
            <Text style={styles.selectionRate}>₹{hourlyRate.toFixed(2)}</Text>
            <Text style={styles.selectionRateUnit}>/hr</Text>
          </View>
        </View>
      ) : (
        <View style={styles.tapToSelectHint}>
          <Ionicons name="finger-print-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.tapToSelectText}>
            Tap any green <Text style={styles.boldText}>FREE</Text> bay above to assign your vehicle.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: Spacing.md,
  },
  floorTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  floorTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  floorTabActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  floorTabText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
  },
  floorTabTextActive: {
    color: Colors.primary,
  },
  floorBadge: {
    backgroundColor: Colors.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  floorBadgeActive: {
    backgroundColor: Colors.primaryLight,
  },
  floorBadgeText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.bold,
  },
  floorBadgeTextActive: {
    color: Colors.white,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendColorBox: {
    width: 12,
    height: 12,
    borderRadius: 3,
    borderWidth: 1,
  },
  legendLabel: {
    fontSize: Typography.sizes.xs - 1,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  entranceMarker: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: BorderRadius.sm,
    gap: 6,
    marginBottom: Spacing.sm,
  },
  entranceText: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    color: '#166534',
    letterSpacing: 0.5,
  },
  parkingDeckLayout: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  baysColumn: {
    flex: 1,
    gap: 8,
  },
  centralDriveway: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  laneDirectionHeader: {
    alignItems: 'center',
  },
  laneDirectionFooter: {
    alignItems: 'center',
  },
  laneText: {
    fontSize: 8,
    fontWeight: Typography.weights.bold,
    color: '#64748B',
  },
  dashedDivider: {
    width: 2,
    flex: 1,
    backgroundColor: '#CBD5E1',
    marginVertical: 4,
  },
  drivewayCenterBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: 4,
    alignItems: 'center',
  },
  drivewayBadgeText: {
    fontSize: 7,
    fontWeight: Typography.weights.bold,
    color: '#475569',
  },
  slotBay: {
    height: 56,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 4,
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
  },
  slotBayAvailable: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  slotBayOccupied: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  slotBaySelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  slotTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotNumberText: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  slotTextOccupied: {
    color: '#94A3B8',
  },
  slotTextSelected: {
    color: Colors.white,
  },
  compactIndicator: {
    fontSize: 9,
    fontWeight: Typography.weights.bold,
    color: Colors.textMuted,
  },
  slotCenterGraphic: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  occupiedCarGraphic: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  occupiedText: {
    fontSize: 8,
    fontWeight: Typography.weights.bold,
    color: '#94A3B8',
  },
  selectedCheckWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  selectedText: {
    fontSize: 8,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
  },
  availableBayOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  availableText: {
    fontSize: 8,
    fontWeight: Typography.weights.bold,
    color: Colors.successDark,
  },
  selectionPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  selectionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionTextCol: {
    flex: 1,
  },
  selectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectionTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
  },
  selectionFloor: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  selectionRateCol: {
    alignItems: 'flex-end',
  },
  selectionRate: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
  },
  selectionRateUnit: {
    fontSize: Typography.sizes.xs - 1,
    color: Colors.textSecondary,
  },
  tapToSelectHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginTop: Spacing.md,
    gap: 6,
  },
  tapToSelectText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },
  boldText: {
    fontWeight: Typography.weights.bold,
    color: Colors.successDark,
  },
});
