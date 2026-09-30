import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [aiAutoReserve, setAiAutoReserve] = useState(user?.isAiAutoReserveEnabled ?? true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [evPreference, setEvPreference] = useState(true);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of ParkAI?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>
              {user?.name ? user.name.charAt(0) : 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Driver'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'driver@smartpark.ai'}</Text>
          <Badge label="Verified Mobile Driver" variant="success" size="sm" style={styles.verifiedBadge} />
        </View>

        {/* Registered Vehicle Section */}
        <Text style={styles.sectionHeading}>Registered Vehicle</Text>
        <View style={styles.vehicleCard}>
          <View style={styles.vehicleIconCircle}>
            <Ionicons name="car-sport" size={24} color={Colors.primary} />
          </View>
          <View style={styles.vehicleDetails}>
            <Text style={styles.vehicleName}>{user?.vehicleModel || 'Tesla Model 3'}</Text>
            <View style={styles.plateRow}>
              <Text style={styles.plateLabel}>License Plate:</Text>
              <Text style={styles.plateValue}>{user?.vehiclePlate || 'CAL-9021'}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => Alert.alert('Edit Vehicle', 'Vehicle details editing simulated.')}
            style={styles.editBtn}
          >
            <Ionicons name="pencil" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* AI & Automation Preferences */}
        <Text style={styles.sectionHeading}>AI Intelligence & Automation</Text>
        <View style={styles.settingsGroup}>
          <View style={styles.settingRow}>
            <View style={styles.settingTextGroup}>
              <Text style={styles.settingTitle}>AI Spot Availability Alert</Text>
              <Text style={styles.settingDesc}>
                Notifies you 30 mins before peak surges around your destination.
              </Text>
            </View>
            <Switch
              value={aiAutoReserve}
              onValueChange={setAiAutoReserve}
              trackColor={{ false: Colors.border, true: Colors.accentAI }}
              thumbColor={Colors.white}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingTextGroup}>
              <Text style={styles.settingTitle}>Priority EV Stall Matching</Text>
              <Text style={styles.settingDesc}>
                Prioritizes stalls equipped with operational level 2/3 chargers.
              </Text>
            </View>
            <Switch
              value={evPreference}
              onValueChange={setEvPreference}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingTextGroup}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingDesc}>
                Arrival directions, gate opening PINs and session expiry timers.
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
        </View>

        {/* App Info & Simulation Notice */}
        <View style={styles.infoCard}>
          <Ionicons name="shield-outline" size={18} color={Colors.textSecondary} />
          <Text style={styles.infoCardText}>
            ParkAI v1.0.0 (Phase 2 Mobile Prototype). Local simulation mode enabled.
          </Text>
        </View>

        {/* Sign Out Button */}
        <Button
          title="Sign Out"
          onPress={handleLogout}
          variant="outline"
          fullWidth
          leftIcon={<Ionicons name="log-out-outline" size={18} color={Colors.primary} />}
          style={styles.logoutBtn}
        />
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxxl,
    backgroundColor: Colors.background,
  },
  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  avatarLarge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  avatarLargeText: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  userName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  userEmail: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  verifiedBadge: {
    marginTop: Spacing.sm,
  },
  sectionHeading: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  vehicleIconCircle: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleName: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  plateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  plateLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  plateValue: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  editBtn: {
    padding: Spacing.sm,
  },
  settingsGroup: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  settingTextGroup: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
  },
  settingDesc: {
    fontSize: Typography.sizes.xs - 1,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  infoCardText: {
    fontSize: 11,
    color: Colors.textSecondary,
    flex: 1,
  },
  logoutBtn: {
    borderColor: Colors.danger,
  },
});
