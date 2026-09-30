import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Typography } from '../constants/theme';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: 'sparkles',
    title: 'AI Predictive Availability',
    subtitle:
      'Predicts parking congestion and vacant slots ahead of time using historical trends and machine learning algorithms.',
    badge: 'AI Smart Engine',
  },
  {
    icon: 'flash',
    title: 'One-Tap Quick Reservation',
    subtitle:
      'Hold your designated bay in advance. No driving in circles, no stressful circling, and zero wasted fuel.',
    badge: 'Instant Spot Hold',
  },
  {
    icon: 'qr-code-outline',
    title: 'Digital Gate & Contactless Entry',
    subtitle:
      'Automatic license plate identification & digital mobile QR pass for touch-free entry and exit.',
    badge: 'Touchless Access',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header & Brand */}
        <View style={styles.brandHeader}>
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <Ionicons name="car-sport" size={24} color={Colors.white} />
            </View>
            <View>
              <Text style={styles.brandTitle}>PARK<Text style={styles.brandTitleAccent}>AI</Text></Text>
              <Text style={styles.brandSlogan}>Autonomous Smart Urban Parking</Text>
            </View>
          </View>
          <Badge label="Prototype v1.0" variant="ai" size="sm" />
        </View>

        {/* Feature Highlights Slider */}
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const slide = Math.round(e.nativeEvent.contentOffset.x / (width - 48));
              if (slide !== activeSlide && slide >= 0 && slide < SLIDES.length) {
                setActiveSlide(slide);
              }
            }}
            scrollEventThrottle={16}
          >
            {SLIDES.map((slide, index) => (
              <View key={index} style={[styles.slideCard, { width: width - 48 }]}>
                <View style={styles.slideIconWrap}>
                  <Ionicons
                    name={slide.icon as any}
                    size={38}
                    color={index === 0 ? Colors.accentAI : Colors.primary}
                  />
                </View>
                <Badge
                  label={slide.badge}
                  variant={index === 0 ? 'ai' : 'info'}
                  size="sm"
                  style={styles.slideBadge}
                />
                <Text style={styles.slideTitle}>{slide.title}</Text>
                <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Pagination Dots */}
          <View style={styles.paginationRow}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === activeSlide && styles.dotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Value Proposition Pills */}
        <View style={styles.statsPreview}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>85%</Text>
            <Text style={styles.statLabel}>Search Time Saved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>94%</Text>
            <Text style={styles.statLabel}>AI Spot Accuracy</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>0s</Text>
            <Text style={styles.statLabel}>Barrier Delay</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            title="Create an Account"
            onPress={() => router.push('/(auth)/signup')}
            variant="primary"
            size="lg"
            fullWidth
            rightIcon={<Ionicons name="arrow-forward" size={18} color={Colors.white} />}
          />

          <Button
            title="I Already Have an Account"
            onPress={() => router.push('/(auth)/login')}
            variant="outline"
            size="md"
            fullWidth
            style={styles.loginBtn}
          />

          <TouchableOpacity
            style={styles.guestLink}
            onPress={() => router.replace('/(tabs)')}
            activeOpacity={0.7}
          >
            <Text style={styles.guestLinkText}>
              Explore Live Demo Dashboard as Guest <Ionicons name="chevron-forward" size={12} color={Colors.textLink} />
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    justifyContent: 'space-between',
  },
  brandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.xs,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  logoIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  brandTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  brandTitleAccent: {
    color: Colors.secondary,
  },
  brandSlogan: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },
  carouselContainer: {
    marginVertical: Spacing.md,
  },
  slideCard: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'flex-start',
  },
  slideIconWrap: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  slideBadge: {
    marginBottom: Spacing.sm,
  },
  slideTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    lineHeight: 26,
  },
  slideSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    width: 22,
    backgroundColor: Colors.primary,
  },
  statsPreview: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    justifyContent: 'space-around',
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNum: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
  },
  statLabel: {
    fontSize: Typography.sizes.xs - 1,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  actionsContainer: {
    gap: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  loginBtn: {
    marginTop: 2,
  },
  guestLink: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  guestLinkText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textLink,
    fontWeight: Typography.weights.semibold,
  },
});
