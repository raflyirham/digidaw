import { createClient } from '@/lib/supabase/client'
import { Category, PaymentMethod, Product, SiteSetting } from '@/types'

const supabase = createClient()

// ─── PRODUCTS ───────────────────────────────────────────────
export async function fetchProducts(categorySlug?: string) {
  let query = supabase
    .from('products')
    .select('*, categories(id, name, slug)')
    .order('created_at', { ascending: false })

  if (categorySlug && categorySlug !== 'semua') {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single()
    if (cat) {
      query = query.eq('category_id', cat.id)
    }
  }

  const { data, error } = await query
  if (error) throw error
  return data as Product[]
}

export async function fetchFeaturedProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(id, name, slug)')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(8)
  if (error) throw error
  return data as Product[]
}

export async function fetchPopularProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(id, name, slug)')
    .eq('is_popular', true)
    .order('created_at', { ascending: false })
    .limit(8)
  if (error) throw error
  return data as Product[]
}

export async function fetchProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(id, name, slug)')
    .eq('slug', slug)
    .single()
  if (error) throw error
  return data as Product
}

export async function fetchProductsByCategory(categoryId: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(id, name, slug)')
    .eq('category_id', categoryId)
    .order('created_at', { ascending: false })
    .limit(8)
  if (error) throw error
  return data as Product[]
}

// ─── CATEGORIES ─────────────────────────────────────────────
export async function fetchCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  if (error) throw error
  return data as Category[]
}

// ─── PAYMENT METHODS ─────────────────────────────────────────
export async function fetchPaymentMethods() {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  if (error) throw error
  return data as PaymentMethod[]
}

// ─── SITE SETTINGS ───────────────────────────────────────────
export async function fetchSiteSettings() {
  const { data, error } = await supabase.from('site_settings').select('*')
  if (error) throw error
  const settings: Record<string, string> = {}
  ;(data as SiteSetting[]).forEach((s) => {
    settings[s.key] = s.value ?? ''
  })
  return settings
}
