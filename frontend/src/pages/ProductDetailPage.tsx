import { Star, ShoppingBag, Minus, Plus, Heart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCartStore } from '../features/cart/cartStore'
import { useCurrency } from '../features/currency/CurrencyContext'
import ProductCard from '../components/products/ProductCard'
import { getActiveProduct, getActiveProducts } from '../services/products'
import type { Product } from '../types'

export default function ProductDetailPage() {
    const { formatPrice } = useCurrency()
    const { id } = useParams<{ id: string }>()
    const { addItem, openCart } = useCartStore()
    const [product, setProduct] = useState<Product | null>(null)
    const [related, setRelated] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [selectedSize, setSelectedSize] = useState<string | undefined>()
    const [selectedColor, setSelectedColor] = useState<string | undefined>()
    const [quantity, setQuantity] = useState(1)
    const [activeImage, setActiveImage] = useState(0)
    const [adding, setAdding] = useState(false)

    useEffect(() => {
        if (!id) {
            setLoading(false)
            return
        }
        const productId = id
        let active = true
        async function loadProduct() {
            try {
                const current = await getActiveProduct(productId)
                if (!active) return
                setProduct(current)
                setSelectedSize(current?.sizes[0])
                setSelectedColor(current?.colors[0])
                if (current) {
                    const all = await getActiveProducts()
                    if (active) setRelated(all.filter((item) => item.category === current.category && item.id !== current.id).slice(0, 4))
                }
            } catch (error) {
                if (active) setLoadError(error instanceof Error ? error.message : 'Unable to load this product.')
            } finally {
                if (active) setLoading(false)
            }
        }
        loadProduct()
        return () => { active = false }
    }, [id])

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-[#777]">Loading product…</div>
    }

    if (loadError) {
        return <div className="min-h-screen flex items-center justify-center px-4 text-center text-[#777]">{loadError}</div>
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-xl font-semibold text-[#343B32]">Product not found</p>
                <Link to="/shop" className="text-[#4285F4] hover:underline">Back to Shop</Link>
            </div>
        )
    }

    const handleAddToCart = async () => {
        if (product.sizes.length > 0 && !selectedSize) return
        setAdding(true)
        addItem({
            product_id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.images[0]?.url ?? '',
            size: selectedSize,
            color: selectedColor,
            quantity,
            stock_quantity: product.stock_quantity,
        })
        await new Promise((r) => setTimeout(r, 600))
        setAdding(false)
        openCart()
    }

    const COLOR_HEX: Record<string, string> = {
        'Navy': '#1a2a4a', 'Charcoal': '#3d3d3d', 'Black': '#111111',
        'Forest Green': '#2d5a27', 'Burgundy': '#722f37', 'Sky Blue': '#87ceeb',
        'White': '#ffffff', 'Light Gray': '#d3d3d3', 'Tan': '#c8a96e',
        'Dark Brown': '#4a2f1a', 'Off-White': '#f5f5f0', 'Tortoise': '#8b6914',
        'Brown': '#8b4513', 'Khaki': '#c3b091', 'Olive': '#808000',
        'Terracotta': '#c1704a', 'Midnight Blue': '#191970', 'Ivory': '#fffff0',
        'Blush': '#ffb6c1', 'Sage': '#8f9779', 'Natural': '#d2b48c', 'Floral Print': '#e8b4bc',
    }

    return (
        <div className="bg-[#FAF8F4] min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-[#777] mb-8">
                    <Link to="/" className="hover:text-[#343B32] transition-colors">Home</Link>
                    <span>/</span>
                    <Link to="/shop" className="hover:text-[#343B32] transition-colors">Shop</Link>
                    <span>/</span>
                    <Link to={`/${product.category}`} className="hover:text-[#343B32] capitalize transition-colors">{product.category}</Link>
                    <span>/</span>
                    <span className="text-[#343B32] truncate">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                    {/* Images */}
                    <div className="space-y-3">
                        <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-[#EDE4D8]">
                            <img
                                src={product.images[activeImage]?.url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {product.images.length > 1 && (
                            <div className="flex gap-3">
                                {product.images.map((img, i) => (
                                    <button
                                        key={img.id}
                                        onClick={() => setActiveImage(i)}
                                        className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${activeImage === i ? 'border-[#343B32]' : 'border-transparent'
                                            }`}
                                    >
                                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="space-y-6">
                        {/* Badges */}
                        <div className="flex gap-2">
                            {product.is_featured && (
                                <span className="bg-[#343B32] text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                                    Bestseller
                                </span>
                            )}
                            {product.is_new_arrival && (
                                <span className="bg-[#A8C3A0] text-[#343B32] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                                    New Arrival
                                </span>
                            )}
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-widest text-[#A8C3A0] font-semibold mb-1 capitalize">
                                {product.category}
                            </p>
                            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#343B32]">{product.name}</h1>
                            <p className="text-xs text-[#777] mt-1">SKU: {product.sku}</p>
                        </div>

                        {/* Rating */}
                        {product.rating && (
                            <div className="flex items-center gap-2">
                                <div className="flex">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} size={16} className={i < Math.floor(product.rating!) ? 'fill-amber-400 text-amber-400' : 'text-[#EDE4D8] fill-[#EDE4D8]'} />
                                    ))}
                                </div>
                                <span className="text-sm text-[#777]">{product.rating} ({product.review_count} reviews)</span>
                            </div>
                        )}

                        {/* Price */}
                        <div className="text-3xl font-bold text-[#343B32]">{formatPrice(product.price)}</div>

                        {/* Description */}
                        <p className="text-[#777] leading-relaxed">{product.description}</p>

                        {/* Color */}
                        {product.colors.length > 0 && (
                            <div>
                                <p className="text-sm font-semibold text-[#343B32] mb-2">
                                    Color: <span className="font-normal text-[#777]">{selectedColor}</span>
                                </p>
                                <div className="flex gap-2 flex-wrap">
                                    {product.colors.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            title={color}
                                            aria-label={`Select color ${color}`}
                                            className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === color
                                                    ? 'border-[#343B32] ring-2 ring-[#A8C3A0] ring-offset-1'
                                                    : 'border-[#EDE4D8]'
                                                }`}
                                            style={{ backgroundColor: COLOR_HEX[color] ?? '#ccc' }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Size */}
                        {product.sizes.length > 0 && (
                            <div>
                                <p className="text-sm font-semibold text-[#343B32] mb-2">
                                    Size: <span className="font-normal text-[#777]">{selectedSize}</span>
                                </p>
                                <div className="flex gap-2 flex-wrap">
                                    {product.sizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            aria-label={`Select size ${size}`}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${selectedSize === size
                                                    ? 'bg-[#343B32] text-white border-[#343B32]'
                                                    : 'border-[#EDE4D8] text-[#777] hover:border-[#343B32] hover:text-[#343B32]'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity */}
                        <div>
                            <p className="text-sm font-semibold text-[#343B32] mb-2">Quantity</p>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center border border-[#EDE4D8] rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                        disabled={quantity <= 1}
                                        className="w-10 h-10 flex items-center justify-center text-[#777] hover:text-[#343B32] hover:bg-[#EDE4D8] transition-colors disabled:opacity-30"
                                        aria-label="Decrease quantity"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="w-12 text-center text-sm font-medium text-[#343B32]">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                                        disabled={quantity >= product.stock_quantity}
                                        className="w-10 h-10 flex items-center justify-center text-[#777] hover:text-[#343B32] hover:bg-[#EDE4D8] transition-colors disabled:opacity-30"
                                        aria-label="Increase quantity"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                                <span className="text-sm text-[#777]">
                                    {product.stock_quantity > 0
                                        ? `${product.stock_quantity} in stock`
                                        : <span className="text-red-500">Out of stock</span>}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleAddToCart}
                                disabled={adding || product.stock_quantity === 0}
                                id="add-to-cart-main"
                                className="flex-1 flex items-center justify-center gap-2 bg-[#343B32] text-white py-3.5 rounded-xl font-semibold hover:bg-[#A8C3A0] hover:text-[#343B32] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ShoppingBag size={18} />
                                {adding ? 'Added to cart!' : product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                            <button
                                aria-label="Save to wishlist"
                                className="w-12 h-12 border border-[#EDE4D8] rounded-xl flex items-center justify-center text-[#777] hover:text-red-400 hover:border-red-200 transition-colors"
                            >
                                <Heart size={18} />
                            </button>
                        </div>

                        {/* Trust note */}
                        <p className="text-xs text-[#777] text-center border-t border-[#EDE4D8] pt-4">
                            🔒 Secure checkout &nbsp;·&nbsp; 🚚 Worldwide delivery &nbsp;·&nbsp; 📋 Payment reviewed by our team
                        </p>
                    </div>
                </div>

                {/* Related products */}
                {related.length > 0 && (
                    <section className="mt-20">
                        <h2 className="text-2xl font-serif font-bold text-[#343B32] mb-7">You might also like</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                            {related.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    )
}
