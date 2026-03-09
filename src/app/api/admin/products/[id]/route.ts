import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { slugify } from '@/lib/utils'

const supabase = createAdminClient()

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data, error } = await supabase.from('products').select('*, categories(*)').eq('id', id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await req.json()
    const { name, description, price, category_id, image_urls, is_featured, is_popular } = body

    if (!category_id) {
      return NextResponse.json({ error: 'Kategori diperlukan' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = { description, price, category_id, image_urls, is_featured, is_popular }
    if (name) {
      updateData.name = name
      updateData.slug = slugify(name) + '-' + Date.now()
    }

    const { data, error } = await supabase.from('products').update(updateData).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
