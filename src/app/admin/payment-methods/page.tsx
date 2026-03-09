'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Plus, Edit, Trash2, X, ToggleLeft, ToggleRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import { PaymentMethod } from '@/types'
import { getPaymentTypeLabel } from '@/lib/utils'
import toast from 'react-hot-toast'

type PM = Omit<PaymentMethod, 'id' | 'created_at'>

function PaymentMethodForm({
  initial,
  onSave,
  onClose,
}: {
  initial?: PaymentMethod
  onSave: (data: PM) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState<PM>({
    name: initial?.name ?? '',
    type: initial?.type ?? 'bank',
    detail: initial?.detail ?? {},
    logo_url: initial?.logo_url ?? '',
    is_active: initial?.is_active ?? true,
    sort_order: initial?.sort_order ?? 0,
  })
  const [detailStr, setDetailStr] = useState(JSON.stringify(initial?.detail ?? {}, null, 2))
  const [loading, setLoading] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const detail = JSON.parse(detailStr)
      setLoading(true)
      await onSave({ ...form, detail })
      onClose()
    } catch {
      toast.error('Format JSON detail tidak valid')
    } finally {
      setLoading(false)
    }
  }

  const detailPlaceholders: Record<string, string> = {
    bank: `{\n  "bank_name": "BCA",\n  "account_number": "1234567890",\n  "account_name": "Digidaw Store"\n}`,
    ewallet: `{\n  "phone_number": "081234567890",\n  "account_name": "Digidaw Store"\n}`,
    qris: `{\n  "description": "Scan QRIS di bawah ini"\n}`,
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#121212] border border-white/10 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-heading font-black text-white">{initial ? 'Edit' : 'Tambah'} Metode Pembayaran</h2>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <Input label="Nama" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required id="pm-name" placeholder="Contoh: BCA Transfer" />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-heading font-bold text-white uppercase tracking-wider mb-1">Tipe</label>
            <select
              value={form.type}
              onChange={(e) => { setForm({ ...form, type: e.target.value as 'bank' | 'ewallet' | 'qris' }); setDetailStr(detailPlaceholders[e.target.value]) }}
              className="w-full px-4 py-3 bg-[#121212] border border-white/10 text-white text-sm focus:ring-1 focus:ring-[#ccff00] focus:border-[#ccff00] hover:border-white/30 transition-all"
            >
              <option value="bank">Transfer Bank</option>
              <option value="ewallet">Dompet Digital</option>
              <option value="qris">QRIS</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-heading font-bold text-white uppercase tracking-wider mb-1">Detail (JSON)</label>
            <textarea
              value={detailStr}
              onChange={(e) => setDetailStr(e.target.value)}
              rows={5}
              className="w-full px-4 py-2.5 bg-[#121212] border-white/10 text-white text-sm font-mono focus:ring-1 focus:ring-[#ccff00] focus:border-[#ccff00] hover:border-white/30 transition-all resize-none"
            />
          </div>
          <Input label="URL Logo (opsional)" value={form.logo_url ?? ''} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} id="pm-logo" placeholder="https://..." />
          <Input label="Urutan Tampil" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} id="pm-order" />
          <label className="flex items-center gap-2 cursor-pointer group">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 accent-[#ccff00] bg-[#121212] border-white/20 rounded" />
            <span className="text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors">Aktif</span>
          </label>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Batal</Button>
            <Button type="submit" loading={loading} className="flex-1">Simpan</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminPaymentMethodsPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState<{ open: boolean; item?: PaymentMethod }>({ open: false })

  const { data: methods = [], isLoading } = useQuery<PaymentMethod[]>({
    queryKey: ['admin-payment-methods'],
    queryFn: async () => { const r = await fetch('/api/admin/payment-methods'); return r.json() },
  })

  const createMutation = useMutation({
    mutationFn: async (data: PM) => {
      const r = await fetch('/api/admin/payment-methods', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (!r.ok) throw new Error((await r.json()).error)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-payment-methods'] }); toast.success('Metode pembayaran ditambahkan!') },
  })

  const editMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PM }) => {
      const r = await fetch(`/api/admin/payment-methods/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (!r.ok) throw new Error((await r.json()).error)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-payment-methods'] }); toast.success('Metode diperbarui!') },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await fetch(`/api/admin/payment-methods/${id}`, { method: 'DELETE' }) },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-payment-methods'] }); toast.success('Metode dihapus!') },
  })

  const toggleActive = (method: PaymentMethod) => {
    editMutation.mutate({ id: method.id, data: { ...method, is_active: !method.is_active } })
  }

  const typeColors: Record<string, 'blue' | 'green' | 'purple'> = { bank: 'blue', ewallet: 'green', qris: 'purple' }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-black text-white">Metode Pembayaran</h1>
          <p className="text-zinc-400 text-sm mt-1">Kelola metode pembayaran yang tersedia</p>
        </div>
        <Button onClick={() => setModal({ open: true })}>
          <Plus size={18} />
          Tambah Metode
        </Button>
      </div>

      <div className="studio-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-6 py-3 font-bold text-zinc-500 text-xs uppercase tracking-wider">Nama</th>
              <th className="text-left px-6 py-3 font-bold text-zinc-500 text-xs uppercase tracking-wider">Tipe</th>
              <th className="text-left px-6 py-3 font-bold text-zinc-500 text-xs uppercase tracking-wider">Status</th>
              <th className="text-right px-6 py-3 font-bold text-zinc-500 text-xs uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading && <tr><td colSpan={4} className="px-6 py-8 text-center text-zinc-500">Memuat...</td></tr>}
            {methods.map((m) => (
              <tr key={m.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-bold text-white">{m.name}</td>
                <td className="px-6 py-4"><Badge variant={typeColors[m.type] ?? 'gray'}>{getPaymentTypeLabel(m.type)}</Badge></td>
                <td className="px-6 py-4">
                  <button onClick={() => toggleActive(m)} className="flex items-center gap-1.5">
                    {m.is_active
                      ? <><ToggleRight size={20} className="text-[#ccff00]" /><span className="text-[#ccff00] text-xs font-bold">Aktif</span></>
                      : <><ToggleLeft size={20} className="text-zinc-500" /><span className="text-zinc-500 text-xs font-bold">Nonaktif</span></>
                    }
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => setModal({ open: true, item: m })} className="p-2 text-zinc-400 hover:text-[#ccff00] hover:bg-[#ccff00]/10 transition-colors"><Edit size={16} /></button>
                    <button onClick={() => confirm(`Hapus "${m.name}"?`) && deleteMutation.mutate(m.id)} className="p-2 text-zinc-400 hover:text-[#ff3366] hover:bg-[#ff3366]/10 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && !methods.length && <tr><td colSpan={4} className="px-6 py-10 text-center text-zinc-500">Belum ada metode pembayaran</td></tr>}
          </tbody>
        </table>
      </div>

      {modal.open && (
        <PaymentMethodForm
          initial={modal.item}
          onClose={() => setModal({ open: false })}
          onSave={async (data) => {
            if (modal.item) {
              await editMutation.mutateAsync({ id: modal.item.id, data })
            } else {
              await createMutation.mutateAsync(data)
            }
          }}
        />
      )}
    </div>
  )
}
