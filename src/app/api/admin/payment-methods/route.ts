import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const supabase = createAdminClient()

export async function GET() {
  const { data, error } = await supabase.from('payment_methods').select('*').order('sort_order')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, type, detail, logo_url, is_active, sort_order } = body
    if (!name || !type) return NextResponse.json({ error: 'Nama dan tipe diperlukan' }, { status: 400 })

    const { data, error } = await supabase
      .from('payment_methods')
      .insert({ name, type, detail: detail || {}, logo_url, is_active: is_active ?? true, sort_order: sort_order ?? 0 })
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
