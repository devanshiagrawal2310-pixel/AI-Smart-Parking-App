import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Typography } from '../../constants/theme';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!email.includes('@') || !email.includes('.')) {
      errs.email = 'Please enter a valid email format (e.g., driver@domain.com).';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});
    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      router.replace('/(tabs)');
    } else {
      setErrors({ general: res.error || 'Failed to log in.' });
    }
  };

  const handleFillDemo = () => {
    setEmail('alex.morgan@smartpark.ai');
    setPassword('demoPass123');
    setErrors({});
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Log in to manage your vehicles, bookings, and AI spot predictions.
          </Text>
        </View>

        {/* Quick Demo Fill Pill */}
        <TouchableOpacity
          style={styles.demoFillBanner}
          onPress={handleFillDemo}
          activeOpacity={0.8}
        >
          <Ionicons name="sparkles" size={16} color={Colors.accentAI} />
          <Text style={styles.demoFillText}>
            Tap to fill demo account (<Text style={styles.demoHighlight}>alex.morgan@smartpark.ai</Text>)
          </Text>
        </TouchableOpacity>

        {/* General Error Banner */}
        {errors.general ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={16} color={Colors.danger} />
            <Text style={styles.errorBannerText}>{errors.general}</Text>
          </View>
        ) : null}

        {/* Form Inputs */}
        <View style={styles.formContainer}>
          <Input
            label="Email Address"
            placeholder="name@example.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail-outline"
            error={errors.email}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            isPassword
            leftIcon="lock-closed-outline"
            error={errors.password}
          />

          <TouchableOpacity style={styles.forgotPasswordLink} activeOpacity={0.7}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button
            title="Log In"
            onPress={handleLogin}
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            style={styles.submitBtn}
          />
        </View>

        {/* Footer Link to Signup */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>{"Don't have an account?"}</Text>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/signup')}
            activeOpacity={0.7}
          >
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxxl,
    justifyContent: 'center',
    flexGrow: 1,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 6,
    lineHeight: 20,
  },
  demoFillBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentAILight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.accentAIBorder,
    marginBottom: Spacing.lg,
    gap: 8,
  },
  demoFillText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    flex: 1,
  },
  demoHighlight: {
    fontWeight: Typography.weights.bold,
    color: Colors.accentAI,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dangerLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    gap: 8,
  },
  errorBannerText: {
    color: Colors.dangerDark,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    flex: 1,
  },
  formContainer: {
    marginBottom: Spacing.lg,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.lg,
    marginTop: -4,
  },
  forgotPasswordText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textLink,
    fontWeight: Typography.weights.medium,
  },
  submitBtn: {
    marginTop: Spacing.xs,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  signupLink: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
});
