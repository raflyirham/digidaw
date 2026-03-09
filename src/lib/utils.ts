import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, '')
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`
}

export function getPaymentTypeLabel(type: string): string {
  switch (type) {
    case 'bank':
      return 'Transfer Bank'
    case 'ewallet':
      return 'Dompet Digital'
    case 'qris':
      return 'QRIS'
    default:
      return type
  }
}

export function getOrderStatusLabel(status: string): string {
  switch (status) {
    case 'pending':
      return 'Menunggu Pembayaran'
    case 'paid':
      return 'Sudah Dibayar'
    case 'cancelled':
      return 'Dibatalkan'
    default:
      return status
  }
}

export function getOrderStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'text-yellow-600 bg-yellow-50'
    case 'paid':
      return 'text-green-600 bg-green-50'
    case 'cancelled':
      return 'text-red-600 bg-red-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}
