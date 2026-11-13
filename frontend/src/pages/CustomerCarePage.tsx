import { ChevronRight, CreditCard, FileText, HelpCircle, PackageCheck, RotateCcw, ShieldCheck, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'

type CarePage = 'privacy' | 'terms' | 'payment-info' | 'delivery' | 'returns' | 'faqs' | 'help'

interface CarePageContent {
    eyebrow: string
    title: string
    intro: string
    icon: typeof ShieldCheck
    sections: Array<{ heading: string; body: string }>
}

const CARE_CONTENT: Record<CarePage, CarePageContent> = {
    privacy: {
        eyebrow: 'Your Privacy',
        title: 'Privacy Policy',
        intro: 'We respect your privacy and handle your personal information with care.',
        icon: ShieldCheck,
        sections: [
            { heading: 'Information we collect', body: 'We collect the details needed to process orders, provide support, and improve your shopping experience, such as your name, contact details, delivery address, and order history.' },
            { heading: 'How we use your information', body: 'Your information is used to fulfil orders, arrange delivery, communicate about purchases, and respond to your requests. We do not sell your personal information.' },
            { heading: 'Keeping information secure', body: 'We use reasonable safeguards to protect your information. Please contact us if you have questions about the information we hold about you.' },
        ],
    },
    terms: {
        eyebrow: 'Shopping With Us',
        title: 'Terms & Conditions',
        intro: 'These terms explain the basics of using and shopping with Berwa Collections.',
        icon: FileText,
        sections: [
            { heading: 'Orders and availability', body: 'Placing an order is subject to product availability and confirmation of payment. We may contact you if an item is unavailable or an order needs clarification.' },
            { heading: 'Product information', body: 'We aim to display product details and colours as accurately as possible. Colours may vary slightly depending on your screen or device.' },
            { heading: 'Changes to these terms', body: 'We may update these terms from time to time. The current version will always be available on this page.' },
        ],
    },
    'payment-info': {
        eyebrow: 'Paying for Your Order',
        title: 'Payment Information',
        intro: 'Find the information you need to complete your order securely and with confidence.',
        icon: CreditCard,
        sections: [
            { heading: 'Payment confirmation', body: 'Your order is confirmed once payment has been successfully authorised. You will receive an order confirmation with your purchase details.' },
            { heading: 'Secure checkout', body: 'Payment details are handled through our secure checkout process. We do not store your full payment card details.' },
            { heading: 'Need help with payment?', body: 'If payment does not go through or you have a question about a charge, please contact our support team with your order number.' },
        ],
    },
    delivery: {
        eyebrow: 'Getting Your Order',
        title: 'Delivery Information',
        intro: 'We deliver your selected pieces safely to your door around the world.',
        icon: Truck,
        sections: [
            { heading: 'Delivery updates', body: 'After your order is confirmed, we will keep you informed about its delivery status using the contact details provided at checkout.' },
            { heading: 'Delivery address', body: 'Please review your delivery address and phone number before placing an order. Accurate details help us deliver without delay.' },
            { heading: 'Delivery questions', body: 'For delivery timing, address changes, or order tracking support, contact us and include your order number.' },
        ],
    },
    returns: {
        eyebrow: 'Easy Support',
        title: 'Returns',
        intro: 'If something is not quite right, our team is here to help you with the next steps.',
        icon: RotateCcw,
        sections: [
            { heading: 'Starting a return', body: 'Contact us with your order number and a brief description of the item you would like to return. Our team will guide you through the process.' },
            { heading: 'Item condition', body: 'Items should be returned unused, in their original condition, and with any tags or packaging included where possible.' },
            { heading: 'Refunds and exchanges', body: 'Once we review your return, we will confirm the available refund or exchange options and keep you updated throughout the process.' },
        ],
    },
    faqs: {
        eyebrow: 'Answers at a Glance',
        title: 'Frequently Asked Questions',
        intro: 'Quick answers to common questions about shopping with Berwa Collections.',
        icon: HelpCircle,
        sections: [
            { heading: 'How do I place an order?', body: 'Choose an item, select the options you need, add it to your cart, and continue to checkout to enter your delivery and payment details.' },
            { heading: 'Can I change an order?', body: 'Get in touch as soon as possible with your order number. We will do our best to help before the order is processed for delivery.' },
            { heading: 'How can I get product advice?', body: 'Our team is happy to help with sizing, styling, and product questions. Send us a message through the contact page.' },
        ],
    },
    help: {
        eyebrow: 'We Are Here to Help',
        title: 'Help Center',
        intro: 'Get help with an order, delivery, payment, returns, or anything else you need.',
        icon: PackageCheck,
        sections: [
            { heading: 'Before you contact us', body: 'Having your order number, the email used for your order, and a short description of the issue will help us assist you faster.' },
            { heading: 'Order support', body: 'For questions about an existing order, contact our team and include your order number in your message.' },
            { heading: 'General support', body: 'For product, sizing, delivery, payment, or return questions, use our contact page and we will get back to you as soon as possible.' },
        ],
    },
}

export default function CustomerCarePage({ page }: { page: CarePage }) {
    const content = CARE_CONTENT[page]
    const Icon = content.icon

    return (
        <div className="min-h-screen bg-[#FAF8F4]">
            <header className="bg-[#343B32] px-4 py-16 text-center sm:py-20">
                <div className="mx-auto max-w-3xl">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#A8C3A0] text-[#343B32]">
                        <Icon size={24} />
                    </div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[#A8C3A0]">{content.eyebrow}</p>
                    <h1 className="font-serif text-4xl font-bold text-white sm:text-5xl">{content.title}</h1>
                    <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/70">{content.intro}</p>
                </div>
            </header>

            <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
                <div className="space-y-5">
                    {content.sections.map((section) => (
                        <section key={section.heading} className="rounded-2xl border border-[#EDE4D8] bg-white p-6 shadow-sm sm:p-8">
                            <h2 className="text-xl font-semibold text-[#343B32]">{section.heading}</h2>
                            <p className="mt-3 leading-relaxed text-[#777]">{section.body}</p>
                        </section>
                    ))}
                </div>

                <div className="mt-10 rounded-2xl bg-[#EDE4D8] p-6 text-center sm:p-8">
                    <h2 className="font-serif text-2xl font-bold text-[#343B32]">Still need help?</h2>
                    <p className="mt-2 text-[#777]">Our team is ready to help with your question.</p>
                    <Link to="/contact" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#343B32] px-5 py-3 font-medium text-white transition-colors hover:bg-[#A8C3A0] hover:text-[#343B32]">
                        Contact us <ChevronRight size={16} />
                    </Link>
                </div>
            </main>
        </div>
    )
}
