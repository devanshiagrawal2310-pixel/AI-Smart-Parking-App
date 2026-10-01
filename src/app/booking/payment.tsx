import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Typography } from '../../constants/theme';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';

type PaymentMethodType = 'UPI' | 'CARD' | 'WALLET';

interface UpiAppOption {
  id: string;
  name: string;
  handle: string;
  iconName: keyof typeof Ionicons.glyphMap;
  color: string;
}

const UPI_APPS: UpiAppOption[] = [
  { id: 'gpay', name: 'Google Pay', handle: 'alex@okhdfc', iconName: 'logo-google', color: '#1A73E8' },
  { id: 'phonepe', name: 'PhonePe', handle: 'alex@ybl', iconName: 'flash', color: '#5F259F' },
  { id: 'paytm', name: 'Paytm UPI', handle: 'alex@paytm', iconName: 'wallet-outline', color: '#00BAF2' },
];

export default function DigitalPaymentScreen() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const { bookings, walletBalance, markBookingAsPaid, deductWalletBalance } = useAuth();

  const booking = bookings.find((b) => b.id === bookingId) || bookings[0];

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('UPI');
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>('gpay');
  const [isProcessing, setIsProcessing] = useState(false);

  const totalAmount = booking?.totalCost || 80.0;
  const isWalletInsufficient = selectedMethod === 'WALLET' && walletBalance < totalAmount;

  const handleProcessPayment = async () => {
    setIsProcessing(true);

    // Simulate 1-second asynchronous digital gateway response
    setTimeout(() => {
      setIsProcessing(false);

      if (selectedMethod === 'WALLET') {
        const success = deductWalletBalance(totalAmount);
        if (!success) {
          Alert.alert('Insufficient Balance', 'Your demo wallet balance is insufficient for this charge.');
          return;
        }
      }

      if (booking) {
        markBookingAsPaid(booking.id, selectedMethod);
      }

      // Navigate to confirmation screen
      router.replace({
        pathname: '/booking/confirmation',
        params: { bookingId: booking?.id || '', justPaid: 'true' },
      });
    }, 1100);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Prototype Demo Banner */}
        <View style={styles.demoBanner}>
          <Ionicons name="shield-checkmark" size={18} color="#D97706" />
          <View style={{ flex: 1 }}>
            <Text style={styles.demoBannerTitle}>DEMO / PROTOTYPE PAYMENT</Text>
            <Text style={styles.demoBannerSub}>
              College prototype simulated checkout. No real payment gateways or real transactions.
            </Text>
          </View>
        </View>

        {/* 1. Booking Summary Ticket */}
        <View style={styles.ticketCard}>
          <View style={styles.ticketHeader}>
            <View>
              <Text style={styles.ticketHeaderTitle}>Booking Checkout</Text>
              <Text style={styles.ticketId}>Ref: #{booking?.id || 'BK-PENDING'}</Text>
            </View>
            <Badge label="Awaiting Demo Pay" variant="warning" size="sm" />
          </View>

          <View style={styles.ticketDivider} />

          {/* Location & Bay */}
          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={16} color={Colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Parking Facility</Text>
              <Text style={styles.infoValue}>{booking?.spotName || 'FC Road Smart Garage'}</Text>
              <Text style={styles.infoSub}>{booking?.locationAddress || 'Fergusson College Road, Shivajinagar, Pune'}</Text>
            </View>
          </View>

          {/* Slot & Floor */}
          <View style={styles.infoRow}>
            <Ionicons name="car-outline" size={16} color={Colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Reserved Slot</Text>
              <Text style={styles.infoValue}>
                Bay {booking?.slotNumber || 'B-14'} • {booking?.floor || 'Level 1'}
              </Text>
              <Text style={styles.infoSub}>Vehicle: {booking?.vehiclePlate || 'MH-12-PQ-9021'}</Text>
            </View>
          </View>

          {/* Schedule */}
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Arrival & Duration</Text>
              <Text style={styles.infoValue}>
                {booking?.date || 'Today'} • {booking?.startTime || 'Instant'}
              </Text>
              <Text style={styles.infoSub}>Duration: {booking?.durationHours || 2} Hour(s)</Text>
            </View>
          </View>

          {/* Price Breakdown */}
          <View style={styles.pricingBox}>
            <View style={styles.priceRow}>
              <Text style={styles.priceRowLabel}>Parking Slot Charge</Text>
              <Text style={styles.priceRowVal}>₹{totalAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceRowLabel}>Automated Barrier Gate Fee</Text>
              <Text style={styles.priceRowFree}>₹0.00 (Demo Free)</Text>
            </View>
            <View style={styles.priceTotalDivider} />
            <View style={styles.priceTotalRow}>
              <Text style={styles.priceTotalLabel}>Total Due</Text>
              <Text style={styles.priceTotalValue}>₹{totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* 2. Demo Payment Methods */}
        <Text style={styles.sectionTitle}>Select Demo Payment Option</Text>

        {/* Method 1: UPI Demo */}
        <TouchableOpacity
          style={[styles.methodCard, selectedMethod === 'UPI' && styles.methodCardActive]}
          onPress={() => setSelectedMethod('UPI')}
          activeOpacity={0.8}
        >
          <View style={styles.methodHeader}>
            <View style={styles.methodTitleRow}>
              <View style={[styles.methodIconBubble, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="qr-code-outline" size={18} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.methodTitle}>UPI (Instant Simulation)</Text>
                <Text style={styles.methodSub}>Virtual Payment Address • Zero fees</Text>
              </View>
            </View>
            <Ionicons
              name={selectedMethod === 'UPI' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={selectedMethod === 'UPI' ? Colors.primary : Colors.textMuted}
            />
          </View>

          {selectedMethod === 'UPI' ? (
            <View style={styles.upiOptionsContainer}>
              <Text style={styles.upiSelectLabel}>Choose Simulated UPI App:</Text>
              <View style={styles.upiChipsRow}>
                {UPI_APPS.map((app) => {
                  const isSelected = selectedUpiApp === app.id;
                  return (
                    <TouchableOpacity
                      key={app.id}
                      style={[styles.upiChip, isSelected && styles.upiChipActive]}
                      onPress={() => setSelectedUpiApp(app.id)}
                    >
                      <Ionicons name={app.iconName} size={14} color={isSelected ? Colors.white : app.color} />
                      <Text style={[styles.upiChipText, isSelected && styles.upiChipTextActive]}>
                        {app.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={styles.vpaPreviewBox}>
                <Text style={styles.vpaPreviewText}>
                  Simulated VPA: <Text style={styles.vpaBold}>{UPI_APPS.find((a) => a.id === selectedUpiApp)?.handle}</Text>
                </Text>
              </View>
            </View>
          ) : null}
        </TouchableOpacity>

        {/* Method 2: Demo Card */}
        <TouchableOpacity
          style={[styles.methodCard, selectedMethod === 'CARD' && styles.methodCardActive]}
          onPress={() => setSelectedMethod('CARD')}
          activeOpacity={0.8}
        >
          <View style={styles.methodHeader}>
            <View style={styles.methodTitleRow}>
              <View style={[styles.methodIconBubble, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="card-outline" size={18} color={Colors.successDark} />
              </View>
              <View>
                <Text style={styles.methodTitle}>Credit / Debit Card (Demo)</Text>
                <Text style={styles.methodSub}>Simulated Visa Card • 1-Tap Authorization</Text>
              </View>
            </View>
            <Ionicons
              name={selectedMethod === 'CARD' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={selectedMethod === 'CARD' ? Colors.primary : Colors.textMuted}
            />
          </View>

          {selectedMethod === 'CARD' ? (
            <View style={styles.demoCardPreview}>
              <View style={styles.demoCardTop}>
                <Ionicons name="card" size={20} color={Colors.white} />
                <Text style={styles.demoCardBrand}>VISA DEMO</Text>
              </View>
              <Text style={styles.demoCardNumber}>•••• •••• •••• 4242</Text>
              <View style={styles.demoCardBottom}>
                <Text style={styles.demoCardName}>Alex Morgan</Text>
                <Text style={styles.demoCardExp}>EXP: 12/28</Text>
              </View>
            </View>
          ) : null}
        </TouchableOpacity>

        {/* Method 3: App SmartPark Wallet */}
        <TouchableOpacity
          style={[styles.methodCard, selectedMethod === 'WALLET' && styles.methodCardActive]}
          onPress={() => setSelectedMethod('WALLET')}
          activeOpacity={0.8}
        >
          <View style={styles.methodHeader}>
            <View style={styles.methodTitleRow}>
              <View style={[styles.methodIconBubble, { backgroundColor: '#FAF5FF' }]}>
                <Ionicons name="wallet-outline" size={18} color={Colors.accentAI} />
              </View>
              <View>
                <Text style={styles.methodTitle}>SmartPark Wallet (Demo Funds)</Text>
                <Text style={styles.methodSub}>
                  Available Balance: <Text style={styles.walletBalBold}>₹{walletBalance.toFixed(2)}</Text>
                </Text>
              </View>
            </View>
            <Ionicons
              name={selectedMethod === 'WALLET' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={selectedMethod === 'WALLET' ? Colors.primary : Colors.textMuted}
            />
          </View>

          {selectedMethod === 'WALLET' ? (
            <View style={styles.walletDetailsBox}>
              <View style={styles.walletCalcRow}>
                <Text style={styles.walletCalcLabel}>Current Balance:</Text>
                <Text style={styles.walletCalcVal}>₹{walletBalance.toFixed(2)}</Text>
              </View>
              <View style={styles.walletCalcRow}>
                <Text style={styles.walletCalcLabel}>Charge Amount:</Text>
                <Text style={styles.walletCalcDeduct}>-₹{totalAmount.toFixed(2)}</Text>
              </View>
              <View style={styles.walletDivider} />
              <View style={styles.walletCalcRow}>
                <Text style={styles.walletCalcLabel}>Remaining Balance:</Text>
                <Text style={styles.walletCalcRemaining}>
                  ₹{Math.max(0, walletBalance - totalAmount).toFixed(2)}
                </Text>
              </View>
            </View>
          ) : null}
        </TouchableOpacity>

        {/* Notice of Simulation */}
        <View style={styles.securityNotice}>
          <Ionicons name="lock-closed-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.securityNoticeText}>
            Simulated Sandbox: Authorizing will immediately confirm your reservation and generate your digital barrier gate access pass.
          </Text>
        </View>

        {/* Action Button */}
        <Button
          title={
            isProcessing
              ? 'Processing Demo Payment...'
              : `Pay Now • ₹${totalAmount.toFixed(2)} (Demo Payment)`
          }
          onPress={handleProcessPayment}
          variant="primary"
          size="lg"
          fullWidth
          loading={isProcessing}
          disabled={isProcessing || isWalletInsufficient}
          leftIcon={!isProcessing ? <Ionicons name="card-outline" size={18} color={Colors.white} /> : undefined}
          style={styles.payBtn}
        />
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
  ticketCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketHeaderTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  ticketId: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  ticketDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  infoValue: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginTop: 1,
  },
  infoSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 1,
  },
  pricingBox: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  priceRowLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },
  priceRowVal: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  priceRowFree: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.successDark,
  },
  priceTotalDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 6,
  },
  priceTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  priceTotalLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  priceTotalValue: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
  },
  sectionTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  methodCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  methodCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#FAFCFF',
  },
  methodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  methodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  methodIconBubble: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  methodSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  upiOptionsContainer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  upiSelectLabel: {
    fontSize: 10,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  upiChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  upiChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  upiChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  upiChipText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  upiChipTextActive: {
    color: Colors.white,
    fontWeight: Typography.weights.bold,
  },
  vpaPreviewBox: {
    backgroundColor: Colors.surfaceSubtle,
    padding: Spacing.sm,
    borderRadius: BorderRadius.xs,
    marginTop: 8,
  },
  vpaPreviewText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  vpaBold: {
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
  },
  demoCardPreview: {
    backgroundColor: '#1E293B',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  demoCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  demoCardBrand: {
    color: Colors.white,
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.xs,
  },
  demoCardNumber: {
    color: Colors.white,
    fontSize: Typography.sizes.md,
    letterSpacing: 2,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.md,
  },
  demoCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  demoCardName: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: Typography.sizes.xs,
  },
  demoCardExp: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: Typography.sizes.xs,
  },
  walletBalBold: {
    fontWeight: Typography.weights.bold,
    color: Colors.accentAI,
  },
  walletDetailsBox: {
    backgroundColor: '#FAF5FF',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  walletCalcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  walletCalcLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },
  walletCalcVal: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  walletCalcDeduct: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.dangerDark,
  },
  walletDivider: {
    height: 1,
    backgroundColor: '#E9D5FF',
    marginVertical: 4,
  },
  walletCalcRemaining: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.successDark,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xs,
  },
  securityNoticeText: {
    fontSize: 10,
    color: Colors.textMuted,
    flex: 1,
    lineHeight: 14,
  },
  payBtn: {
    marginBottom: Spacing.xl,
  },
});
