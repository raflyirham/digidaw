'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Plus, Edit, Trash2, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Category } from '@/types'
import toast from 'react-hot-toast'

export default function AdminCategoriesPage() {
  const qc = useQueryClient()
  const [editItem, setEditItem] = useState<Category | null>(null)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['admin-categories'],
    queryFn: async () => { const r = await fetch('/api/admin/categories'); return r.json() },
  })

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const r = await fetch('/api/admin/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) })
      if (!r.ok) throw new Error((await r.json()).error)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-categories'] }); toast.success('Kategori ditambahkan!'); setNewName(''); setCreating(false) },
    onError: (e: Error) => toast.error(e.message),
  })

  const editMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const r = await fetch(`/api/admin/categories/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) })
      if (!r.ok) throw new Error((await r.json()).error)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-categories'] }); toast.success('Kategori diperbarui!'); setEditItem(null) },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' }) },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-categories'] }); toast.success('Kategori dihapus!') },
  })

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-black text-white">Kategori</h1>
          <p className="text-zinc-400 text-sm mt-1">Kelola kategori produk</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus size={18} />
          Tambah Kategori
        </Button>
      </div>

      {/* Add form */}
      {creating && (
        <div className="studio-card p-5">
          <h3 className="font-heading font-bold text-white mb-3">Kategori Baru</h3>
          <div className="flex gap-3">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nama kategori..."
              id="new-cat"
              className="flex-1"
              autoFocus
            />
            <Button onClick={() => newName && createMutation.mutate(newName)} loading={createMutation.isPending}>Simpan</Button>
            <Button variant="ghost" onClick={() => { setCreating(false); setNewName('') }}><X size={16} /></Button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="studio-card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="shimmer h-12" />)}
          </div>
        ) : (
          <ul className="divide-y divide-white/10">
            {categories.map((cat) => (
              <li key={cat.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                {editItem?.id === cat.id ? (
                  <div className="flex gap-3 flex-1 mr-4">
                    <Input
                      value={editItem.name}
                      onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                      id={`edit-cat-${cat.id}`}
                      className="flex-1"
                      autoFocus
                    />
                    <Button size="sm" onClick={() => editMutation.mutate({ id: cat.id, name: editItem.name })} loading={editMutation.isPending}>Simpan</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditItem(null)}><X size={14} /></Button>
                  </div>
                ) : (
                  <>
                    <div>
                      <span className="font-bold text-white">{cat.name}</span>
                      <span className="ml-2 text-xs text-zinc-500 font-mono">/{cat.slug}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditItem(cat)} className="p-2 text-zinc-400 hover:text-[#ccff00] hover:bg-[#ccff00]/10 transition-colors"><Edit size={16} /></button>
                      <button onClick={() => confirm(`Hapus kategori "${cat.name}"?`) && deleteMutation.mutate(cat.id)} className="p-2 text-zinc-400 hover:text-[#ff3366] hover:bg-[#ff3366]/10 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </>
                )}
              </li>
            ))}
            {!categories.length && (
              <li className="px-6 py-10 text-center text-zinc-500 text-sm">Belum ada kategori</li>
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
