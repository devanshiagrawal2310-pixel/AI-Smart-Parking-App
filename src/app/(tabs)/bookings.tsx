import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Typography } from '../../constants/theme';
import { BookingCard } from '../../components/parking/BookingCard';
import { useAuth } from '../../context/AuthContext';

type BookingTab = 'ALL' | 'ACTIVE' | 'UPCOMING' | 'HISTORY';

export default function BookingsScreen() {
  const { bookings, cancelBooking } = useAuth();
  const [activeTab, setActiveTab] = useState<BookingTab>('ALL');

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'ACTIVE') return b.status === 'ACTIVE';
    if (activeTab === 'UPCOMING') return b.status === 'UPCOMING';
    if (activeTab === 'HISTORY') return b.status === 'COMPLETED' || b.status === 'CANCELLED';
    return true;
  });

  const handleCancel = (bookingId: string) => {
    Alert.alert('Cancel Reservation', 'Do you want to release this parking bay?', [
      { text: 'No, Keep Spot', style: 'cancel' },
      { text: 'Release Spot', style: 'destructive', onPress: () => cancelBooking(bookingId) },
    ]);
  };

  const handlePass = (id: string) => {
    const booking = bookings.find((b) => b.id === id);
    if (!booking) return;
    Alert.alert(
      `Gate Access Pass: ${booking.slotNumber}`,
      `QR Code: ${booking.qrAccessCode}\nPIN Code: ${booking.pinCode}\n\nPresent this pass at the gate barrier or punch the PIN into the smart keypad.`,
      [{ text: 'Close' }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
        <Text style={styles.subtitle}>Manage your reserved bays & digital gate passes</Text>
      </View>

      {/* Tabs Row */}
      <View style={styles.tabsRow}>
        {(['ALL', 'ACTIVE', 'UPCOMING', 'HISTORY'] as BookingTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredBookings.length > 0 ? (
          filteredBookings.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              onPress={() => handlePass(b.id)}
              onViewPass={() => handlePass(b.id)}
              onCancel={() => handleCancel(b.id)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Bookings Found</Text>
            <Text style={styles.emptySubtitle}>
              You don't have any {activeTab.toLowerCase()} parking sessions at the moment.
            </Text>
          </View>
        )}
      </ScrollView>
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
    paddingBottom: Spacing.sm,
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
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSubtle,
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: Typography.sizes.xs,
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
    paddingVertical: Spacing.xxxl,
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
});
