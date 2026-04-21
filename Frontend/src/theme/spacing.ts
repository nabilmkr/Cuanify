/**
 * @module    Spacing
 * @desc     4pt base grid spacing system and border radius tokens.
 *           Every dimension in the app derives from this scale.
 *
 * @author   CUANIFY Team
 * @since    2.0.0
 */

// ─── Spacing Scale (4pt base grid) ──────────────────────────────────────────

export const Spacing = {
  /** 2px */  '2xs': 2,
  /** 4px */  xs:    4,
  /** 6px */  sm:    6,
  /** 8px */  md:    8,
  /** 12px */ base:  12,
  /** 16px */ lg:    16,
  /** 20px */ xl:    20,
  /** 24px */ '2xl': 24,
  /** 32px */ '3xl': 32,
  /** 40px */ '4xl': 40,
  /** 48px */ '5xl': 48,
  /** 64px */ '6xl': 64,
  /** 80px */ '7xl': 80,
} as const;

// ─── Border Radius ───────────────────────────────────────────────────────────

export const Radius = {
  /** 4px  — subtle rounding */  xs:   4,
  /** 8px  — chips, badges */    sm:   8,
  /** 12px — inputs, buttons */  md:   12,
  /** 16px — cards */            lg:   16,
  /** 20px — large cards */      xl:   20,
  /** 24px — hero cards */       '2xl': 24,
  /** 9999 — pills / circles */  full: 9999,
} as const;
