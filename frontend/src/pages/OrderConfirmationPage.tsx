import { ArrowRight, CheckCircle, Package } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../features/auth/AuthContext'
import { supabase } from '../lib/supabase'
import { formatCurrency } from '../lib/utils'

const PAYMENT_INSTRUCTIONS: Record<string, { title: string; steps: string[] }> = {
    card_payment: {
        title: 'Card Payment',
        steps: [
            'Our team will send secure payment instructions for your order.',
            'Use the payment link or instructions provided by Berwa Collections.',
            'Never send card details by email, chat, or social media.',
            'Keep the payment confirmation reference for your records.',
        ],
    },
    digital_wallet: {
        title: 'Digital Wallet',
        steps: [
            'Our team will send the available wallet payment instructions for your order.',
            'Complete the payment using the instructions provided by Berwa Collections.',
            'Keep the transaction reference or confirmation for your records.',
        ],
    },
    bank_transfer: {
        title: 'International Bank Transfer',
        steps: [
            'Transfer to: [BANK NAME - TO BE CONFIGURED]',
            'Account name: Berwa Collections',
            'Account number / IBAN: [TO BE CONFIGURED]',
            'Use your order number as the payment reference.',
            'Keep your transfer confirmation for review.',
        ],
    },
}

export default function OrderConfirmationPage() {
    const [params] = useSearchParams()
    const orderNumber = params.get('order') ?? 'BC-UNKNOWN'
    const orderId = params.get('id')
    const method = params.get('method') ?? 'card_payment'
    const displayCurrency = params.get('currency') ?? 'RWF'
    const displayTotal = Number(params.get('total'))
    const hasDisplayTotal = Number.isFinite(displayTotal) && displayTotal >= 0
    const instructions = PAYMENT_INSTRUCTIONS[method] ?? PAYMENT_INSTRUCTIONS.card_payment
    const { session } = useAuth()
    const [reference, setReference] = useState('')
    const [receipt, setReceipt] = useState<File | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const submitReference = async (event: React.FormEvent) => {
        event.preventDefault()
        if (!orderId || !session?.access_token) {
            toast.error('Sign in to submit a payment reference')
            return
        }

        setSubmitting(true)
        try {
            let receiptPath: string | undefined
            if (receipt) {
                const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
                if (!acceptedTypes.includes(receipt.type) || receipt.size > 5 * 1024 * 1024) {
                    throw new Error('Receipt must be a JPG, PNG, WebP, or PDF file up to 5 MB')
                }
                const safeName = receipt.name.replace(/[^a-zA-Z0-9._-]/g, '-')
                receiptPath = `${session.user.id}/${orderId}/${crypto.randomUUID()}-${safeName}`
                const { error: uploadError } = await supabase.storage.from('payment-receipts').upload(receiptPath, receipt, { contentType: receipt.type, upsert: false })
                if (uploadError) throw new Error('Unable to upload the receipt. Please try again.')
            }

            const response = await fetch('/api/submit-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
                body: JSON.stringify({ order_id: orderId, transaction_reference: reference, receipt_path: receiptPath }),
            })
            const result = await response.json() as { error?: string }
            if (!response.ok) throw new Error(result.error ?? 'Unable to submit your payment reference')
            setSubmitted(true)
            toast.success('Payment reference sent for review')
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Unable to submit your payment reference')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="bg-[#FAF8F4] min-h-screen py-12">
            <div className="max-w-2xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#A8C3A0] rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={36} className="text-[#343B32]" /></div>
                    <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#343B32]">Order Placed!</h1>
                    <p className="text-[#777] mt-2">Thank you for shopping with Berwa Collections.</p>
                </div>

                <div className="bg-white rounded-2xl border border-[#EDE4D8] p-6 mb-5">
                    <div className="flex items-center justify-between mb-4">
                        <div><p className="text-xs text-[#777] uppercase tracking-widest">Order Number</p><p className="text-xl font-bold text-[#343B32] font-mono">{orderNumber}</p></div>
                        <div className="flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-xs font-semibold"><Package size={14} />Pending Payment</div>
                    </div>
                    <p className="text-sm text-[#777] leading-relaxed">Your order has been received and is waiting for payment confirmation. Once payment is verified, we will begin processing your order.</p>
                    {hasDisplayTotal && <div className="mt-4 flex items-center justify-between border-t border-[#EDE4D8] pt-4"><span className="text-sm text-[#777]">Amount due</span><span className="font-bold text-[#343B32]">{formatCurrency(displayTotal, displayCurrency)}</span></div>}
                </div>

                <div className="bg-white rounded-2xl border border-[#EDE4D8] p-6 mb-5">
                    <h2 className="font-semibold text-[#343B32] text-lg mb-1">Payment Instructions</h2>
                    <p className="text-[#777] text-sm mb-5">Complete your payment using {instructions.title}{hasDisplayTotal ? ` for the locked ${displayCurrency} amount shown above` : ''}:</p>
                    <ol className="space-y-3">
                        {instructions.steps.map((step, index) => <li key={step} className="flex gap-3 text-sm text-[#343B32]"><span className="w-6 h-6 bg-[#A8C3A0] rounded-full flex items-center justify-center text-xs font-bold text-[#343B32] shrink-0">{index + 1}</span>{step}</li>)}
                    </ol>
                </div>

                {orderId && (
                    <form onSubmit={submitReference} className="bg-[#FAF8F4] border border-[#EDE4D8] rounded-2xl p-5 mb-5">
                        <p className="text-sm text-[#343B32] font-medium mb-1">Submit your payment reference</p>
                        <p className="text-sm text-[#777] mb-4">A team member must review payment information before the order is confirmed.</p>
                        {submitted ? <p className="text-sm font-medium text-green-700">Payment reference submitted for review.</p> : (
                            <div className="flex flex-col gap-3">
                                <label className="sr-only" htmlFor="payment-reference">Transaction reference</label>
                                <input id="payment-reference" value={reference} onChange={(event) => setReference(event.target.value)} minLength={3} required placeholder="Transaction reference" className="flex-1 px-3 py-2.5 border border-[#EDE4D8] rounded-lg text-sm text-[#343B32] bg-white focus:outline-none focus:border-[#A8C3A0]" />
                                <label htmlFor="payment-receipt" className="text-xs text-[#777]">Optional receipt (JPG, PNG, WebP, or PDF; 5 MB maximum)</label>
                                <input id="payment-receipt" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => setReceipt(event.target.files?.[0] ?? null)} className="text-sm text-[#777]" />
                                <button disabled={submitting} className="self-start bg-[#343B32] text-white px-4 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60">{submitting ? 'Submitting...' : 'Submit reference'}</button>
                            </div>
                        )}
                    </form>
                )}

                <div className="bg-[#FAF8F4] border border-[#EDE4D8] rounded-2xl p-5 mb-8">
                    <p className="text-sm text-[#343B32] font-medium mb-1">After making payment</p>
                    <p className="text-sm text-[#777]">Contact us with your transaction reference and order number <strong>{orderNumber}</strong> so our team can verify your payment promptly.</p>
                    <p className="text-xs text-[#777] mt-2">Contact details: [Berwa Collections support - to be configured]</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <Link to="/shop" className="flex-1 text-center border border-[#EDE4D8] text-[#343B32] py-3 rounded-xl font-medium hover:bg-[#EDE4D8] transition-colors">Continue Shopping</Link>
                    <Link to="/account" className="flex-1 flex items-center justify-center gap-2 bg-[#343B32] text-white py-3 rounded-xl font-medium hover:bg-[#A8C3A0] hover:text-[#343B32] transition-colors group">View My Orders <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></Link>
                </div>
            </div>
        </div>
    )
}
