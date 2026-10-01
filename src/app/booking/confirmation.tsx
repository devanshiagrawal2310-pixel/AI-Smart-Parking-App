import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Typography } from '../../constants/theme';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';

export default function BookingConfirmationScreen() {
  const router = useRouter();
  const { bookingId, justPaid } = useLocalSearchParams<{ bookingId: string; justPaid?: string }>();
  const { bookings } = useAuth();

  const booking = bookings.find((b) => b.id === bookingId) || bookings[0];

  const handleSimulateGateScan = () => {
    Alert.alert(
      'Simulated Barrier Gate Entry',
      `Gate Access Authorized!\n\nBarrier Gate: OPEN\nAssigned Bay: ${booking.slotNumber}\nPlate: ${booking.vehiclePlate}\n\nDrive through to your bay. Welcome to ${booking.spotName}!`,
      [{ text: 'Great, thanks!' }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Payment Confirmation Banner */}
        {justPaid === 'true' && (
          <View style={styles.paidSuccessBanner}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.successDark} />
            <Text style={styles.paidSuccessText}>Demo Payment Confirmed! Gate pass unlocked.</Text>
          </View>
        )}

        {/* Success Header */}
        <View style={styles.header}>
          <View style={styles.successIconCircle}>
            <Ionicons name="checkmark-circle" size={60} color={Colors.success} />
          </View>
          <Text style={styles.title}>Reservation Confirmed!</Text>
          <Text style={styles.subtitle}>
            Your parking bay has been locked and held in the simulated system.
          </Text>

          <View style={styles.bookingIdPill}>
            <Text style={styles.bookingIdLabel}>BOOKING ID:</Text>
            <Text style={styles.bookingIdValue}>#{booking.id}</Text>
          </View>
        </View>

        {/* Digital Gate Pass Card */}
        <View style={styles.gatePassCard}>
          <View style={styles.passHeader}>
            <View style={styles.passHeaderTitleRow}>
              <Ionicons name="shield-checkmark" size={16} color={Colors.primary} />
              <Text style={styles.passHeaderTitle}>Digital Gate Access Pass</Text>
            </View>
            <Badge label="Active Pass" variant="success" size="sm" />
          </View>

          {/* QR Code Graphical Representation */}
          <View style={styles.qrContainer}>
            <View style={styles.qrFrame}>
              <Ionicons name="qr-code" size={130} color={Colors.primaryDark} />
              <View style={styles.qrCenterLogo}>
                <Ionicons name="car" size={18} color={Colors.primary} />
              </View>
            </View>
            <Text style={styles.qrInstruction}>
              Present this code at the scanner or barrier camera
            </Text>
          </View>

          {/* PIN Code Box */}
          <View style={styles.pinBox}>
            <Text style={styles.pinLabel}>4-Digit Gate Keypad PIN</Text>
            <Text style={styles.pinValue}>{booking.pinCode}</Text>
          </View>

          {/* Quick Simulation Trigger */}
          <TouchableOpacity
            style={styles.simulateScanBtn}
            onPress={handleSimulateGateScan}
            activeOpacity={0.8}
          >
            <Ionicons name="scan-outline" size={16} color={Colors.primary} />
            <Text style={styles.simulateScanText}>Simulate Touchless Barrier Scan</Text>
          </TouchableOpacity>
        </View>

        {/* Reservation Details Summary Ticket */}
        <View style={styles.ticketDetailsCard}>
          <Text style={styles.ticketSectionTitle}>Reservation Summary</Text>

          <View style={styles.ticketRow}>
            <Text style={styles.ticketLabel}>Facility</Text>
            <Text style={styles.ticketValueBold}>{booking.spotName}</Text>
          </View>

          <View style={styles.ticketRow}>
            <Text style={styles.ticketLabel}>Assigned Slot</Text>
            <View style={styles.slotBadge}>
              <Text style={styles.slotBadgeText}>{booking.slotNumber}</Text>
            </View>
          </View>

          <View style={styles.ticketRow}>
            <Text style={styles.ticketLabel}>Location Address</Text>
            <Text style={styles.ticketValue} numberOfLines={1}>
              {booking.locationAddress}
            </Text>
          </View>

          <View style={styles.ticketDivider} />

          <View style={styles.ticketRow}>
            <Text style={styles.ticketLabel}>Schedule</Text>
            <Text style={styles.ticketValue}>
              {booking.date ? `${booking.date} • ` : ''}{booking.startTime}
            </Text>
          </View>

          <View style={styles.ticketRow}>
            <Text style={styles.ticketLabel}>Vehicle Plate</Text>
            <Text style={styles.ticketPlate}>{booking.vehiclePlate}</Text>
          </View>

          <View style={styles.ticketRow}>
            <Text style={styles.ticketLabel}>Payment Status</Text>
            <Badge
              label={booking.paymentStatus === 'PAID' ? `PAID (${booking.paymentMethod || 'DEMO'})` : 'PENDING PAYMENT'}
              variant={booking.paymentStatus === 'PAID' ? 'success' : 'warning'}
              size="sm"
            />
          </View>

          {booking.paymentTransactionId ? (
            <View style={styles.ticketRow}>
              <Text style={styles.ticketLabel}>Transaction ID</Text>
              <Text style={styles.ticketValue}>{booking.paymentTransactionId}</Text>
            </View>
          ) : null}

          <View style={styles.ticketRow}>
            <Text style={styles.ticketLabel}>Total Amount (Demo)</Text>
            <Text style={styles.ticketTotal}>₹{booking.totalCost.toFixed(2)}</Text>
          </View>
        </View>

        {booking.paymentStatus !== 'PAID' ? (
          <View style={styles.payPromptCard}>
            <Ionicons name="card-outline" size={18} color="#D97706" />
            <View style={{ flex: 1 }}>
              <Text style={styles.payPromptTitle}>Payment Pending</Text>
              <Text style={styles.payPromptSub}>Complete digital checkout to lock in your digital gate pass.</Text>
            </View>
            <TouchableOpacity
              style={styles.payPromptBtn}
              onPress={() => router.push({ pathname: '/booking/payment', params: { bookingId: booking.id } })}
            >
              <Text style={styles.payPromptBtnText}>Pay Now</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* History Storage Assurance Notice */}
        <View style={styles.noticeCard}>
          <Ionicons name="save-outline" size={16} color={Colors.primary} />
          <Text style={styles.noticeText}>
            Saved locally in prototype memory! You can access this booking anytime in <Text style={styles.noticeBold}>My Bookings</Text>.
          </Text>
        </View>

        {/* Navigation Actions */}
        <View style={styles.actionsContainer}>
          {booking.paymentStatus !== 'PAID' && (
            <Button
              title="Proceed to Demo Payment (Pay Now)"
              onPress={() => router.push({ pathname: '/booking/payment', params: { bookingId: booking.id } })}
              variant="primary"
              size="lg"
              fullWidth
              leftIcon={<Ionicons name="card-outline" size={18} color={Colors.white} />}
            />
          )}

          <Button
            title="View in My Bookings"
            onPress={() => router.replace('/(tabs)/bookings')}
            variant={booking.paymentStatus === 'PAID' ? 'primary' : 'outline'}
            size="lg"
            fullWidth
            leftIcon={<Ionicons name="receipt-outline" size={18} color={booking.paymentStatus === 'PAID' ? Colors.white : Colors.primary} />}
          />

          <Button
            title="Back to Home Dashboard"
            onPress={() => router.replace('/(tabs)')}
            variant="outline"
            size="md"
            fullWidth
            style={styles.homeBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxxl,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  successIconCircle: {
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
    lineHeight: 20,
  },
  bookingIdPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
    gap: 6,
  },
  bookingIdLabel: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    color: Colors.textSecondary,
  },
  bookingIdValue: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  gatePassCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  passHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  passHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  passHeaderTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  qrFrame: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.primaryMuted,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCenterLogo: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  qrInstruction: {
    fontSize: Typography.sizes.xs - 1,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  pinBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    marginTop: Spacing.sm,
  },
  pinLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  pinValue: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.accentAI,
    letterSpacing: 2,
  },
  simulateScanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryMuted,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
    gap: 6,
  },
  simulateScanText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  ticketDetailsCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  ticketSectionTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },
  ticketValue: {
    fontSize: Typography.sizes.xs,
    color: Colors.textPrimary,
    fontWeight: Typography.weights.medium,
    maxWidth: '65%',
    textAlign: 'right',
  },
  ticketValueBold: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    maxWidth: '65%',
    textAlign: 'right',
  },
  slotBadge: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  slotBadgeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  ticketPlate: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
  },
  ticketDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  ticketTotal: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryMuted,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    gap: 8,
  },
  noticeText: {
    fontSize: Typography.sizes.xs,
    color: Colors.primaryDark,
    flex: 1,
  },
  noticeBold: {
    fontWeight: Typography.weights.bold,
  },
  actionsContainer: {
    gap: Spacing.sm,
  },
  homeBtn: {
    marginTop: 2,
  },
  payPromptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#FCD34D',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  payPromptTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: '#92400E',
  },
  payPromptSub: {
    fontSize: 10,
    color: '#B45309',
    marginTop: 1,
  },
  payPromptBtn: {
    backgroundColor: '#D97706',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.sm,
  },
  payPromptBtnText: {
    color: Colors.white,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  paidSuccessBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#86EFAC',
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  paidSuccessText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.successDark,
  },
});
