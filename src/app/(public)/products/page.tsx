'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Search, Filter } from 'lucide-react'
import ProductCard from '@/components/products/ProductCard'
import { SkeletonCard } from '@/components/ui/Spinner'
import { fetchCategories, fetchProducts } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'

function ProductsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialCategory = searchParams.get('category') || 'semua'
  const [activeCategory, setActiveCategory] = useState(initialCategory)
  const [search, setSearch] = useState('')

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', activeCategory],
    queryFn: () => fetchProducts(activeCategory),
  })

  const filtered = products?.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  )

  const handleCategoryChange = (slug: string) => {
    setActiveCategory(slug)
    if (slug === 'semua') {
      router.push('/products')
    } else {
      router.push(`/products?category=${slug}`)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-[#0a0a0a] pt-32 pb-16 md:pt-48 md:pb-24 relative overflow-hidden border-b border-white/10 grain-bg">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ccff00]/5 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center z-10">
          <h1 className="text-[3.5rem] md:text-7xl font-heading font-black text-white mb-6 md:mb-8 tracking-tighter uppercase leading-tight drop-shadow-md">Katalog</h1>
          <p className="text-zinc-400 text-base md:text-xl max-w-2xl mx-auto font-medium leading-relaxed drop-shadow">Jelajahi aset digital premium kami yang dibuat khusus untuk studio profesional.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search & Filter bar */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-12 mt-8">
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Cari aset..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-none border border-white/10 bg-[#121212] text-sm text-white placeholder:text-zinc-500 focus:ring-1 focus:ring-[#ccff00] focus:border-[#ccff00] transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-[0.1em] px-1 sm:px-4">
            <Filter size={16} />
            <span>{filtered?.length ?? 0} ITEM DITEMUKAN</span>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-3 flex-wrap mb-10 border-b border-white/10 pb-6">
          <button
            onClick={() => handleCategoryChange('semua')}
            className={cn(
              'px-6 py-3 font-heading text-xs font-bold tracking-[0.15em] uppercase transition-all duration-300 border',
              activeCategory === 'semua'
                ? 'bg-[#ccff00] border-[#ccff00] text-black shadow-[0_0_15px_rgba(204,255,0,0.15)]'
                : 'bg-[#121212] border-white/10 text-zinc-400 hover:border-[#ccff00] hover:text-[#ccff00]'
            )}
          >
            Semua Area
          </button>
          {categories?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.slug)}
              className={cn(
                'px-6 py-3 font-heading text-xs font-bold tracking-[0.15em] uppercase transition-all duration-300 border',
                activeCategory === cat.slug
                  ? 'bg-[#ccff00] border-[#ccff00] text-black shadow-[0_0_15px_rgba(204,255,0,0.15)]'
                  : 'bg-[#121212] border-white/10 text-zinc-400 hover:border-[#ccff00] hover:text-[#ccff00]'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered && filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 fade-in">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-32 border border-white/10 border-dashed bg-[#121212]">
            <div className="w-16 h-16 bg-[#1a1a1a] border border-white/10 flex items-center justify-center mx-auto mb-6">
              <Search size={28} className="text-zinc-500" />
            </div>
            <h3 className="font-heading font-black text-white text-2xl uppercase tracking-wide">Aset tidak ditemukan</h3>
            <p className="text-zinc-500 text-sm mt-2">Coba sesuaikan pencarian atau filter kategori Anda</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] pt-28 pb-14" />}>
      <ProductsContent />
    </Suspense>
  )
}
