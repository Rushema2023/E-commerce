import { Search, X } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/products/ProductCard'
import { getActiveProducts } from '../services/products'
import type { Category, Product } from '../types'

type SortKey = 'featured' | 'newest' | 'price_asc' | 'price_desc'

const CATEGORIES: { label: string; value: Category | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Men', value: 'men' },
    { label: 'Women', value: 'women' },
    { label: 'Accessories', value: 'accessories' },
]

const SORT_OPTIONS: { label: string; value: SortKey }[] = [
    { label: 'Featured', value: 'featured' },
    { label: 'Newest', value: 'newest' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
]

interface ShopPageProps {
    defaultCategory?: Category
}

export default function ShopPage({ defaultCategory }: ShopPageProps) {
    const [searchParams, setSearchParams] = useSearchParams()
    const [query, setQuery] = useState(searchParams.get('q') ?? '')
    const [category, setCategory] = useState<Category | 'all'>(defaultCategory ?? 'all')
    const [sort, setSort] = useState<SortKey>('featured')
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)

    useEffect(() => {
        setCategory(defaultCategory ?? 'all')
    }, [defaultCategory])

    useEffect(() => {
        let active = true
        getActiveProducts()
            .then((data) => { if (active) setProducts(data) })
            .catch((error: unknown) => { if (active) setLoadError(error instanceof Error ? error.message : 'Products are unavailable right now. Please try again shortly.') })
            .finally(() => { if (active) setLoading(false) })
        return () => { active = false }
    }, [])

    const filtered = useMemo(() => {
        let items = products

        if (category !== 'all') items = items.filter((p) => p.category === category)
        if (query.trim()) {
            const q = query.toLowerCase()
            items = items.filter((p) =>
                p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
            )
        }

        const filterParam = searchParams.get('filter')
        if (filterParam === 'new') items = items.filter((p) => p.is_new_arrival)

        switch (sort) {
            case 'newest': return [...items].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            case 'price_asc': return [...items].sort((a, b) => a.price - b.price)
            case 'price_desc': return [...items].sort((a, b) => b.price - a.price)
            default: return [...items].sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0))
        }
    }, [category, products, query, sort, searchParams])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setSearchParams(query ? { q: query } : {})
    }

    const title = defaultCategory
        ? { men: "Men's Collection", women: "Women's Collection", accessories: 'Accessories' }[defaultCategory]
        : 'All Products'

    return (
        <div className="bg-[#FAF8F4] min-h-screen">
            {/* Page header */}
            <div className="bg-[#EDE4D8] py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#343B32]">{title}</h1>
                    <p className="text-[#777] mt-2">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    {/* Search */}
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777]" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search products..."
                            aria-label="Search products"
                            className="w-full pl-9 pr-4 py-2.5 border border-[#EDE4D8] rounded-lg bg-white text-sm text-[#343B32] focus:outline-none focus:border-[#A8C3A0]"
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => { setQuery(''); setSearchParams({}) }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777] hover:text-[#343B32]"
                                aria-label="Clear search"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </form>

                    {/* Category tabs (desktop) */}
                    <div className="hidden sm:flex items-center gap-1 bg-[#EDE4D8] rounded-lg p-1">
                        {CATEGORIES.map(({ label, value }) => (
                            <button
                                key={value}
                                onClick={() => setCategory(value)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${category === value
                                        ? 'bg-[#343B32] text-white'
                                        : 'text-[#777] hover:text-[#343B32]'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Sort */}
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value as SortKey)}
                        aria-label="Sort products"
                        className="px-3 py-2.5 border border-[#EDE4D8] rounded-lg bg-white text-sm text-[#343B32] focus:outline-none focus:border-[#A8C3A0]"
                    >
                        {SORT_OPTIONS.map(({ label, value }) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>

                {/* Mobile category tabs */}
                <div className="sm:hidden flex gap-2 mb-6 overflow-x-auto pb-1">
                    {CATEGORIES.map(({ label, value }) => (
                        <button
                            key={value}
                            onClick={() => setCategory(value)}
                            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${category === value
                                    ? 'bg-[#343B32] text-white border-transparent'
                                    : 'border-[#EDE4D8] text-[#777]'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Product grid */}
                {loading ? (
                    <div className="text-center py-20 text-[#777]">Loading products…</div>
                ) : loadError ? (
                    <div className="text-center py-20 text-[#777]">{loadError}</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <Search size={48} className="mx-auto text-[#EDE4D8] mb-4" />
                        <p className="text-[#343B32] font-semibold text-lg">No products found</p>
                        <p className="text-[#777] text-sm mt-1">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                        {filtered.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
