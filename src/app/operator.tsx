import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Typography } from '../constants/theme';
import { Badge } from '../components/common/Badge';
import { MOCK_PARKING_SPOTS, generateMockSlots } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { ParkingSlot } from '../types/parking';

export default function ParkingManagementScreen() {
  const { bookings } = useAuth();

  // Facility selection for operator view
  const [selectedSpotId, setSelectedSpotId] = useState(MOCK_PARKING_SPOTS[0].id);
  const currentSpot = MOCK_PARKING_SPOTS.find((s) => s.id === selectedSpotId) || MOCK_PARKING_SPOTS[0];

  // Local state for slots of the selected facility so operator can toggle/view
  const [facilitySlots, setFacilitySlots] = useState<{ [spotId: string]: ParkingSlot[] }>({
    [selectedSpotId]: currentSpot.slots || generateMockSlots(selectedSpotId),
  });

  const activeSlots = useMemo(() => {
    return facilitySlots[selectedSpotId] || currentSpot.slots || generateMockSlots(selectedSpotId);
  }, [facilitySlots, selectedSpotId, currentSpot]);

  // Metrics computation
  const totalSlotsCount = activeSlots.length;
  const occupiedSlotsCount = activeSlots.filter((s) => s.status === 'OCCUPIED').length;
  const availableSlotsCount = activeSlots.filter((s) => s.status === 'AVAILABLE').length;

  // Today's bookings count & estimated revenue from local demo bookings
  const todaysBookings = useMemo(() => {
    return bookings.filter(
      (b) =>
        b.date?.toLowerCase().includes('today') ||
        b.startTime?.toLowerCase().includes('today') ||
        b.status === 'ACTIVE'
    );
  }, [bookings]);

  const todaysBookingsCount = todaysBookings.length > 0 ? todaysBookings.length : 3;

  const todaysRevenue = useMemo(() => {
    const rev = todaysBookings.reduce((sum, b) => sum + (b.totalCost || 0), 0);
    return rev > 0 ? rev : 420.0;
  }, [todaysBookings]);

  // Filter for slot list: ALL, AVAILABLE, OCCUPIED
  const [slotFilter, setSlotFilter] = useState<'ALL' | 'AVAILABLE' | 'OCCUPIED'>('ALL');

  const filteredSlotsList = useMemo(() => {
    if (slotFilter === 'AVAILABLE') return activeSlots.filter((s) => s.status === 'AVAILABLE');
    if (slotFilter === 'OCCUPIED') return activeSlots.filter((s) => s.status === 'OCCUPIED');
    return activeSlots;
  }, [activeSlots, slotFilter]);

  // Quick toggle slot status (simulation)
  const toggleSlotStatus = (slotId: string) => {
    setFacilitySlots((prev) => {
      const current = prev[selectedSpotId] || [];
      const updated = current.map((slot) => {
        if (slot.id === slotId) {
          const nextStatus = slot.status === 'AVAILABLE' ? 'OCCUPIED' : 'AVAILABLE';
          return { ...slot, status: nextStatus as 'AVAILABLE' | 'OCCUPIED' };
        }
        return slot;
      });
      return { ...prev, [selectedSpotId]: updated };
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Prototype Demo Banner */}
        <View style={styles.demoBanner}>
          <Ionicons name="hardware-chip-outline" size={18} color="#D97706" />
          <View style={{ flex: 1 }}>
            <Text style={styles.demoBannerTitle}>OPERATOR DEMO • PARKING MANAGEMENT</Text>
            <Text style={styles.demoBannerSub}>
              College prototype dashboard for facility managers to inspect real-time bay telemetry, occupancy, and revenue.
            </Text>
          </View>
        </View>

        {/* Facility Selector */}
        <Text style={styles.sectionTitle}>Select Facility</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.facilitySelectorRow}
        >
          {MOCK_PARKING_SPOTS.map((spot) => {
            const isSelected = spot.id === selectedSpotId;
            return (
              <TouchableOpacity
                key={spot.id}
                style={[styles.facilityChip, isSelected && styles.facilityChipActive]}
                onPress={() => setSelectedSpotId(spot.id)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="business"
                  size={14}
                  color={isSelected ? Colors.white : Colors.textSecondary}
                />
                <Text
                  style={[styles.facilityChipText, isSelected && styles.facilityChipTextActive]}
                  numberOfLines={1}
                >
                  {spot.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 1. Key Metrics Cards */}
        <Text style={styles.sectionTitle}>Facility Overview</Text>
        <View style={styles.metricsGrid}>
          {/* Total Slots */}
          <View style={styles.metricCard}>
            <View style={styles.metricIconBox}>
              <Ionicons name="grid-outline" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.metricNumber}>{totalSlotsCount}</Text>
            <Text style={styles.metricLabel}>Total Slots</Text>
          </View>

          {/* Occupied Slots */}
          <View style={styles.metricCard}>
            <View style={[styles.metricIconBox, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="car" size={18} color={Colors.danger} />
            </View>
            <Text style={[styles.metricNumber, { color: Colors.danger }]}>
              {occupiedSlotsCount}
            </Text>
            <Text style={styles.metricLabel}>Occupied Slots</Text>
          </View>

          {/* Available Slots */}
          <View style={styles.metricCard}>
            <View style={[styles.metricIconBox, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.successDark} />
            </View>
            <Text style={[styles.metricNumber, { color: Colors.successDark }]}>
              {availableSlotsCount}
            </Text>
            <Text style={styles.metricLabel}>Available Slots</Text>
          </View>

          {/* Today's Bookings */}
          <View style={styles.metricCard}>
            <View style={[styles.metricIconBox, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="receipt-outline" size={18} color={Colors.accentAI} />
            </View>
            <Text style={[styles.metricNumber, { color: Colors.accentAI }]}>
              {todaysBookingsCount}
            </Text>
            <Text style={styles.metricLabel}>{"Today's Bookings"}</Text>
          </View>

          {/* Today's Estimated Revenue (Full Width) */}
          <View style={[styles.metricCard, styles.metricCardRevenue]}>
            <View style={styles.revenueRow}>
              <View>
                <Text style={styles.revenueLabel}>{"Today's Estimated Revenue"}</Text>
                <Text style={styles.revenueValue}>₹{todaysRevenue.toFixed(2)}</Text>
              </View>
              <View style={[styles.metricIconBox, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="cash-outline" size={24} color="#D97706" />
              </View>
            </View>
            <Text style={styles.revenueNote}>
              Based on active sessions & hourly rate (₹{currentSpot.hourlyRate.toFixed(2)}/hr)
            </Text>
          </View>
        </View>

        {/* 2. Slot Management List */}
        <View style={styles.slotListHeaderRow}>
          <Text style={styles.sectionTitle}>Parking Slots ({filteredSlotsList.length})</Text>
          <View style={styles.slotFilterRow}>
            <TouchableOpacity
              style={[styles.filterPill, slotFilter === 'ALL' && styles.filterPillActive]}
              onPress={() => setSlotFilter('ALL')}
            >
              <Text style={[styles.filterPillText, slotFilter === 'ALL' && styles.filterPillTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterPill, slotFilter === 'AVAILABLE' && styles.filterPillActive]}
              onPress={() => setSlotFilter('AVAILABLE')}
            >
              <Text style={[styles.filterPillText, slotFilter === 'AVAILABLE' && styles.filterPillTextActive]}>
                Available
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterPill, slotFilter === 'OCCUPIED' && styles.filterPillActive]}
              onPress={() => setSlotFilter('OCCUPIED')}
            >
              <Text style={[styles.filterPillText, slotFilter === 'OCCUPIED' && styles.filterPillTextActive]}>
                Occupied
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* List of Parking Slots */}
        <View style={styles.slotsCard}>
          {filteredSlotsList.map((slot) => {
            const isAvailable = slot.status === 'AVAILABLE';
            return (
              <TouchableOpacity
                key={slot.id}
                style={styles.slotRow}
                onPress={() => toggleSlotStatus(slot.id)}
                activeOpacity={0.7}
              >
                <View style={styles.slotLeftCol}>
                  <View style={[styles.slotBadge, isAvailable ? styles.slotBadgeAvail : styles.slotBadgeOcc]}>
                    <Text style={[styles.slotBadgeText, isAvailable ? styles.slotBadgeTextAvail : styles.slotBadgeTextOcc]}>
                      {slot.slotNumber}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.slotFloorText}>{slot.floor || 'Level 1'}</Text>
                    <Text style={styles.slotTypeText}>{slot.type || 'STANDARD'}</Text>
                  </View>
                </View>

                <View style={styles.slotRightCol}>
                  <Badge
                    label={isAvailable ? 'Available' : 'Occupied'}
                    variant={isAvailable ? 'success' : 'neutral'}
                    size="sm"
                  />
                  <Text style={styles.toggleHint}>Tap to toggle</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
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
    paddingBottom: Spacing.xxxl,
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#FCD34D',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  demoBannerTitle: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: '#92400E',
    letterSpacing: 0.5,
  },
  demoBannerSub: {
    fontSize: Typography.sizes.xs,
    color: '#B45309',
    marginTop: 2,
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  facilitySelectorRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  facilityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  facilityChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  facilityChipText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
  },
  facilityChipTextActive: {
    color: Colors.white,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  metricCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'flex-start',
  },
  metricIconBox: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  metricNumber: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  metricLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  metricCardRevenue: {
    minWidth: '100%',
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  revenueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  revenueLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    color: '#92400E',
  },
  revenueValue: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: '#B45309',
    marginTop: 2,
  },
  revenueNote: {
    fontSize: 10,
    color: '#D97706',
    marginTop: 6,
  },
  slotListHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  slotFilterRow: {
    flexDirection: 'row',
    gap: 4,
  },
  filterPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterPillText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  filterPillTextActive: {
    color: Colors.white,
  },
  slotsCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  slotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  slotLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  slotBadge: {
    width: 44,
    height: 34,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotBadgeAvail: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  slotBadgeOcc: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  slotBadgeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  slotBadgeTextAvail: {
    color: Colors.successDark,
  },
  slotBadgeTextOcc: {
    color: Colors.textSecondary,
  },
  slotFloorText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
  },
  slotTypeText: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  slotRightCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  toggleHint: {
    fontSize: 9,
    color: Colors.textMuted,
  },
});
