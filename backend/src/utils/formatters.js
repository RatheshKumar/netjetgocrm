// =============================================================================
// src/utils/formatters.js
// =============================================================================
// 🔧 FORMATTING HELPERS — Pure functions for displaying data nicely.
// =============================================================================

/**
 * Format a date string or ISO timestamp into a readable date.
 * e.g. "2024-05-21T10:00:00.000Z" → "21 May 2024"
 */
export function formatDate(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
  });
}

/**
 * Format a number as a dollar amount.
 * e.g. 62456000 → "$62,456,000"
 * e.g. "" or null → "—"
 */
export function formatMoney(amount) {
  if (amount === undefined || amount === null || amount === '') return '—';
  return `$${Number(amount).toLocaleString('en-US')}`;
}

/**
 * Generate a short unique ID for new records.
 * e.g. "1716304800000-x4k2a"
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Get the first two uppercase letters of a name for avatar display.
 * e.g. "John Smith" → "JS"
 */
export function getInitials(name = '') {
  return name
    .trim()
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '')
    .join('');
}

/**
 * Format a number with a k/M suffix for compact display.
 * e.g. 62456000 → "$62.5M"
 * e.g. 4500 → "$4.5k"
 */
export function formatMoneyCompact(amount) {
  const n = Number(amount) || 0;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n}`;
}
