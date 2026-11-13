import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

const messages = [
    '🚚 Worldwide delivery available',
    '✨ Stylish fashion, wherever you are!',
    '💳 Multiple payment options available',
]

export default function AnnouncementBar() {
    const [idx, setIdx] = useState(0)

    const prev = () => setIdx((i) => (i - 1 + messages.length) % messages.length)
    const next = () => setIdx((i) => (i + 1) % messages.length)

    return (
        <div className="bg-[#343B32] text-white text-xs sm:text-sm py-2 px-4 flex items-center justify-center gap-4">
            <button
                onClick={prev}
                aria-label="Previous announcement"
                className="opacity-70 hover:opacity-100 transition-opacity"
            >
                <ChevronLeft size={14} />
            </button>
            <span className="tracking-wide text-center transition-all duration-300">
                {messages[idx]}
            </span>
            <button
                onClick={next}
                aria-label="Next announcement"
                className="opacity-70 hover:opacity-100 transition-opacity"
            >
                <ChevronRight size={14} />
            </button>
        </div>
    )
}
