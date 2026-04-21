/**
 * @module    TransactionRow
 * @desc     Single transaction list item with category icon, amount,
 *           and spring press feedback. Income shows green, expense shows red.
 *
 * @requires react-native-reanimated — spring press animation
 *
 * @author   CUANIFY Team
 * @since    2.0.0
 */
import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Transaction } from '../../types/api.types';
import { Colors, coloredShadow } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { Spring } from '../../theme/motion';
import { formatCurrency, formatDateLabel } from '../../utils/format';

// ─── Category Icon Map ───────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, string> = {
  'Makanan':     '🍔',
  'Transportasi':'🚗',
  'Belanja':     '🛍️',
  'Hiburan':     '🎮',
  'Kesehatan':   '💊',
  'Pendidikan':  '📚',
  'Gaji':        '💰',
  'Freelance':   '💻',
  'Investasi':   '📈',
  'Lainnya':     '📌',
};

// ─── Props ───────────────────────────────────────────────────────────────────

interface TransactionRowProps {
  item: Transaction;
}

// ─── Component ───────────────────────────────────────────────────────────────

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const TransactionRow = memo(function TransactionRow({ item }: TransactionRowProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isIncome = item.category?.type === 'income';
  const icon = CATEGORY_ICONS[item.category?.name ?? ''] || '📌';
  const amountColor = isIncome ? Colors.success : Colors.danger;

  return (
    <AnimatedPressable
      onPressIn={() => { scale.value = withSpring(0.97, Spring.snappy); }}
      onPressOut={() => { scale.value = withSpring(1, Spring.snappy); }}
      style={[styles.row, animStyle]}
    >
      {/* Category icon with subtle glow */}
      <View style={[styles.iconWrap, { ...coloredShadow(amountColor, 0.15) }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      {/* Transaction info */}
      <View style={styles.info}>
        <Text style={styles.category} numberOfLines={1}>
          {item.category?.name || 'Uncategorized'}
        </Text>
        <Text style={styles.note} numberOfLines={1}>
          {item.note || formatDateLabel(item.transaction_date)}
        </Text>
      </View>

      {/* Amount */}
      <Text style={[styles.amount, { color: amountColor }]}>
        {isIncome ? '+' : '-'}{formatCurrency(item.amount)}
      </Text>
    </AnimatedPressable>
  );
});

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.base,
    gap: Spacing.base,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  category: {
    fontFamily: FontFamily.soraMedium,
    fontSize: FontSize.body,
    color: Colors.textMain,
  },
  note: {
    fontFamily: FontFamily.sora,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  amount: {
    fontFamily: FontFamily.soraSemiBold,
    fontSize: FontSize.body,
    letterSpacing: -0.3,
  },
});
