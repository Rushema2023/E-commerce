// =====================
// BRAND / PRODUCT TYPES
// =====================

export type Category = 'men' | 'women' | 'accessories'

export interface Product {
    id: string
    name: string
    description: string
    category: Category
    price: number // integer in the store's base currency
    slug: string
    sku: string
    stock_quantity: number
    is_featured: boolean
    is_new_arrival: boolean
    is_active: boolean
    sizes: string[]
    colors: string[]
    images: ProductImage[]
    rating?: number
    review_count?: number
    created_at: string
}

export interface ProductImage {
    id: string
    product_id: string
    url: string
    alt: string
    is_primary: boolean
    sort_order: number
}

// =====================
// CART TYPES
// =====================

export interface CartItem {
    product_id: string
    name: string
    price: number
    image_url: string
    size?: string
    color?: string
    quantity: number
    stock_quantity: number
}

// =====================
// ORDER / CHECKOUT TYPES
// =====================

export type OrderStatus =
    | 'pending_payment'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'

export type PaymentStatus =
    | 'awaiting_payment'
    | 'submitted'
    | 'approved'
    | 'rejected'
    | 'refunded'

export interface Order {
    id: string
    order_number: string
    user_id?: string
    customer_name: string
    customer_phone: string
    district: string
    address: string
    delivery_instructions?: string
    payment_method: string
    subtotal: number
    delivery_fee: number
    total: number
    base_currency: string
    display_currency: string
    exchange_rate: number
    display_subtotal: number
    display_delivery_fee: number
    display_total: number
    status: OrderStatus
    payment_status: PaymentStatus
    items: OrderItem[]
    payment?: Payment
    created_at: string
}

export interface OrderItem {
    id: string
    order_id: string
    product_id: string
    product_name: string // snapshot
    product_sku: string
    price: number // snapshot in the store's base currency
    quantity: number
    size?: string
    color?: string
}

export interface Payment {
    id: string
    order_id: string
    method: string
    transaction_reference: string
    receipt_url?: string
    status: PaymentStatus
    admin_notes?: string
    created_at: string
    reviewed_at?: string
}

// =====================
// AUTH TYPES
// =====================

export interface UserProfile {
    id: string
    email: string
    full_name?: string
    phone?: string
    is_admin: boolean
    created_at: string
}

// =====================
// STORE SETTINGS
// =====================

export interface StoreSettings {
    id: string
    key: string
    value: string
    label: string
}
