'use client'

import { useQuery } from '@tanstack/react-query'
import { use, useState, useEffect } from 'react'
import Image from 'next/image'
import { ArrowLeft, ShoppingCart, Minus, Plus, Package, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { PageLoader } from '@/components/ui/Spinner'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { fetchProductBySlug } from '@/lib/api'
import { formatRupiah } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'

interface Props {
  params: Promise<{ slug: string }>
}

export default function ProductDetailPage({ params }: Props) {
  const { slug } = use(params)
  const [qty, setQty] = useState(1)
  const addItem = useCartStore((s) => s.addItem)

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProductBySlug(slug),
  })

  // State for gallery
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    if (product?.image_urls && product.image_urls.length > 0 && !selectedImage) {
      setSelectedImage(product.image_urls[0])
    }
  }, [product, selectedImage])

  if (isLoading) return <PageLoader />

  if (error || !product) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-black text-white font-heading uppercase tracking-widest">Aset Tidak Ditemukan</h1>
            <Link href="/products">
              <Button>Kembali ke Katalog</Button>
            </Link>
          </div>
        </div>
      </>
    )
  }

  const handleAddToCart = () => {
    addItem(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_urls?.[0] ?? null,
        slug: product.slug,
      },
      qty
    )
    toast.success(`${product.name} added to cart!`, { style: { background: '#0a0a0a', color: '#ccff00', border: '1px solid #ccff00' } })
  }

  const handleBuyNow = () => {
    handleAddToCart()
    window.location.href = '/cart'
  }

  return (
    <>
      <div className="pt-32 pb-24 min-h-screen grain-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-[#ccff00] text-xs font-bold tracking-[0.2em] uppercase transition-colors mb-12"
          >
            <ArrowLeft size={16} />
            KEMBALI KE KATALOG
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Image */}
            <div className="relative">
              <div className="aspect-square overflow-hidden bg-[#121212] border border-white/10 studio-card p-4">
                <div className="relative w-full h-full bg-[#1a1a1a]">
                  {selectedImage ? (
                    <Image
                      src={selectedImage}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Package size={64} className="text-zinc-600" />
                    </div>
                  )}
                </div>
              </div>

              {/* Image Gallery */}
              {product.image_urls && product.image_urls.length > 1 && (
                <div className="mt-4 grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {product.image_urls.map((url, i) => (
                    <div 
                      key={i} 
                      className={`relative aspect-square cursor-pointer overflow-hidden border transition-all ${selectedImage === url ? 'border-[#ccff00] scale-95 opacity-100' : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'}`}
                      onClick={() => setSelectedImage(url)}
                    >
                      <Image src={url} alt={`${product.name} ${i+1}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Detail */}
            <div className="flex flex-col gap-8">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {product.categories && (
                  <Badge variant="gray">{product.categories.name}</Badge>
                )}
                {product.is_featured && <Badge variant="blue">Featured</Badge>}
                {product.is_popular && <Badge variant="purple">Trending</Badge>}
              </div>

              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-white leading-[1.1] tracking-tighter uppercase">
                  {product.name}
                </h1>
              </div>

              <div className="text-4xl lg:text-5xl font-heading font-black text-[#ccff00] tracking-tighter">
                {formatRupiah(product.price)}
              </div>

              {product.description && (
                <div className="border-t border-white/10 pt-8">
                  <h3 className="font-heading font-bold text-white text-sm uppercase tracking-[0.2em] mb-4">Spesifikasi & Detail</h3>
                  <p className="text-zinc-400 text-sm md:text-base leading-loose whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              <div className="border-t border-white/10 pt-8 mt-auto space-y-8">
                {/* Quantity */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">Kuantitas</span>
                  <div className="flex items-center border border-white/10 bg-[#121212]">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="p-4 hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-6 font-heading font-bold text-white text-lg min-w-[3.5rem] text-center border-x border-white/10">
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty(qty + 1)}
                      className="p-4 hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Total */}
                <div className="bg-[#121212] border border-white/10 p-6 flex items-center justify-between">
                  <span className="text-zinc-400 font-bold uppercase tracking-[0.2em] text-xs">Total Harga</span>
                  <span className="text-3xl font-heading font-black text-[#ccff00] tracking-tight">
                    {formatRupiah(product.price * qty)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    onClick={handleAddToCart}
                    variant="outline"
                    className="flex-1 py-5"
                  >
                    <ShoppingCart size={20} />
                    TAMBAH KE KERANJANG
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleBuyNow}
                    className="flex-1 py-5"
                  >
                    BELI SEKARANG
                  </Button>
                </div>

                {/* Note */}
                <p className="text-xs text-zinc-500 font-bold flex items-center justify-center gap-2 mt-4 uppercase tracking-widest">
                  <CheckCircle size={14} className="text-[#ccff00]" />
                  PENGIRIMAN DIGITAL INSTAN
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
