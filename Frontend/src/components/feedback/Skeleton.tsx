/**
 * @module    Skeleton
 * @desc     Shimmer skeleton loaders that replace spinners during data fetching.
 *           Provides base Skeleton, CardSkeleton, and ChartSkeleton presets.
 *
 * @requires react-native-reanimated — shimmer opacity animation
 *
 * @example
 * {isLoading ? <CardSkeleton /> : <TransactionRow item={tx} />}
 *
 * @author   CUANIFY Team
 * @since    2.0.0
 */
import React, { useEffect } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '../../theme/colors';
import { Spacing, Radius } from '../../theme/spacing';
import { Duration } from '../../theme/motion';

// ─── Props ───────────────────────────────────────────────────────────────────

interface SkeletonProps {
  /** Width — number (px) or string (%) */
  width: number | `${number}%`;
  /** Height in pixels */
  height: number;
  /** Border radius (default 8) */
  borderRadius?: number;
  /** Additional styles */
  style?: StyleProp<ViewStyle>;
}

// ─── Base Skeleton ───────────────────────────────────────────────────────────

export function Skeleton({ width, height, borderRadius = Radius.sm, style }: SkeletonProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 }),
      ),
      -1,
      true,
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: 'rgba(255,255,255,0.08)',
        },
        animStyle,
        style,
      ]}
    />
  );
}

// ─── Card Skeleton (transaction row placeholder) ─────────────────────────────

export function CardSkeleton() {
  return (
    <View style={styles.cardRow}>
      <Skeleton width={44} height={44} borderRadius={22} />
      <View style={styles.cardContent}>
        <Skeleton width="65%" height={14} />
        <Skeleton width="40%" height={11} />
      </View>
      <Skeleton width={72} height={14} />
    </View>
  );
}

// ─── Chart Skeleton (bar chart placeholder) ──────────────────────────────────

export function ChartSkeleton() {
  return (
    <View style={styles.chartWrap}>
      <View style={styles.chartBars}>
        {[0.5, 0.8, 0.35, 0.65, 0.9, 0.45, 0.7].map((h, i) => (
          <Skeleton
            key={i}
            width={24}
            height={100 * h}
            borderRadius={Radius.xs}
            style={styles.chartBar}
          />
        ))}
      </View>
      <Skeleton width="100%" height={1} borderRadius={0} />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  cardContent: {
    flex: 1,
    gap: Spacing.sm,
  },
  chartWrap: {
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 100,
  },
  chartBar: {
    alignSelf: 'flex-end',
  },
});
