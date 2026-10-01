import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Typography } from '../../constants/theme';
import { useLocation } from '../../context/LocationContext';
import { Badge } from '../common/Badge';

interface LocationSelectorModalProps {
  visible: boolean;
  onClose: () => void;
}

export const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    locationSource,
    locationName,
    activePresetId,
    demoPresets,
    isLocating,
    statusMessage,
    requestDeviceLocation,
    setDemoPreset,
  } = useLocation();

  const handleUseDeviceGps = async () => {
    await requestDeviceLocation();
  };

  const handleSelectPreset = (presetId: string) => {
    setDemoPreset(presetId);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Location & GPS Settings</Text>
              <Text style={styles.subtitle}>Find nearest parking or test simulated hubs</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Current Active Status */}
          <View style={styles.currentStatusCard}>
            <View style={styles.statusRow}>
              <Ionicons
                name={locationSource === 'device' ? 'navigate' : 'map-outline'}
                size={18}
                color={locationSource === 'device' ? Colors.successDark : Colors.primary}
              />
              <Text style={styles.currentStatusTitle}>Active Reference Point:</Text>
              <Badge
                label={locationSource === 'device' ? 'Live GPS' : 'Demo Fallback'}
                variant={locationSource === 'device' ? 'success' : 'neutral'}
                size="sm"
              />
            </View>
            <Text style={styles.currentLocationName}>{locationName}</Text>
            <Text style={styles.statusMsg}>{statusMessage}</Text>
          </View>

          {/* Action 1: Live Device GPS Button */}
          <TouchableOpacity
            style={[styles.deviceGpsBtn, isLocating && styles.deviceGpsBtnDisabled]}
            onPress={handleUseDeviceGps}
            disabled={isLocating}
            activeOpacity={0.8}
          >
            {isLocating ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Ionicons name="navigate-circle" size={20} color={Colors.white} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.deviceGpsText}>
                {isLocating ? 'Acquiring GPS Position...' : 'Use My Live Device Location'}
              </Text>
              <Text style={styles.deviceGpsSub}>
                Queries mobile GPS hardware (requires permission)
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.white} />
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR TEST DEMO HUBS</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Action 2: Demo Presets List */}
          <Text style={styles.sectionLabel}>Simulated Prototype Locations:</Text>
          <ScrollView style={styles.presetsList}>
            {demoPresets.map((preset) => {
              const isSelected = locationSource === 'demo' && activePresetId === preset.id;
              return (
                <TouchableOpacity
                  key={preset.id}
                  style={[styles.presetCard, isSelected && styles.presetCardActive]}
                  onPress={() => handleSelectPreset(preset.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.presetIcon}>
                    <Ionicons
                      name="location"
                      size={18}
                      color={isSelected ? Colors.primary : Colors.textMuted}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.presetTitle, isSelected && styles.presetTitleActive]}>
                      {preset.name}
                    </Text>
                    <Text style={styles.presetDesc}>{preset.description}</Text>
                  </View>
                  {isSelected ? (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Prototype note */}
          <View style={styles.modalNote}>
            <Ionicons name="information-circle-outline" size={13} color={Colors.textMuted} />
            <Text style={styles.modalNoteText}>
              All spot distances & walking times update instantly when you change locations.
            </Text>
          </View>
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
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSubtle,
  },
  currentStatusCard: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  currentStatusTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
  },
  currentLocationName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  statusMsg: {
    fontSize: Typography.sizes.xs - 1,
    color: Colors.textMuted,
    marginTop: 4,
  },
  deviceGpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  deviceGpsBtnDisabled: {
    opacity: 0.7,
  },
  deviceGpsText: {
    color: Colors.white,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  deviceGpsSub: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    marginTop: 2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.sm,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    color: Colors.textMuted,
  },
  sectionLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  presetsList: {
    maxHeight: 200,
  },
  presetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  presetCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  presetIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  presetTitleActive: {
    color: Colors.primaryDark,
    fontWeight: Typography.weights.bold,
  },
  presetDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  modalNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: 6,
    marginTop: Spacing.sm,
  },
  modalNoteText: {
    fontSize: 10,
    color: Colors.textMuted,
    flex: 1,
  },
});
