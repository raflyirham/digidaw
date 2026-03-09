'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  CreditCard,
  Settings,
  LogOut,
  Zap,
  Tag,
  KeyRound,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import { fetchSiteSettings } from '@/lib/api'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Produk', icon: Package },
  { href: '/admin/categories', label: 'Kategori', icon: Tag },
  { href: '/admin/orders', label: 'Pesanan', icon: ShoppingBag },
  { href: '/admin/payment-methods', label: 'Metode Bayar', icon: CreditCard },
  { href: '/admin/settings', label: 'Pengaturan', icon: Settings },
  { href: '/admin/change-password', label: 'Ubah Password', icon: KeyRound },
]

export default function AdminSidebar({ initialSettings }: { initialSettings?: Record<string, string> }) {
  const pathname = usePathname()
  const router = useRouter()

  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: fetchSiteSettings,
    initialData: initialSettings,
  })

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    toast.success('Berhasil keluar')
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside className="w-64 min-h-screen bg-[#121212] border-r border-white/10 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-[#ccff00] flex items-center justify-center transition-transform group-hover:scale-105">
            <Zap size={20} className="text-black fill-black" />
          </div>
          <div className="flex flex-col justify-center">
            <div className="font-heading font-black text-white text-xl tracking-tighter uppercase leading-none">{settings?.site_name || 'Digidaw'}</div>
            <div className="text-[#ccff00] text-[10px] font-bold tracking-widest uppercase mt-1">Admin Panel</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all duration-200 group',
                active
                  ? 'bg-[#ccff00] text-black shadow-[0_0_15px_rgba(204,255,0,0.15)] font-bold'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white'
              )}
            >
              <item.icon size={18} className={active ? 'text-black' : 'text-zinc-500 group-hover:text-white'} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight size={14} className="text-black" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-4 py-2.5 text-zinc-400 hover:text-white text-sm font-medium transition-colors"
        >
          <Package size={16} />
          Lihat Toko
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-zinc-400 hover:text-[#ff3366] text-sm font-medium transition-colors hover:bg-white/5"
        >
          <LogOut size={16} />
          Keluar
        </button>
      </div>
    </aside>
  )
}
