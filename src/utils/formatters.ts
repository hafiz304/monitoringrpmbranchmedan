export function formatRupiah(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return 'Rp ' + Math.round(value).toLocaleString('id-ID');
}

export function formatCompactRupiah(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  if (Math.abs(value) >= 1_000_000_000) {
    return 'Rp ' + (value / 1_000_000_000).toFixed(2) + ' M';
  }
  if (Math.abs(value) >= 1_000_000) {
    return 'Rp ' + (value / 1_000_000).toFixed(1) + ' Jt';
  }
  if (Math.abs(value) >= 1_000) {
    return 'Rp ' + (value / 1_000).toFixed(0) + ' Rb';
  }
  return 'Rp ' + value.toLocaleString('id-ID');
}

export function formatNumber(value: number | null | undefined, decimals = 0): string {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return value.toLocaleString('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercent(value: number | null | undefined, decimals = 2): string {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return (value * 100).toFixed(decimals) + '%';
}

export function formatPoint(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return (value * 100).toFixed(2) + ' pts';
}

/**
 * Returns color classes based on achievement percentage against Time Factor or 100%
 */
export function getAchievementColor(achievement: number | null | undefined, timeFactor = 0.5714): {
  bg: string;
  text: string;
  border: string;
  badge: string;
} {
  if (achievement === null || achievement === undefined || isNaN(achievement)) {
    return {
      bg: 'bg-slate-100',
      text: 'text-slate-500',
      border: 'border-slate-200',
      badge: 'bg-slate-100 text-slate-700',
    };
  }

  if (achievement >= 1.0) {
    return {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-800',
    };
  } else if (achievement >= timeFactor) {
    return {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      badge: 'bg-amber-100 text-amber-800',
    };
  } else {
    return {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      badge: 'bg-rose-100 text-rose-800',
    };
  }
}

/**
 * Heatmap color specifically for Store Performance Matrix
 * Hijau: >= 1.0
 * Kuning: 0.80 - 0.99
 * Merah: < 0.80
 */
export function getMatrixHeatmapColor(val: number | null | undefined): {
  bg: string;
  text: string;
} {
  if (val === null || val === undefined || isNaN(val)) {
    return { bg: 'bg-slate-50', text: 'text-slate-400' };
  }
  if (val >= 1.0) {
    return { bg: 'bg-emerald-100 text-emerald-900 font-semibold', text: 'text-emerald-800' };
  }
  if (val >= 0.80) {
    return { bg: 'bg-amber-100 text-amber-900 font-semibold', text: 'text-amber-800' };
  }
  return { bg: 'bg-rose-100 text-rose-900 font-semibold', text: 'text-rose-800' };
}
