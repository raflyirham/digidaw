import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { verifyAdminToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin-token')?.value
    if (!token) return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })

    const payload = await verifyAdminToken(token)
    if (!payload) return NextResponse.json({ error: 'Sesi tidak valid' }, { status: 401 })

    const adminId = payload.id

    const { current_password, new_password } = await req.json()
    if (!current_password || !new_password) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }
    if (new_password.length < 6) {
      return NextResponse.json({ error: 'Password baru minimal 6 karakter' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', adminId)
      .single()

    if (error || !admin) return NextResponse.json({ error: 'Admin tidak ditemukan' }, { status: 404 })

    const valid = await bcrypt.compare(current_password, admin.password_hash)
    if (!valid) return NextResponse.json({ error: 'Password saat ini salah' }, { status: 400 })

    const newHash = await bcrypt.hash(new_password, 12)
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({ password_hash: newHash })
      .eq('id', adminId)

    if (updateError) throw updateError

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
