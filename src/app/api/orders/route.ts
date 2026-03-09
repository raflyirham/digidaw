import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      customer_name,
      customer_email,
      customer_phone,
      notes,
      payment_method_id,
      total_amount,
      items,
    } = body

    if (!customer_name || !customer_phone || !items?.length) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name,
        customer_email: customer_email || null,
        customer_phone,
        notes: notes || null,
        payment_method_id: payment_method_id || null,
        total_amount,
        status: 'pending',
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Create order items
    const orderItems = items.map((item: {
      product_id: string
      product_name: string
      price: number
      quantity: number
    }) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      price: item.price,
      quantity: item.quantity,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    return NextResponse.json(order)
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
