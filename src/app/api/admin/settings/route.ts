import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const supabase = createAdminClient()

export async function GET() {
  const { data, error } = await supabase.from('site_settings').select('*')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const settings: Record<string, string> = {}
  data.forEach((s: { key: string; value: string | null }) => { settings[s.key] = s.value ?? '' })
  return NextResponse.json(settings)
}

export async function PUT(req: NextRequest) {
  try {
    const updates: Record<string, string> = await req.json()
    const upserts = Object.entries(updates).map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString(),
    }))
    const { error } = await supabase
      .from('site_settings')
      .upsert(upserts, { onConflict: 'key' })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
