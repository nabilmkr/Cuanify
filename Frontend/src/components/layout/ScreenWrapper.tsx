/**
 * @module    ScreenWrapper
 * @desc     Root layout wrapper for every screen. Provides mesh gradient
 *           background with colored blobs, properly configured StatusBar,
 *           and accurate SafeArea insets.
 *
 * @requires expo-linear-gradient — base gradient layer
 * @requires react-native-safe-area-context — inset-aware padding
 *
 * @example
 * <ScreenWrapper>
 *   <ScrollView>{children}</ScrollView>
 * </ScreenWrapper>
 *
 * @author   CUANIFY Team
 * @since    2.0.0
 */
import React from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';

// ─── Props ───────────────────────────────────────────────────────────────────

interface ScreenWrapperProps {
  children: React.ReactNode;
  /** Skip SafeArea top padding (e.g. for login hero) */
  noSafeArea?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ScreenWrapper({ children, noSafeArea = false }: ScreenWrapperProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Base gradient layer */}
      <LinearGradient
        colors={[Colors.bgMain, Colors.bgSoft]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Mesh gradient blobs for depth */}
      <View style={[styles.blob, styles.blobPurple]} />
      <View style={[styles.blob, styles.blobBlue]} />

      {/* Content */}
      <View
        style={[
          styles.content,
          !noSafeArea && { paddingTop: insets.top },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgMain,
  },
  content: {
    flex: 1,
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  blobPurple: {
    width: 300,
    height: 300,
    top: -100,
    left: -80,
    backgroundColor: 'rgba(139,92,246,0.08)',
  },
  blobBlue: {
    width: 250,
    height: 250,
    bottom: -60,
    right: -60,
    backgroundColor: 'rgba(96,165,250,0.05)',
  },
});
