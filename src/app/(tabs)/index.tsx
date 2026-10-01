import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Typography } from '../../constants/theme';
import { Header } from '../../components/common/Header';
import { Badge } from '../../components/common/Badge';
import { ParkingCard } from '../../components/parking/ParkingCard';
import { AiPredictionCard } from '../../components/parking/AiPredictionCard';
import { BookingCard } from '../../components/parking/BookingCard';
import { QuickReserveModal } from '../../components/parking/QuickReserveModal';
import { LocationSelectorModal } from '../../components/parking/LocationSelectorModal';
import { MOCK_AI_PREDICTION } from '../../data/mockData';
import { ParkingSpot } from '../../types/parking';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';

type FilterType = 'ALL' | 'CLOSEST' | 'EV' | 'COVERED' | 'BUDGET';

export default function HomeScreen() {
  const router = useRouter();
  const { bookings, createBooking, cancelBooking } = useAuth();
  const {
    sortedSpots,
    nearestSpot,
    locationSource,
    locationName,
    isLocating,
    requestDeviceLocation,
  } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [selectedSpotForReserve, setSelectedSpotForReserve] = useState<ParkingSpot | null>(null);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Active / Upcoming bookings for recent section
  const relevantBookings = useMemo(() => {
    return bookings.filter((b) => b.status === 'ACTIVE' || b.status === 'UPCOMING');
  }, [bookings]);

  // Filtered parking spots based on active location and proximity sorting
  const filteredSpots = useMemo(() => {
    return sortedSpots.filter((spot) => {
      // Query filter
      const matchesQuery =
        spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spot.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spot.category.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesQuery) return false;

      // Filter chips
      if (activeFilter === 'EV') return spot.features.evCharging;
      if (activeFilter === 'COVERED') return spot.features.covered;
      if (activeFilter === 'BUDGET') return spot.hourlyRate <= 40.0;
      if (activeFilter === 'CLOSEST') return (spot.distanceNumeric ?? 99) <= 0.6;

      return true;
    });
  }, [searchQuery, activeFilter, sortedSpots]);

  const totalAvailableSpots = useMemo(() => {
    return sortedSpots.reduce((acc, curr) => acc + curr.availableSpots, 0);
  }, [sortedSpots]);

  const handleOpenReserve = (spot: ParkingSpot) => {
    setSelectedSpotForReserve(spot);
    setIsReserveModalOpen(true);
  };

  const handleConfirmReservation = (hours: number) => {
    if (!selectedSpotForReserve) return;
    const newBooking = createBooking(
      selectedSpotForReserve.id,
      selectedSpotForReserve.name,
      selectedSpotForReserve.address,
      selectedSpotForReserve.hourlyRate,
      hours
    );
    return newBooking;
  };

  const handleCancelBooking = (bookingId: string) => {
    Alert.alert(
      'Cancel Reservation',
      'Are you sure you want to release this parking bay?',
      [
        { text: 'Keep Spot', style: 'cancel' },
        {
          text: 'Release Spot',
          style: 'destructive',
          onPress: () => cancelBooking(bookingId),
        },
      ]
    );
  };

  const handleViewPass = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;
    Alert.alert(
      `Gate Access Pass • ${booking.slotNumber}`,
      `QR Code: ${booking.qrAccessCode}\nPIN Code: ${booking.pinCode}\n\nShow this code or enter the 4-digit PIN at the parking entrance gate barrier.`,
      [{ text: 'Close' }]
    );
  };

  const handleLocateMe = async () => {
    const success = await requestDeviceLocation();
    if (!success) {
      Alert.alert(
        'Location Notice',
        'Device location was not accessible or permission was not granted. Using Pune demo coordinates (Demo Fallback).'
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* App Header with Location Selector Trigger */}
      <Header
        onNotificationPress={() =>
          Alert.alert(
            'Smart Notifications',
            'AI Alert: Spot availability in Downtown District will decrease by 40% after 5:30 PM due to peak commuter traffic.'
          )
        }
        onLocationPress={() => setIsLocationModalOpen(true)}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search garages, streets, landmarks..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Quick Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'ALL' && styles.filterChipActive]}
            onPress={() => setActiveFilter('ALL')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, activeFilter === 'ALL' && styles.filterChipTextActive]}>
              All ({sortedSpots.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'CLOSEST' && styles.filterChipActive]}
            onPress={() => setActiveFilter('CLOSEST')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="navigate"
              size={12}
              color={activeFilter === 'CLOSEST' ? Colors.white : Colors.textSecondary}
            />
            <Text style={[styles.filterChipText, activeFilter === 'CLOSEST' && styles.filterChipTextActive]}>
              Closest (&le;0.6 mi)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'EV' && styles.filterChipActive]}
            onPress={() => setActiveFilter('EV')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="flash"
              size={12}
              color={activeFilter === 'EV' ? Colors.white : Colors.textSecondary}
            />
            <Text style={[styles.filterChipText, activeFilter === 'EV' && styles.filterChipTextActive]}>
              EV Charging
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'COVERED' && styles.filterChipActive]}
            onPress={() => setActiveFilter('COVERED')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="umbrella"
              size={12}
              color={activeFilter === 'COVERED' ? Colors.white : Colors.textSecondary}
            />
            <Text style={[styles.filterChipText, activeFilter === 'COVERED' && styles.filterChipTextActive]}>
              Covered
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'BUDGET' && styles.filterChipActive]}
            onPress={() => setActiveFilter('BUDGET')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, activeFilter === 'BUDGET' && styles.filterChipTextActive]}>
              Under ₹40/hr
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* FEATURE: Find Nearby Parking GPS Action Card */}
        <View style={styles.nearbyGpsCard}>
          <View style={styles.nearbyGpsTop}>
            <View style={styles.nearbyGpsLeft}>
              <View style={styles.nearbyGpsIconBubble}>
                <Ionicons name="navigate-circle" size={24} color={Colors.white} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.nearbyGpsBadgeRow}>
                  <Text style={styles.nearbyGpsTitle}>Find Nearby Parking</Text>
                  <Badge
                    label={locationSource === 'device' ? 'Live GPS' : 'Demo Mode'}
                    variant={locationSource === 'device' ? 'success' : 'neutral'}
                    size="sm"
                  />
                </View>
                <Text style={styles.nearbyGpsLocationText} numberOfLines={1}>
                  📍 {locationName}
                </Text>
              </View>
            </View>
          </View>

          {/* Quick nearest recommendation */}
          <View style={styles.nearestSpotPreview}>
            <Ionicons name="sparkles" size={14} color={Colors.primary} />
            <Text style={styles.nearestSpotPreviewText}>
              Nearest Spot: <Text style={styles.boldText}>{nearestSpot.name}</Text> •{' '}
              <Text style={styles.highlightDistance}>{nearestSpot.distance}</Text> ({nearestSpot.walkingTime})
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.nearbyGpsActions}>
            <TouchableOpacity
              style={[styles.locateMeBtn, isLocating && styles.locateMeBtnDisabled]}
              onPress={handleLocateMe}
              disabled={isLocating}
              activeOpacity={0.8}
            >
              {isLocating ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Ionicons name="locate" size={15} color={Colors.white} />
              )}
              <Text style={styles.locateMeBtnText}>
                {isLocating ? 'Locating...' : 'Locate with GPS'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchHubBtn}
              onPress={() => setIsLocationModalOpen(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="swap-horizontal" size={15} color={Colors.primaryDark} />
              <Text style={styles.switchHubBtnText}>Change Hub</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Live Status Metric Bar */}
        <View style={styles.metricsBar}>
          <TouchableOpacity
            style={styles.metricItem}
            onPress={() => router.push('/(tabs)/search')}
            activeOpacity={0.7}
          >
            <Text style={styles.metricValue}>{totalAvailableSpots}</Text>
            <Text style={styles.metricLabel}>Total Free Spots ➔</Text>
          </TouchableOpacity>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>₹49</Text>
            <Text style={styles.metricLabel}>Avg. Hourly Rate</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricValueAI}>92%</Text>
            <Text style={styles.metricLabel}>AI Match Rate</Text>
          </View>
        </View>

        {/* Section: Recent / Upcoming Bookings */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="time" size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Your Bookings & Gate Passes</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/bookings')}>
            <Text style={styles.seeAllText}>View All ({bookings.length})</Text>
          </TouchableOpacity>
        </View>

        {relevantBookings.length > 0 ? (
          relevantBookings.slice(0, 2).map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onPress={() => handleViewPass(booking.id)}
              onViewPass={() => handleViewPass(booking.id)}
              onCancel={() => handleCancelBooking(booking.id)}
            />
          ))
        ) : (
          <View style={styles.emptyBookingsCard}>
            <Ionicons name="car-outline" size={24} color={Colors.textMuted} />
            <Text style={styles.emptyBookingsText}>No active or upcoming reservations.</Text>
            <Text style={styles.emptyBookingsSub}>Select any parking bay below to reserve a spot instantly.</Text>
          </View>
        )}

        {/* Section: AI Parking Prediction Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="hardware-chip" size={18} color={Colors.accentAI} />
            <Text style={styles.sectionTitle}>AI Parking Prediction</Text>
          </View>
          <Badge label="Prototype Model" variant="ai" size="sm" />
        </View>

        {/* AI Prediction Component with Current vs Predicted & Best Time to Park */}
        <AiPredictionCard prediction={MOCK_AI_PREDICTION} />

        {/* Section: Nearby Parking Facilities (Sorted by Proximity) */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="business" size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Nearby Parking Locations</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/search')}
            activeOpacity={0.7}
          >
            <Text style={styles.seeAllText}>View All ({sortedSpots.length}) ➔</Text>
          </TouchableOpacity>
        </View>

        {filteredSpots.map((spot) => (
          <ParkingCard
            key={spot.id}
            spot={spot}
            isNearest={spot.id === nearestSpot.id}
            onPress={() => router.push(`/reserve/${spot.id}`)}
            onQuickReserve={() => handleOpenReserve(spot)}
          />
        ))}

        {filteredSpots.length === 0 ? (
          <View style={styles.noResultsBox}>
            <Ionicons name="search" size={32} color={Colors.textMuted} />
            <Text style={styles.noResultsTitle}>No parking facilities match your search</Text>
            <Text style={styles.noResultsSub}>Try resetting your search query or filter tags.</Text>
            <TouchableOpacity
              style={styles.resetFilterBtn}
              onPress={() => {
                setSearchQuery('');
                setActiveFilter('ALL');
              }}
            >
              <Text style={styles.resetFilterText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Prototype Environment Disclaimer */}
        <View style={styles.demoDisclaimerBox}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
          <Text style={styles.demoDisclaimerText}>
            Simulated Demo Mode: Real IoT barrier gates, optical camera detection, live GPS telemetry, and payment processing will be integrated in future phases.
          </Text>
        </View>
      </ScrollView>

      {/* Quick Reserve Modal */}
      <QuickReserveModal
        visible={isReserveModalOpen}
        spot={selectedSpotForReserve}
        onClose={() => setIsReserveModalOpen(false)}
        onConfirm={handleConfirmReservation}
      />

      {/* Location / GPS Selector Modal */}
      <LocationSelectorModal
        visible={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxxl,
    backgroundColor: Colors.background,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 46,
    marginBottom: Spacing.sm + 2,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
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
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
    marginBottom: Spacing.md,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  filterChipTextActive: {
    color: Colors.white,
    fontWeight: Typography.weights.bold,
  },
  nearbyGpsCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  nearbyGpsTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nearbyGpsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
  },
  nearbyGpsIconBubble: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nearbyGpsBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nearbyGpsTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  nearbyGpsLocationText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  nearestSpotPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryMuted,
    paddingVertical: 6,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
    gap: 6,
  },
  nearestSpotPreviewText: {
    fontSize: 11,
    color: Colors.primaryDark,
    flex: 1,
  },
  boldText: {
    fontWeight: Typography.weights.bold,
  },
  highlightDistance: {
    fontWeight: Typography.weights.bold,
    color: Colors.successDark,
  },
  nearbyGpsActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm + 2,
  },
  locateMeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    gap: 5,
  },
  locateMeBtnDisabled: {
    opacity: 0.7,
  },
  locateMeBtnText: {
    color: Colors.white,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
  },
  switchHubBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  switchHubBtnText: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
  },
  metricsBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    justifyContent: 'space-around',
    marginBottom: Spacing.lg,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  metricValueAI: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.accentAI,
  },
  metricLabel: {
    fontSize: Typography.sizes.xs - 1,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  metricDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm + 2,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  seeAllText: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
  },
  emptyBookingsCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyBookingsText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginTop: 6,
  },
  emptyBookingsSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  noResultsBox: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: Spacing.md,
  },
  noResultsTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  noResultsSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  resetFilterBtn: {
    marginTop: Spacing.md,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: Colors.primaryMuted,
    borderRadius: BorderRadius.sm,
  },
  resetFilterText: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
  },
  demoDisclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surfaceSubtle,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
    gap: 8,
  },
  demoDisclaimerText: {
    fontSize: 11,
    color: Colors.textMuted,
    flex: 1,
    lineHeight: 16,
  },
});
