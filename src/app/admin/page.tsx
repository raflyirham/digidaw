'use client'

import { useQuery } from '@tanstack/react-query'
import { Package, ShoppingBag, CreditCard, TrendingUp, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { formatRupiah } from '@/lib/utils'

export default function AdminDashboardPage() {
  const { data: products } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const res = await fetch('/api/admin/products')
      return res.json()
    },
  })

  const { data: orders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const res = await fetch('/api/admin/orders')
      return res.json()
    },
  })

  const stats = [
    {
      label: 'Total Produk',
      value: products?.length ?? 0,
      icon: Package,
      color: 'blue',
      href: '/admin/products',
    },
    {
      label: 'Total Pesanan',
      value: orders?.length ?? 0,
      icon: ShoppingBag,
      color: 'purple',
      href: '/admin/orders',
    },
    {
      label: 'Pesanan Pending',
      value: orders?.filter((o: { status: string }) => o.status === 'pending').length ?? 0,
      icon: TrendingUp,
      color: 'yellow',
      href: '/admin/orders',
    },
    {
      label: 'Total Pendapatan',
      value: formatRupiah(
        orders
          ?.filter((o: { status: string }) => o.status === 'paid')
          .reduce((sum: number, o: { total_amount: number }) => sum + o.total_amount, 0) ?? 0
      ),
      icon: CreditCard,
      color: 'green',
      href: '/admin/orders',
    },
  ]

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    green: 'bg-green-500/10 text-green-400 border border-green-500/20',
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-heading font-black text-white tracking-tight">Dashboard</h1>
          <p className="text-zinc-400 mt-2 text-sm">Selamat datang di panel admin Digidaw</p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 text-sm text-[#ccff00] hover:text-[#b3e600] font-semibold"
        >
          <ExternalLink size={16} />
          Lihat Toko
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="studio-card studio-card-hover p-6 group">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 flex items-center justify-center ${colorMap[stat.color]}`}>
                  <stat.icon size={22} />
                </div>
              </div>
              <div className="text-3xl font-heading font-black text-white tracking-tight">{stat.value}</div>
              <div className="text-zinc-400 text-sm mt-2 font-medium">{stat.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="studio-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <h2 className="font-heading font-black text-white text-lg tracking-tight">Pesanan Terbaru</h2>
          <Link href="/admin/orders" className="text-sm text-[#ccff00] hover:text-[#b3e600] font-semibold">
            Lihat Semua
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-3 font-bold text-zinc-500 text-xs uppercase tracking-wider">ID</th>
                <th className="text-left px-6 py-3 font-bold text-zinc-500 text-xs uppercase tracking-wider">Pelanggan</th>
                <th className="text-left px-6 py-3 font-bold text-zinc-500 text-xs uppercase tracking-wider">Total</th>
                <th className="text-left px-6 py-3 font-bold text-zinc-500 text-xs uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders?.slice(0, 5).map((order: { id: string; customer_name: string; total_amount: number; status: string }) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-zinc-400">{order.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-6 py-4 font-semibold text-white">{order.customer_name}</td>
                  <td className="px-6 py-4 font-heading font-bold tracking-tight text-[#ccff00]">{formatRupiah(order.total_amount)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-bold tracking-wide ${
                      order.status === 'paid'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : order.status === 'cancelled'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    }`}>
                      {order.status === 'paid' ? 'Lunas' : order.status === 'cancelled' ? 'Batal' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
              {!orders?.length && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500 text-sm">Belum ada pesanan</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
