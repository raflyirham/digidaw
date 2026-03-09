import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const supabase = createAdminClient()

export async function GET() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, payment_methods(id, name, type), order_items(*, products(name))')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
