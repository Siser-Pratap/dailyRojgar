/**
 * Formats a number as Indian Rupees (e.g. 1500 → "₹1,500")
 */
export function formatCurrency(amount: number, showDecimals = false): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount)
}

/**
 * Formats a per-day price with label (e.g. "₹500 / Day")
 */
export function formatDayRate(amount: number): string {
  return `${formatCurrency(amount)} / Day`
}
