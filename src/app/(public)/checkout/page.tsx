'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle, MessageCircle, ChevronDown, ChevronUp, Package } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useCartStore } from '@/store/cartStore'
import { fetchPaymentMethods, fetchSiteSettings } from '@/lib/api'
import { formatRupiah, buildWhatsAppUrl, getPaymentTypeLabel } from '@/lib/utils'
import { PaymentMethod } from '@/types'
import toast from 'react-hot-toast'

const schema = z.object({
  customer_name: z.string().min(2, 'Nama harus minimal 2 karakter'),
  customer_email: z.string().email('Email tidak valid').or(z.literal('')).optional(),
  customer_phone: z.string().min(9, 'Nomor WhatsApp tidak valid'),
  notes: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface OrderResult {
  orderId: string
  totalAmount: number
}

function PaymentMethodCard({
  method,
  selected,
  onSelect,
}: {
  method: PaymentMethod
  selected: boolean
  onSelect: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  const typeLabel = getPaymentTypeLabel(method.type)

  return (
    <div
      className={`border rounded-none overflow-hidden transition-all duration-300 cursor-pointer ${
        selected ? 'border-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.1)] bg-[#1a1a1a]' : 'border-white/10 hover:border-white/30 bg-[#121212]'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-4 p-5">
        {/* Radio */}
        <div
          className={`w-5 h-5 flex items-center justify-center shrink-0 transition-colors border ${
            selected ? 'border-[#ccff00]' : 'border-white/20'
          }`}
        >
          {selected && <div className="w-2.5 h-2.5 bg-[#ccff00]" />}
        </div>

        {/* Logo / Icon */}
        <div className="w-12 h-12 bg-[#0a0a0a] border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
          {method.logo_url ? (
            <Image src={method.logo_url} alt={method.name} width={40} height={40} className="object-contain p-1.5" />
          ) : (
            <span className="text-xs font-black text-zinc-600 uppercase">
              {method.name.slice(0, 2)}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-heading font-black text-white text-base tracking-wide uppercase">{method.name}</div>
          <div className="text-xs text-zinc-500 font-bold uppercase tracking-[0.1em]">{typeLabel}</div>
        </div>

        {selected && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
            className="text-zinc-500 hover:text-[#ccff00] transition-colors p-2 bg-[#0a0a0a] border border-white/5 hover:border-[#ccff00]/30"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>

      {/* Detail panel */}
      {selected && expanded && (
        <div className="px-5 pb-5 pt-0 border-t border-white/10 mt-2 bg-[#0a0a0a]">
          {method.type === 'bank' && (
            <div className="space-y-3 text-sm mt-5">
              <p className="text-zinc-400 flex justify-between"><span className="font-bold uppercase tracking-[0.1em] text-xs">Bank</span> <span className="text-white font-medium">{method.detail.bank_name}</span></p>
              <p className="text-zinc-400 flex justify-between"><span className="font-bold uppercase tracking-[0.1em] text-xs">No Rekening</span>{' '}
                <span className="font-black text-[#ccff00] text-lg tracking-wider">{method.detail.account_number}</span>
              </p>
              <p className="text-zinc-400 flex justify-between"><span className="font-bold uppercase tracking-[0.1em] text-xs">Nama</span> <span className="text-white font-medium">{method.detail.account_name}</span></p>
            </div>
          )}
          {method.type === 'ewallet' && (
            <div className="space-y-3 text-sm mt-5">
              <p className="text-zinc-400 flex justify-between"><span className="font-bold uppercase tracking-[0.1em] text-xs">No HP</span>{' '}
                <span className="font-black text-[#ccff00] text-lg tracking-wider">{method.detail.phone_number}</span>
              </p>
              <p className="text-zinc-400 flex justify-between"><span className="font-bold uppercase tracking-[0.1em] text-xs">Nama</span> <span className="text-white font-medium">{method.detail.account_name}</span></p>
            </div>
          )}
          {method.type === 'qris' && (
            <div className="text-sm text-zinc-400 mt-5">
              <p className="leading-relaxed">{method.detail.description}</p>
              {method.detail.qris_image_url && (
                <Image
                  src={method.detail.qris_image_url}
                  alt="QRIS Code"
                  width={200}
                  height={200}
                  className="mt-4 border-2 border-white/10"
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore()
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null)
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null)

  const { data: paymentMethods } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: fetchPaymentMethods,
  })

  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: fetchSiteSettings,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const createOrderMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          payment_method_id: selectedPayment,
          total_amount: totalPrice(),
          items: items.map((i) => ({
            product_id: i.productId,
            product_name: i.name,
            price: i.price,
            quantity: i.quantity,
          })),
        }),
      })
      if (!res.ok) throw new Error('Gagal membuat pesanan')
      return res.json()
    },
    onSuccess: (data) => {
      setOrderResult({ orderId: data.id, totalAmount: totalPrice() })
      clearCart()
    },
    onError: () => toast.error('Gagal membuat pesanan. Silakan coba lagi.', { style: { background: '#0a0a0a', color: '#ff3366', border: '1px solid #ff3366' } }),
  })

  const onSubmit = (data: FormData) => {
    if (!selectedPayment) {
      toast.error('Silakan pilih metode pembayaran', { style: { background: '#0a0a0a', color: '#ff3366', border: '1px solid #ff3366' } })
      return
    }
    if (items.length === 0) {
      toast.error('Keranjang Anda kosong!', { style: { background: '#0a0a0a', color: '#ff3366', border: '1px solid #ff3366' } })
      return
    }
    createOrderMutation.mutate(data)
  }

  const buildWaMessage = () => {
    const pm = paymentMethods?.find((m) => m.id === selectedPayment)
    const lines = [
      `Halo, saya ingin mengonfirmasi pembayaran pesanan saya:`,
      ``,
      `*ID Pesanan:* ${orderResult?.orderId?.slice(0, 8).toUpperCase()}`,
      `*Nama:* ${getValues('customer_name')}`,
      `*Total:* ${formatRupiah(orderResult?.totalAmount ?? 0)}`,
      `*Metode Pembayaran:* ${pm?.name ?? '-'}`,
    ]
    return lines.join('\n')
  }

  // Order success state
  if (orderResult) {
    const waNumber = settings?.whatsapp_number ?? ''
    return (
      <>
        <div className="pt-32 pb-24 min-h-screen flex items-center justify-center grain-bg">
          <div className="max-w-md w-full mx-auto px-4 text-center space-y-8">
            <div className="w-24 h-24 bg-[#ccff00]/10 flex items-center justify-center mx-auto border border-[#ccff00]/30 shadow-[0_0_30px_rgba(204,255,0,0.15)]">
              <CheckCircle size={48} className="text-[#ccff00]" />
            </div>
            <div>
              <h1 className="text-3xl font-heading font-black text-white tracking-tighter uppercase">Pesanan Berhasil!</h1>
              <p className="text-zinc-400 mt-4 text-sm leading-relaxed">
                Terima kasih! Pesanan Anda telah diterima. Silakan lakukan pembayaran menggunakan metode yang dipilih dan konfirmasi melalui WhatsApp.
              </p>
            </div>

            <div className="bg-[#121212] border border-white/10 p-6 text-left space-y-4">
              <p className="text-xs text-[#ccff00] font-bold uppercase tracking-[0.2em] mb-4">Detail Pesanan</p>
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <span className="text-zinc-500 text-sm font-medium">ID Pesanan</span>
                <span className="font-heading font-black text-white bg-white/5 px-2 py-1 tracking-widest">{orderResult.orderId.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-zinc-500 text-sm font-medium">Total Harga</span>
                <span className="font-heading font-black text-[#ccff00] text-2xl tracking-tighter">{formatRupiah(orderResult.totalAmount)}</span>
              </div>
            </div>

            <div className="space-y-4">
              {waNumber && (
                <a
                  href={buildWhatsAppUrl(waNumber, buildWaMessage())}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full block"
                >
                  <Button size="lg" className="w-full bg-[#ccff00] text-black hover:bg-white hover:text-black py-5 border-none shadow-[0_0_20px_rgba(204,255,0,0.2)]">
                    <MessageCircle size={20} className="mr-2" />
                    KONFIRMASI VIA WHATSAPP
                  </Button>
                </a>
              )}
              <Link href="/products" className="block">
                <Button size="md" variant="ghost" className="w-full text-xs">
                  LANJUT BELANJA
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (items.length === 0) {
    return (
      <>
        <div className="pt-32 pb-24 min-h-screen flex items-center justify-center grain-bg">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-[#121212] flex items-center justify-center mx-auto border border-white/10">
              <Package size={40} className="text-zinc-600" />
            </div>
            <h1 className="text-3xl font-heading font-black text-white tracking-tighter uppercase">Keranjang Kosong</h1>
            <Link href="/products" className="block pt-4"><Button>JELAJAHI KATALOG</Button></Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="pt-32 pb-24 min-h-screen grain-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-4xl md:text-5xl font-heading font-black text-white tracking-tighter uppercase mb-12">Pembayaran</h1>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Left - Form + Payment */}
              <div className="lg:col-span-2 space-y-8">
                {/* Customer info */}
                <div className="bg-[#121212] border border-white/10 p-8 studio-card">
                  <h2 className="font-heading font-black text-white text-xl mb-6 tracking-tighter uppercase border-b border-white/10 pb-4">Info Pelanggan</h2>
                  <div className="space-y-6">
                    <Input
                      {...register('customer_name')}
                      label="Nama Lengkap"
                      placeholder="Contoh: Budi Santoso"
                      error={errors.customer_name?.message}
                      required
                      id="customer_name"
                    />
                    <Input
                      {...register('customer_phone')}
                      label="Nomor WhatsApp"
                      placeholder="Contoh: 08123456789"
                      error={errors.customer_phone?.message}
                      required
                      id="customer_phone"
                    />
                    <Input
                      {...register('customer_email')}
                      label="Email (Opsional)"
                      placeholder="Contoh: budi@example.com"
                      error={errors.customer_email?.message}
                      type="email"
                      id="customer_email"
                    />
                    <div className="flex flex-col gap-2">
                      <label htmlFor="notes" className="text-xs font-bold text-white uppercase tracking-[0.1em]">
                        Catatan (Opsional)
                      </label>
                      <textarea
                        {...register('notes')}
                        id="notes"
                        placeholder="Catatan tambahan untuk pesanan Anda..."
                        rows={3}
                        className="w-full px-4 py-4 rounded-none border border-white/10 bg-[#0a0a0a] text-sm text-white placeholder:text-zinc-500 focus:ring-1 focus:ring-[#ccff00] focus:border-[#ccff00] transition-colors resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment methods */}
                <div className="bg-[#121212] border border-white/10 p-8 studio-card">
                  <h2 className="font-heading font-black text-white text-xl mb-6 tracking-tighter uppercase border-b border-white/10 pb-4">Metode Pembayaran</h2>

                  {paymentMethods && paymentMethods.length > 0 ? (
                    <div className="space-y-6">
                      {/* Group by type */}
                      {(['bank', 'ewallet', 'qris'] as const).map((type) => {
                        const group = paymentMethods.filter((m) => m.type === type)
                        if (group.length === 0) return null
                        return (
                          <div key={type}>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">
                              {getPaymentTypeLabel(type)}
                            </p>
                            <div className="space-y-3">
                              {group.map((method) => (
                                <PaymentMethodCard
                                  key={method.id}
                                  method={method}
                                  selected={selectedPayment === method.id}
                                  onSelect={() => setSelectedPayment(method.id)}
                                />
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-zinc-500 text-sm">Belum ada metode pembayaran yang tersedia.</p>
                  )}
                </div>
              </div>

              {/* Right - Summary */}
              <div className="lg:col-span-1">
                <div className="bg-[#121212] border border-white/10 p-8 sticky top-28 studio-card space-y-6">
                  <h2 className="font-heading font-black text-white text-xl tracking-tighter uppercase border-b border-white/10 pb-4">Ringkasan Pesanan</h2>

                  <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {items.map((item) => (
                      <div key={item.productId} className="flex justify-between text-sm gap-4">
                        <span className="text-zinc-400 line-clamp-2 flex-1 leading-relaxed">
                          {item.name} <span className="text-zinc-600 block mt-1">x{item.quantity}</span>
                        </span>
                        <span className="font-bold text-white shrink-0">
                          {formatRupiah(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-white/10 pt-6">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-zinc-400 uppercase tracking-[0.1em] text-xs">Total Harga</span>
                      <span className="font-heading font-black text-[#ccff00] text-3xl tracking-tighter">
                        {formatRupiah(totalPrice())}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14"
                    loading={createOrderMutation.isPending}
                  >
                    BUAT PESANAN
                  </Button>

                  <p className="text-[10px] text-zinc-500 text-center uppercase tracking-widest leading-relaxed">
                    Dengan membuat pesanan ini, Anda menyetujui Syarat dan Ketentuan kami.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
