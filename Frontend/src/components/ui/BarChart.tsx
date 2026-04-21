/**
 * @module    BarChart
 * @desc     Custom animated bar chart built with Views and LinearGradient.
 *           Bars grow upward on mount for a polished data-presentation feel.
 *
 * @requires expo-linear-gradient — gradient fill per bar
 * @requires react-native-reanimated — bar height entry animation
 *
 * @example
 * <BarChart points={trendData.points} height={140} />
 *
 * @author   CUANIFY Team
 * @since    2.0.0
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { Duration, Easings } from '../../theme/motion';

// ─── Types ───────────────────────────────────────────────────────────────────

interface TrendPoint {
  label: string;
  value: number;
}

interface BarChartProps {
  /** Data points to render */
  points: TrendPoint[];
  /** Chart height in pixels (default 120) */
  height?: number;
}

// ─── Animated Bar Component ──────────────────────────────────────────────────

function AnimatedBar({ value, maxVal, height }: { value: number; maxVal: number; height: number }) {
  const barHeight = useSharedValue(0);
  const ratio = maxVal > 0 ? value / maxVal : 0;

  useEffect(() => {
    barHeight.value = withTiming(ratio * height, {
      duration: Duration.slow,
      easing: Easings.decelerate,
    });
  }, [ratio, height, barHeight]);

  const animStyle = useAnimatedStyle(() => ({
    height: barHeight.value,
  }));

  return (
    <Animated.View style={[styles.barOuter, animStyle]}>
      <LinearGradient
        colors={Colors.gradientBar}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.barGradient}
      />
    </Animated.View>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function BarChart({ points, height = 120 }: BarChartProps) {
  const maxVal = Math.max(...points.map((p) => p.value), 1);

  return (
    <View>
      {/* Grid lines */}
      <View style={[styles.chartArea, { height }]}>
        <View style={styles.gridLine} />
        <View style={[styles.gridLine, { top: '50%' }]} />

        {/* Bars */}
        <View style={styles.barRow}>
          {points.map((point, i) => (
            <View key={i} style={styles.barCol}>
              <AnimatedBar value={point.value} maxVal={maxVal} height={height - 8} />
            </View>
          ))}
        </View>
      </View>

      {/* Labels */}
      <View style={styles.labelRow}>
        {points.map((point, i) => (
          <Text key={i} style={styles.label} numberOfLines={1}>
            {point.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  chartArea: {
    position: 'relative',
    justifyContent: 'flex-end',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    flex: 1,
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barOuter: {
    width: '70%',
    maxWidth: 32,
    borderRadius: Radius.xs,
    overflow: 'hidden',
    minHeight: 4,
  },
  barGradient: {
    flex: 1,
    borderRadius: Radius.xs,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  label: {
    flex: 1,
    fontFamily: FontFamily.sora,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
