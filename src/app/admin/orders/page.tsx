'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDate, formatRupiah, getOrderStatusColor, getOrderStatusLabel } from '@/lib/utils'
import { Order } from '@/types'
import { useState } from 'react'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'

function OrderDetailModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const qc = useQueryClient()
  const statusMutation = useMutation({
    mutationFn: async (status: string) => {
      const r = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!r.ok) throw new Error('Gagal update status')
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-orders'] }); toast.success('Status diperbarui!') },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#121212] border border-white/10 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-heading font-black text-white">Detail Pesanan</h2>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="bg-white/5 border border-white/10 p-4 space-y-2 text-sm">
            <p><span className="text-zinc-500 font-medium">ID Pesanan:</span> <span className="font-black font-mono text-white">{order.id.slice(0, 8).toUpperCase()}</span></p>
            <p><span className="text-zinc-500 font-medium">Nama:</span> <span className="font-bold text-white">{order.customer_name}</span></p>
            <p><span className="text-zinc-500 font-medium">WhatsApp:</span> <span className="font-semibold text-white">{order.customer_phone}</span></p>
            {order.customer_email && <p><span className="text-zinc-500 font-medium">Email:</span> <span className="text-white">{order.customer_email}</span></p>}
            <p><span className="text-zinc-500 font-medium">Tanggal:</span> <span className="text-white">{formatDate(order.created_at)}</span></p>
            {order.notes && <p><span className="text-zinc-500 font-medium">Catatan:</span> <span className="text-white">{order.notes}</span></p>}
          </div>

          <div>
            <h3 className="font-heading font-bold text-white mb-3">Item Pesanan</h3>
            <div className="space-y-2">
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm bg-white/5 border border-white/5 px-4 py-3">
                  <span className="text-zinc-300 font-semibold">{item.product_name} <span className="text-zinc-500">x{item.quantity}</span></span>
                  <span className="font-black text-[#ccff00]">{formatRupiah(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3 px-4">
              <span className="font-bold text-white">Total</span>
              <span className="font-black text-[#ccff00] text-lg">{formatRupiah(order.total_amount)}</span>
            </div>
          </div>

          {order.payment_methods && (
            <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-3 text-sm">
              <span className="text-blue-400/80 font-medium">Metode Bayar:</span>{' '}
              <span className="font-bold text-blue-400">{order.payment_methods.name}</span>
            </div>
          )}

          <div>
            <h3 className="font-heading font-bold text-white mb-2">Update Status</h3>
            <div className="flex gap-2">
              {(['pending', 'paid', 'cancelled'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => statusMutation.mutate(s)}
                  disabled={order.status === s || statusMutation.isPending}
                  className={`px-4 py-2 text-sm font-bold transition-all border-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    order.status === s ? 'border-[#ccff00] bg-[#ccff00] text-black shadow-[0_0_15px_rgba(204,255,0,0.2)]' : 'border-white/10 text-zinc-400 hover:border-[#ccff00] hover:text-[#ccff00]'
                  }`}
                >
                  {getOrderStatusLabel(s)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminOrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['admin-orders'],
    queryFn: async () => { const r = await fetch('/api/admin/orders'); return r.json() },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-black text-white">Pesanan</h1>
        <p className="text-zinc-400 text-sm mt-1">{orders.length} pesanan total</p>
      </div>

      <div className="studio-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-3 font-bold text-zinc-500 text-xs uppercase tracking-wider">ID</th>
                <th className="text-left px-6 py-3 font-bold text-zinc-500 text-xs uppercase tracking-wider">Pelanggan</th>
                <th className="text-left px-6 py-3 font-bold text-zinc-500 text-xs uppercase tracking-wider">Total</th>
                <th className="text-left px-6 py-3 font-bold text-zinc-500 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 font-bold text-zinc-500 text-xs uppercase tracking-wider">Tanggal</th>
                <th className="text-right px-6 py-3 font-bold text-zinc-500 text-xs uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {isLoading && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-zinc-500">Memuat...</td></tr>
              )}
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-zinc-500">{order.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">{order.customer_name}</div>
                    <div className="text-xs text-zinc-500">{order.customer_phone}</div>
                  </td>
                  <td className="px-6 py-4 font-black text-[#ccff00]">{formatRupiah(order.total_amount)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-bold border ${order.status === 'paid' ? 'bg-green-500/10 text-green-400 border-green-500/20' : order.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'} `}>
                      {getOrderStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-xs">{formatDate(order.created_at)}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-4 py-1.5 border border-white/20 text-white hover:border-[#ccff00] hover:text-[#ccff00] hover:bg-[#ccff00]/10 text-xs font-bold transition-colors"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && !orders.length && (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-zinc-500">Belum ada pesanan</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  )
}
