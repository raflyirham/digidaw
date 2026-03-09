'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Package } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useCartStore } from '@/store/cartStore'
import { formatRupiah } from '@/lib/utils'

export default function CartPage() {
  const { items, removeItem, increaseQuantity, decreaseQuantity, totalPrice, clearCart } =
    useCartStore()

  if (items.length === 0) {
    return (
      <>
        <div className="pt-40 pb-24 min-h-screen bg-[#0a0a0a] grain-bg flex items-center justify-center">
          <div className="text-center flex flex-col items-center justify-center gap-8 max-w-md mx-auto px-4 relative z-10">
            <div className="w-24 h-24 bg-[#121212] flex items-center justify-center mx-auto border border-white/10 rounded-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-[#ccff00]/5 group-hover:bg-[#ccff00]/10 transition-colors" />
              <ShoppingBag size={40} className="text-zinc-400 group-hover:text-[#ccff00] transition-colors relative z-10" />
            </div>
            <div>
              <h1 className="text-3xl font-heading font-black text-white tracking-tighter uppercase leading-tight mb-4">Keranjang Kosong</h1>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Anda belum menambahkan aset digital apa pun ke keranjang Anda.
              </p>
            </div>
            <Link href="/products" className="w-full mt-4">
              <Button size="lg" className="w-full">
                JELAJAHI KATALOG
              </Button>
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="pt-40 pb-24 min-h-screen grain-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-heading font-black text-white tracking-tighter uppercase">Keranjang Anda</h1>
            </div>
            <button
              onClick={clearCart}
              className="text-xs text-zinc-500 hover:text-[#ff3366] font-bold uppercase tracking-[0.1em] flex items-center gap-2 transition-colors pb-1"
            >
              <Trash2 size={14} />
              KOSONGKAN KERANJANG
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="bg-[#121212] border border-white/10 p-5 flex flex-col sm:flex-row gap-6 studio-card hover:border-white/30 transition-colors"
                >
                  {/* Image */}
                  <div className="relative w-full sm:w-32 h-32 sm:h-auto border border-white/5 bg-[#1a1a1a] shrink-0">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="128px" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Package size={24} className="text-zinc-600" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h3 className="font-heading font-black text-white line-clamp-2 text-lg uppercase tracking-tight">{item.name}</h3>
                      <p className="text-[#ccff00] text-xl font-black tracking-tight mt-2">{formatRupiah(item.price)}</p>
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                      {/* Quantity */}
                      <div className="flex items-center border border-white/10 bg-[#0a0a0a]">
                        <button
                          onClick={() => decreaseQuantity(item.productId)}
                          className="p-3 hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-4 font-bold text-white text-sm min-w-[2.5rem] text-center border-x border-white/10">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => increaseQuantity(item.productId)}
                          className="p-3 hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Subtotal & Remove */}
                      <div className="flex items-center gap-4">
                        <span className="font-black text-white text-base">
                          {formatRupiah(item.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="p-2 text-zinc-500 hover:text-[#ff3366] hover:bg-[#ff3366]/10 transition-all border border-transparent hover:border-[#ff3366]/30"
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#121212] border border-white/10 p-8 sticky top-28 studio-card">
                <h2 className="font-heading font-black text-white text-xl mb-8 tracking-tighter uppercase border-b border-white/10 pb-4">Ringkasan Pesanan</h2>

                <div className="space-y-4 mb-8">
                  {items.map((item) => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span className="text-zinc-400 line-clamp-1 flex-1 pr-4">{item.name} <span className="text-zinc-600">x{item.quantity}</span></span>
                      <span className="font-bold text-white shrink-0">{formatRupiah(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-6 mb-8">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-zinc-400 uppercase tracking-[0.1em] text-xs">Total Harga</span>
                    <span className="font-heading font-black text-[#ccff00] text-3xl tracking-tighter">{formatRupiah(totalPrice())}</span>
                  </div>
                </div>

                <Link href="/checkout">
                  <Button size="lg" className="w-full h-14">
                    LANJUT KE PEMBAYARAN
                    <ArrowRight size={18} />
                  </Button>
                </Link>

                <Link href="/products" className="block mt-4">
                  <Button size="md" variant="ghost" className="w-full text-xs">
                    LANJUT BELANJA
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
