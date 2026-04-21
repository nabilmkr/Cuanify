/**
 * @module    GlassCard
 * @desc     Frosted glass card with diagonal gradient overlay, blur effect,
 *           and proper iOS/Android shadow. The signature visual element of CUANIFY.
 *
 * @requires expo-blur — native blur backdrop
 * @requires expo-linear-gradient — glass highlight overlay
 *
 * @example
 * <GlassCard style={{ gap: 12 }}>
 *   <Text>Content inside glass</Text>
 * </GlassCard>
 *
 * @author   CUANIFY Team
 * @since    2.0.0
 */
import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Shadows } from '../../theme/colors';
import { Spacing, Radius } from '../../theme/spacing';

// ─── Props ───────────────────────────────────────────────────────────────────

interface GlassCardProps {
  children: React.ReactNode;
  /** Override container styles */
  style?: StyleProp<ViewStyle>;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function GlassCard({ children, style }: GlassCardProps) {
  return (
    <View style={[styles.container, style]}>
      {/* Backdrop blur (native platforms) */}
      <BlurView
        intensity={18}
        tint="dark"
        style={StyleSheet.absoluteFillObject}
      />

      {/* Diagonal gradient overlay for glass highlight */}
      <LinearGradient
        colors={['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.03)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Content sits on top of blur + gradient */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadows.md,
  },
  content: {
    padding: Spacing.lg,
  },
});
