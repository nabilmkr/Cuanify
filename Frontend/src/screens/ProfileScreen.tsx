/**
 * @module    ProfileScreen
 * @desc     User profile and settings screen. Allows avatar/name editing,
 *           notification toggles, and session security management.
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
  Image,
  Switch,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ScreenWrapper } from '../components/layout/ScreenWrapper';
import { GlassCard } from '../components/ui/GlassCard';
import { AppButton } from '../components/ui/AppButton';
import { CardSkeleton } from '../components/feedback/Skeleton';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import { User } from '../types/api.types';
import { Colors, coloredShadow } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { stagger } from '../theme/motion';

// ─── Component ───────────────────────────────────────────────────────────────

export function ProfileScreen() {
  const { user, setUser, logout } = useAuthStore();
  const [profile, setProfile] = useState<User | null>(null);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [nameFocused, setNameFocused] = useState(false);
  const [avatarFocused, setAvatarFocused] = useState(false);

  // ─── Data Fetching ───────────────────────────────────────────────────────

  const fetchProfile = useCallback(async () => {
    setError('');
    try {
      const [profileRes, notifRes] = await Promise.all([
        api.get<{ status: string; data: User }>('/profile'),
        api.get<{ status: string; data: { notifications_enabled: boolean } }>(
          '/settings/notifications',
        ),
      ]);
      setProfile(profileRes.data.data);
      setNotifEnabled(notifRes.data.data.notifications_enabled);
    } catch (e: any) {
      setError(e?.message || 'Gagal memuat profil.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  // ─── Actions ─────────────────────────────────────────────────────────────

  async function handleSaveProfile() {
    if (!profile) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.put<{ status: string; data: User }>('/profile', {
        name: profile.name,
        avatar_url: profile.avatar_url || null,
      });
      setProfile(res.data.data);
      setUser(res.data.data);
      setSuccess('Profil berhasil disimpan!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: any) {
      setError(e?.message || 'Gagal menyimpan profil.');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleNotif(value: boolean) {
    setNotifEnabled(value);
    try {
      await api.put('/settings/notifications', { notifications_enabled: value });
    } catch {
      setNotifEnabled(!value); // Revert on error
    }
  }

  async function handleRevokeOtherTokens() {
    setRevoking(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/settings/security/revoke-tokens');
      setSuccess('Semua sesi lain berhasil dicabut.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: any) {
      setError(e?.message || 'Gagal mencabut sesi lain.');
    } finally {
      setRevoking(false);
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────

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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accentLight} />
          }
        >
          <Text style={styles.pageTitle}>Profil & Pengaturan</Text>

          {/* ── Avatar Section ─────────────────────── */}
          <Animated.View entering={FadeInDown.delay(stagger(0)).springify()} style={styles.avatarSection}>
            <View style={styles.avatarWrap}>
              <Image
                source={{ uri: profile?.avatar_url || user?.avatar_url || 'https://i.pravatar.cc/96' }}
                style={styles.avatar}
              />
            </View>
            <Text style={styles.userName}>{profile?.name || user?.name || 'Loading...'}</Text>
            <Text style={styles.userEmail}>{profile?.email || user?.email}</Text>
          </Animated.View>

          {/* Feedback messages */}
          {!!error && (
            <Animated.View entering={FadeInDown} style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </Animated.View>
          )}
          {!!success && (
            <Animated.View entering={FadeInDown} style={styles.successBox}>
              <Text style={styles.successText}>✅ {success}</Text>
            </Animated.View>
          )}

          {/* ── Edit Profile ───────────────────────── */}
          <Animated.View entering={FadeInDown.delay(stagger(1)).springify()}>
            {loading ? (
              <CardSkeleton />
            ) : (
              <GlassCard style={styles.card}>
                <Text style={styles.sectionTitle}>Data Profil</Text>

                <View style={styles.field}>
                  <Text style={styles.label}>Nama Panggilan</Text>
                  <TextInput
                    style={[styles.input, nameFocused && styles.inputFocused]}
                    value={profile?.name ?? ''}
                    onChangeText={(v) => setProfile((prev) => prev ? { ...prev, name: v } : prev)}
                    placeholder="Nama lengkap"
                    placeholderTextColor={Colors.textMuted}
                    onFocus={() => setNameFocused(true)}
                    onBlur={() => setNameFocused(false)}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>URL Avatar</Text>
                  <TextInput
                    style={[styles.input, avatarFocused && styles.inputFocused]}
                    value={profile?.avatar_url ?? ''}
                    onChangeText={(v) =>
                      setProfile((prev) => prev ? { ...prev, avatar_url: v || null } : prev)
                    }
                    placeholder="https://..."
                    placeholderTextColor={Colors.textMuted}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setAvatarFocused(true)}
                    onBlur={() => setAvatarFocused(false)}
                  />
                </View>

                <AppButton
                  label={saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                  onPress={handleSaveProfile}
                  loading={saving}
                  fullWidth
                  style={styles.mt}
                />
              </GlassCard>
            )}
          </Animated.View>

          {/* ── Preferences ────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(stagger(2)).springify()}>
            {loading ? (
              <CardSkeleton />
            ) : (
              <GlassCard style={styles.card}>
                <Text style={styles.sectionTitle}>Preferensi</Text>

                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>Notifikasi Insight</Text>
                    <Text style={styles.settingDesc}>
                      Dapatkan peringatan AI saat ada pengeluaran anomali.
                    </Text>
                  </View>
                  <Switch
                    value={notifEnabled}
                    onValueChange={handleToggleNotif}
                    trackColor={{ false: Colors.lineStrong, true: Colors.accent }}
                    thumbColor="#fff"
                  />
                </View>
              </GlassCard>
            )}
          </Animated.View>

          {/* ── Security ───────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(stagger(3)).springify()}>
            {loading ? (
              <CardSkeleton />
            ) : (
              <GlassCard style={styles.card}>
                <Text style={styles.sectionTitle}>Keamanan Akun</Text>

                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>Cabut Sesi Lain</Text>
                    <Text style={styles.settingDesc}>
                      Logout akun ini dari perangkat lain yang terhubung.
                    </Text>
                  </View>
                  <AppButton
                    label="Cabut"
                    onPress={handleRevokeOtherTokens}
                    loading={revoking}
                    variant="soft"
                  />
                </View>
              </GlassCard>
            )}
          </Animated.View>

          {/* ── Logout ─────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(stagger(4)).springify()}>
            <AppButton
              label="🚪 Keluar dari Akun"
              onPress={logout}
              variant="danger"
              fullWidth
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
    gap: Spacing.lg,
    paddingBottom: 100,
  },
  pageTitle: {
    fontFamily: FontFamily.soraBold,
    fontSize: FontSize['3xl'],
    color: Colors.textMain,
    marginBottom: -Spacing.sm,
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.base,
  },
  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: Colors.accent,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
    ...coloredShadow(Colors.accent, 0.2),
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userName: {
    fontFamily: FontFamily.soraBold,
    fontSize: FontSize['2xl'],
    color: Colors.textMain,
  },
  userEmail: {
    fontFamily: FontFamily.sora,
    fontSize: FontSize.base,
    color: Colors.textMuted,
  },

  // Feedback
  errorBox: {
    backgroundColor: Colors.dangerSoft,
    borderWidth: 1,
    borderColor: Colors.dangerBorder,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  errorText: {
    fontFamily: FontFamily.sora,
    fontSize: FontSize.base,
    color: Colors.danger,
  },
  successBox: {
    backgroundColor: Colors.successSoft,
    borderWidth: 1,
    borderColor: Colors.successBorder,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  successText: {
    fontFamily: FontFamily.soraSemiBold,
    fontSize: FontSize.body,
    color: Colors.success,
  },

  // Cards
  card: {
    gap: Spacing.md,
  },
  sectionTitle: {
    fontFamily: FontFamily.soraSemiBold,
    fontSize: FontSize.title,
    color: Colors.textMain,
  },

  // Form Fields
  field: {
    gap: Spacing.xs,
  },
  label: {
    fontFamily: FontFamily.sora,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    marginLeft: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.line,
    backgroundColor: Colors.bgInput,
    color: Colors.textMain,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontFamily: FontFamily.sora,
    fontSize: FontSize.body,
  },
  inputFocused: {
    borderColor: Colors.accent,
    ...coloredShadow(Colors.accent, 0.1),
  },
  mt: {
    marginTop: Spacing.xs,
  },

  // Settings
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  settingInfo: {
    flex: 1,
    gap: 2,
  },
  settingLabel: {
    fontFamily: FontFamily.soraMedium,
    fontSize: FontSize.body,
    color: Colors.textMain,
  },
  settingDesc: {
    fontFamily: FontFamily.sora,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: 16,
    paddingRight: Spacing.xl,
  },
});
