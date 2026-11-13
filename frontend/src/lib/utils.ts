/**
 * Format a price in RWF (Rwandan Francs)
 * Prices are stored as integers.
 */
export function formatPrice(amount: number): string {
    return `RWF ${amount.toLocaleString('en-RW')}`
}

/** Format an amount already stored in its stated currency. */
export function formatCurrency(amount: number, currency: string): string {
    try {
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency,
            currencyDisplay: 'code',
            maximumFractionDigits: 2,
        }).format(amount)
    } catch {
        return formatPrice(amount)
    }
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value))
}

/**
 * Truncate text to a maximum length
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '…'
}

/**
 * Generate a slug from a string
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
}

/**
 * Validate an international phone number in a commonly used E.164 format.
 */
export function isValidInternationalPhone(phone: string): boolean {
    const cleaned = phone.replace(/[\s()-]/g, '')
    return /^\+?[1-9]\d{6,14}$/.test(cleaned)
}

/**
 * Generate order number from date + random
 */
export function generateOrderNumber(): string {
    const prefix = 'BC'
    const date = new Date()
    const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
    const random = Math.floor(Math.random() * 9000) + 1000
    return `${prefix}-${datePart}-${random}`
}

/**
 * Status label maps
 */
export const ORDER_STATUS_LABELS: Record<string, string> = {
    pending_payment: 'Pending Payment',
    confirmed: 'Confirmed',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
}

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
    awaiting_payment: 'Awaiting Payment',
    submitted: 'Under Review',
    approved: 'Approved',
    rejected: 'Rejected',
    refunded: 'Refunded',
}
