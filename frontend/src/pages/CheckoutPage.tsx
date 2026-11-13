import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useCartStore } from '../features/cart/cartStore'
import { useAuth } from '../features/auth/AuthContext'
import { isValidInternationalPhone } from '../lib/utils'
import { BASE_CURRENCY, getCurrencyForCountryName, useCurrency } from '../features/currency/CurrencyContext'
import { PAYMENT_METHODS } from '../data/mockData'
import { Package } from 'lucide-react'

const checkoutSchema = z.object({
    full_name: z.string().min(2, 'Full name is required'),
    phone: z.string().refine(isValidInternationalPhone, 'Enter a valid phone number with country code (e.g. +14155552671)'),
    country: z.string().min(2, 'Please enter your country or region'),
    address: z.string().min(5, 'Please enter your delivery address'),
    delivery_instructions: z.string().optional(),
    payment_method: z.string().min(1, 'Please select a payment method'),
})

type CheckoutForm = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
    const navigate = useNavigate()
    const { items, clearCart } = useCartStore()
    const cartTotal = useCartStore((s) => s.total())
    const { session } = useAuth()
    const { formatPrice, currency, isEstimate, setCurrency } = useCurrency()
    const [submitting, setSubmitting] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: { payment_method: 'card_payment' },
    })

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-[#FAF8F4] flex flex-col items-center justify-center gap-4 px-4">
                <Package size={60} className="text-[#EDE4D8]" />
                <p className="text-xl font-semibold text-[#343B32]">Your cart is empty</p>
                <Link to="/shop" className="bg-[#343B32] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#A8C3A0] hover:text-[#343B32] transition-colors">
                    Continue Shopping
                </Link>
            </div>
        )
    }

    const onSubmit = async (data: CheckoutForm) => {
        if (!session?.access_token) {
            toast.error('Please sign in before placing an order')
            navigate('/auth/login', { state: { from: '/checkout' } })
            return
        }
        setSubmitting(true)
        try {
            const response = await fetch('/api/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    ...data,
                    district: data.country,
                    display_currency: currency,
                    items: items.map(({ product_id, quantity, size, color }) => ({ product_id, quantity, size, color })),
                }),
            })
            const result = await response.json() as { order?: { id: string; order_number: string; display_currency?: string; display_total?: number }; error?: string }
            if (!response.ok || !result.order) throw new Error(result.error ?? 'Unable to create your order')
            clearCart()
            toast.success('Order placed successfully!')
            const currencyParam = result.order.display_currency ?? BASE_CURRENCY
            const totalParam = result.order.display_total
            navigate(`/order-confirmation?order=${encodeURIComponent(result.order.order_number)}&id=${encodeURIComponent(result.order.id)}&method=${encodeURIComponent(data.payment_method)}&currency=${encodeURIComponent(currencyParam)}${typeof totalParam === 'number' ? `&total=${encodeURIComponent(String(totalParam))}` : ''}`)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Unable to create your order')
        } finally {
            setSubmitting(false)
        }
    }

    const countryField = register('country')
    const INPUT_CLS = "w-full px-4 py-3 border border-[#EDE4D8] rounded-lg text-sm text-[#343B32] focus:outline-none focus:border-[#A8C3A0] bg-[#FAF8F4]"
    const ERROR_CLS = "text-red-500 text-xs mt-1"

    return (
        <div className="bg-[#FAF8F4] min-h-screen py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-serif font-bold text-[#343B32]">Checkout</h1>
                    <div className="flex gap-2 text-sm text-[#777] mt-2">
                        <Link to="/shop" className="hover:text-[#343B32]">Shop</Link>
                        <span>›</span>
                        <Link to="/cart" className="hover:text-[#343B32]">Cart</Link>
                        <span>›</span>
                        <span className="text-[#343B32] font-medium">Checkout</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        {/* Form */}
                        <div className="lg:col-span-3 space-y-6">
                            {/* Delivery details */}
                            <div className="bg-white rounded-2xl border border-[#EDE4D8] p-6">
                                <h2 className="font-semibold text-[#343B32] text-lg mb-5">Delivery Details</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="full_name" className="block text-sm font-medium text-[#343B32] mb-1.5">Full Name *</label>
                                        <input id="full_name" {...register('full_name')} className={INPUT_CLS} placeholder="Your full name" />
                                        {errors.full_name && <p className={ERROR_CLS}>{errors.full_name.message}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-[#343B32] mb-1.5">Phone Number *</label>
                                        <input id="phone" {...register('phone')} className={INPUT_CLS} placeholder="+1 415 555 2671" type="tel" autoComplete="tel" />
                                        {errors.phone && <p className={ERROR_CLS}>{errors.phone.message}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="country" className="block text-sm font-medium text-[#343B32] mb-1.5">Country / Region *</label>
                                        <input id="country" {...countryField} onBlur={(event) => { countryField.onBlur(event); const detectedCurrency = getCurrencyForCountryName(event.target.value); if (detectedCurrency) setCurrency(detectedCurrency) }} className={INPUT_CLS} placeholder="Your country or region" autoComplete="country-name" />
                                        {errors.country && <p className={ERROR_CLS}>{errors.country.message}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="address" className="block text-sm font-medium text-[#343B32] mb-1.5">Delivery Address *</label>
                                        <textarea id="address" {...register('address')} rows={3} className={`${INPUT_CLS} resize-none`} placeholder="Street address, city, postal code..." autoComplete="street-address" />
                                        {errors.address && <p className={ERROR_CLS}>{errors.address.message}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="delivery_instructions" className="block text-sm font-medium text-[#343B32] mb-1.5">
                                            Delivery Instructions <span className="text-[#777] font-normal">(optional)</span>
                                        </label>
                                        <input id="delivery_instructions" {...register('delivery_instructions')} className={INPUT_CLS} placeholder="Any additional delivery notes" />
                                    </div>
                                </div>
                            </div>

                            {/* Payment method */}
                            <div className="bg-white rounded-2xl border border-[#EDE4D8] p-6">
                                <h2 className="font-semibold text-[#343B32] text-lg mb-5">Payment Method</h2>
                                <div className="space-y-3">
                                    {PAYMENT_METHODS.map((method) => (
                                        <label
                                            key={method.id}
                                            className="flex items-center gap-4 p-4 border border-[#EDE4D8] rounded-xl cursor-pointer hover:border-[#A8C3A0] transition-colors has-[:checked]:border-[#343B32] has-[:checked]:bg-[#FAF8F4]"
                                        >
                                            <input
                                                type="radio"
                                                value={method.id}
                                                {...register('payment_method')}
                                                className="accent-[#343B32]"
                                            />
                                            <div>
                                                <p className="font-medium text-[#343B32] text-sm">{method.label}</p>
                                                <p className="text-[#777] text-xs">{method.description}</p>
                                            </div>
                                        </label>
                                    ))}
                                    {errors.payment_method && <p className={ERROR_CLS}>{errors.payment_method.message}</p>}
                                </div>
                                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <p className="text-amber-800 text-xs">
                                        💡 After placing your order, you will receive payment instructions. Your order will be confirmed once our team verifies your payment.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Order summary */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl border border-[#EDE4D8] p-6 sticky top-24">
                                <h2 className="font-semibold text-[#343B32] text-lg mb-5">Order Summary</h2>
                                <div className="space-y-4 max-h-60 overflow-y-auto mb-4">
                                    {items.map((item) => (
                                        <div key={`${item.product_id}-${item.size}-${item.color}`} className="flex gap-3">
                                            <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#EDE4D8] shrink-0">
                                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-[#343B32] truncate">{item.name}</p>
                                                <p className="text-xs text-[#777]">
                                                    {[item.size, item.color].filter(Boolean).join(' · ')}
                                                </p>
                                                <p className="text-xs text-[#777]">Qty: {item.quantity}</p>
                                            </div>
                                            <span className="text-sm font-semibold text-[#343B32] shrink-0">
                                                {formatPrice(item.price * item.quantity)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-[#EDE4D8] pt-4 space-y-2">
                                    <div className="flex justify-between text-sm text-[#777]">
                                        <span>Subtotal</span>
                                        <span className="text-[#343B32]">{formatPrice(cartTotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-[#777]">
                                        <span>Delivery fee</span>
                                        <span className="text-[#343B32]">Calculated after review</span>
                                    </div>
                                    <div className="flex justify-between text-base font-bold text-[#343B32] border-t border-[#EDE4D8] pt-2 mt-2">
                                        <span>Total</span>
                                        <span>{formatPrice(cartTotal)}</span>
                                    </div>
                                </div>
                                {isEstimate && (
                                    <p className="mt-4 text-xs leading-relaxed text-[#777]">Shown in {currency} using the latest available exchange rate. Your final amount is locked in this currency when you place the order.</p>
                                )}
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    id="place-order"
                                    className="w-full mt-6 bg-[#343B32] text-white py-3.5 rounded-xl font-semibold hover:bg-[#A8C3A0] hover:text-[#343B32] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'Placing Order…' : 'Place Order'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
