/**
 * @module    TransactionScreen
 * @desc     Form for adding new income/expense transactions. Features a large
 *           animated amount input, spring-animated category chips, and a
 *           success checkmark animation.
 *
 * @author   CUANIFY Team
 * @since    2.0.0
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { ScreenWrapper } from '../components/layout/ScreenWrapper';
import { GlassCard } from '../components/ui/GlassCard';
import { AppButton } from '../components/ui/AppButton';
import { CategoryService, TransactionService } from '../services/insight.service';
import { Category } from '../types/api.types';
import { Colors, coloredShadow } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { stagger, Spring } from '../theme/motion';
import { formatDateFull } from '../utils/format';

// ─── Animated Chip Component ─────────────────────────────────────────────────

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function CategoryChip({
  cat,
  selected,
  onPress,
}: {
  cat: Category;
  selected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const activeStyle = cat.type === 'expense' ? styles.chipExpenseActive : styles.chipIncomeActive;
  const activeTextStyle = cat.type === 'expense' ? styles.chipExpenseTxtActive : styles.chipIncomeTxtActive;

  return (
    <AnimatedPressable
      onPressIn={() => { scale.value = withSpring(0.9, Spring.snappy); }}
      onPressOut={() => { scale.value = withSpring(1, Spring.snappy); }}
      onPress={onPress}
      style={[styles.catChip, selected && activeStyle, animStyle]}
    >
      <Text style={[styles.catChipTxt, selected && activeTextStyle]}>
        {cat.name}
      </Text>
    </AnimatedPressable>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function TransactionScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [catType, setCatType] = useState<'expense' | 'income'>('expense');
  
  const [amountFocused, setAmountFocused] = useState(false);
  const [noteFocused, setNoteFocused] = useState(false);

  // Success animation state
  const checkScale = useSharedValue(0);

  useEffect(() => {
    CategoryService.list()
      .then(setCategories)
      .catch(() => setError('Gagal memuat kategori.'));
  }, []);

  const filteredCats = categories.filter((c) => c.type === catType);

  async function handleSubmit() {
    if (!selectedCategory) {
      setError('Pilih kategori terlebih dahulu.');
      return;
    }
    const numAmount = parseInt(amount.replace(/\D/g, ''), 10);
    if (!numAmount || numAmount <= 0) {
      setError('Masukkan nominal yang valid.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await TransactionService.create({
        category_id: selectedCategory,
        amount: numAmount,
        transaction_date: date,
        note: note.trim() || undefined,
      });
      
      // Trigger success state and animation
      setSuccess(true);
      checkScale.value = withSequence(
        withSpring(1.2, Spring.bouncy),
        withSpring(1, Spring.snappy)
      );
      
      setAmount('');
      setNote('');
      setSelectedCategory(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e?.message || 'Gagal menyimpan transaksi.');
    } finally {
      setLoading(false);
    }
  }

  const checkAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(stagger(0)).springify()}>
            <Text style={styles.pageTitle}>Tambah Transaksi</Text>
            <Text style={styles.dateSub}>{formatDateFull(date)}</Text>
          </Animated.View>

          {/* Type Switcher */}
          <Animated.View entering={FadeInDown.delay(stagger(1)).springify()} style={styles.typeSwitcher}>
            {(['expense', 'income'] as const).map((type) => {
              const active = catType === type;
              return (
                <Pressable
                  key={type}
                  style={[
                    styles.typeBtn,
                    active && (type === 'expense' ? styles.typeBtnActiveExpense : styles.typeBtnActiveIncome),
                  ]}
                  onPress={() => {
                    setCatType(type);
                    setSelectedCategory(null);
                  }}
                >
                  <Text style={[styles.typeTxt, active && styles.typeTxtActive]}>
                    {type === 'expense' ? '💸 Pengeluaran' : '💰 Pemasukan'}
                  </Text>
                </Pressable>
              );
            })}
          </Animated.View>

          {/* Amount */}
          <Animated.View entering={FadeInDown.delay(stagger(2)).springify()}>
            <GlassCard style={[styles.card, amountFocused && styles.cardFocused]}>
              <Text style={styles.label}>Nominal (Rp)</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={(v) => setAmount(v.replace(/\D/g, ''))}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
                returnKeyType="done"
                onFocus={() => setAmountFocused(true)}
                onBlur={() => setAmountFocused(false)}
              />
            </GlassCard>
          </Animated.View>

          {/* Category */}
          <Animated.View entering={FadeInDown.delay(stagger(3)).springify()}>
            <GlassCard style={styles.card}>
              <Text style={styles.label}>Kategori</Text>
              <View style={styles.catGrid}>
                {filteredCats.map((cat) => (
                  <CategoryChip
                    key={cat.id}
                    cat={cat}
                    selected={selectedCategory === cat.id}
                    onPress={() => setSelectedCategory(cat.id)}
                  />
                ))}
              </View>
            </GlassCard>
          </Animated.View>

          {/* Note */}
          <Animated.View entering={FadeInDown.delay(stagger(4)).springify()}>
            <GlassCard style={[styles.card, noteFocused && styles.cardFocused]}>
              <Text style={styles.label}>Catatan (opsional)</Text>
              <TextInput
                style={styles.noteInput}
                value={note}
                onChangeText={setNote}
                placeholder="Tambah catatan..."
                placeholderTextColor={Colors.textMuted}
                multiline
                returnKeyType="done"
                onFocus={() => setNoteFocused(true)}
                onBlur={() => setNoteFocused(false)}
              />
            </GlassCard>
          </Animated.View>

          {/* Feedback */}
          <Animated.View entering={FadeInDown.delay(stagger(5)).springify()}>
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            ) : null}

            {success ? (
              <Animated.View entering={FadeIn} style={styles.successBox}>
                <Animated.Text style={[styles.successIcon, checkAnimStyle]}>
                  ✅
                </Animated.Text>
                <Text style={styles.successText}>Transaksi berhasil disimpan!</Text>
              </Animated.View>
            ) : null}

            <AppButton
              label={loading ? 'Menyimpan...' : 'Simpan Transaksi'}
              onPress={handleSubmit}
              loading={loading}
              fullWidth
              style={styles.submitBtn}
            />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: 100,
  },
  pageTitle: {
    fontFamily: FontFamily.soraBold,
    fontSize: FontSize['3xl'],
    color: Colors.textMain,
  },
  dateSub: {
    fontFamily: FontFamily.sora,
    fontSize: FontSize.base,
    color: Colors.textMuted,
    marginTop: -Spacing.xs,
  },

  // Type Switcher
  typeSwitcher: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: Colors.lineSoft,
  },
  typeBtnActiveExpense: {
    backgroundColor: Colors.dangerSoft,
    borderColor: Colors.dangerBorder,
  },
  typeBtnActiveIncome: {
    backgroundColor: Colors.successSoft,
    borderColor: Colors.successBorder,
  },
  typeTxt: {
    fontFamily: FontFamily.soraMedium,
    fontSize: FontSize.body,
    color: Colors.textMuted,
  },
  typeTxtActive: {
    color: Colors.textMain,
  },

  // Highlight Cards on Focus
  card: {
    borderWidth: 1,
    borderColor: 'transparent', // controlled by GlassCard internally, but we can override wrapper
  },
  cardFocused: {
    borderColor: Colors.accentMedium,
    ...coloredShadow(Colors.accent, 0.1),
  },

  // Inputs
  label: {
    fontFamily: FontFamily.sora,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  amountInput: {
    fontFamily: FontFamily.soraBold,
    fontSize: FontSize['4xl'],
    color: Colors.textMain,
    letterSpacing: -1,
  },
  noteInput: {
    fontFamily: FontFamily.sora,
    fontSize: FontSize.body,
    color: Colors.textMain,
    minHeight: 60,
    textAlignVertical: 'top',
  },

  // Category Chips
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  catChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: Colors.line,
  },
  chipExpenseActive: {
    backgroundColor: Colors.danger,
    borderColor: Colors.dangerBorder,
    ...coloredShadow(Colors.danger, 0.2),
  },
  chipIncomeActive: {
    backgroundColor: Colors.success,
    borderColor: Colors.successBorder,
    ...coloredShadow(Colors.success, 0.2),
  },
  catChipTxt: {
    fontFamily: FontFamily.soraMedium,
    fontSize: FontSize.body,
    color: Colors.textMuted,
  },
  chipExpenseTxtActive: {
    color: '#fff',
  },
  chipIncomeTxtActive: {
    color: '#fff',
  },

  // Feedback
  errorBox: {
    backgroundColor: Colors.dangerSoft,
    borderWidth: 1,
    borderColor: Colors.dangerBorder,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontFamily: FontFamily.sora,
    fontSize: FontSize.base,
    color: Colors.danger,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.successSoft,
    borderWidth: 1,
    borderColor: Colors.successBorder,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  successIcon: {
    fontSize: 20,
  },
  successText: {
    fontFamily: FontFamily.soraSemiBold,
    fontSize: FontSize.body,
    color: Colors.success,
  },
  submitBtn: {
    marginTop: Spacing.xs,
  },
});
