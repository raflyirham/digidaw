import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/client'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  let settings: Record<string, string> = {}
  try {
    const supabase = createClient()
    const { data } = await supabase.from('site_settings').select('*')
    data?.forEach((s: any) => { settings[s.key] = s.value ?? '' })
  } catch (e) {
    console.error('Failed to fetch settings:', e)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar initialSettings={settings} />
      <main className="flex-1">{children}</main>
      <Footer initialSettings={settings} />
    </div>
  )
}
