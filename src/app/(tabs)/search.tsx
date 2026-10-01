import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Typography } from '../../constants/theme';
import { ParkingCard } from '../../components/parking/ParkingCard';
import { QuickReserveModal } from '../../components/parking/QuickReserveModal';
import { LocationSelectorModal } from '../../components/parking/LocationSelectorModal';
import { ParkingSpot } from '../../types/parking';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { Badge } from '../../components/common/Badge';

type FilterCategory = 'ALL' | 'HIGH_AVAIL' | 'BUDGET' | 'EV_READY' | 'COVERED' | 'CLOSE';
type SortOption = 'DISTANCE' | 'PRICE' | 'AVAILABLE';

export default function ParkingLocationsScreen() {
  const router = useRouter();
  const { createBooking } = useAuth();
  const {
    sortedSpots,
    nearestSpot,
    locationSource,
    locationName,
    isLocating,
    requestDeviceLocation,
  } = useLocation();

  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('DISTANCE');
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  // Search, Filter, and Sort logic using dynamically enriched sortedSpots from LocationContext
  const filteredSpots = useMemo(() => {
    return sortedSpots
      .filter((spot) => {
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
            return spot.hourlyRate <= 40.0;
          case 'EV_READY':
            return spot.features.evCharging;
          case 'COVERED':
            return spot.features.covered;
          case 'CLOSE':
            return (spot.distanceNumeric ?? 99) <= 0.6;
          case 'ALL':
          default:
            return true;
        }
      })
      .sort((a, b) => {
        if (sortBy === 'PRICE') return a.hourlyRate - b.hourlyRate;
        if (sortBy === 'AVAILABLE') return b.availableSpots - a.availableSpots;
        // Default: distance from active coordinates
        return (a.distanceNumeric ?? 0) - (b.distanceNumeric ?? 0);
      });
  }, [sortedSpots, query, activeFilter, sortBy]);

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
            <Text style={styles.subtitle}>Sorted by proximity to your current location</Text>
          </View>
          <Badge label={`${sortedSpots.length} Hubs`} variant="info" size="sm" />
        </View>

        {/* GPS Reference Bar */}
        <View style={styles.gpsBar}>
          <View style={styles.gpsBarLeft}>
            <Ionicons
              name={locationSource === 'device' ? 'navigate' : 'map'}
              size={14}
              color={locationSource === 'device' ? Colors.successDark : Colors.primary}
            />
            <Text style={styles.gpsBarText} numberOfLines={1}>
              {locationName}
            </Text>
            <Badge
              label={locationSource === 'device' ? 'Live GPS' : 'Demo Fallback'}
              variant={locationSource === 'device' ? 'success' : 'neutral'}
              size="sm"
            />
          </View>

          <View style={styles.gpsBarActions}>
            <TouchableOpacity
              style={styles.gpsSmallBtn}
              onPress={() => requestDeviceLocation()}
              disabled={isLocating}
            >
              {isLocating ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Ionicons name="locate" size={13} color={Colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.changeHubBtn}
              onPress={() => setLocationModalOpen(true)}
            >
              <Text style={styles.changeHubText}>Change</Text>
            </TouchableOpacity>
          </View>
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
              All ({sortedSpots.length})
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
              Under ₹40/hr
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
            isNearest={spot.id === nearestSpot.id}
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
              {`We couldn't find any parking facilities matching "${query}".`}
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
            Local prototype demo feed: Distances, walking times, and slot predictions are dynamically calculated from your active reference point.
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

      {/* Location / GPS Selector Modal */}
      <LocationSelectorModal
        visible={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
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
    marginBottom: Spacing.xs,
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
  gpsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceSubtle,
    paddingVertical: 6,
    paddingHorizontal: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  gpsBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  gpsBarText: {
    fontSize: 11,
    color: Colors.textPrimary,
    fontWeight: Typography.weights.medium,
    maxWidth: 160,
  },
  gpsBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gpsSmallBtn: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  changeHubBtn: {
    backgroundColor: Colors.white,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  changeHubText: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
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
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
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
    paddingVertical: Spacing.sm,
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
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.sm,
    padding: 2,
    gap: 2,
  },
  sortBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
  },
  sortBtnActive: {
    backgroundColor: Colors.white,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sortBtnText: {
    fontSize: Typography.sizes.xs - 1,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  sortBtnTextActive: {
    color: Colors.primaryDark,
    fontWeight: Typography.weights.bold,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    backgroundColor: Colors.background,
  },
  emptyContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xxl,
    alignItems: 'center',
    marginVertical: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  emptySub: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.lg,
  },
  resetBtn: {
    backgroundColor: Colors.primaryMuted,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  resetBtnText: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.sm,
  },
  demoNoticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surfaceSubtle,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  demoNoticeText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
});
