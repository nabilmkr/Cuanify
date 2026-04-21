/**
 * @module    InsightCard
 * @desc     AI financial insight card showing ML prediction badge and
 *           Gemini-generated narrative. Features accent glow border and
 *           animated refresh button.
 *
 * @requires react-native-reanimated — spin animation on refresh
 *
 * @example
 * <InsightCard
 *   insight={data?.ai_insight}
 *   prediction={data?.ml_prediction}
 *   onRefresh={handleRefresh}
 *   loading={isRefreshing}
 * />
 *
 * @author   CUANIFY Team
 * @since    2.0.0
 */
import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, coloredShadow } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';

// ─── Props ───────────────────────────────────────────────────────────────────

interface InsightCardProps {
  /** AI-generated narrative text */
  insight?: string | null;
  /** ML prediction label (e.g. "Stabil", "Kritis") */
  prediction?: string | null;
  /** Callback to refresh insight from server */
  onRefresh?: () => void;
  /** Whether a refresh is in progress */
  loading?: boolean;
}

// ─── Prediction Badge Colors ─────────────────────────────────────────────────

const PREDICTION_STYLES: Record<string, { bg: string; text: string }> = {
  'Sehat':  { bg: Colors.successSoft, text: Colors.success },
  'Stabil': { bg: 'rgba(59,130,246,0.12)', text: '#60A5FA' },
  'Kritis': { bg: Colors.dangerSoft, text: Colors.danger },
};

// ─── Component ───────────────────────────────────────────────────────────────

export function InsightCard({ insight, prediction, onRefresh, loading }: InsightCardProps) {
  // Spin animation for refresh icon
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (loading) {
      rotation.value = withRepeat(withTiming(360, { duration: 1000 }), -1, false);
    } else {
      cancelAnimation(rotation);
      rotation.value = 0;
    }
  }, [loading, rotation]);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const predStyle = PREDICTION_STYLES[prediction ?? ''] || PREDICTION_STYLES['Stabil'];

  return (
    <View style={styles.container}>
      {/* Accent glow overlay */}
      <LinearGradient
        colors={[`${Colors.accent}18`, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.aiIcon}>🧠</Text>
          <Text style={styles.title}>AI Insight</Text>
        </View>

        {prediction && (
          <View style={[styles.badge, { backgroundColor: predStyle.bg }]}>
            <Text style={[styles.badgeText, { color: predStyle.text }]}>{prediction}</Text>
          </View>
        )}
      </View>

      {/* Narrative */}
      <Text style={styles.narrative}>
        {insight || 'Belum ada analisis. Tekan refresh untuk memulai.'}
      </Text>

      {/* Refresh button */}
      {onRefresh && (
        <Pressable onPress={onRefresh} disabled={loading} style={styles.refreshBtn}>
          <Animated.Text style={[styles.refreshIcon, spinStyle]}>🔄</Animated.Text>
          <Text style={styles.refreshLabel}>
            {loading ? 'Menganalisis...' : 'Refresh Insight'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: `${Colors.accent}30`,
    padding: Spacing.lg,
    gap: Spacing.base,
    overflow: 'hidden',
    ...coloredShadow(Colors.accent, 0.12),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  aiIcon: {
    fontSize: 20,
  },
  title: {
    fontFamily: FontFamily.soraSemiBold,
    fontSize: FontSize.xl,
    color: Colors.textMain,
  },
  badge: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  badgeText: {
    fontFamily: FontFamily.soraSemiBold,
    fontSize: FontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  narrative: {
    fontFamily: FontFamily.sora,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  refreshIcon: {
    fontSize: 16,
  },
  refreshLabel: {
    fontFamily: FontFamily.soraMedium,
    fontSize: FontSize.base,
    color: Colors.accentLight,
  },
});
