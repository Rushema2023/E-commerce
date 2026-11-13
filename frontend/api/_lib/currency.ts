const BASE_CURRENCY = 'RWF'
const EXCHANGE_RATE_URL = `https://open.er-api.com/v6/latest/${BASE_CURRENCY}`

export interface CurrencyQuote {
  currency: string
  rate: number
}

/**
 * Quotes one unit of RWF in the requested ISO 4217 currency. This runs only
 * on the server, so a browser can choose a currency but cannot choose a rate.
 */
export async function getCurrencyQuote(requestedCurrency: unknown): Promise<CurrencyQuote> {
  const currency = typeof requestedCurrency === 'string' ? requestedCurrency.trim().toUpperCase() : BASE_CURRENCY
  if (!/^[A-Z]{3}$/.test(currency)) throw new Error('Choose a valid three-letter currency code')
  if (currency === BASE_CURRENCY) return { currency, rate: 1 }

  let response: Response
  try {
    response = await fetch(EXCHANGE_RATE_URL, { signal: AbortSignal.timeout(5000) })
  } catch {
    throw new Error('Live exchange rates are temporarily unavailable. Please try again.')
  }
  if (!response.ok) throw new Error('Live exchange rates are temporarily unavailable. Please try again.')

  const data = await response.json() as { result?: string; rates?: Record<string, unknown> }
  const rate = data.result === 'success' ? Number(data.rates?.[currency]) : Number.NaN
  if (!Number.isFinite(rate) || rate <= 0 || rate > 1_000_000) {
    throw new Error(`Currency ${currency} is not currently available`)
  }
  // Preserve a stable, auditable rate without storing arbitrary floating precision.
  return { currency, rate: Math.round(rate * 100_000_000) / 100_000_000 }
}
