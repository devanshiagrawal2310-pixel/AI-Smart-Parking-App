import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Booking } from '../../types/parking';
import { Colors, BorderRadius, Spacing, Typography } from '../../constants/theme';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface BookingDetailModalProps {
  visible: boolean;
  booking: Booking | null;
  onClose: () => void;
  onCancelBooking?: (bookingId: string) => void;
  onPayNow?: (bookingId: string) => void;
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  visible,
  booking,
  onClose,
  onCancelBooking,
  onPayNow,
}) => {
  if (!booking) return null;

  const isPaid = booking.paymentStatus === 'PAID';
  const isActive = booking.status === 'ACTIVE';
  const isUpcoming = booking.status === 'UPCOMING';
  const isCancelled = booking.status === 'CANCELLED';

  const handleSimulateScan = () => {
    Alert.alert(
      'Simulated Gate Barrier Scan',
      `Gate Access Authorized!\n\nBarrier: OPEN\nBay: ${booking.slotNumber}\nVehicle: ${booking.vehiclePlate}\n\nShow QR code or enter PIN ${booking.pinCode} at gate kiosk.`,
      [{ text: 'Done' }]
    );
  };

  const getStatusBadge = () => {
    switch (booking.status) {
      case 'ACTIVE':
        return <Badge label="Active Session" variant="success" size="sm" />;
      case 'UPCOMING':
        return <Badge label="Upcoming" variant="warning" size="sm" />;
      case 'COMPLETED':
        return <Badge label="Completed" variant="neutral" size="sm" />;
      case 'CANCELLED':
        return <Badge label="Cancelled" variant="danger" size="sm" />;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.headerTitle}>Booking Details</Text>
              <Text style={styles.headerSubtitle}>Reservation #{booking.id}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Status & Payment Badges */}
            <View style={styles.statusBadgesRow}>
              {getStatusBadge()}
              <Badge
                label={isPaid ? `Paid via ${booking.paymentMethod || 'Demo'}` : 'Payment Pending'}
                variant={isPaid ? 'success' : 'warning'}
                size="sm"
              />
              <Text style={styles.totalHeaderPrice}>₹{booking.totalCost.toFixed(2)}</Text>
            </View>

            {/* Gate Pass Card */}
            <View style={styles.gatePassBox}>
              <View style={styles.gatePassTop}>
                <Ionicons name="shield-checkmark" size={16} color={Colors.primary} />
                <Text style={styles.gatePassTitle}>Digital Gate Access Pass</Text>
              </View>

              <View style={styles.qrRow}>
                <View style={styles.qrFrame}>
                  <Ionicons name="qr-code" size={90} color={Colors.primaryDark} />
                  <View style={styles.qrCenterDot}>
                    <Ionicons name="car" size={12} color={Colors.primary} />
                  </View>
                </View>

                <View style={styles.pinDetails}>
                  <Text style={styles.pinLabel}>Entry Keypad PIN</Text>
                  <Text style={styles.pinValue}>{booking.pinCode}</Text>
                  <Text style={styles.qrCodeLabel}>Code: {booking.qrAccessCode}</Text>
                  <TouchableOpacity
                    style={styles.simulateScanBtn}
                    onPress={handleSimulateScan}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="scan-outline" size={13} color={Colors.primary} />
                    <Text style={styles.simulateScanText}>Simulate Barrier Entry</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Parking Location Card */}
            <View style={styles.detailCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="business-outline" size={16} color={Colors.primary} />
                <Text style={styles.cardTitle}>Parking Location</Text>
              </View>
              <Text style={styles.facilityName}>{booking.spotName}</Text>
              <Text style={styles.facilityAddress}>{booking.locationAddress}</Text>
            </View>

            {/* Slot & Vehicle Card */}
            <View style={styles.detailCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="car-outline" size={16} color={Colors.primary} />
                <Text style={styles.cardTitle}>Bay & Vehicle Information</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Assigned Slot:</Text>
                <Text style={styles.metaValueBold}>{booking.slotNumber}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Deck / Level:</Text>
                <Text style={styles.metaValue}>{booking.floor || 'Level 1 (Ground)'}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Vehicle Plate:</Text>
                <Text style={styles.metaPlate}>{booking.vehiclePlate}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Vehicle Model:</Text>
                <Text style={styles.metaValue}>{booking.vehicleModel}</Text>
              </View>
            </View>

            {/* Schedule & Duration Card */}
            <View style={styles.detailCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
                <Text style={styles.cardTitle}>Reservation Schedule</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Date:</Text>
                <Text style={styles.metaValue}>{booking.date || 'Today'}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Arrival Window:</Text>
                <Text style={styles.metaValue}>{booking.startTime}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Valid Until:</Text>
                <Text style={styles.metaValue}>{booking.endTime}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Duration:</Text>
                <Text style={styles.metaValue}>{booking.durationHours || 2} Hour(s)</Text>
              </View>
            </View>

            {/* Digital Payment Receipt Card */}
            <View style={styles.detailCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="receipt-outline" size={16} color={Colors.primary} />
                <Text style={styles.cardTitle}>Payment Receipt (Demo Sandbox)</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Payment Status:</Text>
                <Text style={[styles.metaValueBold, { color: isPaid ? Colors.successDark : Colors.warningDark }]}>
                  {isPaid ? 'CONFIRMED & PAID' : 'PENDING PAYMENT'}
                </Text>
              </View>
              {booking.paymentMethod ? (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Payment Method:</Text>
                  <Text style={styles.metaValue}>{booking.paymentMethod} (Simulated Demo)</Text>
                </View>
              ) : null}
              {booking.paymentTransactionId ? (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Transaction Ref:</Text>
                  <Text style={styles.metaValue}>{booking.paymentTransactionId}</Text>
                </View>
              ) : null}
              {booking.paidAt ? (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Paid At:</Text>
                  <Text style={styles.metaValue}>{booking.paidAt}</Text>
                </View>
              ) : null}
              <View style={styles.receiptDivider} />
              <View style={styles.metaRow}>
                <Text style={styles.metaTotalLabel}>Total Amount:</Text>
                <Text style={styles.metaTotalVal}>₹{booking.totalCost.toFixed(2)}</Text>
              </View>
            </View>

            {/* Action buttons */}
            <View style={styles.modalActions}>
              {!isPaid && onPayNow ? (
                <Button
                  title={`Complete Demo Payment (₹${booking.totalCost.toFixed(2)})`}
                  onPress={() => {
                    onClose();
                    onPayNow(booking.id);
                  }}
                  variant="primary"
                  size="md"
                  fullWidth
                  leftIcon={<Ionicons name="card-outline" size={16} color={Colors.white} />}
                  style={{ marginBottom: Spacing.sm }}
                />
              ) : null}

              {(isActive || isUpcoming) && !isCancelled && onCancelBooking ? (
                <Button
                  title="Cancel & Release Spot"
                  onPress={() => {
                    onClose();
                    onCancelBooking(booking.id);
                  }}
                  variant="outline"
                  size="md"
                  fullWidth
                  style={styles.cancelBtn}
                />
              ) : null}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSubtle,
  },
  scrollBody: {
    paddingBottom: Spacing.xxl,
  },
  statusBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.md,
  },
  totalHeaderPrice: {
    marginLeft: 'auto',
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
  },
  gatePassBox: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  gatePassTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  gatePassTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  qrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  qrFrame: {
    width: 100,
    height: 100,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  qrCenterDot: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDetails: {
    flex: 1,
  },
  pinLabel: {
    fontSize: 10,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
  },
  pinValue: {
    fontSize: 22,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
    letterSpacing: 3,
    marginTop: 1,
  },
  qrCodeLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 2,
  },
  simulateScanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryMuted,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.xs,
    marginTop: 8,
    gap: 4,
    alignSelf: 'flex-start',
  },
  simulateScanText: {
    fontSize: 10,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
  },
  detailCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm + 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.xs,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  facilityName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  facilityAddress: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  metaLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },
  metaValue: {
    fontSize: Typography.sizes.xs,
    color: Colors.textPrimary,
    fontWeight: Typography.weights.medium,
  },
  metaValueBold: {
    fontSize: Typography.sizes.xs,
    color: Colors.textPrimary,
    fontWeight: Typography.weights.bold,
  },
  metaPlate: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 8,
  },
  metaTotalLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  metaTotalVal: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
  },
  modalActions: {
    marginTop: Spacing.md,
  },
  cancelBtn: {
    borderColor: Colors.danger,
  },
});
