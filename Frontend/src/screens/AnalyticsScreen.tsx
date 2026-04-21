/**
 * @module    AnalyticsScreen
 * @desc     Financial analytics dashboard with animated range switcher,
 *           trend chart, and category distribution breakdown.
 *
 * @author   CUANIFY Team
 * @since    2.0.0
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ScreenWrapper } from '../components/layout/ScreenWrapper';
import { GlassCard } from '../components/ui/GlassCard';
import { BarChart } from '../components/ui/BarChart';
import { CategoryRow } from '../components/ui/CategoryRow';
import { ChartSkeleton, CardSkeleton } from '../components/feedback/Skeleton';
import { EmptyState } from '../components/feedback/EmptyState';
import { AnalyticsService, AnalyticsRange } from '../services/analytics.service';
import { TrendData, CategoryDistributionData } from '../types/api.types';
import { Colors } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { stagger } from '../theme/motion';
import { formatCurrency } from '../utils/format';

// ─── Range Options ───────────────────────────────────────────────────────────

const RANGES: { key: AnalyticsRange; label: string }[] = [
  { key: 'week',  label: 'Minggu' },
  { key: 'month', label: 'Bulan' },
  { key: 'year',  label: 'Tahun' },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function AnalyticsScreen() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [range, setRange] = useState<AnalyticsRange>('month');
  const [trend, setTrend] = useState<TrendData | null>(null);
  const [distribution, setDistribution] = useState<CategoryDistributionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // ─── Data Fetching ───────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    setError('');
    try {
      const [t, d] = await Promise.all([
        AnalyticsService.getTrend(range, month, year),
        AnalyticsService.getCategoryDistribution(range, month, year),
      ]);
      setTrend(t);
      setDistribution(d);
    } catch (e: any) {
      setError(e?.message || 'Gagal memuat analytics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [range, month, year]);

  useEffect(() => {
    setLoading(true);
    fetchAll();
  }, [fetchAll]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAll();
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accentLight} />
        }
      >
        <Text style={styles.pageTitle}>Analytics</Text>

        {/* ── Range Switcher ───────────────────────── */}
        <View style={styles.rangeSwitcher}>
          {RANGES.map((r) => {
            const active = range === r.key;
            return (
              <Pressable
                key={r.key}
                style={[styles.rangeBtn, active && styles.rangeBtnActive]}
                onPress={() => setRange(r.key)}
              >
                <Text style={[styles.rangeTxt, active && styles.rangeTxtActive]}>
                  {r.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {/* ── Trend Chart ──────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(stagger(0)).springify()}>
          <GlassCard>
            <View style={styles.cardHeader}>
              <Text style={styles.panelTitle}>Spending Overview</Text>
              {trend && (
                <Text style={styles.panelSub} numberOfLines={1}>
                  {trend.start_date} – {trend.end_date}
                </Text>
              )}
            </View>
            {loading ? (
              <ChartSkeleton />
            ) : trend?.points ? (
              <BarChart points={trend.points.map(p => ({ label: p.label, value: p.expense }))} height={140} />
            ) : (
              <EmptyState icon="📈" title="Tidak ada data" description="Pilih rentang waktu lain" />
            )}
          </GlassCard>
        </Animated.View>

        {/* ── Category Distribution ────────────────── */}
        <Animated.View entering={FadeInDown.delay(stagger(1)).springify()}>
          <GlassCard>
            <View style={styles.cardHeader}>
              <Text style={styles.panelTitle}>Distribusi Kategori</Text>
              {distribution && (
                <Text style={styles.panelSub}>
                  {formatCurrency(distribution.total_expense)}
                </Text>
              )}
            </View>

            {loading ? (
              <View style={styles.catList}>
                {[0, 1, 2].map((i) => <CardSkeleton key={i} />)}
              </View>
            ) : distribution && distribution.categories.length > 0 ? (
              <View style={styles.catList}>
                {distribution.categories.map((cat, index) => (
                  <CategoryRow key={cat.category_id} item={cat} index={index} />
                ))}
              </View>
            ) : (
              <EmptyState
                icon="🏷️"
                title="Belum ada pengeluaran"
                description="Data distribusi akan muncul setelah ada transaksi"
              />
            )}
          </GlassCard>
        </Animated.View>
      </ScrollView>
    </ScreenWrapper>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: 100,
  },
  pageTitle: {
    fontFamily: FontFamily.soraBold,
    fontSize: FontSize['3xl'],
    color: Colors.textMain,
  },

  // Range switcher
  rangeSwitcher: {
    flexDirection: 'row',
    backgroundColor: Colors.glassBg,
    borderRadius: Radius.md,
    padding: 3,
    gap: 3,
  },
  rangeBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  rangeBtnActive: {
    backgroundColor: Colors.accentSoft,
  },
  rangeTxt: {
    fontFamily: FontFamily.soraMedium,
    fontSize: FontSize.base,
    color: Colors.textMuted,
  },
  rangeTxtActive: {
    color: Colors.textAccentSoft,
  },

  // Feedback
  errorBox: {
    backgroundColor: Colors.dangerSoft,
    borderWidth: 1,
    borderColor: Colors.dangerBorder,
    borderRadius: Radius.md,
    padding: Spacing.base,
  },
  errorText: {
    fontFamily: FontFamily.sora,
    fontSize: FontSize.base,
    color: Colors.danger,
  },

  // Card headers
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  panelTitle: {
    fontFamily: FontFamily.soraSemiBold,
    fontSize: FontSize.sub,
    color: Colors.textMain,
  },
  panelSub: {
    fontFamily: FontFamily.sora,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    maxWidth: 130,
  },
  catList: {
    gap: Spacing.lg,
  },
});
