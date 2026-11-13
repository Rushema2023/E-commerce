import { Mail, Phone, MapPin, Send } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ContactPage() {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
    const [sending, setSending] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSending(true)
        await new Promise((r) => setTimeout(r, 1000))
        setSending(false)
        toast.success('Message sent! We\'ll get back to you within 24 hours.')
        setForm({ name: '', email: '', subject: '', message: '' })
    }

    const INPUT_CLS = "w-full px-4 py-3 border border-[#EDE4D8] rounded-lg text-sm text-[#343B32] focus:outline-none focus:border-[#A8C3A0] bg-[#FAF8F4]"

    return (
        <div className="bg-[#FAF8F4] min-h-screen">
            {/* Hero */}
            <div className="bg-[#EDE4D8] py-14 px-4 text-center">
                <p className="text-[#A8C3A0] text-xs font-bold uppercase tracking-[0.3em] mb-2">Get in Touch</p>
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#343B32]">Contact Us</h1>
                <p className="text-[#777] mt-2 max-w-md mx-auto">We'd love to hear from you. Reach out with any questions about orders, products, or delivery.</p>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Info */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-xl font-semibold text-[#343B32] mb-5">Contact Information</h2>
                            <div className="space-y-4">
                                {[
                                    { icon: MapPin, label: 'Address', value: '[Your business address]' },
                                    { icon: Phone, label: 'Phone / WhatsApp', value: '[Your phone number]' },
                                    { icon: Mail, label: 'Email', value: '[Your email address]' },
                                ].map(({ icon: Icon, label, value }) => (
                                    <div key={label} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-[#EDE4D8]">
                                        <div className="w-10 h-10 bg-[#A8C3A0] rounded-full flex items-center justify-center shrink-0">
                                            <Icon size={18} className="text-[#343B32]" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-[#777] uppercase tracking-wider">{label}</p>
                                            <p className="text-[#343B32] font-medium text-sm mt-0.5">{value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-[#343B32] rounded-2xl p-6 text-center">
                            <p className="text-white font-semibold mb-1">Business Hours</p>
                            <p className="text-white/60 text-sm">Monday – Saturday: [Your hours]</p>
                            <p className="text-white/60 text-sm">Sunday: [Your hours]</p>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="bg-white rounded-2xl border border-[#EDE4D8] p-7">
                        <h2 className="text-xl font-semibold text-[#343B32] mb-6">Send a Message</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="contact-name" className="block text-sm font-medium text-[#343B32] mb-1.5">Name *</label>
                                    <input id="contact-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={INPUT_CLS} placeholder="Your name" />
                                </div>
                                <div>
                                    <label htmlFor="contact-email" className="block text-sm font-medium text-[#343B32] mb-1.5">Email *</label>
                                    <input id="contact-email" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={INPUT_CLS} placeholder="you@example.com" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="contact-subject" className="block text-sm font-medium text-[#343B32] mb-1.5">Subject</label>
                                <input id="contact-subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={INPUT_CLS} placeholder="How can we help?" />
                            </div>
                            <div>
                                <label htmlFor="contact-message" className="block text-sm font-medium text-[#343B32] mb-1.5">Message *</label>
                                <textarea id="contact-message" required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={`${INPUT_CLS} resize-none`} placeholder="Your message..." />
                            </div>
                            <button
                                type="submit"
                                disabled={sending}
                                id="contact-submit"
                                className="w-full flex items-center justify-center gap-2 bg-[#343B32] text-white py-3 rounded-lg font-semibold hover:bg-[#A8C3A0] hover:text-[#343B32] transition-colors disabled:opacity-60"
                            >
                                <Send size={16} />
                                {sending ? 'Sending…' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
