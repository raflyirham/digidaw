import type { Metadata } from 'next'
import { Syne, Manrope } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '500', '600', '700', '800'],
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  weight: ['400', '500', '600', '700', '800'],
})

import { createClient } from '@/lib/supabase/client'

export async function generateMetadata(): Promise<Metadata> {
  let settings: Record<string, string> = {}
  try {
    const supabase = createClient()
    const { data } = await supabase.from('site_settings').select('*')
    data?.forEach((s: any) => { settings[s.key] = s.value ?? '' })
  } catch (e) {
    console.error('Failed to fetch metadata:', e)
  }

  const title = settings.site_title || 'Digidaw - Toko Produk Digital Terpercaya'
  const description = settings.site_description || 'Temukan dan beli produk digital berkualitas tinggi — template, ebook, preset, dan tools kreatif di Digidaw.'

  return {
    title: {
      default: title,
      template: `%s | ${settings.site_name || 'Digidaw'}`,
    },
    description,
    icons: settings.site_favicon_url ? { icon: settings.site_favicon_url } : undefined,
    keywords: ['produk digital', 'template', 'ebook', 'preset', 'digidaw'],
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={`${syne.variable} ${manrope.variable} dark`}>
      <body className="min-h-screen bg-[#0a0a0a] font-sans text-white overflow-x-hidden selection:bg-[#ccff00] selection:text-black">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
