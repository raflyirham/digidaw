'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Eye } from 'lucide-react'
import { Product } from '@/types'
import { formatRupiah } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'
import Badge from '@/components/ui/Badge'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_urls?.[0] ?? null,
      slug: product.slug,
    })
    toast.success(`${product.name} ditambahkan ke keranjang!`)
  }

  return (
    <Link href={`/products/${product.slug}`} className="group block h-full">
      <div className="h-full flex flex-col studio-card studio-card-hover overflow-hidden">
        {/* Image */}
        <div className="relative h-60 bg-[#121212] overflow-hidden border-b border-white/10">
          {product.image_urls && product.image_urls.length > 0 ? (
            <Image
              src={product.image_urls[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-[#1a1a1a] flex items-center justify-center border border-white/10">
                <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          )}
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.is_featured && <Badge variant="blue">Unggulan</Badge>}
            {product.is_popular && <Badge variant="purple">Populer</Badge>}
          </div>
          {/* Category */}
          {product.categories && (
            <div className="absolute bottom-3 left-3">
              <Badge variant="gray">{product.categories.name}</Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1 gap-3">
          <div className="space-y-2 flex-1">
            <h3 className="font-heading font-bold text-white text-lg leading-snug line-clamp-2 group-hover:text-[#ccff00] transition-colors">
              {product.name}
            </h3>
            {product.description && (
              <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-4 mt-auto border-t border-white/10">
            <span className="font-heading font-black text-[#ccff00] text-xl tracking-tight">{formatRupiah(product.price)}</span>
            <div className="flex items-center gap-2">
              <span className="p-2.5 bg-[#1a1a1a] hover:bg-white text-zinc-400 hover:text-black transition-all duration-300">
                <Eye size={18} />
              </span>
              <button
                onClick={handleAddToCart}
                className="p-2.5 bg-white text-black hover:bg-[#ccff00] transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                aria-label="Tambah ke keranjang"
              >
                <ShoppingCart size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
