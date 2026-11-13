import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export const BASE_CURRENCY = 'RWF'

export const CURRENCIES = {
    RWF: 'Rwandan franc',
    ARS: 'Argentine peso',
    BDT: 'Bangladeshi taka',
    BHD: 'Bahraini dinar',
    BGN: 'Bulgarian lev',
    BWP: 'Botswana pula',
    USD: 'US dollar',
    EUR: 'Euro',
    GBP: 'British pound',
    ZAR: 'South African rand',
    XAF: 'Central African CFA franc',
    XOF: 'West African CFA franc',
    DZD: 'Algerian dinar',
    EGP: 'Egyptian pound',
    ETB: 'Ethiopian birr',
    KES: 'Kenyan shilling',
    UGX: 'Ugandan shilling',
    TZS: 'Tanzanian shilling',
    CDF: 'Congolese franc',
    NGN: 'Nigerian naira',
    GHS: 'Ghanaian cedi',
    MAD: 'Moroccan dirham',
    MUR: 'Mauritian rupee',
    TND: 'Tunisian dinar',
    ZMW: 'Zambian kwacha',
    AED: 'UAE dirham',
    ILS: 'Israeli new shekel',
    JOD: 'Jordanian dinar',
    KWD: 'Kuwaiti dinar',
    OMR: 'Omani rial',
    QAR: 'Qatari riyal',
    SAR: 'Saudi riyal',
    INR: 'Indian rupee',
    PKR: 'Pakistani rupee',
    LKR: 'Sri Lankan rupee',
    CAD: 'Canadian dollar',
    AUD: 'Australian dollar',
    NZD: 'New Zealand dollar',
    JPY: 'Japanese yen',
    CNY: 'Chinese yuan',
    HKD: 'Hong Kong dollar',
    IDR: 'Indonesian rupiah',
    MYR: 'Malaysian ringgit',
    PHP: 'Philippine peso',
    SGD: 'Singapore dollar',
    THB: 'Thai baht',
    TWD: 'New Taiwan dollar',
    VND: 'Vietnamese dong',
    KRW: 'South Korean won',
    BRL: 'Brazilian real',
    CLP: 'Chilean peso',
    COP: 'Colombian peso',
    MXN: 'Mexican peso',
    PEN: 'Peruvian sol',
    UYU: 'Uruguayan peso',
    CHF: 'Swiss franc',
    CZK: 'Czech koruna',
    DKK: 'Danish krone',
    HUF: 'Hungarian forint',
    ISK: 'Icelandic krona',
    NOK: 'Norwegian krone',
    PLN: 'Polish zloty',
    RON: 'Romanian leu',
    SEK: 'Swedish krona',
    TRY: 'Turkish lira',
    UAH: 'Ukrainian hryvnia',
} as const

export type CurrencyCode = keyof typeof CURRENCIES

const COUNTRY_CURRENCIES: Record<string, CurrencyCode> = {
    RW: 'RWF', US: 'USD', PR: 'USD', GB: 'GBP', IE: 'EUR', FR: 'EUR', DE: 'EUR', ES: 'EUR', IT: 'EUR', PT: 'EUR', NL: 'EUR', BE: 'EUR', AT: 'EUR', FI: 'EUR', GR: 'EUR', CY: 'EUR', EE: 'EUR', LV: 'EUR', LT: 'EUR', LU: 'EUR', MT: 'EUR', SI: 'EUR', SK: 'EUR', HR: 'EUR',
    ZA: 'ZAR', DZ: 'DZD', BW: 'BWP', CM: 'XAF', CF: 'XAF', TD: 'XAF', CG: 'XAF', GQ: 'XAF', GA: 'XAF', KE: 'KES', UG: 'UGX', TZ: 'TZS', CD: 'CDF', NG: 'NGN', GH: 'GHS', EG: 'EGP', ET: 'ETB', CI: 'XOF', SN: 'XOF', ML: 'XOF', BF: 'XOF', BJ: 'XOF', TG: 'XOF', NE: 'XOF', GW: 'XOF', MA: 'MAD', MU: 'MUR', TN: 'TND', ZM: 'ZMW',
    AE: 'AED', BH: 'BHD', IL: 'ILS', JO: 'JOD', KW: 'KWD', OM: 'OMR', QA: 'QAR', SA: 'SAR', TR: 'TRY', IN: 'INR', PK: 'PKR', LK: 'LKR', BD: 'BDT', CA: 'CAD', AU: 'AUD', NZ: 'NZD', JP: 'JPY', CN: 'CNY', HK: 'HKD', ID: 'IDR', MY: 'MYR', PH: 'PHP', SG: 'SGD', TH: 'THB', TW: 'TWD', VN: 'VND', KR: 'KRW', BR: 'BRL', AR: 'ARS', CL: 'CLP', CO: 'COP', MX: 'MXN', PE: 'PEN', UY: 'UYU',
    CH: 'CHF', SE: 'SEK', NO: 'NOK', DK: 'DKK', PL: 'PLN', CZ: 'CZK', HU: 'HUF', RO: 'RON', BG: 'BGN', IS: 'ISK', UA: 'UAH',
}

