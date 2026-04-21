/**
 * @module    AppButton
 * @desc     Premium button with spring press animation, colored glow shadow,
 *           and loading state. Uses Pressable + Reanimated for App Store quality feel.
 *
 * @requires react-native-reanimated — spring scale animation
 * @requires expo-linear-gradient — gradient variant background
 *
 * @example
 * <AppButton label="Simpan" onPress={handleSave} loading={isSaving} />
 * <AppButton label="Hapus" variant="danger" onPress={handleDelete} />
 *
 * @author   CUANIFY Team
 * @since    2.0.0
 */
import React, { memo } from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, coloredShadow } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { Spring } from '../../theme/motion';

// ─── Types ───────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'soft' | 'ghost' | 'danger';

interface AppButtonProps {
  /** Button text */
  label: string;
  /** Press handler */
  onPress?: () => void;
  /** Visual variant */
  variant?: ButtonVariant;
  /** Show loading spinner instead of label */
  loading?: boolean;
  /** Stretch to full width */
  fullWidth?: boolean;
  /** Disable interaction */
  disabled?: boolean;
  /** Additional container styles */
  style?: StyleProp<ViewStyle>;
}

// ─── Animation setup ─────────────────────────────────────────────────────────

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ─── Component ───────────────────────────────────────────────────────────────

export const AppButton = memo(function AppButton({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  fullWidth = false,
  disabled = false,
  style,
}: AppButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, Spring.snappy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, Spring.snappy);
  };

  const isDisabled = disabled || loading;

  // Spinner color depends on variant
  const spinnerColor =
    variant === 'primary' || variant === 'danger' ? '#fff' : Colors.accentLight;

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        animatedStyle,
        styles.base,
        variantStyles[variant],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {/* Primary variant uses gradient background */}
      {variant === 'primary' && (
        <LinearGradient
          colors={Colors.gradientAccent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFillObject, { borderRadius: Radius.md }]}
        />
      )}

      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <Text style={[styles.label, labelStyles[variant]]}>{label}</Text>
      )}
    </AnimatedPressable>
  );
});

// ─── Variant Styles ──────────────────────────────────────────────────────────

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: {
    ...coloredShadow(Colors.accent, 0.35),
  },
  soft: {
    backgroundColor: Colors.accentSoft,
    borderWidth: 1,
    borderColor: Colors.accentMedium,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: Colors.danger,
    ...coloredShadow(Colors.danger, 0.3),
  },
};

const labelStyles: Record<ButtonVariant, object> = {
  primary: { color: '#FFFFFF' },
  soft:    { color: Colors.accentLight },
  ghost:   { color: Colors.accentLight },
  danger:  { color: '#FFFFFF' },
};

// ─── Base Styles ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  base: {
    height: 50,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    overflow: 'hidden',
  },
  label: {
    fontFamily: FontFamily.soraSemiBold,
    fontSize: FontSize.body,
    letterSpacing: 0.3,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.45,
  },
});
