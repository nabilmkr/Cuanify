/**
 * @module    LoginScreen
 * @desc     Authentication screen with logo/brand hero, Sanctum token input,
 *           and stagger entry animations. Supports logo image from assets
 *           with Orbitron text fallback.
 *
 * @requires expo-linear-gradient — hero decoration blob
 * @requires react-native-reanimated — stagger entry animations
 *
 * @author   CUANIFY Team
 * @since    2.0.0
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenWrapper } from '../components/layout/ScreenWrapper';
import { AppButton } from '../components/ui/AppButton';
import { GlassCard } from '../components/ui/GlassCard';
import { useAuthStore } from '../store/useAuthStore';
import { AuthService } from '../services/auth.service';
import { Colors, coloredShadow } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { stagger } from '../theme/motion';

// ─── Logo Asset ──────────────────────────────────────────────────────────────

// Letakkan file logo di Frontend/assets/logo.png
// Jika file belum ada, hero section akan menampilkan teks "CUANIFY"
let logoSource: any = null;
try {
  logoSource = require('../../assets/logo.png');
} catch {
  // File belum tersedia — fallback ke text brand
}

// ─── Component ───────────────────────────────────────────────────────────────

export function LoginScreen() {
  const [tokenDraft, setTokenDraft] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const { setToken, setUser } = useAuthStore();

  async function handleLogin() {
    const trimmed = tokenDraft.trim();
    if (!trimmed) {
      setError('Masukkan Sanctum API token terlebih dahulu.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await setToken(trimmed);
      const user = await AuthService.me();
      setUser(user);
    } catch (e: any) {
      setError(e?.message || 'Token tidak valid atau server tidak dapat dijangkau.');
      await setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenWrapper noSafeArea>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Hero Section ──────────────────────────── */}
          <View style={styles.heroSection}>
            {/* Decorative purple blob */}
            <LinearGradient
              colors={['rgba(139,92,246,0.30)', 'transparent']}
              style={styles.heroBall}
            />

            {/* Logo or Brand Text */}
            <Animated.View entering={FadeInDown.delay(stagger(0)).springify()}>
              {logoSource ? (
                <Image source={logoSource} style={styles.logo} resizeMode="contain" />
              ) : (
                <Text style={styles.brand}>CUANIFY</Text>
              )}
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(stagger(1)).springify()}>
              <Text style={styles.tagline}>Cuanify your life.</Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(stagger(2)).springify()}>
              <Text style={styles.subtitle}>
                Kelola keuangan lebih cerdas dengan{'\n'}AI yang memahami polamu.
              </Text>
            </Animated.View>
          </View>

          {/* ── Login Card ────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(stagger(3)).springify()}>
            <GlassCard style={styles.card}>
              <Text style={styles.cardTitle}>Masuk ke Akun</Text>
              <Text style={styles.cardSub}>
                Gunakan Sanctum API token dari backend untuk login.
              </Text>

              {/* Token Input with focus glow */}
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>API Token</Text>
                <TextInput
                  style={[
                    styles.input,
                    focused && styles.inputFocused,
                  ]}
                  value={tokenDraft}
                  onChangeText={setTokenDraft}
                  placeholder="1|xxxxxxxxxxxxxxxxxxxx"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry
                  returnKeyType="go"
                  onSubmitEditing={handleLogin}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                />
              </View>

              {/* Error message */}
              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>⚠️  {error}</Text>
                </View>
              ) : null}

              {/* Login button */}
              <AppButton
                label="Masuk ke Dashboard"
                onPress={handleLogin}
                loading={loading}
                fullWidth
                style={styles.loginBtn}
              />
            </GlassCard>
          </Animated.View>

          {/* Footer */}
          <Animated.View entering={FadeInDown.delay(stagger(4)).springify()}>
            <Text style={styles.footer}>CUANIFY © 2026 · AI-Powered Finance</Text>
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
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: 72,
    paddingBottom: Spacing['5xl'],
    gap: Spacing['2xl'],
  },

  // Hero
  heroSection: {
    alignItems: 'center',
    gap: Spacing.md,
    position: 'relative',
    paddingVertical: Spacing['3xl'],
  },
  heroBall: {
    position: 'absolute',
    top: -40,
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.6,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: Spacing.md,
  },
  brand: {
    fontFamily: FontFamily.orbitronBold,
    fontSize: 40,
    color: Colors.textMain,
    letterSpacing: 4,
  },
  tagline: {
    fontFamily: FontFamily.soraSemiBold,
    fontSize: FontSize['2xl'],
    color: Colors.accentLight,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FontFamily.sora,
    fontSize: FontSize.body,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Card
  card: {
    gap: Spacing.base,
  },
  cardTitle: {
    fontFamily: FontFamily.soraBold,
    fontSize: FontSize['2xl'],
    color: Colors.textMain,
  },
  cardSub: {
    fontFamily: FontFamily.sora,
    fontSize: FontSize.base,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  inputWrapper: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  label: {
    fontFamily: FontFamily.soraMedium,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.line,
    backgroundColor: Colors.bgInput,
    color: Colors.textMain,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    fontFamily: FontFamily.sora,
    fontSize: FontSize.body,
  },
  inputFocused: {
    borderColor: Colors.accent,
    ...coloredShadow(Colors.accent, 0.15),
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
  loginBtn: {
    marginTop: Spacing.md,
  },

  footer: {
    textAlign: 'center',
    fontFamily: FontFamily.sora,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    opacity: 0.5,
  },
});
