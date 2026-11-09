/**
 * Formatters for currency, dates, numbers and time durations
 */

/**
 * Format currency to Vietnamese Dong (VNĐ)
 * e.g., 8500000 -> "8.500.000 ₫"
 */
export const formatVND = (amount: number): string => {
  if (isNaN(amount)) return '0 ₫'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format large VND numbers to Millions abbreviation
 * e.g., 8500000 -> "8.5 Tr đ"
 */
export const formatMillionVND = (amount: number): string => {
  if (isNaN(amount) || amount === 0) return '0 đ'
  const million = amount / 1000000
  return `${million.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} Tr đ`
}

/**
 * Format Date to standard Vietnamese display format (DD/MM/YYYY)
 */
export const formatDateVi = (dateInput: string | Date | number): string => {
  try {
    const d = new Date(dateInput)
    if (isNaN(d.getTime())) return '—'
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d)
  } catch {
    return '—'
  }
}

/**
 * Format Date with time (HH:mm - DD/MM/YYYY)
 */
export const formatDateTimeVi = (dateInput: string | Date | number): string => {
  try {
    const d = new Date(dateInput)
    if (isNaN(d.getTime())) return '—'
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d)
  } catch {
    return '—'
  }
}

/**
 * Format seconds into mm:ss or hh:mm:ss
 */
export const formatDuration = (totalSeconds: number): string => {
  if (isNaN(totalSeconds) || totalSeconds < 0) return '00:00'
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)

  const pad = (n: number) => n.toString().padStart(2, '0')
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  }
  return `${pad(minutes)}:${pad(seconds)}`
}

/**
 * Format number with compact K / M / B suffix
 */
export const formatCompactNumber = (num: number): string => {
  if (isNaN(num)) return '0'
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num)
}

