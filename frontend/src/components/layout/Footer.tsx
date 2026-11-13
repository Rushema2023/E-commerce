import { Globe, Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCurrency } from '../../features/currency/CurrencyContext'

export default function Footer() {
    const { currency, isEstimate } = useCurrency()
    return (
        <footer className="bg-[#343B32] text-white">
            {/* Main footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div>
                            <span className="text-2xl font-bold tracking-tight font-serif">Berwa</span>
                            <span className="ml-1 text-xs uppercase tracking-[0.25em] text-[#A8C3A0] font-light block -mt-1">
                                Collections
                            </span>
                        </div>
                        <p className="text-sm text-white/60 italic">"Style that stays."</p>
                        <div className="space-y-2 text-sm text-white/60">
                            <div className="flex items-center gap-2">
                                <MapPin size={14} className="text-[#A8C3A0] shrink-0" />
                                <span>[Your business address]</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone size={14} className="text-[#A8C3A0] shrink-0" />
                                <span>[Your phone number]</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail size={14} className="text-[#A8C3A0] shrink-0" />
                                <span>[Your email address]</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-sm uppercase tracking-widest mb-5 text-[#A8C3A0]">
                            Quick Links
                        </h3>
                        <ul className="space-y-2.5 text-sm text-white/70">
                            {[
                                { label: 'Home', to: '/' },
                                { label: 'Shop', to: '/shop' },
                                { label: 'Men', to: '/men' },
                                { label: 'Women', to: '/women' },
                                { label: 'Accessories', to: '/accessories' },
                                { label: 'About', to: '/about' },
                                { label: 'Contact', to: '/contact' },
                            ].map(({ label, to }) => (
                                <li key={label}>
                                    <Link to={to} className="hover:text-[#A8C3A0] transition-colors">
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Customer Care */}
                    <div>
                        <h3 className="font-semibold text-sm uppercase tracking-widest mb-5 text-[#A8C3A0]">
                            Customer Care
                        </h3>
                        <ul className="space-y-2.5 text-sm text-white/70">
                            {[
                                { label: 'Privacy Policy', to: '/privacy' },
                                { label: 'Terms & Conditions', to: '/terms' },
                                { label: 'Payment Information', to: '/payment-info' },
                                { label: 'Delivery Information', to: '/delivery' },
                                { label: 'Returns', to: '/returns' },
                                { label: 'FAQs', to: '/faqs' },
                                { label: 'Help Center', to: '/help' },
                            ].map(({ label, to }) => (
                                <li key={label}>
                                    <Link to={to} className="hover:text-[#A8C3A0] transition-colors">
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Follow Us */}
                    <div>
                        <h3 className="font-semibold text-sm uppercase tracking-widest mb-5 text-[#A8C3A0]">
                            Follow Us
                        </h3>
                        <div className="flex gap-3">
                            {[
                                { icon: Globe, label: 'Social link 1', href: '#' },
                                { icon: Globe, label: 'Social link 2', href: '#' },
                                { icon: Globe, label: 'Social link 3', href: '#' },
                                { icon: Globe, label: 'Social link 4', href: '#' },
                            ].map(({ icon: Icon, label, href }) => (
                                <a
                                    key={label}
                                    href={href}
                                    aria-label={label}
                                    className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:border-[#A8C3A0] hover:text-[#A8C3A0] transition-all"
                                >
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
                    <span>© 2026 Berwa Collections. All rights reserved.</span>
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                        <span className="text-lg">🇷🇼</span>
                        <span>Prices shown in {currency}{isEstimate ? ' (estimate)' : ''}</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
