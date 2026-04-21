/**
 * @module    CategoryRow
 * @desc     Category distribution row with colored progress bar showing
 *           percentage of total expense. Used in AnalyticsScreen.
 *
 * @author   CUANIFY Team
 * @since    2.0.0
 */
import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CategoryDistributionItem } from '../../types/api.types';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { formatCurrency } from '../../utils/format';

// ─── Color Cycle ─────────────────────────────────────────────────────────────

const BAR_COLORS: readonly [string, string][] = [
  ['#8B5CF6', '#A78BFA'],
  ['#3B82F6', '#60A5FA'],
  ['#10B981', '#34D399'],
  ['#F59E0B', '#FBBF24'],
  ['#EF4444', '#F87171'],
  ['#EC4899', '#F472B6'],
];

// ─── Props ───────────────────────────────────────────────────────────────────

interface CategoryRowProps {
  item: CategoryDistributionItem;
  /** Index for color cycling */
  index?: number;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const CategoryRow = memo(function CategoryRow({ item, index = 0 }: CategoryRowProps) {
  const colors = BAR_COLORS[index % BAR_COLORS.length];
  const pct = Math.max(0, Math.min(100, item.percentage ?? 0));

  return (
    <View style={styles.container}>
      {/* Header row: name + amount */}
      <View style={styles.header}>
        <View style={styles.nameRow}>
          <View style={[styles.dot, { backgroundColor: colors[0] }]} />
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        </View>
        <Text style={styles.amount}>{formatCurrency(item.total)}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.track}>
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: `${pct}%` }]}
        />
      </View>

      {/* Percentage label */}
      <Text style={styles.pct}>{pct.toFixed(1)}%</Text>
    </View>
  );
});

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  name: {
    fontFamily: FontFamily.soraMedium,
    fontSize: FontSize.body,
    color: Colors.textMain,
    flex: 1,
  },
  amount: {
    fontFamily: FontFamily.soraSemiBold,
    fontSize: FontSize.body,
    color: Colors.textSecondary,
  },
  track: {
    height: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.lineSoft,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
    minWidth: 4,
  },
  pct: {
    fontFamily: FontFamily.sora,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    alignSelf: 'flex-end',
  },
});
