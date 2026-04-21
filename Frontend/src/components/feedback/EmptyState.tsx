/**
 * @module    EmptyState
 * @desc     Illustrated empty/error state with optional CTA button.
 *           Replaces plain "No data" text with a polished, branded experience.
 *
 * @requires react-native-reanimated — fade-in entry animation
 *
 * @example
 * <EmptyState
 *   icon="📊"
 *   title="Belum ada transaksi"
 *   description="Mulai catat pengeluaranmu hari ini"
 *   action={{ label: 'Tambah Transaksi', onPress: handleAdd }}
 * />
 *
 * @author   CUANIFY Team
 * @since    2.0.0
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { AppButton } from '../ui/AppButton';

// ─── Props ───────────────────────────────────────────────────────────────────

interface EmptyStateProps {
  /** Emoji or icon string displayed in the circle */
  icon: string;
  /** Primary message */
  title: string;
  /** Supporting description */
  description: string;
  /** Optional call-to-action button */
  action?: {
    label: string;
    onPress: () => void;
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {action && (
        <AppButton
          label={action.label}
          onPress={action.onPress}
          variant="soft"
          style={styles.actionBtn}
        />
      )}
    </Animated.View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['4xl'],
    paddingHorizontal: Spacing['2xl'],
    gap: Spacing.base,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.accentSoft,
    borderWidth: 1,
    borderColor: Colors.accentMedium,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  icon: {
    fontSize: 28,
  },
  title: {
    fontFamily: FontFamily.soraSemiBold,
    fontSize: FontSize.xl,
    color: Colors.textMain,
    textAlign: 'center',
  },
  description: {
    fontFamily: FontFamily.sora,
    fontSize: FontSize.base,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 260,
  },
  actionBtn: {
    marginTop: Spacing.md,
  },
});
