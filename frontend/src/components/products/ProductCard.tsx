import { Star, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCartStore } from '../../features/cart/cartStore'
import { useCurrency } from '../../features/currency/CurrencyContext'
import type { Product } from '../../types'

interface ProductCardProps {
    product: Product
}

const COLOR_HEX: Record<string, string> = {
    'Navy': '#1a2a4a',
    'Charcoal': '#3d3d3d',
    'Black': '#111111',
    'Forest Green': '#2d5a27',
    'Burgundy': '#722f37',
    'Sky Blue': '#87ceeb',
    'White': '#ffffff',
    'Light Gray': '#d3d3d3',
    'Tan': '#c8a96e',
    'Dark Brown': '#4a2f1a',
    'Off-White': '#f5f5f0',
    'Tortoise': '#8b6914',
    'Brown': '#8b4513',
    'Khaki': '#c3b091',
    'Olive': '#808000',
    'Terracotta': '#c1704a',
    'Midnight Blue': '#191970',
    'Ivory': '#fffff0',
    'Blush': '#ffb6c1',
    'Sage': '#8f9779',
    'Natural': '#d2b48c',
    'Floral Print': '#e8b4bc',
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addItem } = useCartStore()
    const { formatPrice } = useCurrency()
    const [adding, setAdding] = useState(false)
    const [imageLoaded, setImageLoaded] = useState(false)

    const primaryImage = product.images.find((i) => i.is_primary) ?? product.images[0]

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setAdding(true)
        addItem({
            product_id: product.id,
            name: product.name,
            price: product.price,
            image_url: primaryImage?.url ?? '',
            stock_quantity: product.stock_quantity,
        })
        await new Promise((r) => setTimeout(r, 700))
        setAdding(false)
    }

    return (
        <article className="group bg-white rounded-2xl overflow-hidden border border-[#EDE4D8] hover:border-[#A8C3A0] hover:shadow-lg transition-all duration-300 flex flex-col">
            {/* Image container */}
            <Link to={`/product/${product.id}`} className="relative block overflow-hidden aspect-[4/5] bg-[#EDE4D8]" tabIndex={-1}>
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                    {product.is_featured && (
                        <span className="bg-[#343B32] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                            Bestseller
                        </span>
                    )}
                    {product.is_new_arrival && (
                        <span className="bg-[#A8C3A0] text-[#343B32] text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                            New
                        </span>
                    )}
                </div>

                {/* Stock warning */}
                {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                    <div className="absolute top-3 right-3 z-10">
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-1 rounded-full">
                            Only {product.stock_quantity} left
                        </span>
                    </div>
                )}

                <img
                    src={primaryImage?.url}
                    alt={product.name}
                    onLoad={() => setImageLoaded(true)}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                />
                {!imageLoaded && (
                    <div className="absolute inset-0 bg-[#EDE4D8] animate-pulse" />
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-[#343B32]/0 group-hover:bg-[#343B32]/10 transition-colors duration-300" />

                {/* Quick add on hover */}
                <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <button
                        onClick={handleAddToCart}
                        disabled={adding || product.stock_quantity === 0}
                        aria-label={`Add ${product.name} to cart`}
                        className="w-full bg-white text-[#343B32] text-xs font-semibold py-2.5 rounded-xl hover:bg-[#343B32] hover:text-white transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <ShoppingBag size={14} />
                        {adding ? 'Added!' : product.stock_quantity === 0 ? 'Out of Stock' : 'Quick Add'}
                    </button>
                </div>
            </Link>

            {/* Product info */}
            <div className="p-4 flex flex-col gap-2 flex-1">
                <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#A8C3A0] font-semibold mb-0.5">
                        {product.category}
                    </p>
                    <Link
                        to={`/product/${product.id}`}
                        className="font-semibold text-[#343B32] text-sm sm:text-base leading-tight hover:text-[#A8C3A0] transition-colors"
                    >
                        {product.name}
                    </Link>
                </div>

                {/* Rating */}
                {product.rating && (
                    <div className="flex items-center gap-1.5">
                        <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    size={11}
                                    className={
                                        i < Math.floor(product.rating!)
                                            ? 'fill-amber-400 text-amber-400'
                                            : 'text-[#EDE4D8] fill-[#EDE4D8]'
                                    }
                                />
                            ))}
                        </div>
                        <span className="text-[11px] text-[#777]">({product.review_count})</span>
                    </div>
                )}

                {/* Colors */}
                {product.colors.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
                        {product.colors.slice(0, 4).map((color) => (
                            <div
                                key={color}
                                title={color}
                                className="w-4 h-4 rounded-full border border-[#EDE4D8] ring-1 ring-offset-1 ring-transparent hover:ring-[#A8C3A0] transition-all cursor-pointer"
                                style={{ backgroundColor: COLOR_HEX[color] ?? '#ccc' }}
                            />
                        ))}
                        {product.colors.length > 4 && (
                            <span className="text-[11px] text-[#777] flex items-center">+{product.colors.length - 4}</span>
                        )}
                    </div>
                )}

                {/* Price + Add to Cart */}
                <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="text-base font-bold text-[#343B32]">{formatPrice(product.price)}</span>
                    <button
                        onClick={handleAddToCart}
                        disabled={adding || product.stock_quantity === 0}
                        id={`add-to-cart-${product.id}`}
                        aria-label={`Add ${product.name} to cart`}
                        className="flex items-center gap-1.5 bg-[#343B32] text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-[#A8C3A0] hover:text-[#343B32] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ShoppingBag size={13} />
                        {adding ? 'Added!' : product.stock_quantity === 0 ? 'Sold Out' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </article>
    )
}
