import { User, Package, LogOut, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../features/auth/AuthContext'
import { toast } from 'sonner'
import { formatCurrency, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '../lib/utils'
import { supabase } from '../lib/supabase'
import type { OrderStatus, PaymentStatus } from '../types'

interface AccountOrder {
    id: string
    order_number: string
    status: OrderStatus
    payment_status: PaymentStatus
    total: number
    display_total: number
    display_currency: string
    created_at: string
    items: Array<{ product_name: string; quantity: number }>
}

const STATUS_COLORS: Record<string, string> = {
    pending_payment: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    awaiting_payment: 'bg-gray-100 text-gray-700',
    submitted: 'bg-amber-100 text-amber-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-700',
}

export default function AccountPage() {
    const { user, profile, signOut } = useAuth()
    const [orders, setOrders] = useState<AccountOrder[]>([])
    const [loadingOrders, setLoadingOrders] = useState(true)

    useEffect(() => {
        if (!user) return
        let active = true
        async function loadOrders() {
            const { data, error } = await supabase
                .from('orders')
                .select('id, order_number, status, total, display_total, display_currency, created_at, order_items(product_name, quantity), payments(status)')
                .order('created_at', { ascending: false })
            if (!active) return
            if (error) {
                toast.error('Unable to load your orders')
            } else {
                const mapped = (data ?? []).map((order: any) => ({
                    id: order.id,
                    order_number: order.order_number,
                    status: order.status as OrderStatus,
                    payment_status: (order.payments?.[0]?.status ?? 'awaiting_payment') as PaymentStatus,
                    total: order.total,
                    display_total: Number(order.display_total ?? order.total),
                    display_currency: order.display_currency ?? 'RWF',
                    created_at: order.created_at,
                    items: order.order_items ?? [],
                }))
                setOrders(mapped)
            }
            setLoadingOrders(false)
        }
        loadOrders()
        return () => { active = false }
    }, [user])

    const handleSignOut = async () => {
        await signOut()
        toast.success('Signed out successfully')
    }

    return (
        <div className="bg-[#FAF8F4] min-h-screen py-10">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#343B32]">My Account</h1>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 text-sm text-[#777] hover:text-red-500 transition-colors"
                    >
                        <LogOut size={16} />
                        Sign Out
                    </button>
                </div>

                {/* Profile card */}
                <div className="bg-white rounded-2xl border border-[#EDE4D8] p-6 mb-6">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-full bg-[#A8C3A0] flex items-center justify-center">
                            <User size={24} className="text-[#343B32]" />
                        </div>
                        <div>
                            <p className="font-semibold text-[#343B32] text-lg">{profile?.full_name ?? 'My Account'}</p>
                            <p className="text-[#777] text-sm">{user?.email}</p>
                            {profile?.is_admin && (
                                <span className="inline-block mt-1 bg-[#343B32] text-white text-xs px-2 py-0.5 rounded-full">Administrator</span>
                            )}
                        </div>
                    </div>
                    {profile?.is_admin && (
                        <div className="mt-4 pt-4 border-t border-[#EDE4D8]">
                            <Link
                                to="/admin"
                                className="flex items-center justify-between p-3 rounded-lg bg-[#EDE4D8] hover:bg-[#A8C3A0]/30 transition-colors group"
                            >
                                <span className="text-sm font-medium text-[#343B32]">Go to Admin Dashboard</span>
                                <ChevronRight size={16} className="text-[#777] group-hover:text-[#343B32]" />
                            </Link>
                        </div>
                    )}
                </div>

                {/* Order history */}
                <div className="bg-white rounded-2xl border border-[#EDE4D8] p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Package size={20} className="text-[#343B32]" />
                        <h2 className="font-semibold text-[#343B32] text-lg">Order History</h2>
                    </div>

                    {loadingOrders ? (
                        <p className="text-sm text-[#777] py-6">Loading your orders…</p>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-10">
                            <Package size={40} className="mx-auto text-[#EDE4D8] mb-3" />
                            <p className="text-[#777]">No orders yet.</p>
                            <Link to="/shop" className="mt-3 inline-block text-sm text-[#4285F4] hover:underline">Start shopping</Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div key={order.id} className="border border-[#EDE4D8] rounded-xl p-4 hover:border-[#A8C3A0] transition-colors">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                                        <div>
                                            <p className="font-mono font-semibold text-[#343B32] text-sm">{order.order_number}</p>
                                            <p className="text-xs text-[#777] mt-0.5">
                                                {new Date(order.created_at).toLocaleDateString('en-RW', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
                                                {ORDER_STATUS_LABELS[order.status]}
                                            </span>
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.payment_status]}`}>
                                                Payment: {PAYMENT_STATUS_LABELS[order.payment_status]}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-[#777]">
                                            {order.items.map((i) => `${i.product_name} ×${i.quantity}`).join(', ')}
                                        </p>
                                        <p className="font-bold text-[#343B32]">{formatCurrency(order.display_total, order.display_currency)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
