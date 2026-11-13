import { Minus, Package, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCartStore } from '../features/cart/cartStore'
import { useCurrency } from '../features/currency/CurrencyContext'

export default function CartPage() {
    const { items, removeItem, updateQuantity } = useCartStore()
    const total = useCartStore((state) => state.total())
    const { formatPrice, currency, isEstimate } = useCurrency()

    if (items.length === 0) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FAF8F4] px-4 text-center">
                <Package size={60} className="text-[#EDE4D8]" />
                <h1 className="font-serif text-3xl font-bold text-[#343B32]">Your cart is empty</h1>
                <p className="text-[#777]">Add something you love and it will appear here.</p>
                <Link to="/shop" className="rounded-lg bg-[#343B32] px-6 py-3 font-medium text-white transition-colors hover:bg-[#A8C3A0] hover:text-[#343B32]">
                    Continue Shopping
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#FAF8F4] py-10 sm:py-14">
            <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-center gap-3">
                    <ShoppingBag size={28} className="text-[#343B32]" />
                    <div>
                        <h1 className="font-serif text-3xl font-bold text-[#343B32]">Your Cart</h1>
                        <p className="mt-1 text-sm text-[#777]">{items.length} {items.length === 1 ? 'item' : 'items'} in your cart</p>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
                    <section className="divide-y divide-[#EDE4D8] rounded-2xl border border-[#EDE4D8] bg-white px-5 sm:px-7">
                        {items.map((item) => (
                            <article key={`${item.product_id}-${item.size}-${item.color}`} className="flex gap-4 py-5 sm:gap-5">
                                <Link to={`/product/${item.product_id}`} className="h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-[#EDE4D8] sm:h-28 sm:w-24">
                                    <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                                </Link>
                                <div className="min-w-0 flex-1">
                                    <Link to={`/product/${item.product_id}`} className="font-semibold text-[#343B32] transition-colors hover:text-[#A8C3A0]">{item.name}</Link>
                                    {(item.size || item.color) && <p className="mt-1 text-xs text-[#777]">{[item.size, item.color].filter(Boolean).join(' · ')}</p>}
                                    <p className="mt-2 text-sm font-semibold text-[#343B32]">{formatPrice(item.price)}</p>
                                    <div className="mt-3 flex items-center gap-3">
                                        <div className="flex items-center overflow-hidden rounded-lg border border-[#EDE4D8]">
                                            <button type="button" aria-label={`Decrease quantity of ${item.name}`} disabled={item.quantity <= 1} onClick={() => updateQuantity(item.product_id, item.quantity - 1, item.size, item.color)} className="flex h-8 w-8 items-center justify-center text-[#777] transition-colors hover:bg-[#EDE4D8] disabled:cursor-not-allowed disabled:opacity-30"><Minus size={14} /></button>
                                            <span className="flex h-8 w-9 items-center justify-center border-x border-[#EDE4D8] text-sm font-medium text-[#343B32]">{item.quantity}</span>
                                            <button type="button" aria-label={`Increase quantity of ${item.name}`} disabled={item.quantity >= item.stock_quantity} onClick={() => updateQuantity(item.product_id, item.quantity + 1, item.size, item.color)} className="flex h-8 w-8 items-center justify-center text-[#777] transition-colors hover:bg-[#EDE4D8] disabled:cursor-not-allowed disabled:opacity-30"><Plus size={14} /></button>
                                        </div>
                                        <button type="button" aria-label={`Remove ${item.name} from cart`} onClick={() => removeItem(item.product_id, item.size, item.color)} className="p-1.5 text-[#777] transition-colors hover:text-red-500"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                                <p className="shrink-0 text-sm font-bold text-[#343B32]">{formatPrice(item.price * item.quantity)}</p>
                            </article>
                        ))}
                    </section>

                    <aside className="h-fit rounded-2xl border border-[#EDE4D8] bg-white p-6">
                        <h2 className="text-lg font-semibold text-[#343B32]">Order Summary</h2>
                        <div className="mt-5 flex items-center justify-between border-b border-[#EDE4D8] pb-4 text-sm text-[#777]"><span>Subtotal</span><span className="font-medium text-[#343B32]">{formatPrice(total)}</span></div>
                        <p className="mt-4 text-xs leading-relaxed text-[#777]">Delivery fee is calculated at checkout.{isEstimate && ` Prices in ${currency} are estimates; your order is securely recorded in RWF.`}</p>
                        <Link to="/checkout" className="mt-5 block w-full rounded-lg bg-[#343B32] py-3 text-center font-medium text-white transition-colors hover:bg-[#A8C3A0] hover:text-[#343B32]">Proceed to Checkout</Link>
                        <Link to="/shop" className="mt-4 block text-center text-sm text-[#777] transition-colors hover:text-[#343B32]">Continue Shopping</Link>
                    </aside>
                </div>
            </main>
        </div>
    )
}
