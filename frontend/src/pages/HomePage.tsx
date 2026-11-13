import { ArrowRight, Truck, Headphones, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/products/ProductCard'
import { getActiveProducts } from '../services/products'
import type { Product } from '../types'

const HERO_SLIDES = [
    {
        id: 1,
        tagline: 'Classic · Modern · For Everyone',
        headline: 'Timeless Fashion for Every You',
        description: 'Discover premium clothing and accessories for men, women and everyone. Quality styles, affordable prices, and worldwide delivery.',
        cta: 'Shop Now',
        ctaLink: '/shop',
        image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&q=80',
        script: 'Style that stays.',
    },
    {
        id: 2,
        tagline: 'New Arrivals · Fresh Styles',
        headline: 'Elevate Your Everyday Look',
        description: 'New arrivals just landed. Explore the latest collections from our men\'s, women\'s, and accessories ranges.',
        cta: 'View New Arrivals',
        ctaLink: '/shop?filter=new',
        image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&q=80',
        script: 'Freshly in.',
    },
    {
        id: 3,
        tagline: 'Accessories · Complete Your Look',
        headline: 'The Right Details Make the Difference',
        description: 'Handbags, sunglasses, belts, hats and more. The perfect accessories to complete any outfit.',
        cta: 'Shop Accessories',
        ctaLink: '/accessories',
        image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=900&q=80',
        script: 'Details matter.',
    },
]

const COLLECTIONS = [
    {
        label: 'Men',
        description: 'Classic looks for every occasion.',
        to: '/men',
        image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80',
        cta: 'Shop Men',
    },
    {
        label: 'Women',
        description: 'Elegant styles for every moment.',
        to: '/women',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80',
        cta: 'Shop Women',
    },
    {
        label: 'Accessories',
        description: 'Complete your look with the right details.',
        to: '/accessories',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
        cta: 'Shop Accessories',
    },
]

const TRUST_ITEMS = [
    { icon: Truck, title: 'Worldwide Delivery', desc: 'Reliable delivery to customers around the world.' },
    { icon: Headphones, title: 'Secure Support', desc: 'We\'re here to help, always.' },
    { icon: ShieldCheck, title: 'Payment Review', desc: 'Your payment is verified by our admin team before release.' },
]

function HeroSection() {
    const [slide, setSlide] = useState(0)
    const [imgLoaded, setImgLoaded] = useState(false)

    const prev = () => { setImgLoaded(false); setSlide((s) => (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length) }
    const next = () => { setImgLoaded(false); setSlide((s) => (s + 1) % HERO_SLIDES.length) }

    useEffect(() => {
        const timer = setInterval(next, 5500)
        return () => clearInterval(timer)
    }, [])

    const s = HERO_SLIDES[slide]

    return (
        <section className="relative bg-[#EDE4D8] overflow-hidden min-h-[520px] lg:min-h-[620px]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                <div className="grid lg:grid-cols-2 gap-0 items-center min-h-[520px] lg:min-h-[620px]">
                    {/* Text side */}
                    <div className="py-16 lg:py-0 z-10 relative">
                        <p className="text-[#A8C3A0] text-xs font-bold uppercase tracking-[0.25em] mb-4">
                            {s.tagline}
                        </p>
                        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#343B32] leading-tight mb-5 max-w-lg">
                            {s.headline}
                        </h1>
                        <p className="text-[#777] text-base lg:text-lg leading-relaxed mb-8 max-w-md">
                            {s.description}
                        </p>
                        <Link
                            to={s.ctaLink}
                            id="hero-cta"
                            className="inline-flex items-center gap-2 bg-[#343B32] text-white px-7 py-3.5 rounded-lg font-semibold hover:bg-[#A8C3A0] hover:text-[#343B32] transition-all duration-300 group"
                        >
                            {s.cta}
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>

                        {/* Dots */}
                        <div className="flex gap-2 mt-10">
                            {HERO_SLIDES.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setImgLoaded(false); setSlide(i) }}
                                    aria-label={`Slide ${i + 1}`}
                                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === slide ? 'bg-[#343B32] w-6' : 'bg-[#343B32]/30'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Image side */}
                    <div className="relative hidden lg:flex h-full min-h-[620px] items-stretch">
                        {/* Script overlay */}
                        <div className="absolute top-12 right-6 z-20 text-right pointer-events-none">
                            <span className="font-serif italic text-2xl text-[#343B32]/70">
                                {s.script}
                            </span>
                        </div>

                        <img
                            key={slide}
                            src={s.image}
                            alt={s.headline}
                            onLoad={() => setImgLoaded(true)}
                            className={`w-full h-full object-cover transition-opacity duration-700 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                            style={{ maxHeight: '620px' }}
                        />
                        {!imgLoaded && <div className="absolute inset-0 bg-[#EDE4D8] animate-pulse" />}
                    </div>
                </div>
            </div>

            {/* Arrow controls */}
            <button
                onClick={prev}
                aria-label="Previous slide"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center text-[#343B32] hover:bg-white shadow-md transition-all hidden lg:flex"
            >
                <ChevronLeft size={18} />
            </button>
            <button
                onClick={next}
                aria-label="Next slide"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center text-[#343B32] hover:bg-white shadow-md transition-all hidden lg:flex"
            >
                <ChevronRight size={18} />
            </button>
        </section>
    )
}

function CollectionsSection() {
    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#343B32]">Shop by Collection</h2>
                <Link to="/shop" className="flex items-center gap-1 text-sm text-[#777] hover:text-[#343B32] transition-colors">
                    View All Collections <ArrowRight size={14} />
                </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {COLLECTIONS.map(({ label, description, to, image, cta }) => (
                    <Link
                        key={label}
                        to={to}
                        className="group relative rounded-2xl overflow-hidden bg-[#EDE4D8] min-h-[260px] flex flex-col justify-end hover:shadow-xl transition-shadow duration-300"
                    >
                        <img
                            src={image}
                            alt={label}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#343B32]/70 via-[#343B32]/20 to-transparent" />
                        <div className="relative p-6">
                            <h3 className="text-2xl font-serif font-bold text-white mb-1">{label}</h3>
                            <p className="text-white/80 text-sm mb-4">{description}</p>
                            <span className="inline-flex items-center gap-1.5 bg-[#343B32]/80 border border-white/30 text-white text-xs font-semibold px-4 py-2 rounded-lg group-hover:bg-[#A8C3A0] group-hover:text-[#343B32] group-hover:border-[#A8C3A0] transition-all">
                                {cta} <ArrowRight size={12} />
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}

const PRODUCT_SECTIONS: Array<{ title: string; to: string; category?: Product['category'] }> = [
    { title: 'All Products', to: '/shop' },
    { title: "Men's Collection", to: '/men', category: 'men' },
    { title: "Women's Collection", to: '/women', category: 'women' },
    { title: 'Accessories', to: '/accessories', category: 'accessories' },
]

function CatalogueSections({ products }: { products: Product[] }) {
    return (
        <div className="bg-[#FAF8F4]">
            {PRODUCT_SECTIONS.map(({ title, to, category }, index) => {
                const sectionProducts = (category ? products.filter((product) => product.category === category) : products).slice(0, 4)
                return (
                    <section key={title} className={index % 2 === 0 ? 'py-16' : 'bg-[#EDE4D8] py-16'}>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#343B32]">{title}</h2>
                                <Link to={to} className="flex items-center gap-1 text-sm text-[#777] hover:text-[#343B32] transition-colors">
                                    View All <ArrowRight size={14} />
                                </Link>
                            </div>
                            {sectionProducts.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                                    {sectionProducts.map((product) => <ProductCard key={product.id} product={product} />)}
                                </div>
                            ) : (
                                <p className="text-sm text-[#777]">Products will appear here when this collection is configured.</p>
                            )}
                        </div>
                    </section>
                )
            })}
        </div>
    )
}

function BestsellingSection({ products }: { products: Product[] }) {
    const featured = products.filter((p) => p.is_featured || p.is_new_arrival).slice(0, 6)
    return (
        <section className="bg-[#FAF8F4] py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#343B32]">Bestselling Products</h2>
                    <Link to="/shop" className="flex items-center gap-1 text-sm text-[#777] hover:text-[#343B32] transition-colors">
                        View All <ArrowRight size={14} />
                    </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {featured.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    )
}

function NewArrivalsSection({ products }: { products: Product[] }) {
    const newProducts = products.filter((p) => p.is_new_arrival).slice(0, 4)
    return (
        <section className="bg-[#EDE4D8] py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#343B32]">New Arrivals</h2>
                    <Link to="/shop?filter=new" className="flex items-center gap-1 text-sm text-[#777] hover:text-[#343B32] transition-colors">
                        See All <ArrowRight size={14} />
                    </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {newProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    )
}

function OurStorySection() {
    return (
        <section className="bg-[#FAF8F4] py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-3 gap-10 items-center">
                    {/* Image */}
                    <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                        <img
                            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80"
                            alt="Berwa Collections store"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-4 left-4 bg-[#343B32] text-white px-4 py-3 rounded-xl">
                            <span className="font-serif font-bold text-lg block">Berwa</span>
                            <span className="text-[10px] uppercase tracking-[0.25em] text-[#A8C3A0]">Collections</span>
                        </div>
                    </div>

                    {/* Story */}
                    <div className="space-y-5">
                        <h2 className="text-3xl font-serif font-bold text-[#343B32]">Our Story</h2>
                        <p className="text-[#777] leading-relaxed">
                            Berwa Collections was born from a simple belief: great style should be accessible to everyone. We bring together classic, modern and versatile pieces that fit your lifestyle — whether you're heading to work, a special event, or just enjoying your day.
                        </p>
                        <p className="text-[#777] leading-relaxed">
                            Our mission is to make quality fashion easy, affordable and available wherever you are.
                        </p>
                        <Link
                            to="/about"
                            className="inline-flex items-center gap-2 bg-[#343B32] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#A8C3A0] hover:text-[#343B32] transition-colors group"
                        >
                            Learn More <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* Trust icons */}
                    <div className="space-y-5">
                        {TRUST_ITEMS.map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="flex items-start gap-4 p-4 rounded-xl bg-[#EDE4D8]/60">
                                <div className="w-11 h-11 bg-[#A8C3A0] rounded-full flex items-center justify-center shrink-0">
                                    <Icon size={20} className="text-[#343B32]" />
                                </div>
                                <div>
                                    <p className="font-semibold text-[#343B32] text-sm">{title}</p>
                                    <p className="text-[#777] text-xs mt-0.5 leading-relaxed">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

function NewsletterSection() {
    const [email, setEmail] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.includes('@')) {
            setError('Please enter a valid email address.')
            return
        }
        setError('')
        setSubmitted(true)
    }

    return (
        <section className="bg-[#343B32] py-14">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-3 gap-6 items-center">
                    <div className="lg:col-span-1">
                        <h2 className="text-2xl font-serif font-bold text-white mb-2">Join Our Newsletter</h2>
                        <p className="text-white/60 text-sm leading-relaxed">
                            Get the latest collections, exclusive offers and style inspiration. No spam, just great fashion.
                        </p>
                    </div>
                    <div className="lg:col-span-1">
                        {submitted ? (
                            <div className="flex items-center gap-3 bg-[#A8C3A0]/20 border border-[#A8C3A0] px-5 py-4 rounded-lg">
                                <ShieldCheck size={20} className="text-[#A8C3A0] shrink-0" />
                                <p className="text-white text-sm">Thank you! You're subscribed.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email address"
                                        aria-label="Email for newsletter"
                                        className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/20 focus:border-[#A8C3A0] focus:outline-none text-sm"
                                        required
                                    />
                                    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
                                </div>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-[#A8C3A0] text-[#343B32] font-semibold rounded-lg hover:bg-white transition-colors whitespace-nowrap text-sm"
                                >
                                    Subscribe
                                </button>
                            </form>
                        )}
                    </div>
                    <div className="hidden lg:flex justify-end items-center">
                        <div className="text-right">
                            <span className="text-4xl">🌿</span>
                            <p className="text-white/40 text-xs italic mt-1">Better Together</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default function HomePage() {
    const [products, setProducts] = useState<Product[]>([])
    const [catalogueError, setCatalogueError] = useState<string | null>(null)

    useEffect(() => {
        let active = true
        getActiveProducts().then((data) => {
            if (active) setProducts(data)
        }).catch((error: unknown) => {
            if (active) setCatalogueError(error instanceof Error ? error.message : 'The catalogue is unavailable right now.')
        })
        return () => { active = false }
    }, [])

    return (
        <>
            <HeroSection />
            <CollectionsSection />
            {catalogueError && <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8"><p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{catalogueError}</p></div>}
            <CatalogueSections products={products} />
            <BestsellingSection products={products} />
            <NewArrivalsSection products={products} />
            <OurStorySection />
            <NewsletterSection />
        </>
    )
}
