import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Format a number as Colombian Peso currency
 */
export function formatCurrency(value) {
  if (value == null || isNaN(value)) return '$0';
  
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${new Intl.NumberFormat('es-CO').format(Math.round(value))}`;
  }
  return `$${new Intl.NumberFormat('es-CO').format(value)}`;
}

/**
 * Format a number as full Colombian Peso currency (no abbreviation)
 */
export function formatCurrencyFull(value) {
  if (value == null || isNaN(value)) return '$0';
  return `$${new Intl.NumberFormat('es-CO').format(Math.round(value))}`;
}

/**
 * Format a number with thousands separator
 */
export function formatNumber(value) {
  if (value == null || isNaN(value)) return '0';
  return new Intl.NumberFormat('es-CO').format(value);
}

/**
 * Format a number abbreviated (45231 → 45.2k)
 */
export function formatNumberShort(value) {
  if (value == null || isNaN(value)) return '0';
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(1)}k`;
  }
  return String(value);
}

/**
 * Format a date string
 */
export function formatDate(dateStr, fmt = 'dd MMM, yyyy') {
  if (!dateStr) return '—';
  if (typeof dateStr === 'string' && (dateStr.includes(' de ') || dateStr.includes(' a las '))) {
    return dateStr;
  }
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr);
    if (!isValid(date)) {
      return typeof dateStr === 'string' ? dateStr : '—';
    }
    return format(date, fmt, { locale: es });
  } catch {
    return typeof dateStr === 'string' ? dateStr : '—';
  }
}

/**
 * Format as percentage
 */
export function formatPercent(value, decimals = 1) {
  if (value == null || isNaN(value)) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
}

/**
 * Parse a date from Excel serial number or string
 */
export function parseExcelDate(value) {
  if (!value) return null;
  
  // Excel serial number
  if (typeof value === 'number') {
    const epoch = new Date(1899, 11, 30);
    const date = new Date(epoch.getTime() + value * 86400000);
    return isValid(date) ? date : null;
  }
  
  // String date
  if (typeof value === 'string') {
    const date = new Date(value);
    return isValid(date) ? date : null;
  }

  if (value instanceof Date) {
    return isValid(value) ? value : null;
  }
  
  return null;
}
