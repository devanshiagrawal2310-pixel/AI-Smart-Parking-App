import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Typography } from '../../constants/theme';
import { ParkingCard } from '../../components/parking/ParkingCard';
import { QuickReserveModal } from '../../components/parking/QuickReserveModal';
import { MOCK_PARKING_SPOTS } from '../../data/mockData';
import { ParkingSpot } from '../../types/parking';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';

type FilterCategory = 'ALL' | 'HIGH_AVAIL' | 'BUDGET' | 'EV_READY' | 'COVERED' | 'CLOSE';
type SortOption = 'DISTANCE' | 'PRICE' | 'AVAILABLE';

export default function ParkingLocationsScreen() {
  const router = useRouter();
  const { createBooking } = useAuth();

  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('DISTANCE');
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Search and Filter logic
  const filteredSpots = useMemo(() => {
    return MOCK_PARKING_SPOTS.filter((spot) => {
      const q = query.toLowerCase().trim();
      const matchesText =
        !q ||
        spot.name.toLowerCase().includes(q) ||
        spot.address.toLowerCase().includes(q) ||
        spot.category.toLowerCase().includes(q);

      if (!matchesText) return false;

      switch (activeFilter) {
        case 'HIGH_AVAIL':
          return spot.availabilityStatus === 'High Availability';
        case 'BUDGET':
          return spot.hourlyRate <= 4.0;
        case 'EV_READY':
          return spot.features.evCharging;
        case 'COVERED':
          return spot.features.covered;
        case 'CLOSE':
          return parseFloat(spot.distance) <= 0.6;
        case 'ALL':
        default:
          return true;
      }
    }).sort((a, b) => {
      if (sortBy === 'PRICE') return a.hourlyRate - b.hourlyRate;
      if (sortBy === 'AVAILABLE') return b.availableSpots - a.availableSpots;
      // Default: distance
      return parseFloat(a.distance) - parseFloat(b.distance);
    });
  }, [query, activeFilter, sortBy]);

  const totalSpotsCount = useMemo(() => {
    return filteredSpots.reduce((sum, s) => sum + s.availableSpots, 0);
  }, [filteredSpots]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View>
            <Text style={styles.title}>Parking Locations</Text>
            <Text style={styles.subtitle}>Real-time bay availability and facilities</Text>
          </View>
          <Badge label="7 Hubs Active" variant="info" size="sm" />
        </View>

        {/* Search Input Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search facility name, street, or landmark..."
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Categories Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'ALL' && styles.filterPillActive]}
            onPress={() => setActiveFilter('ALL')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterPillText, activeFilter === 'ALL' && styles.filterPillTextActive]}>
              All Facilities ({MOCK_PARKING_SPOTS.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'HIGH_AVAIL' && styles.filterPillActive]}
            onPress={() => setActiveFilter('HIGH_AVAIL')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="checkmark-circle"
              size={12}
              color={activeFilter === 'HIGH_AVAIL' ? Colors.white : Colors.successDark}
            />
            <Text style={[styles.filterPillText, activeFilter === 'HIGH_AVAIL' && styles.filterPillTextActive]}>
              High Availability
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'CLOSE' && styles.filterPillActive]}
            onPress={() => setActiveFilter('CLOSE')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="navigate"
              size={12}
              color={activeFilter === 'CLOSE' ? Colors.white : Colors.textSecondary}
            />
            <Text style={[styles.filterPillText, activeFilter === 'CLOSE' && styles.filterPillTextActive]}>
              Nearest (&le;0.6 mi)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'EV_READY' && styles.filterPillActive]}
            onPress={() => setActiveFilter('EV_READY')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="flash"
              size={12}
              color={activeFilter === 'EV_READY' ? Colors.white : Colors.accentAI}
            />
            <Text style={[styles.filterPillText, activeFilter === 'EV_READY' && styles.filterPillTextActive]}>
              EV Charging
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'COVERED' && styles.filterPillActive]}
            onPress={() => setActiveFilter('COVERED')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="umbrella"
              size={12}
              color={activeFilter === 'COVERED' ? Colors.white : Colors.textSecondary}
            />
            <Text style={[styles.filterPillText, activeFilter === 'COVERED' && styles.filterPillTextActive]}>
              Covered
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'BUDGET' && styles.filterPillActive]}
            onPress={() => setActiveFilter('BUDGET')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterPillText, activeFilter === 'BUDGET' && styles.filterPillTextActive]}>
              Under $4/hr
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Sort Bar */}
        <View style={styles.sortRow}>
          <Text style={styles.countText}>
            Showing <Text style={styles.countBold}>{filteredSpots.length}</Text> locations ({totalSpotsCount} free bays)
          </Text>

          <View style={styles.sortOptions}>
            <TouchableOpacity
              onPress={() => setSortBy('DISTANCE')}
              style={[styles.sortBtn, sortBy === 'DISTANCE' && styles.sortBtnActive]}
            >
              <Text style={[styles.sortBtnText, sortBy === 'DISTANCE' && styles.sortBtnTextActive]}>
                Distance
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSortBy('PRICE')}
              style={[styles.sortBtn, sortBy === 'PRICE' && styles.sortBtnActive]}
            >
              <Text style={[styles.sortBtnText, sortBy === 'PRICE' && styles.sortBtnTextActive]}>
                Price
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSortBy('AVAILABLE')}
              style={[styles.sortBtn, sortBy === 'AVAILABLE' && styles.sortBtnActive]}
            >
              <Text style={[styles.sortBtnText, sortBy === 'AVAILABLE' && styles.sortBtnTextActive]}>
                Free Slots
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Location Cards Feed */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredSpots.map((spot) => (
          <ParkingCard
            key={spot.id}
            spot={spot}
            onPress={() => router.push(`/reserve/${spot.id}`)}
            onQuickReserve={() => {
              setSelectedSpot(spot);
              setModalOpen(true);
            }}
          />
        ))}

        {filteredSpots.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="business-outline" size={44} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Matching Parking Locations</Text>
            <Text style={styles.emptySub}>
              We couldn't find any parking facilities matching "{query}".
            </Text>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => {
                setQuery('');
                setActiveFilter('ALL');
              }}
            >
              <Text style={styles.resetBtnText}>Clear Search & Filters</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Demo Disclaimer */}
        <View style={styles.demoNoticeCard}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.demoNoticeText}>
            Local prototype demo feed: Slot counts, distances, and pricing are simulated for Phase 3 evaluation.
          </Text>
        </View>
      </ScrollView>

      {/* Quick Reserve Modal */}
      <QuickReserveModal
        visible={modalOpen}
        spot={selectedSpot}
        onClose={() => setModalOpen(false)}
        onConfirm={(hours) => {
          if (!selectedSpot) return;
          return createBooking(
            selectedSpot.id,
            selectedSpot.name,
            selectedSpot.address,
            selectedSpot.hourlyRate,
            hours
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 44,
    marginBottom: Spacing.sm,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: Colors.textPrimary,
    fontSize: Typography.sizes.sm,
  },
  filterScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: Spacing.sm,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterPillText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  filterPillTextActive: {
    color: Colors.white,
    fontWeight: Typography.weights.bold,
  },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  countText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },
  countBold: {
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  sortOptions: {
    flexDirection: 'row',
    gap: 4,
  },
  sortBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  sortBtnActive: {
    backgroundColor: Colors.primaryMuted,
  },
  sortBtnText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: Typography.weights.medium,
  },
  sortBtnTextActive: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxxl,
    backgroundColor: Colors.background,
  },
  emptyContainer: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  emptySub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  resetBtn: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
  },
  resetBtnText: {
    color: Colors.primary,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  demoNoticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    gap: 8,
  },
  demoNoticeText: {
    fontSize: 11,
    color: Colors.textMuted,
    flex: 1,
    lineHeight: 16,
  },
});
