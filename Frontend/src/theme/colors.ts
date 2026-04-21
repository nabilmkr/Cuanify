/**
 * @module    Colors
 * @desc     CUANIFY design tokens — refined dark premium palette with 50-900 scales.
 *           All color decisions flow from this single source of truth.
 *
 * @author   CUANIFY Team
 * @since    2.0.0
 */

// ─── Brand Palette (Purple-Blue Spectrum) ────────────────────────────────────

export const purple = {
  50:  '#F5F3FF',
  100: '#EDE9FE',
  200: '#DDD6FE',
  300: '#C4B5FD',
  400: '#A78BFA',
  500: '#8B5CF6',
  600: '#7C3AED',
  700: '#6D28D9',
  800: '#5B21B6',
  900: '#4C1D95',
} as const;

export const blue = {
  400: '#60A5FA',
  500: '#3B82F6',
  600: '#2563EB',
} as const;

// ─── Neutral Scale (Dark-first) ──────────────────────────────────────────────

export const gray = {
  950: '#060608',
  900: '#0D0D14',
  850: '#111118',
  800: '#1A1D28',
  700: '#252836',
  600: '#3D4155',
  500: '#6B7084',
  400: '#9CA0B4',
  300: '#C4C8D8',
  200: '#E2E4ED',
  100: '#F2F3F7',
} as const;

// ─── Semantic Colors ─────────────────────────────────────────────────────────

export const semantic = {
  success:      '#10B981',
  successSoft:  'rgba(16,185,129,0.12)',
  successBorder:'rgba(16,185,129,0.35)',
  danger:       '#EF4444',
  dangerSoft:   'rgba(239,68,68,0.10)',
  dangerBorder: 'rgba(239,68,68,0.35)',
  warning:      '#F59E0B',
  warningSoft:  'rgba(245,158,11,0.10)',
  info:         '#3B82F6',
} as const;

// ─── Shadow Tokens (iOS) ─────────────────────────────────────────────────────

export const Shadows = {
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.20,
    shadowRadius: 24,
    elevation: 10,
  },
} as const;

/** Colored glow shadow — iOS only, with Android elevation fallback */
export const coloredShadow = (color: string, intensity = 0.4) => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: intensity,
  shadowRadius: 16,
  elevation: 8,
});

// ─── Unified Export (backward-compatible) ────────────────────────────────────

export const Colors = {
  // Backgrounds
  bgMain:     gray[950],
  bgSoft:     gray[900],
  bgCard:     gray[800],
  bgElevated: gray[700],
  bgInput:    'rgba(13,13,20,0.8)',

  // Text
  textMain:       gray[100],
  textSecondary:  gray[400],
  textMuted:      gray[500],
  textAccentSoft: purple[200],

  // Brand
  accent:       purple[600],
  accentLight:  purple[400],
  accentSoft:   `rgba(139,92,246,0.15)`,
  accentMedium: `rgba(139,92,246,0.25)`,
  accentBlue:   blue[400],

  // Semantic
  success:       semantic.success,
  successSoft:   semantic.successSoft,
  successBorder: semantic.successBorder,
  danger:        semantic.danger,
  dangerSoft:    semantic.dangerSoft,
  dangerBorder:  semantic.dangerBorder,
  warning:       semantic.warning,

  // Borders
  line:     'rgba(255,255,255,0.08)',
  lineSoft: 'rgba(255,255,255,0.04)',
  lineStrong: 'rgba(255,255,255,0.16)',

  // Nav
  navInactive: gray[500],
  navActive:   purple[400],

  // Glass
  glassBg:     'rgba(255,255,255,0.06)',
  glassBorder: 'rgba(255,255,255,0.12)',

  // Gradients
  gradientAccent: [purple[600], blue[400]] as readonly [string, string],
  gradientBar:    ['rgba(139,92,246,0.95)', 'rgba(139,92,246,0.15)'] as readonly [string, string],
  gradientBg:     ['rgba(139,92,246,0.10)', 'rgba(7,8,15,0.95)'] as readonly [string, string],
  gradientFab:    [purple[500], blue[400]] as readonly [string, string],
  gradientCard:   [gray[800], gray[700]] as readonly [string, string],
} as const;
