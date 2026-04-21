/**
 * @module    HomeScreen
 * @desc     Main dashboard showing total balance, spending ratio, trend chart,
 *           AI insight, and recent transactions. Uses skeleton loaders during
 *           data fetch and EmptyState when no transactions exist.
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
  TextInput,
  RefreshControl,
  Image,
  Pressable,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenWrapper } from '../components/layout/ScreenWrapper';
import { GlassCard } from '../components/ui/GlassCard';
import { BarChart } from '../components/ui/BarChart';
import { TransactionRow } from '../components/ui/TransactionRow';
import { InsightCard } from '../components/ui/InsightCard';
import { CardSkeleton, ChartSkeleton } from '../components/feedback/Skeleton';
import { EmptyState } from '../components/feedback/EmptyState';
import { useAuthStore } from '../store/useAuthStore';
import { DashboardService } from '../services/dashboard.service';
import { InsightService } from '../services/insight.service';
import { DashboardData } from '../types/api.types';
import { Colors, coloredShadow } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { stagger } from '../theme/motion';
import { formatCurrency, getMonthName } from '../utils/format';

// ─── Component ───────────────────────────────────────────────────────────────

export function HomeScreen() {
  const { user, logout } = useAuthStore();
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [insightLoading, setInsightLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  // ─── Data Fetching ───────────────────────────────────────────────────────

  const fetchDashboard = useCallback(async () => {
    try {
      setError('');
      const result = await DashboardService.get(month, year);
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Gagal memuat dashboard.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboard();
  }, [fetchDashboard]);

  async function handleRefreshInsight() {
    setInsightLoading(true);
    try {
      await InsightService.refresh(month, year);
      await fetchDashboard();
    } catch (e: any) {
      setError(e?.message || 'Gagal refresh insight AI.');
    } finally {
      setInsightLoading(false);
    }
  }

  // ─── Derived State ───────────────────────────────────────────────────────

  const transactions = data?.recent_transactions ?? [];
  const filtered = search.trim()
    ? transactions.filter(
        (t) =>
          t.note?.toLowerCase().includes(search.toLowerCase()) ||
          t.category?.name?.toLowerCase().includes(search.toLowerCase()),
      )
    : transactions;

  const income = data?.summary.total_income ?? 0;
  const expense = data?.summary.total_expense ?? 0;
  const ratio = income > 0 ? Math.min(1, expense / income) : 0;

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.accentLight}
          />
        }
      >
        {/* ── Top Bar ─────────────────────────────── */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>Hai, {user?.name?.split(' ')[0]} 👋</Text>
            <Text style={styles.period}>
              {getMonthName(month)} {year}
            </Text>
          </View>
          <Pressable style={styles.avatarWrap} onPress={logout}>
            <Image
              source={{ uri: user?.avatar_url || 'https://i.pravatar.cc/96' }}
              style={styles.avatar}
            />
          </Pressable>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        ) : null}

        {/* ── Balance Card ─────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(stagger(0)).springify()}>
          <LinearGradient
            colors={['rgba(139,92,246,0.20)', 'rgba(96,165,250,0.08)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceCard}
          >
            <Text style={styles.balanceLabel}>Total Saldo</Text>
            <Text style={styles.balanceAmount}>
              {loading ? '...' : formatCurrency(data?.summary.total_balance ?? 0)}
            </Text>
            <View style={styles.balanceRow}>
              <View style={styles.balanceStat}>
                <Text style={styles.statLabel}>Pemasukan</Text>
                <Text style={[styles.statVal, styles.income]}>
                  +{loading ? '...' : formatCurrency(income)}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.balanceStat}>
                <Text style={styles.statLabel}>Pengeluaran</Text>
                <Text style={[styles.statVal, styles.expense]}>
                  -{loading ? '...' : formatCurrency(expense)}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── Spending Bar ─────────────────────────── */}
        {!loading && income > 0 && (
          <Animated.View entering={FadeInDown.delay(stagger(1)).springify()}>
            <GlassCard>
              <View style={styles.cardHeader}>
                <Text style={styles.panelTitle}>Pengeluaran Bulan Ini</Text>
                <Text style={styles.panelSub}>{Math.round(ratio * 100)}% dari pemasukan</Text>
              </View>
              <View style={styles.progressTrack}>
                <LinearGradient
                  colors={Colors.gradientAccent}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${ratio * 100}%` }]}
                />
              </View>
            </GlassCard>
          </Animated.View>
        )}

        {/* ── Trend Chart ──────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(stagger(2)).springify()}>
          <GlassCard>
            <View style={styles.cardHeader}>
              <Text style={styles.panelTitle}>Grafik Pengeluaran</Text>
              <Text style={styles.panelSub}>7 hari terakhir</Text>
            </View>
            {loading ? (
              <ChartSkeleton />
            ) : data?.trend_preview?.points ? (
              <BarChart points={data.trend_preview.points.map(p => ({ label: p.label, value: p.expense }))} />
            ) : (
              <EmptyState
                icon="📊"
                title="Belum ada data"
                description="Catat transaksi untuk melihat tren"
              />
            )}
          </GlassCard>
        </Animated.View>

        {/* ── AI Insight ───────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(stagger(3)).springify()}>
          <InsightCard
            insight={data?.insight_preview?.ai_insight}
            prediction={data?.insight_preview?.ml_prediction}
            onRefresh={handleRefreshInsight}
            loading={insightLoading}
          />
        </Animated.View>

        {/* ── Recent Transactions ──────────────────── */}
        <Animated.View entering={FadeInDown.delay(stagger(4)).springify()}>
          <GlassCard>
            <View style={styles.cardHeader}>
              <Text style={styles.panelTitle}>Transaksi Terkini</Text>
              <Text style={styles.panelSub}>{filtered.length} item</Text>
            </View>

            {/* Search with focus glow */}
            <TextInput
              style={[styles.searchInput, searchFocused && styles.searchFocused]}
              value={search}
              onChangeText={setSearch}
              placeholder="Cari kategori atau catatan..."
              placeholderTextColor={Colors.textMuted}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />

            {loading ? (
              <View style={styles.skeletonList}>
                {[0, 1, 2].map((i) => <CardSkeleton key={i} />)}
              </View>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={search ? '🔍' : '📝'}
                title={search ? 'Tidak ditemukan' : 'Belum ada transaksi'}
                description={search ? 'Coba kata kunci lain' : 'Mulai catat pengeluaranmu'}
              />
            ) : (
              <View style={styles.txList}>
                {filtered.map((tx) => (
                  <TransactionRow key={tx.id} item={tx} />
                ))}
              </View>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontFamily: FontFamily.soraBold,
    fontSize: FontSize.xl,
    color: Colors.textMain,
  },
  period: {
    fontFamily: FontFamily.sora,
    fontSize: FontSize.base,
    color: Colors.textMuted,
    marginTop: 2,
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Colors.accentMedium,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
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

  // Balance card
  balanceCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: Spacing.xl,
    gap: Spacing.md,
    ...coloredShadow(Colors.accent, 0.1),
  },
  balanceLabel: {
    fontFamily: FontFamily.soraMedium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  balanceAmount: {
    fontFamily: FontFamily.soraBold,
    fontSize: FontSize['4xl'],
    color: Colors.textMain,
    letterSpacing: -1,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: Spacing.xl,
  },
  balanceStat: { gap: 2 },
  statLabel: {
    fontFamily: FontFamily.sora,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statVal: {
    fontFamily: FontFamily.soraSemiBold,
    fontSize: FontSize.sub,
  },
  income:  { color: Colors.success },
  expense: { color: Colors.danger },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.line,
  },

  // Card sections
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
  },
  progressTrack: {
    height: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.lineSoft,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
  },

  // Search
  searchInput: {
    borderWidth: 1,
    borderColor: Colors.line,
    backgroundColor: Colors.bgInput,
    color: Colors.textMain,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontFamily: FontFamily.sora,
    fontSize: FontSize.base,
    marginBottom: Spacing.base,
  },
  searchFocused: {
    borderColor: Colors.accent,
    ...coloredShadow(Colors.accent, 0.1),
  },

  // Lists
  skeletonList: { gap: Spacing.md },
  txList: { gap: Spacing.xs },
});
