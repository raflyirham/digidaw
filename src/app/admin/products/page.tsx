'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Plus, Edit, Trash2, Star, TrendingUp, Package, X, UploadCloud, ImageIcon, ZoomIn } from 'lucide-react'
import Image from 'next/image'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import { SkeletonCard } from '@/components/ui/Spinner'
import { formatRupiah } from '@/lib/utils'
import { Product, Category } from '@/types'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

type ProductForm = {
  name: string
  description: string
  price: number
  category_id: string
  image_urls: string[]
  is_featured: boolean
  is_popular: boolean
}

function ProductFormModal({
  product,
  categories,
  onClose,
  onSave,
}: {
  product?: Product
  categories: Category[]
  onClose: () => void
  onSave: (data: ProductForm) => Promise<void>
}) {
  const [form, setForm] = useState<ProductForm>({
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product?.price ?? 0,
    category_id: product?.category_id ?? '',
    image_urls: product?.image_urls ?? [],
    is_featured: product?.is_featured ?? false,
    is_popular: product?.is_popular ?? false,
  })
  const [loading, setLoading] = useState(false)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name) return toast.error('Nama produk diperlukan')
    if (!form.category_id) return toast.error('Kategori produk diperlukan')
    setLoading(true)
    try {
      let uploaded_urls: string[] = []
      if (imageFiles.length > 0) {
        const supabase = createClient()
        for (const file of imageFiles) {
          const fileExt = file.name.split('.').pop()
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
          
          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, file)
            
          if (uploadError) {
            toast.error('Gagal mengupload gambar ' + file.name + ': ' + uploadError.message)
            continue
          }
          
          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName)
            
          uploaded_urls.push(publicUrl)
        }
      }

      await onSave({ ...form, image_urls: [...form.image_urls, ...uploaded_urls] })
      onClose()
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#121212] border border-white/10 rounded-max shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-heading font-black text-white">{product ? 'Edit Produk' : 'Tambah Produk'}</h2>
          <button onClick={onClose} className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handle} className="p-6 space-y-4">
          <Input label="Nama Produk" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required id="p-name" placeholder="Contoh: Template CV Premium" />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="p-desc" className="text-xs font-heading font-bold text-white uppercase tracking-wider mb-1">Deskripsi</label>
            <textarea
              id="p-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 bg-[#121212] border-white/10 text-white text-sm focus:ring-1 focus:ring-[#ccff00] focus:border-[#ccff00] hover:border-white/30 transition-all resize-none"
              placeholder="Deskripsi produk..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Harga (Rp)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required id="p-price" placeholder="50000" />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="p-category" className="text-xs font-heading font-bold text-white uppercase tracking-wider mb-1">Kategori</label>
              <select
                id="p-category"
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full px-4 py-3 border border-white/10 bg-[#121212] text-sm text-white focus:ring-1 focus:ring-[#ccff00] focus:border-[#ccff00] hover:border-white/30 transition-all"
              >
                <option value="">-- Pilih Kategori --</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-heading font-bold text-white uppercase tracking-wider mb-1">Gambar Produk</label>
            
            {/* Drag & Drop Upload Area */}
            <div 
              className={`relative border-2 border-dashed ${isDragging ? 'border-[#ccff00] bg-[#ccff00]/5' : 'border-white/20 bg-[#121212] hover:border-white/40'} transition-all flex flex-col items-center justify-center p-8 text-center cursor-pointer group`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  setImageFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
                }
              }}
            >
              <input
                type="file"
                id="p-img-file"
                accept="image/*"
                multiple
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setImageFiles((prev) => [...prev, ...Array.from(e.target.files as FileList)]);
                  }
                }}
              />
              <div className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[#ccff00] group-hover:text-black transition-all duration-300">
                <UploadCloud size={24} className={isDragging ? 'text-[#ccff00]' : 'text-zinc-400 group-hover:text-black'} />
              </div>
              <p className="font-bold text-white text-sm mb-1 uppercase tracking-wide">Pilih File atau Tarik ke Sini</p>
              <p className="text-zinc-500 text-xs">Mendukung format JPG, PNG, WEBP</p>
            </div>

            {/* Image Previews */}
            {(form.image_urls.length > 0 || imageFiles.length > 0) && (
              <div className="mt-4 grid grid-cols-4 sm:grid-cols-5 gap-3 bg-white/5 p-4 border border-white/5">
                {/* Existing URLs */}
                {form.image_urls.map((url, i) => (
                  <div key={`url-${i}`} className="relative group rounded-none overflow-hidden border border-white/20 aspect-square bg-[#0a0a0a]">
                     <Image src={url} alt={`product image ${i}`} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                       <button 
                         type="button"
                         onClick={() => setPreviewImage(url)}
                         className="p-1.5 bg-white text-black hover:bg-[#ccff00] transition-colors shadow-lg"
                         title="Lihat Penuh"
                       >
                         <ZoomIn size={14} />
                       </button>
                       <button 
                         type="button" 
                         onClick={() => setForm({...form, image_urls: form.image_urls.filter((_, idx) => idx !== i)})} 
                         className="p-1.5 bg-red-500/80 text-white hover:bg-red-500 transition-colors shadow-lg"
                         title="Hapus"
                       >
                         <Trash2 size={14} />
                       </button>
                     </div>
                  </div>
                ))}
                
                {/* Newly selected files */}
                {imageFiles.map((file, i) => {
                  const objUrl = URL.createObjectURL(file);
                  return (
                    <div key={`file-${i}`} className="relative group rounded-none overflow-hidden border border-[#ccff00]/30 aspect-square bg-[#0a0a0a]">
                       <Image src={objUrl} alt={`new image ${i}`} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                       <div className="absolute top-0 right-0 bg-[#ccff00] text-black text-[10px] font-black px-1.5 py-0.5 uppercase tracking-wider">Baru</div>
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                         <button 
                           type="button"
                           onClick={() => setPreviewImage(objUrl)}
                           className="p-1.5 bg-white text-black hover:bg-[#ccff00] transition-colors shadow-lg"
                           title="Lihat Penuh"
                         >
                           <ZoomIn size={14} />
                         </button>
                         <button 
                           type="button" 
                           onClick={() => setImageFiles(imageFiles.filter((_, idx) => idx !== i))} 
                           className="p-1.5 bg-red-500/80 text-white hover:bg-red-500 transition-colors shadow-lg"
                           title="Hapus"
                         >
                           <Trash2 size={14} />
                         </button>
                       </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="w-4 h-4 accent-[#ccff00] bg-[#121212] border-white/20 rounded" />
              <span className="text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors">Produk Unggulan</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" checked={form.is_popular} onChange={(e) => setForm({ ...form, is_popular: e.target.checked })} className="w-4 h-4 accent-[#ccff00] bg-[#121212] border-white/20 rounded" />
              <span className="text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors">Produk Populer</span>
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Batal</Button>
            <Button type="submit" loading={loading} className="flex-1">{product ? 'Simpan Perubahan' : 'Tambah Produk'}</Button>
          </div>
        </form>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4 cursor-zoom-out"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative w-full max-w-5xl h-[85vh]">
            <Image 
              src={previewImage} 
              alt="Preview" 
              fill 
              className="object-contain" 
            />
          </div>
          <button 
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white hover:text-black text-white rounded-full transition-colors cursor-pointer"
            onClick={(e) => { e.stopPropagation(); setPreviewImage(null); }}
          >
            <X size={24} />
          </button>
        </div>
      )}
    </div>
  )
}

export default function AdminProductsPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState<{ open: boolean; product?: Product }>({ open: false })

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['admin-products'],
    queryFn: async () => { const r = await fetch('/api/admin/products'); return r.json() },
  })
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['admin-categories'],
    queryFn: async () => { const r = await fetch('/api/admin/categories'); return r.json() },
  })

  const createMutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      const r = await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (!r.ok) throw new Error((await r.json()).error)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Produk ditambahkan!') },
    onError: (e: Error) => toast.error(e.message),
  })

  const editMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProductForm }) => {
      const r = await fetch(`/api/admin/products/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (!r.ok) throw new Error((await r.json()).error)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Produk diperbarui!') },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Produk dihapus!') },
  })

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Hapus produk "${name}"?`)) deleteMutation.mutate(id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-black text-white">Produk</h1>
          <p className="text-zinc-400 text-sm mt-1">{products?.length ?? 0} produk terdaftar</p>
        </div>
        <Button onClick={() => setModal({ open: true })}>
          <Plus size={18} />
          Tambah Produk
        </Button>
      </div>

      {isLoading ? (
        <div className="studio-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-3 font-bold text-zinc-500 text-xs uppercase tracking-wider">Produk</th>
                <th className="text-left px-6 py-3 font-bold text-zinc-500 text-xs uppercase tracking-wider">Kategori</th>
                <th className="text-left px-6 py-3 font-bold text-zinc-500 text-xs uppercase tracking-wider">Harga</th>
                <th className="text-left px-6 py-3 font-bold text-zinc-500 text-xs uppercase tracking-wider">Flag</th>
                <th className="text-right px-6 py-3 font-bold text-zinc-500 text-xs uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/5 shimmer border border-white/10 shrink-0"></div>
                      <div className="h-4 bg-white/5 shimmer rounded w-32"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-white/5 shimmer rounded w-20"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-white/5 shimmer rounded w-24"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-white/5 shimmer rounded-full"></div>
                      <div className="h-6 w-16 bg-white/5 shimmer rounded-full"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 flex justify-end">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white/5 shimmer rounded"></div>
                      <div className="w-8 h-8 bg-white/5 shimmer rounded"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="studio-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-3 font-bold text-zinc-500 text-xs uppercase tracking-wider">Produk</th>
                <th className="text-left px-6 py-3 font-bold text-zinc-500 text-xs uppercase tracking-wider">Kategori</th>
                <th className="text-left px-6 py-3 font-bold text-zinc-500 text-xs uppercase tracking-wider">Harga</th>
                <th className="text-left px-6 py-3 font-bold text-zinc-500 text-xs uppercase tracking-wider">Flag</th>
                <th className="text-right px-6 py-3 font-bold text-zinc-500 text-xs uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products?.map((p) => (
                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/5 border border-white/10 overflow-hidden shrink-0">
                        {p.image_urls && p.image_urls.length > 0 ? (
                          <Image src={p.image_urls[0]} alt={p.name} width={40} height={40} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={18} className="text-zinc-500" />
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-white line-clamp-1">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">{p.categories?.name ?? '-'}</td>
                  <td className="px-6 py-4 font-black text-[#ccff00]">{formatRupiah(p.price)}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      {p.is_featured && <Badge variant="blue"><Star size={10} className="mr-1" />Unggulan</Badge>}
                      {p.is_popular && <Badge variant="purple"><TrendingUp size={10} className="mr-1" />Populer</Badge>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setModal({ open: true, product: p })}
                        className="p-2 text-zinc-400 hover:text-[#ccff00] hover:bg-[#ccff00]/10 transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-2 text-zinc-400 hover:text-[#ff3366] hover:bg-[#ff3366]/10 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!products?.length && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-zinc-500">Belum ada produk. Klik &quot;Tambah Produk&quot; untuk memulai.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal.open && (
        <ProductFormModal
          product={modal.product}
          categories={categories}
          onClose={() => setModal({ open: false })}
          onSave={async (data) => {
            if (modal.product) {
              await editMutation.mutateAsync({ id: modal.product.id, data })
            } else {
              await createMutation.mutateAsync(data)
            }
          }}
        />
      )}
    </div>
  )
}
