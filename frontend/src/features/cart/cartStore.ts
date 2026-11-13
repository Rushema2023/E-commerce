import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '../../types'
import { clamp } from '../../lib/utils'

interface CartStore {
    items: CartItem[]
    isOpen: boolean
    addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
    removeItem: (productId: string, size?: string, color?: string) => void
    updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void
    clearCart: () => void
    openCart: () => void
    closeCart: () => void
    toggleCart: () => void
    total: () => number
    itemCount: () => number
}

function itemKey(productId: string, size?: string, color?: string) {
    return `${productId}|${size ?? ''}|${color ?? ''}`
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,

            addItem: (incoming) => {
                const { items } = get()
                const key = itemKey(incoming.product_id, incoming.size, incoming.color)
                const existing = items.find(
                    (i) => itemKey(i.product_id, i.size, i.color) === key
                )

                if (existing) {
                    const newQty = clamp(
                        existing.quantity + (incoming.quantity ?? 1),
                        1,
                        incoming.stock_quantity
                    )
                    set({
                        items: items.map((i) =>
                            itemKey(i.product_id, i.size, i.color) === key
                                ? { ...i, quantity: newQty }
                                : i
                        ),
                        isOpen: true,
                    })
                } else {
                    set({
                        items: [
                            ...items,
                            { ...incoming, quantity: clamp(incoming.quantity ?? 1, 1, incoming.stock_quantity) },
                        ],
                        isOpen: true,
                    })
                }
            },

            removeItem: (productId, size, color) => {
                const key = itemKey(productId, size, color)
                set({ items: get().items.filter((i) => itemKey(i.product_id, i.size, i.color) !== key) })
            },

            updateQuantity: (productId, quantity, size, color) => {
                const key = itemKey(productId, size, color)
                set({
                    items: get().items.map((i) =>
                        itemKey(i.product_id, i.size, i.color) === key
                            ? { ...i, quantity: clamp(quantity, 1, i.stock_quantity) }
                            : i
                    ),
                })
            },

            clearCart: () => set({ items: [] }),
            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),
            toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

            total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
            itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
        }),
        {
            name: 'berwa-cart',
            partialize: (state) => ({ items: state.items }),
        }
    )
)
