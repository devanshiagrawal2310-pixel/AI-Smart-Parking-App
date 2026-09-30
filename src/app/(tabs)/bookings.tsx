import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Typography } from '../../constants/theme';
import { BookingCard } from '../../components/parking/BookingCard';
import { BookingDetailModal } from '../../components/parking/BookingDetailModal';
import { useAuth } from '../../context/AuthContext';
import { Booking } from '../../types/parking';
import { Badge } from '../../components/common/Badge';

type BookingTab = 'ALL' | 'UPCOMING' | 'PAST' | 'CANCELLED';

export default function BookingHistoryScreen() {
  const router = useRouter();
  const { bookings, walletBalance, cancelBooking } = useAuth();
  const [activeTab, setActiveTab] = useState<BookingTab>('ALL');
  const [selectedBookingForDetail, setSelectedBookingForDetail] = useState<Booking | null>(null);

  // Filter bookings based on active tab
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (activeTab === 'UPCOMING') return b.status === 'ACTIVE' || b.status === 'UPCOMING';
      if (activeTab === 'PAST') return b.status === 'COMPLETED';
      if (activeTab === 'CANCELLED') return b.status === 'CANCELLED';
      return true;
    });
  }, [bookings, activeTab]);

  const totalSpent = useMemo(() => {
    return bookings
      .filter((b) => b.paymentStatus === 'PAID')
      .reduce((sum, b) => sum + b.totalCost, 0);
  }, [bookings]);

  const activeCount = useMemo(() => {
    return bookings.filter((b) => b.status === 'ACTIVE' || b.status === 'UPCOMING').length;
  }, [bookings]);

  const pastCount = useMemo(() => {
    return bookings.filter((b) => b.status === 'COMPLETED').length;
  }, [bookings]);

  const handleCancel = (bookingId: string) => {
    Alert.alert('Cancel Reservation', 'Do you want to release this parking bay?', [
      { text: 'Keep Spot', style: 'cancel' },
      { text: 'Release Spot', style: 'destructive', onPress: () => cancelBooking(bookingId) },
    ]);
  };

  const handlePass = (id: string) => {
    const booking = bookings.find((b) => b.id === id);
    if (!booking) return;
    Alert.alert(
      `Gate Access Pass • Bay ${booking.slotNumber}`,
      `QR Code: ${booking.qrAccessCode}\nPIN Code: ${booking.pinCode}\n\nPresent this pass at the gate barrier or punch the 4-digit PIN into the keypad.`,
      [{ text: 'Close' }]
    );
  };

  const handlePayNow = (bookingId: string) => {
    router.push({
      pathname: '/booking/payment',
      params: { bookingId },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View>
            <Text style={styles.title}>Booking History</Text>
            <Text style={styles.subtitle}>Reserved bays, digital receipts & gate passes</Text>
          </View>
          <Badge label="Local Demo Storage" variant="info" size="sm" />
        </View>

        {/* History Quick Metrics */}
        <View style={styles.metricsBar}>
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>{bookings.length}</Text>
            <Text style={styles.metricLabel}>Total Sessions</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>${totalSpent.toFixed(2)}</Text>
            <Text style={styles.metricLabel}>Total Paid (Demo)</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricValWallet}>${walletBalance.toFixed(2)}</Text>
            <Text style={styles.metricLabel}>Wallet Balance</Text>
          </View>
        </View>
      </View>

      {/* Tabs Row */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'ALL' && styles.tabButtonActive]}
          onPress={() => setActiveTab('ALL')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'ALL' && styles.tabTextActive]}>
            All ({bookings.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'UPCOMING' && styles.tabButtonActive]}
          onPress={() => setActiveTab('UPCOMING')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'UPCOMING' && styles.tabTextActive]}>
            Upcoming & Active ({activeCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'PAST' && styles.tabButtonActive]}
          onPress={() => setActiveTab('PAST')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'PAST' && styles.tabTextActive]}>
            Past ({pastCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'CANCELLED' && styles.tabButtonActive]}
          onPress={() => setActiveTab('CANCELLED')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'CANCELLED' && styles.tabTextActive]}>
            Cancelled
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredBookings.length > 0 ? (
          filteredBookings.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              onPress={() => setSelectedBookingForDetail(b)}
              onViewPass={() => handlePass(b.id)}
              onCancel={() => handleCancel(b.id)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Bookings Found</Text>
            <Text style={styles.emptySubtitle}>
              {`You don't have any ${activeTab.toLowerCase()} parking sessions in local history.`}
            </Text>
            <TouchableOpacity
              style={styles.browseSpotsBtn}
              onPress={() => router.push('/(tabs)/search')}
              activeOpacity={0.8}
            >
              <Text style={styles.browseSpotsText}>Find Nearby Parking Spots</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Prototype Storage Notice */}
        <View style={styles.historyNotice}>
          <Ionicons name="information-circle-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.historyNoticeText}>
            Prototype Environment: All transactions and reservations are maintained in application state for prototype testing. No bank or gateway accounts are charged.
          </Text>
        </View>
      </ScrollView>

      {/* Full Booking Details Modal */}
      <BookingDetailModal
        visible={!!selectedBookingForDetail}
        booking={selectedBookingForDetail}
        onClose={() => setSelectedBookingForDetail(null)}
        onCancelBooking={handleCancel}
        onPayNow={handlePayNow}
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
    paddingBottom: Spacing.xs,
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
  metricsBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.sm,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.xs,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricVal: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  metricValWallet: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.accentAI,
  },
  metricLabel: {
    fontSize: 9,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  tabButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSubtle,
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 11,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.white,
    fontWeight: Typography.weights.bold,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxxl,
    backgroundColor: Colors.background,
    flexGrow: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 240,
  },
  browseSpotsBtn: {
    backgroundColor: Colors.primaryMuted,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  browseSpotsText: {
    color: Colors.primary,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  historyNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surfaceSubtle,
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
    gap: 6,
  },
  historyNoticeText: {
    fontSize: 10,
    color: Colors.textMuted,
    flex: 1,
    lineHeight: 14,
  },
});