const COUNTRY_NAME_CURRENCIES: Record<string, CurrencyCode> = {
    rwanda: 'RWF', 'united states': 'USD', 'united states of america': 'USD', 'puerto rico': 'USD', 'united kingdom': 'GBP', britain: 'GBP', england: 'GBP',
    ireland: 'EUR', france: 'EUR', germany: 'EUR', spain: 'EUR', italy: 'EUR', portugal: 'EUR', netherlands: 'EUR', belgium: 'EUR', austria: 'EUR', finland: 'EUR', greece: 'EUR', cyprus: 'EUR', estonia: 'EUR', latvia: 'EUR', lithuania: 'EUR', luxembourg: 'EUR', malta: 'EUR', slovenia: 'EUR', slovakia: 'EUR', croatia: 'EUR',
    'south africa': 'ZAR', kenya: 'KES', uganda: 'UGX', tanzania: 'TZS', 'democratic republic of the congo': 'CDF', 'dr congo': 'CDF', nigeria: 'NGN', ghana: 'GHS', 'united arab emirates': 'AED', uae: 'AED', 'saudi arabia': 'SAR', india: 'INR', canada: 'CAD', australia: 'AUD', 'new zealand': 'NZD', japan: 'JPY', china: 'CNY', 'south korea': 'KRW', brazil: 'BRL', mexico: 'MXN',
}

const STORAGE_KEY = 'berwa-currency'
const RATE_CACHE_KEY = 'berwa-rwf-rates'
const CACHE_MAX_AGE = 12 * 60 * 60 * 1000

interface RateCache {
    updatedAt: number
    rates: Record<string, number>
}

interface CurrencyContextValue {
    currency: CurrencyCode
    setCurrency: (currency: CurrencyCode) => void
    formatPrice: (amountInRwf: number) => string
    isRateLoading: boolean
    isEstimate: boolean
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

function getBrowserCurrency(): CurrencyCode {
    if (typeof navigator === 'undefined') return BASE_CURRENCY
    const locale = navigator.languages?.[0] ?? navigator.language
    try {
        const region = new Intl.Locale(locale).region
        return region ? COUNTRY_CURRENCIES[region] ?? BASE_CURRENCY : BASE_CURRENCY
    } catch {
        const region = locale.split('-').find((part) => /^[A-Z]{2}$/.test(part))
        return region ? COUNTRY_CURRENCIES[region] ?? BASE_CURRENCY : BASE_CURRENCY
    }
}

function getInitialCurrency(): CurrencyCode {
    if (typeof window === 'undefined') return BASE_CURRENCY
    const saved = window.localStorage.getItem(STORAGE_KEY)
    return saved && saved in CURRENCIES ? saved as CurrencyCode : getBrowserCurrency()
}

export function getCurrencyForCountryName(country: string): CurrencyCode | null {
    const normalised = country.trim().toLowerCase().replace(/[^a-z ]/g, '').replace(/\s+/g, ' ')
    return COUNTRY_NAME_CURRENCIES[normalised] ?? null
}

function getCachedRates(): RateCache | null {
    try {
        const raw = window.localStorage.getItem(RATE_CACHE_KEY)
        if (!raw) return null
        const cache = JSON.parse(raw) as RateCache
        return cache.updatedAt > Date.now() - CACHE_MAX_AGE && typeof cache.rates?.RWF === 'number' ? cache : null
    } catch {
        return null
    }
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const [currency, setCurrencyState] = useState<CurrencyCode>(getInitialCurrency)
    const [rates, setRates] = useState<Record<string, number>>({ RWF: 1 })
    const [isRateLoading, setIsRateLoading] = useState(false)

    useEffect(() => {
        const cached = getCachedRates()
        if (cached) {
            setRates(cached.rates)
            return
        }

        const controller = new AbortController()
        setIsRateLoading(true)
        fetch('https://open.er-api.com/v6/latest/RWF', { signal: controller.signal })
            .then(async (response) => {
                if (!response.ok) throw new Error('Unable to load exchange rates')
                return response.json() as Promise<{ result?: string; rates?: Record<string, number> }>
            })
            .then((data) => {
                if (data.result !== 'success' || !data.rates || typeof data.rates.RWF !== 'number') throw new Error('Invalid exchange-rate response')
                const cache = { updatedAt: Date.now(), rates: data.rates }
                setRates(data.rates)
                window.localStorage.setItem(RATE_CACHE_KEY, JSON.stringify(cache))
            })
            .catch(() => {
                // RWF remains available when the rate service is offline or blocked.
            })
            .finally(() => setIsRateLoading(false))

        return () => controller.abort()
    }, [])

    const value = useMemo<CurrencyContextValue>(() => {
        const rate = rates[currency]
        const canConvert = currency === BASE_CURRENCY || typeof rate === 'number' && Number.isFinite(rate) && rate > 0
        return {
            currency,
            setCurrency: (nextCurrency) => {
                setCurrencyState(nextCurrency)
                window.localStorage.setItem(STORAGE_KEY, nextCurrency)
            },
            formatPrice: (amountInRwf) => new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency: canConvert ? currency : BASE_CURRENCY,
                currencyDisplay: 'code',
                maximumFractionDigits: 2,
            }).format(canConvert ? amountInRwf * (rate ?? 1) : amountInRwf),
            isRateLoading,
            isEstimate: currency !== BASE_CURRENCY && canConvert,
        }
    }, [currency, isRateLoading, rates])

    return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrency() {
    const context = useContext(CurrencyContext)
    if (!context) throw new Error('useCurrency must be used within CurrencyProvider')
    return context
}
