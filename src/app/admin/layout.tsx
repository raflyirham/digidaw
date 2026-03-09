import { createClient } from '@/lib/supabase/client'
import AdminLayoutClient from './AdminLayoutClient'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let settings: Record<string, string> = {}
  try {
    const supabase = createClient()
    const { data } = await supabase.from('site_settings').select('*')
    data?.forEach((s: any) => { settings[s.key] = s.value ?? '' })
  } catch (e) {
    console.error('Failed to fetch settings:', e)
  }

  return <AdminLayoutClient initialSettings={settings}>{children}</AdminLayoutClient>
}
