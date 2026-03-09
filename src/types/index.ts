// ─────────────────────────────────────────
// SHARED TYPESCRIPT TYPES FOR DIGIDAW
// ─────────────────────────────────────────

export interface Category {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  category_id: string | null
  image_urls: string[] | null
  is_featured: boolean
  is_popular: boolean
  created_at: string
  categories?: Category
}

export interface PaymentMethodDetail {
  account_number?: string
  account_name?: string
  bank_name?: string
  phone_number?: string
  description?: string
  qris_image_url?: string
}

export type PaymentMethodType = 'bank' | 'ewallet' | 'qris'

export interface PaymentMethod {
  id: string
  name: string
  type: PaymentMethodType
  detail: PaymentMethodDetail
  logo_url: string | null
  is_active: boolean
  sort_order: number
  created_at: string
}

export type OrderStatus = 'pending' | 'paid' | 'cancelled'

export interface Order {
  id: string
  customer_name: string
  customer_email: string | null
  customer_phone: string
  total_amount: number
  status: OrderStatus
  payment_method_id: string | null
  notes: string | null
  created_at: string
  payment_methods?: PaymentMethod
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  price: number
  quantity: number
  products?: Product
}

export interface SiteSetting {
  id: string
  key: string
  value: string | null
  updated_at: string
}

export interface AdminUser {
  id: string
  username: string
  password_hash: string
  created_at: string
}

// Cart types (client-side only)
export interface CartItem {
  productId: string
  name: string
  price: number
  image_url: string | null
  slug: string
  quantity: number
}
