/**
 * CUANIFY — Format Utilities
 * Port dari frontend web lama, disesuaikan untuk mobile
 */

/**
 * Format angka ke format Rupiah Indonesia.
 * Contoh: 1500000 → "Rp 1.500.000"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format angka singkat untuk label grafik.
 * Contoh: 1500000 → "1,5jt" | 500000 → "500rb"
 */
export function formatCurrencyCompact(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1).replace('.0', '')}jt`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}rb`;
  }
  return String(amount);
}

/**
 * Format tanggal ISO ke label human-friendly.
 * Contoh: "2025-04-20" → "20 Apr"
 */
export function formatDateLabel(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

/**
 * Format tanggal ISO ke format lengkap.
 * Contoh: "2025-04-20" → "20 April 2025"
 */
export function formatDateFull(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Nama bulan dalam Bahasa Indonesia.
 */
export const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export function getMonthName(month: number): string {
  return MONTH_NAMES[month - 1] ?? '';
}
