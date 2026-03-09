'use client'

import Link from 'next/link'
import { Zap, Instagram, Twitter, Mail, Heart } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { fetchSiteSettings } from '@/lib/api'

export default function Footer({ initialSettings }: { initialSettings?: Record<string, string> }) {
  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: fetchSiteSettings,
    initialData: initialSettings,
  })
  return (
    <footer className="bg-[#0a0a0a] text-zinc-400 border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-[#ccff00] flex items-center justify-center transition-transform group-hover:scale-105">
                <Zap size={20} className="text-black fill-black" />
              </div>
              <span className="font-heading font-black text-2xl text-white tracking-tighter uppercase">{settings?.site_name || 'DIGIDAW'}</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm whitespace-pre-line">
              {settings?.footer_description || 'Aset digital premium terkurasi. Tingkatkan proyek kreatif Anda dengan templat, alat, dan sumber daya tingkat tinggi.'}
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-6">
            <h4 className="font-heading font-bold text-white text-xs uppercase tracking-[0.2em]">NAVIGASI</h4>
            <ul className="space-y-3">
              {[
                { href: '/', label: 'BERANDA' },
                { href: '/products', label: 'KATALOG' },
                { href: '/cart', label: 'KERANJANG' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-[#ccff00] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h4 className="font-heading font-bold text-white text-xs uppercase tracking-[0.2em]">HUBUNGI</h4>
            <div className="flex items-center gap-4">
              <a
                href="mailto:hello@digidaw.id"
                className="w-10 h-10 border border-white/10 flex items-center justify-center hover:border-[#ccff00] hover:text-[#ccff00] transition-colors"
                aria-label="Email"
              >
                <Mail size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 border border-white/10 flex items-center justify-center hover:border-[#ccff00] hover:text-[#ccff00] transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 border border-white/10 flex items-center justify-center hover:border-[#ccff00] hover:text-[#ccff00] transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs tracking-wide uppercase">&copy; {new Date().getFullYear()} {settings?.footer_copyright || 'Digidaw Studio.'}</p>
          <p className="text-xs tracking-wide uppercase flex items-center gap-1.5">
            Dibuat dengan <Heart size={14} className="text-[#ccff00] fill-[#ccff00]" /> di Indonesia
          </p>
        </div>
      </div>
    </footer>
  )
}
