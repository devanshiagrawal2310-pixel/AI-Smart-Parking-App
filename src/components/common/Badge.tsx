import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, BorderRadius, Spacing, Typography } from '../../constants/theme';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'ai' | 'neutral' | 'info';
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  icon,
  style,
  textStyle,
  size = 'md',
}) => {
  const getBadgeStyle = (): ViewStyle => {
    switch (variant) {
      case 'success':
        return { backgroundColor: Colors.successLight, borderColor: Colors.success };
      case 'warning':
        return { backgroundColor: Colors.warningLight, borderColor: Colors.warning };
      case 'danger':
        return { backgroundColor: Colors.dangerLight, borderColor: Colors.danger };
      case 'ai':
        return { backgroundColor: Colors.accentAILight, borderColor: Colors.accentAIBorder };
      case 'info':
        return { backgroundColor: Colors.secondaryLight, borderColor: Colors.secondary };
      case 'neutral':
      default:
        return { backgroundColor: Colors.surfaceSubtle, borderColor: Colors.border };
    }
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'success':
        return Colors.successDark;
      case 'warning':
        return Colors.warningDark;
      case 'danger':
        return Colors.dangerDark;
      case 'ai':
        return Colors.accentAI;
      case 'info':
        return Colors.primaryLight;
      case 'neutral':
      default:
        return Colors.textSecondary;
    }
  };

  return (
    <View
      style={[
        styles.badge,
        getBadgeStyle(),
        size === 'sm' && styles.badgeSm,
        style,
      ]}
    >
      {icon ? <View style={styles.iconWrapper}>{icon}</View> : null}
      <Text
        style={[
          styles.label,
          { color: getTextColor() },
          size === 'sm' && styles.labelSm,
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  iconWrapper: {
    marginRight: 4,
  },
  label: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
  },
  labelSm: {
    fontSize: 10,
  },
});
