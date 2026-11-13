import { useEffect, useMemo, useState } from 'react'
import { Search, CheckCircle, XCircle, Eye, X, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { formatPrice, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '../../lib/utils'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../features/auth/AuthContext'
import type { OrderStatus, PaymentStatus } from '../../types'

interface AdminOrder {
    id: string
    order_number: string
    customer_name: string
    customer_phone: string
    district: string
    address: string
    payment_method: string
    total: number
    status: OrderStatus
    payment_status: PaymentStatus
    transaction_reference?: string
    created_at: string
    items: Array<{ product_name: string; quantity: number; price: number }>
}

const STATUS_COLORS: Record<string, string> = {
    pending_payment: 'bg-amber-100 text-amber-800', confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800', shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800',
    awaiting_payment: 'bg-gray-100 text-gray-700', submitted: 'bg-amber-100 text-amber-800',
    approved: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800', refunded: 'bg-gray-100 text-gray-700',
}

const NEXT_STATUSES: Partial<Record<OrderStatus, OrderStatus[]>> = {
    confirmed: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
}

export default function AdminOrdersPage() {
    const { session } = useAuth()
    const [orders, setOrders] = useState<AdminOrder[]>([])
    const [query, setQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)
    const [confirmAction, setConfirmAction] = useState<{ orderId: string; action: 'approve' | 'reject' } | null>(null)
    const [adminNotes, setAdminNotes] = useState('')
    const [saving, setSaving] = useState(false)

    const loadOrders = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('orders')
            .select('id, order_number, customer_name, customer_phone, district, address, payment_method, total, status, created_at, order_items(product_name, quantity, price), payments(status, transaction_reference)')
            .order('created_at', { ascending: false })
        if (error) {
            toast.error('Unable to load orders')
        } else {
            setOrders((data ?? []).map((order: any) => ({
                id: order.id,
                order_number: order.order_number,
                customer_name: order.customer_name,
                customer_phone: order.customer_phone,
                district: order.district,
                address: order.address,
                payment_method: order.payment_method,
                total: order.total,
                status: order.status as OrderStatus,
                payment_status: (order.payments?.[0]?.status ?? 'awaiting_payment') as PaymentStatus,
                transaction_reference: order.payments?.[0]?.transaction_reference ?? undefined,
                created_at: order.created_at,
                items: order.order_items ?? [],
            })))
        }
        setLoading(false)
    }

    useEffect(() => { loadOrders() }, [])

    const filtered = useMemo(() => {
        const term = query.trim().toLowerCase()
        return term ? orders.filter((order) => [order.order_number, order.customer_name, order.district].some((value) => value.toLowerCase().includes(term))) : orders
    }, [orders, query])

    const callAdminApi = async (path: string, body: Record<string, unknown>) => {
        if (!session?.access_token) throw new Error('Your session has expired. Sign in again.')
        const response = await fetch(path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
            body: JSON.stringify(body),
        })
        const result = await response.json() as { error?: string }
        if (!response.ok) throw new Error(result.error ?? 'The action could not be completed')
    }

    const handlePaymentAction = async () => {
        if (!confirmAction) return
        if (confirmAction.action === 'reject' && adminNotes.trim().length < 3) {
            toast.error('Add a short reason for the rejection')
            return
        }
        setSaving(true)
        try {
            await callAdminApi(`/api/admin/${confirmAction.action === 'approve' ? 'approve-payment' : 'reject-payment'}`, {
                order_id: confirmAction.orderId,
                admin_notes: adminNotes,
            })
            toast.success(`Payment ${confirmAction.action === 'approve' ? 'approved' : 'rejected'}`)
            setConfirmAction(null)
            setAdminNotes('')
            setSelectedOrder(null)
            await loadOrders()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Unable to update payment')
        } finally {
            setSaving(false)
        }
    }

    const updateOrderStatus = async (order: AdminOrder, status: OrderStatus) => {
        setSaving(true)
        try {
            await callAdminApi('/api/admin/update-order-status', { order_id: order.id, status })
            setSelectedOrder({ ...order, status })
            toast.success('Order status updated')
            await loadOrders()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Unable to update order status')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <div><h1 className="text-2xl font-serif font-bold text-[#343B32]">Orders</h1><p className="text-[#777] text-sm mt-0.5">{orders.length} orders total</p></div>
            <div className="relative max-w-sm"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search orders, customers…" className="w-full pl-9 pr-4 py-2.5 border border-[#EDE4D8] rounded-lg bg-white text-sm text-[#343B32] focus:outline-none focus:border-[#A8C3A0]" /></div>

            <div className="bg-white rounded-2xl border border-[#EDE4D8] overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-[#FAF8F4] border-b border-[#EDE4D8]"><tr>{['Order', 'Customer', 'Total', 'Order Status', 'Payment', 'Actions'].map((heading) => <th key={heading} className="px-5 py-3 text-left text-xs font-semibold text-[#777] uppercase tracking-wider whitespace-nowrap">{heading}</th>)}</tr></thead><tbody className="divide-y divide-[#EDE4D8]">
                {loading ? <tr><td colSpan={6} className="px-5 py-10 text-center text-[#777]">Loading orders…</td></tr> : filtered.length === 0 ? <tr><td colSpan={6} className="px-5 py-10 text-center text-[#777]">No orders found.</td></tr> : filtered.map((order) => <tr key={order.id} className="hover:bg-[#FAF8F4] transition-colors"><td className="px-5 py-3"><p className="font-mono font-semibold text-xs text-[#343B32]">{order.order_number}</p><p className="text-xs text-[#777] mt-0.5">{new Date(order.created_at).toLocaleDateString('en-RW')}</p></td><td className="px-5 py-3"><p className="text-[#343B32] font-medium">{order.customer_name}</p><p className="text-xs text-[#777]">{order.district}</p></td><td className="px-5 py-3 font-semibold text-[#343B32]">{formatPrice(order.total)}</td><td className="px-5 py-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>{ORDER_STATUS_LABELS[order.status]}</span></td><td className="px-5 py-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.payment_status]}`}>{PAYMENT_STATUS_LABELS[order.payment_status]}</span></td><td className="px-5 py-3"><div className="flex items-center gap-1"><button onClick={() => setSelectedOrder(order)} className="p-2 text-[#777] hover:text-[#343B32] hover:bg-[#EDE4D8] rounded-lg" aria-label="View order details"><Eye size={14} /></button>{order.payment_status === 'submitted' && <><button onClick={() => setConfirmAction({ orderId: order.id, action: 'approve' })} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" aria-label="Approve payment"><CheckCircle size={14} /></button><button onClick={() => setConfirmAction({ orderId: order.id, action: 'reject' })} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" aria-label="Reject payment"><XCircle size={14} /></button></>}</div></td></tr>)}
            </tbody></table></div></div>

            {selectedOrder && <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-4 overflow-y-auto"><div className="bg-white rounded-2xl max-w-xl w-full shadow-xl my-8"><div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE4D8]"><div><h3 className="font-semibold text-[#343B32]">{selectedOrder.order_number}</h3><p className="text-xs text-[#777]">{new Date(selectedOrder.created_at).toLocaleString('en-RW')}</p></div><button onClick={() => setSelectedOrder(null)} className="text-[#777] hover:text-[#343B32]" aria-label="Close details"><X size={20} /></button></div><div className="p-6 space-y-5"><section><p className="text-xs text-[#777] uppercase tracking-wider mb-2">Customer details</p><div className="bg-[#FAF8F4] rounded-xl p-4 space-y-1 text-sm"><p><span className="text-[#777]">Name:</span> <span className="font-medium text-[#343B32]">{selectedOrder.customer_name}</span></p><p><span className="text-[#777]">Phone:</span> <span className="font-medium text-[#343B32]">{selectedOrder.customer_phone}</span></p><p><span className="text-[#777]">District:</span> <span className="font-medium text-[#343B32]">{selectedOrder.district}</span></p><p><span className="text-[#777]">Address:</span> <span className="font-medium text-[#343B32]">{selectedOrder.address}</span></p></div></section><section><p className="text-xs text-[#777] uppercase tracking-wider mb-2">Order items</p><div className="space-y-2">{selectedOrder.items.map((item, index) => <div key={`${item.product_name}-${index}`} className="flex justify-between text-sm py-2 border-b border-[#EDE4D8]"><span className="text-[#343B32]">{item.product_name} <span className="text-[#777]">×{item.quantity}</span></span><span className="font-semibold text-[#343B32]">{formatPrice(item.price * item.quantity)}</span></div>)}<div className="flex justify-between font-bold text-[#343B32] pt-1"><span>Total</span><span>{formatPrice(selectedOrder.total)}</span></div></div></section><section><p className="text-xs text-[#777] uppercase tracking-wider mb-2">Payment</p><div className="bg-[#FAF8F4] rounded-xl p-4 space-y-2 text-sm"><div className="flex justify-between"><span className="text-[#777]">Method:</span><span className="font-medium text-[#343B32] capitalize">{selectedOrder.payment_method.replace('_', ' ')}</span></div>{selectedOrder.transaction_reference && <div className="flex justify-between"><span className="text-[#777]">Reference:</span><span className="font-mono font-medium text-[#343B32]">{selectedOrder.transaction_reference}</span></div>}<div className="flex justify-between items-center"><span className="text-[#777]">Status:</span><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[selectedOrder.payment_status]}`}>{PAYMENT_STATUS_LABELS[selectedOrder.payment_status]}</span></div></div></section>{NEXT_STATUSES[selectedOrder.status] && <section><label htmlFor="order-status-update" className="block text-xs text-[#777] uppercase tracking-wider mb-2">Update fulfilment status</label><div className="relative"><select id="order-status-update" value={selectedOrder.status} disabled={saving} onChange={(event) => updateOrderStatus(selectedOrder, event.target.value as OrderStatus)} className="w-full px-4 py-2.5 border border-[#EDE4D8] rounded-lg text-sm bg-[#FAF8F4] focus:outline-none focus:border-[#A8C3A0] appearance-none pr-8"><option value={selectedOrder.status}>{ORDER_STATUS_LABELS[selectedOrder.status]}</option>{NEXT_STATUSES[selectedOrder.status]?.map((status) => <option key={status} value={status}>{ORDER_STATUS_LABELS[status]}</option>)}</select><ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777] pointer-events-none" /></div></section>}{selectedOrder.payment_status === 'submitted' && <div className="flex gap-3"><button onClick={() => setConfirmAction({ orderId: selectedOrder.id, action: 'approve' })} className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-lg text-sm font-semibold"><CheckCircle size={16} />Approve payment</button><button onClick={() => setConfirmAction({ orderId: selectedOrder.id, action: 'reject' })} className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-2.5 rounded-lg text-sm font-semibold"><XCircle size={16} />Reject payment</button></div>}</div></div></div>}

            {confirmAction && <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"><div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"><h3 className="font-semibold text-[#343B32] text-lg mb-2">{confirmAction.action === 'approve' ? 'Approve payment?' : 'Reject payment?'}</h3><p className="text-[#777] text-sm mb-4">{confirmAction.action === 'approve' ? 'Only approve after confirming the payment in the relevant provider account.' : 'Tell the customer briefly why the payment could not be verified.'}</p>{confirmAction.action === 'reject' && <textarea value={adminNotes} onChange={(event) => setAdminNotes(event.target.value)} placeholder="Reason for rejection" rows={3} className="w-full mb-4 px-3 py-2 border border-[#EDE4D8] rounded-lg text-sm focus:outline-none focus:border-[#A8C3A0]" />}<div className="flex gap-3"><button disabled={saving} onClick={() => { setConfirmAction(null); setAdminNotes('') }} className="flex-1 border border-[#EDE4D8] text-[#343B32] rounded-lg py-2.5 text-sm font-medium">Cancel</button><button disabled={saving} onClick={handlePaymentAction} className={`flex-1 text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-60 ${confirmAction.action === 'approve' ? 'bg-green-600' : 'bg-red-500'}`}>{saving ? 'Saving…' : confirmAction.action === 'approve' ? 'Approve' : 'Reject'}</button></div></div></div>}
        </div>
    )
}
