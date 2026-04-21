/**
 * @module    CustomTabBar
 * @desc     Premium bottom tab bar with BlurView background, active glow dot
 *           indicator, and floating FAB center button. Extracted from RootNavigator
 *           for clean separation of concerns.
 *
 * @requires expo-blur — frosted glass tab bar effect
 * @requires expo-linear-gradient — FAB gradient + glow
 * @requires react-native-safe-area-context — bottom inset padding
 *
 * @author   CUANIFY Team
 * @since    2.0.0
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Colors, coloredShadow } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import { Spring } from '../theme/motion';

// ─── Tab Configuration ───────────────────────────────────────────────────────

const TAB_CONFIG: Record<string, { icon: keyof typeof Ionicons.glyphMap; label: string }> = {
  Home:          { icon: 'home',      label: 'Home' },
  Analytics:     { icon: 'bar-chart', label: 'Analitik' },
  AddTransaction:{ icon: 'add',       label: '' },
  Profile:       { icon: 'person',    label: 'Profil' },
};

// ─── Animated Tab Item ───────────────────────────────────────────────────────

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function TabItem({
  routeName,
  active,
  onPress,
}: {
  routeName: string;
  active: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const config = TAB_CONFIG[routeName];

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!config) return null;

  // Center FAB button
  if (routeName === 'AddTransaction') {
    return (
      <AnimatedPressable
        onPressIn={() => { scale.value = withSpring(0.9, Spring.bouncy); }}
        onPressOut={() => { scale.value = withSpring(1, Spring.bouncy); }}
        onPress={onPress}
        style={[styles.fabWrapper, animStyle]}
      >
        <LinearGradient
          colors={Colors.gradientFab}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  // Regular tab item
  const color = active ? Colors.navActive : Colors.navInactive;

  return (
    <AnimatedPressable
      onPressIn={() => { scale.value = withSpring(0.92, Spring.snappy); }}
      onPressOut={() => { scale.value = withSpring(1, Spring.snappy); }}
      onPress={onPress}
      style={[styles.tabItem, animStyle]}
    >
      <Ionicons name={config.icon} size={22} color={color} />
      {config.label ? (
        <Text style={[styles.tabLabel, { color }]}>{config.label}</Text>
      ) : null}
      {/* Active glow dot */}
      {active && <View style={styles.activeDot} />}
    </AnimatedPressable>
  );
}

// ─── Main Tab Bar ────────────────────────────────────────────────────────────

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 8);

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      {/* Blur background */}
      <BlurView
        intensity={Platform.OS === 'ios' ? 60 : 0}
        tint="dark"
        style={StyleSheet.absoluteFillObject}
      />

      {/* Solid fallback for Android */}
      <View style={styles.androidBg} />

      {/* Tab items */}
      <View style={styles.tabRow}>
        {state.routes.map((route, index) => (
          <TabItem
            key={route.key}
            routeName={route.name}
            active={state.index === index}
            onPress={() => navigation.navigate(route.name)}
          />
        ))}
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    overflow: 'hidden',
  },
  androidBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6,6,8,0.95)',
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: Spacing.md,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
    minWidth: 56,
    gap: 3,
  },
  tabLabel: {
    fontFamily: FontFamily.soraMedium,
    fontSize: 10,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.navActive,
    marginTop: 2,
  },
  fabWrapper: {
    top: -20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...coloredShadow(Colors.accent, 0.45),
  },
});
