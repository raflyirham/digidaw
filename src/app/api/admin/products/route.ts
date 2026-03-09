import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { slugify } from '@/lib/utils'

const supabase = createAdminClient()

export async function GET() {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(id, name, slug)')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, description, price, category_id, image_urls, is_featured, is_popular } = body

    if (!name || price === undefined || !category_id) {
      return NextResponse.json({ error: 'Nama, harga, dan kategori diperlukan' }, { status: 400 })
    }

    const slug = slugify(name) + '-' + Date.now()

    const { data, error } = await supabase
      .from('products')
      .insert({ name, slug, description, price, category_id, image_urls, is_featured, is_popular })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
