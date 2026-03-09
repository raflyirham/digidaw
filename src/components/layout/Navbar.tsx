'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, Menu, X, Zap } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchSiteSettings } from '@/lib/api'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'BERANDA' },
  { href: '/products', label: 'KATALOG' },
]

export default function Navbar({ initialSettings }: { initialSettings?: Record<string, string> }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const totalItems = useCartStore((s) => s.totalItems())

  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: fetchSiteSettings,
    initialData: initialSettings,
  })

  useEffect(() => {
    setMounted(true)
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out',
        scrolled
          ? 'bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/10'
          : 'bg-[#0a0a0a]/40 backdrop-blur-md border-b border-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 relative">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group z-20 focus:outline-none">
            <div className="w-10 h-10 bg-[#ccff00] flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3 shadow-[0_0_15px_rgba(204,255,0,0.15)] group-hover:shadow-[0_0_20px_rgba(204,255,0,0.3)]">
              <Zap size={20} className="text-black fill-black" />
            </div>
            <span className="font-heading font-black text-2xl text-white tracking-tighter uppercase">
              {settings?.site_name || 'Digidaw'}
            </span>
          </Link>

          {/* Desktop nav links - Centered */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-xs font-bold tracking-[0.2em] transition-all duration-300 relative group focus:outline-none',
                  pathname === link.href
                    ? 'text-white'
                    : 'text-zinc-400 hover:text-white'
                )}
              >
                {link.label}
                <span className={cn(
                  "absolute -bottom-2 left-1/2 -translate-x-1/2 h-[2px] bg-[#ccff00] transition-all duration-300 ease-out",
                  pathname === link.href ? "w-full" : "w-0 group-hover:w-full opacity-0 group-hover:opacity-100"
                )} />
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-5 z-20">
            <Link
              href="/cart"
              className="relative p-2 text-zinc-400 hover:text-[#ccff00] transition-colors focus:outline-none rounded-full hover:bg-white/5"
              aria-label="Keranjang belanja"
            >
              <ShoppingCart size={22} className="transition-transform duration-300 hover:scale-110" />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#ccff00] text-black text-[10px] font-black min-w-[20px] h-[20px] rounded-full flex items-center justify-center px-1">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-zinc-400 hover:text-[#ccff00] transition-colors focus:outline-none rounded-full hover:bg-white/5"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-6 flex items-center justify-center">
                <Menu size={24} className={cn("absolute transition-all duration-300", menuOpen ? "rotate-90 opacity-0 scale-50" : "rotate-0 opacity-100 scale-100")} />
                <X size={24} className={cn("absolute transition-all duration-300", menuOpen ? "rotate-0 opacity-100 scale-100" : "-rotate-90 opacity-0 scale-50")} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu container - Smooth expand */}
      <div 
        className={cn(
          "md:hidden bg-[#0a0a0a] border-b border-white/10 overflow-hidden transition-all duration-500 ease-in-out",
          menuOpen ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 py-8 flex flex-col gap-6 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                'text-lg font-heading font-black tracking-[0.2em] transition-all uppercase',
                pathname === link.href
                  ? 'text-[#ccff00]'
                  : 'text-zinc-400 hover:text-white'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
