/**
 * @module    Motion
 * @desc     Animation presets for react-native-reanimated. Centralizes all
 *           spring configs, timing durations, and stagger helpers so that
 *           every animation in the app feels cohesive.
 *
 * @requires react-native-reanimated
 *
 * @example
 * import { Motion } from '../theme/motion';
 * withSpring(1, Motion.spring.snappy);
 * FadeInDown.delay(Motion.stagger(index)).springify();
 *
 * @author   CUANIFY Team
 * @since    2.0.0
 */
import { Easing } from 'react-native-reanimated';

// ─── Duration Tokens (milliseconds) ─────────────────────────────────────────

export const Duration = {
  instant: 100,
  fast:    200,
  normal:  300,
  slow:    500,
  slower:  700,
} as const;

// ─── Spring Presets (for withSpring) ─────────────────────────────────────────

export const Spring = {
  /** Snappy — buttons, chips, micro-interactions */
  snappy:  { damping: 20, stiffness: 250, mass: 0.8 },
  /** Bouncy — playful elements, FAB, success animations */
  bouncy:  { damping: 12, stiffness: 180, mass: 1.0 },
  /** Smooth — page transitions, cards entering */
  smooth:  { damping: 25, stiffness: 200, mass: 1.0 },
  /** Stiff — data-driven UI, charts */
  stiff:   { damping: 30, stiffness: 300, mass: 0.8 },
} as const;

// ─── Easing Presets (for withTiming) ─────────────────────────────────────────

export const Easings = {
  /** Material Design standard curve */
  standard:   Easing.bezier(0.4, 0.0, 0.2, 1),
  /** Decelerate — elements entering view */
  decelerate: Easing.bezier(0.0, 0.0, 0.2, 1),
  /** Accelerate — elements leaving view */
  accelerate: Easing.bezier(0.4, 0.0, 1.0, 1),
  /** Sharp — fast state changes */
  sharp:      Easing.bezier(0.4, 0.0, 0.6, 1),
} as const;

// ─── Stagger Helper ──────────────────────────────────────────────────────────

/**
 * Calculate stagger delay for list item entry animations.
 * @param index - Item index in the list
 * @param base  - Base delay per item (default 60ms)
 * @returns Delay in milliseconds
 */
export const stagger = (index: number, base = 60): number => index * base;

// ─── Unified Export ──────────────────────────────────────────────────────────

export const Motion = {
  duration: Duration,
  spring:   Spring,
  easing:   Easings,
  stagger,
} as const;
