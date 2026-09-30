import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';

interface HeaderProps {
  onNotificationPress?: () => void;
  onLocationPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNotificationPress,
  onLocationPress,
}) => {
  const { user } = useAuth();
  const { locationName, locationSource } = useLocation();
  const firstName = user?.name ? user.name.split(' ')[0] : 'Driver';

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{firstName.charAt(0)}</Text>
        </View>
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>Hello, {firstName} 👋</Text>
          <TouchableOpacity
            style={styles.locationSelector}
            onPress={onLocationPress}
            activeOpacity={0.7}
          >
            <Ionicons
              name={locationSource === 'device' ? 'navigate' : 'location-sharp'}
              size={13}
              color={locationSource === 'device' ? Colors.successDark : Colors.primary}
            />
            <Text style={styles.locationText} numberOfLines={1}>
              {locationName}
            </Text>
            <Ionicons name="chevron-down" size={12} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onNotificationPress}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={20} color={Colors.textPrimary} />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    color: Colors.primary,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  greetingContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 3,
  },
  locationText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    maxWidth: 160,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.danger,
    borderWidth: 1,
    borderColor: Colors.white,
  },
});
