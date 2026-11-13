import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCartStore } from '../../features/cart/cartStore'
import { useCurrency } from '../../features/currency/CurrencyContext'

export default function CartDrawer() {
    const { items, isOpen, closeCart, removeItem, updateQuantity } = useCartStore()
    const cartTotal = useCartStore((s) => s.total())
    const { formatPrice } = useCurrency()

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                    onClick={closeCart}
                    aria-hidden="true"
                />
            )}

            {/* Drawer */}
            <aside
                className={`fixed right-0 top-0 h-full z-50 w-full max-w-md bg-[#FAF8F4] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                aria-label="Shopping cart"
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#EDE4D8]">
                    <div className="flex items-center gap-2">
                        <ShoppingBag size={20} className="text-[#343B32]" />
                        <h2 className="text-lg font-semibold text-[#343B32]">Your Cart</h2>
                        {items.length > 0 && (
                            <span className="bg-[#343B32] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                {items.length}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={closeCart}
                        aria-label="Close cart"
                        className="p-2 rounded-lg text-[#777] hover:text-[#343B32] hover:bg-[#EDE4D8] transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
                            <ShoppingBag size={48} className="text-[#EDE4D8]" />
                            <div>
                                <p className="text-[#343B32] font-medium">Your cart is empty</p>
                                <p className="text-[#777] text-sm mt-1">Add some items to get started</p>
                            </div>
                            <button
                                onClick={closeCart}
                                className="mt-2 px-6 py-2.5 bg-[#343B32] text-white text-sm font-medium rounded-lg hover:bg-[#4a5248] transition-colors"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div
                                key={`${item.product_id}-${item.size}-${item.color}`}
                                className="flex gap-4 py-4 border-b border-[#EDE4D8] last:border-0"
                            >
                                {/* Image */}
                                <Link
                                    to={`/product/${item.product_id}`}
                                    onClick={closeCart}
                                    className="w-20 h-24 rounded-lg overflow-hidden shrink-0 bg-[#EDE4D8]"
                                >
                                    <img
                                        src={item.image_url}
                                        alt={item.name}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                    />
                                </Link>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <Link
                                        to={`/product/${item.product_id}`}
                                        onClick={closeCart}
                                        className="font-medium text-sm text-[#343B32] hover:text-[#A8C3A0] transition-colors line-clamp-2"
                                    >
                                        {item.name}
                                    </Link>
                                    <div className="flex gap-2 text-xs text-[#777] mt-0.5">
                                        {item.size && <span>Size: {item.size}</span>}
                                        {item.color && <span>· {item.color}</span>}
                                    </div>
                                    <p className="text-[#343B32] font-semibold text-sm mt-1">
                                        {formatPrice(item.price)}
                                    </p>

                                    {/* Quantity controls */}
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="flex items-center border border-[#EDE4D8] rounded-lg overflow-hidden">
                                            <button
                                                aria-label="Decrease quantity"
                                                onClick={() => updateQuantity(item.product_id, item.quantity - 1, item.size, item.color)}
                                                disabled={item.quantity <= 1}
                                                className="w-7 h-7 flex items-center justify-center text-[#777] hover:text-[#343B32] hover:bg-[#EDE4D8] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <Minus size={12} />
                                            </button>
                                            <span className="w-8 h-7 flex items-center justify-center text-sm font-medium text-[#343B32]">
                                                {item.quantity}
                                            </span>
                                            <button
                                                aria-label="Increase quantity"
                                                onClick={() => updateQuantity(item.product_id, item.quantity + 1, item.size, item.color)}
                                                disabled={item.quantity >= item.stock_quantity}
                                                className="w-7 h-7 flex items-center justify-center text-[#777] hover:text-[#343B32] hover:bg-[#EDE4D8] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <Plus size={12} />
                                            </button>
                                        </div>
                                        <button
                                            aria-label="Remove item"
                                            onClick={() => removeItem(item.product_id, item.size, item.color)}
                                            className="p-1.5 text-[#777] hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Line total */}
                                <div className="text-right shrink-0">
                                    <span className="text-sm font-semibold text-[#343B32]">
                                        {formatPrice(item.price * item.quantity)}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="border-t border-[#EDE4D8] px-6 py-5 space-y-4 bg-white">
                        <div className="flex items-center justify-between text-sm text-[#777]">
                            <span>Subtotal</span>
                            <span className="font-medium text-[#343B32]">{formatPrice(cartTotal)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-[#777]">Delivery fee calculated at checkout</span>
                        </div>
                        <Link
                            to="/checkout"
                            onClick={closeCart}
                            id="proceed-to-checkout"
                            className="block w-full bg-[#343B32] text-white text-center py-3.5 rounded-lg font-medium hover:bg-[#4a5248] transition-colors"
                        >
                            Proceed to Checkout
                        </Link>
                        <button
                            onClick={closeCart}
                            className="block w-full text-center text-sm text-[#777] hover:text-[#343B32] transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </div>
                )}
            </aside>
        </>
    )
}
