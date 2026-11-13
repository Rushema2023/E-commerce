import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Clock, TrendingUp, AlertTriangle } from 'lucide-react'
import { formatPrice } from '../../lib/utils'
import { supabase } from '../../lib/supabase'
import type { OrderStatus, PaymentStatus } from '../../types'

interface DashboardOrder {
    id: string
    order_number: string
    customer_name: string
    total: number
    status: OrderStatus
    payment_status: PaymentStatus
    created_at: string
}

interface LowStockProduct { id: string; name: string; sku: string; stock_quantity: number; image_url?: string }

const STATUS_COLORS: Record<string, string> = {
    pending_payment: 'bg-amber-100 text-amber-800', confirmed: 'bg-blue-100 text-blue-800', processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800', delivered: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800',
    submitted: 'bg-amber-100 text-amber-800', approved: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800',
}

export default function AdminDashboardPage() {
    const [orders, setOrders] = useState<DashboardOrder[]>([])
    const [products, setProducts] = useState<LowStockProduct[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let active = true
        async function loadDashboard() {
            const [ordersResult, productsResult] = await Promise.all([
                supabase.from('orders').select('id, order_number, customer_name, total, status, created_at, payments(status)').order('created_at', { ascending: false }),
                supabase.from('products').select('id, name, sku, stock_quantity, product_images(url, sort_order)').order('stock_quantity', { ascending: true }),
            ])
            if (!active) return
            if (ordersResult.error || productsResult.error) {
                setError('Unable to load dashboard data. Check your administrator access and try again.')
            } else {
                setOrders((ordersResult.data ?? []).map((order: any) => ({
                    id: order.id, order_number: order.order_number, customer_name: order.customer_name, total: order.total,
                    status: order.status as OrderStatus, payment_status: (order.payments?.[0]?.status ?? 'awaiting_payment') as PaymentStatus,
                    created_at: order.created_at,
                })))
                setProducts((productsResult.data ?? []).map((product: any) => ({
                    id: product.id, name: product.name, sku: product.sku, stock_quantity: product.stock_quantity,
                    image_url: [...(product.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0]?.url,
                })))
            }
            setLoading(false)
        }
        loadDashboard()
        return () => { active = false }
    }, [])

    const lowStock = useMemo(() => products.filter((product) => product.stock_quantity <= 5), [products])
    const approvedRevenue = useMemo(() => orders.filter((order) => order.payment_status === 'approved').reduce((sum, order) => sum + order.total, 0), [orders])
    const pendingReview = useMemo(() => orders.filter((order) => order.payment_status === 'submitted').length, [orders])
    const cards = [
        { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600', alert: false },
        { label: 'Pending Review', value: pendingReview, icon: Clock, color: 'bg-amber-50 text-amber-600', alert: pendingReview > 0 },
        { label: 'Approved Revenue', value: formatPrice(approvedRevenue), icon: TrendingUp, color: 'bg-green-50 text-green-600', alert: false },
        { label: 'Low Stock Products', value: lowStock.length, icon: AlertTriangle, color: 'bg-red-50 text-red-600', alert: lowStock.length > 0 },
    ]

    return <div className="space-y-8">
        <div><h1 className="text-2xl font-serif font-bold text-[#343B32]">Dashboard</h1><p className="text-[#777] text-sm mt-1">Overview of your store’s performance</p></div>
        {error && <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">{cards.map(({ label, value, icon: Icon, color, alert }) => <div key={label} className="bg-white rounded-2xl border border-[#EDE4D8] p-5"><div className="flex items-start justify-between mb-3"><div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}><Icon size={20} /></div>{alert && <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse mt-1" />}</div><p className="text-2xl font-bold text-[#343B32]">{loading ? '—' : value}</p><p className="text-xs text-[#777] mt-0.5">{label}</p></div>)}</div>
        <div className="bg-white rounded-2xl border border-[#EDE4D8] overflow-hidden"><div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE4D8]"><h2 className="font-semibold text-[#343B32]">Recent Orders</h2><Link to="/admin/orders" className="text-sm text-[#4285F4] hover:underline">View all</Link></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-[#FAF8F4] border-b border-[#EDE4D8]"><tr>{['Order', 'Customer', 'Total', 'Order Status', 'Payment'].map((heading) => <th key={heading} className="px-5 py-3 text-left text-xs font-semibold text-[#777] uppercase tracking-wider">{heading}</th>)}</tr></thead><tbody className="divide-y divide-[#EDE4D8]">{loading ? <tr><td colSpan={5} className="px-5 py-10 text-center text-[#777]">Loading dashboard…</td></tr> : orders.slice(0, 5).map((order) => <tr key={order.id} className="hover:bg-[#FAF8F4]"><td className="px-5 py-3 font-mono text-xs text-[#343B32] font-medium">{order.order_number}</td><td className="px-5 py-3 text-[#343B32]">{order.customer_name}</td><td className="px-5 py-3 font-semibold text-[#343B32]">{formatPrice(order.total)}</td><td className="px-5 py-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>{order.status.replace(/_/g, ' ')}</span></td><td className="px-5 py-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.payment_status]}`}>{order.payment_status}</span></td></tr>)}</tbody></table></div></div>
        {lowStock.length > 0 && <div className="bg-white rounded-2xl border border-[#EDE4D8] overflow-hidden"><div className="flex items-center gap-2 px-6 py-4 border-b border-[#EDE4D8]"><AlertTriangle size={16} className="text-amber-500" /><h2 className="font-semibold text-[#343B32]">Low Stock Alert</h2></div><div className="divide-y divide-[#EDE4D8]">{lowStock.map((product) => <div key={product.id} className="flex items-center justify-between px-6 py-3"><div className="flex items-center gap-3">{product.image_url ? <img src={product.image_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-[#EDE4D8]" /> : <div className="w-10 h-10 rounded-lg bg-[#EDE4D8]" />}<div><p className="text-sm font-medium text-[#343B32]">{product.name}</p><p className="text-xs text-[#777]">{product.sku}</p></div></div><span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">{product.stock_quantity} left</span></div>)}</div></div>}
    </div>
}
