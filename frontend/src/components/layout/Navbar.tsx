import { Search, User, ShoppingBag, Menu, X, Globe } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCartStore } from '../../features/cart/cartStore'
import { CURRENCIES, type CurrencyCode, useCurrency } from '../../features/currency/CurrencyContext'

const NAV_LINKS = [
    { label: 'Home', to: '/' },
    { label: 'Shop', to: '/shop' },
    { label: 'Men', to: '/men' },
    { label: 'Women', to: '/women' },
    { label: 'Accessories', to: '/accessories' },
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/contact' },
]

export default function Navbar() {
    const location = useLocation()
    const navigate = useNavigate()
    const { toggleCart } = useCartStore()
    const count = useCartStore((s) => s.itemCount())
    const { currency, setCurrency, isRateLoading } = useCurrency()

    const [searchOpen, setSearchOpen] = useState(false)
    const [searchQ, setSearchQ] = useState('')
    const [mobileOpen, setMobileOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const searchRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    useEffect(() => {
        setMobileOpen(false)
    }, [location.pathname])

    useEffect(() => {
        if (searchOpen) searchRef.current?.focus()
    }, [searchOpen])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQ.trim()) {
            navigate(`/shop?q=${encodeURIComponent(searchQ.trim())}`)
            setSearchOpen(false)
            setSearchQ('')
        }
    }

    const isActive = (to: string) =>
        to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

    return (
        <>
            <header
                className={`sticky top-0 z-50 bg-[#FAF8F4] border-b border-[#EDE4D8] transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'shadow-none'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 lg:h-20">
                        {/* Logo */}
                        <Link to="/" className="flex flex-col leading-none group">
                            <span className="text-xl lg:text-2xl font-bold tracking-tight text-[#343B32] font-serif group-hover:text-[#A8C3A0] transition-colors">
                                Berwa
                            </span>
                            <span className="text-[9px] uppercase tracking-[0.3em] text-[#777] font-light -mt-0.5">
                                Collections
                            </span>
                        </Link>

                        {/* Desktop nav */}
                        <nav className="hidden lg:flex items-center gap-7">
                            {NAV_LINKS.map(({ label, to }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    className={`text-sm font-medium transition-colors relative py-1 ${isActive(to)
                                            ? 'text-[#343B32]'
                                            : 'text-[#777] hover:text-[#343B32]'
                                        }`}
                                >
                                    {label}
                                    {isActive(to) && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#343B32] rounded-full" />
                                    )}
                                </Link>
                            ))}
                        </nav>

                        {/* Icons */}
                        <div className="flex items-center gap-1 sm:gap-2">
                            <label className="hidden md:flex items-center gap-1 rounded-lg border border-[#EDE4D8] bg-white px-2 py-1.5 text-xs text-[#343B32]" title="Display currency">
                                <Globe size={14} className="text-[#777]" aria-hidden="true" />
                                <span className="sr-only">Display currency</span>
                                <select
                                    value={currency}
                                    onChange={(event) => setCurrency(event.target.value as CurrencyCode)}
                                    className="max-w-16 cursor-pointer appearance-none bg-transparent pr-1 font-semibold outline-none"
                                    aria-label="Display currency"
                                >
                                    {Object.entries(CURRENCIES).map(([code, name]) => <option key={code} value={code}>{code} — {name}</option>)}
                                </select>
                                {isRateLoading && currency !== 'RWF' && <span className="text-[10px] text-[#777]">…</span>}
                            </label>
                            {/* Search */}
                            {searchOpen ? (
                                <form
                                    onSubmit={handleSearch}
                                    className="flex items-center border border-[#EDE4D8] rounded-full overflow-hidden bg-white"
                                >
                                    <input
                                        ref={searchRef}
                                        type="text"
                                        value={searchQ}
                                        onChange={(e) => setSearchQ(e.target.value)}
                                        placeholder="Search products..."
                                        className="pl-4 pr-2 py-1.5 text-sm w-44 sm:w-56 bg-transparent outline-none text-[#343B32]"
                                        aria-label="Search products"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => { setSearchOpen(false); setSearchQ('') }}
                                        className="p-2 text-[#777] hover:text-[#343B32] transition-colors"
                                        aria-label="Close search"
                                    >
                                        <X size={16} />
                                    </button>
                                </form>
                            ) : (
                                <button
                                    onClick={() => setSearchOpen(true)}
                                    aria-label="Open search"
                                    className="p-2 text-[#777] hover:text-[#343B32] transition-colors"
                                >
                                    <Search size={20} />
                                </button>
                            )}

                            {/* Account */}
                            <Link
                                to="/account"
                                aria-label="My account"
                                className="p-2 text-[#777] hover:text-[#343B32] transition-colors"
                            >
                                <User size={20} />
                            </Link>

                            {/* Cart */}
                            <button
                                id="cart-toggle"
                                onClick={toggleCart}
                                aria-label={`Shopping cart, ${count} item${count !== 1 ? 's' : ''}`}
                                className="relative p-2 text-[#777] hover:text-[#343B32] transition-colors"
                            >
                                <ShoppingBag size={20} />
                                {count > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-[#343B32] text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] min-h-[18px] px-1">
                                        {count > 99 ? '99+' : count}
                                    </span>
                                )}
                            </button>

                            {/* Mobile menu */}
                            <button
                                onClick={() => setMobileOpen((o) => !o)}
                                aria-label="Toggle mobile menu"
                                className="lg:hidden p-2 text-[#777] hover:text-[#343B32] transition-colors"
                            >
                                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile nav drawer */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-black/30" onClick={() => setMobileOpen(false)}>
                    <nav
                        className="absolute top-0 right-0 w-72 h-full bg-[#FAF8F4] shadow-xl p-6 pt-20 flex flex-col gap-1"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <label className="mb-3 flex items-center gap-2 rounded-lg border border-[#EDE4D8] bg-white px-3 py-2.5 text-sm text-[#343B32]">
                            <Globe size={16} className="text-[#777]" aria-hidden="true" />
                            <span className="font-medium">Currency</span>
                            <select
                                value={currency}
                                onChange={(event) => setCurrency(event.target.value as CurrencyCode)}
                                className="ml-auto cursor-pointer bg-transparent text-sm font-semibold outline-none"
                                aria-label="Display currency"
                            >
                                {Object.entries(CURRENCIES).map(([code, name]) => <option key={code} value={code}>{code} — {name}</option>)}
                            </select>
                        </label>
                        {NAV_LINKS.map(({ label, to }) => (
                            <Link
                                key={to}
                                to={to}
                                className={`px-4 py-3 rounded-lg text-base font-medium transition-colors ${isActive(to)
                                        ? 'bg-[#EDE4D8] text-[#343B32]'
                                        : 'text-[#777] hover:bg-[#EDE4D8] hover:text-[#343B32]'
                                    }`}
                            >
                                {label}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </>
    )
}
