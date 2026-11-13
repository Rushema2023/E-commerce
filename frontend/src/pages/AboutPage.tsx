import { ArrowRight, Award, Globe, Heart, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

const VALUES = [
    { icon: Award, title: 'Quality First', desc: 'We source only premium materials and carefully curated styles.' },
    { icon: Globe, title: 'Global Style', desc: 'Bringing considered fashion to customers around the world.' },
    { icon: Heart, title: 'Accessible Fashion', desc: 'Great style should never be out of reach.' },
    { icon: Users, title: 'Community', desc: 'Building a community of confident, stylish people everywhere.' },
]

export default function AboutPage() {
    return (
        <div className="bg-[#FAF8F4]">
            <div className="bg-[#343B32] py-20 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <p className="text-[#A8C3A0] text-xs font-bold uppercase tracking-[0.3em] mb-3">Our Story</p>
                    <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-5">Fashion for Every You</h1>
                    <p className="text-white/70 text-lg leading-relaxed">
                        Berwa Collections was born from a simple belief: great style should be accessible to everyone, everywhere.
                    </p>
                </div>
            </div>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid lg:grid-cols-2 gap-14 items-center">
                    <div>
                        <img
                            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80"
                            alt="Berwa Collections store"
                            className="rounded-2xl w-full aspect-[4/3] object-cover shadow-lg"
                        />
                    </div>
                    <div className="space-y-5">
                        <h2 className="text-3xl font-serif font-bold text-[#343B32]">Who We Are</h2>
                        <p className="text-[#777] leading-relaxed">
                            Berwa Collections brings together classic, modern, and versatile pieces that fit your lifestyle, whether you're heading to work, a special event, or simply enjoying your day.
                        </p>
                        <p className="text-[#777] leading-relaxed">
                            We carefully select every item in our catalogue to ensure it meets our standards of quality, style, and value. From crisp blazers and elegant dresses to premium accessories, every piece tells a story.
                        </p>
                        <p className="text-[#777] leading-relaxed">
                            Our mission is to make quality fashion easy, affordable, and available to customers around the world.
                        </p>
                        <Link
                            to="/shop"
                            className="inline-flex items-center gap-2 bg-[#343B32] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#A8C3A0] hover:text-[#343B32] transition-colors group"
                        >
                            Shop the Collection <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            <section className="bg-[#EDE4D8] py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-serif font-bold text-[#343B32]">What We Stand For</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {VALUES.map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="bg-white rounded-2xl p-6 text-center shadow-sm">
                                <div className="w-12 h-12 bg-[#A8C3A0] rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Icon size={22} className="text-[#343B32]" />
                                </div>
                                <h3 className="font-semibold text-[#343B32] mb-2">{title}</h3>
                                <p className="text-[#777] text-sm leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
