import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { slugify } from '@/lib/utils'

const supabase = createAdminClient()

export async function GET() {
  const { data, error } = await supabase.from('categories').select('*').order('name')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json()
    if (!name) return NextResponse.json({ error: 'Nama kategori diperlukan' }, { status: 400 })

    const slug = slugify(name)
    const { data, error } = await supabase.from('categories').insert({ name, slug }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
