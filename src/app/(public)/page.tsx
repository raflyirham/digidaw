'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { ArrowRight, ShoppingBag, Star, Zap, Package, Compass } from 'lucide-react'
import ProductCard from '@/components/products/ProductCard'
import { SkeletonCard } from '@/components/ui/Spinner'
import {
  fetchFeaturedProducts,
  fetchPopularProducts,
  fetchSiteSettings,
  fetchCategories,
  fetchProductsByCategory,
} from '@/lib/api'
import Button from '@/components/ui/Button'
import { Category } from '@/types'

function HeroSection() {
  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: fetchSiteSettings,
  })

  return (
    <section className="relative overflow-hidden pt-32 pb-24 md:pt-48 md:pb-32 border-b border-white/10 grain-bg">
      {/* Abstract Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ccff00]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-black via-black/50 to-transparent pointer-events-none z-10" />
      <div className="absolute left-0 top-0 w-1/3 h-full bg-gradient-to-r from-black via-black/50 to-transparent pointer-events-none z-10" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center z-20">
        <div className="inline-flex items-center gap-3 px-4 py-2 mb-10 border border-[#ccff00]/30 bg-[#ccff00]/5 backdrop-blur-sm">
          <Star size={14} className="text-[#ccff00] fill-[#ccff00]" />
          <span className="text-[#ccff00] text-xs font-bold tracking-[0.2em] uppercase font-heading">{settings?.hero_badge || 'Elemen Digital Premium'}</span>
        </div>

        <h1 className="text-[4rem] md:text-6xl lg:text-[8rem] font-heading font-black text-white leading-[1.1] mb-12 tracking-tighter uppercase drop-shadow-lg">
          {settings?.hero_title ? (
            <span className="block max-w-[90vw] mx-auto text-balance">{settings.hero_title}</span>
          ) : (
            <>
              Bangun <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 text-zinc-400 drop-shadow-md">Lebih Cepat.</span>
            </>
          )}
        </h1>

        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-16 font-medium whitespace-pre-line">
          {settings?.hero_description || 'Tingkatkan alur kerja kreatif Anda dengan pilihan templat tingkat tinggi, aset desain, dan kit pengembangan yang dikurasi khusus untuk studio modern.'}
        </p>

        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 w-full sm:w-auto mt-4">
          <Link href="/products" className="w-full sm:w-auto">
            <Button size="lg" className="w-full h-14 text-sm font-bold tracking-[0.2em]">
              <ShoppingBag size={18} className="mr-2" />
              JELAJAHI KATALOG
            </Button>
          </Link>
          <Link href="/products" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full h-14 text-sm font-bold tracking-[0.2em]">
              LIHAT SEMUA
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="mt-24 mb-12 grid grid-cols-1 sm:grid-cols-3 w-full border border-white/10 studio-card divide-y sm:divide-y-0 sm:divide-x divide-white/10 max-w-4xl mx-auto rounded-xl overflow-hidden bg-[#121212]/50 backdrop-blur-sm">
          {[
            { value: settings?.stat_1_value || '50+', label: settings?.stat_1_label || 'Aset Digital' },
            { value: settings?.stat_2_value || '1K+', label: settings?.stat_2_label || 'Kreator Bahagia' },
            { value: <span className="flex items-center gap-2 justify-center">{settings?.stat_3_value || '4.9'}<Star size={24} className="fill-[#ccff00] text-[#ccff00]" /></span>, label: settings?.stat_3_label || 'Rata-rata Penilaian' },
          ].map((stat, idx) => (
            <div key={idx} className="text-center group p-10 hover:bg-white/5 transition-colors">
              <div className="flex justify-center text-4xl md:text-5xl font-heading font-black text-white">{stat.value}</div>
              <div className="text-zinc-500 text-[10px] font-bold tracking-[0.2em] uppercase mt-4">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SectionHeader({
  title,
  subtitle,
  href,
}: {
  title: string
  subtitle?: string
  href?: string
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
      <div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-white tracking-tighter uppercase leading-tight">{title}</h2>
        {subtitle && <p className="text-zinc-400 mt-6 text-sm max-w-xl leading-relaxed font-medium uppercase tracking-wider">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="group text-zinc-400 hover:text-[#ccff00] font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-3 transition-colors shrink-0"
        >
          Lihat Koleksi <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
        </Link>
      )}
    </div>
  )
}

function FeaturedSection() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: fetchFeaturedProducts,
  })

  return (
    <section className="py-32 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Unggulan"
          subtitle="Aset pilihan dengan kualitas premium."
          href="/products"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : products?.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  )
}

function PopularSection() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', 'popular'],
    queryFn: fetchPopularProducts,
  })

  return (
    <section className="py-32 bg-[#121212] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Sedang Tren"
          subtitle="Paling banyak diunduh oleh komunitas."
          href="/products"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : products?.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  )
}

function CategorySection({ category }: { category: Category }) {
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', 'category', category.id],
    queryFn: () => fetchProductsByCategory(category.id),
  })

  if (!isLoading && (!products || products.length === 0)) return null

  return (
    <section className="py-32 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title={category.name}
          subtitle={`Temukan koleksi premium ${category.name} kami.`}
          href={`/products?category=${category.slug}`}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : products?.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  )
}

function CategorySections() {
  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: fetchSiteSettings,
  })
  const { data: allCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  const featuredIds: string[] = settings?.featured_category_ids
    ? JSON.parse(settings.featured_category_ids)
    : []

  const categoriesToShow =
    featuredIds.length > 0
      ? allCategories?.filter((c) => featuredIds.includes(c.id))
      : allCategories?.slice(0, 3)

  return (
    <>
      {categoriesToShow?.map((cat, i) => (
        <div key={cat.id} className={i % 2 === 0 ? '' : 'bg-[#121212]'}>
          <CategorySection category={cat} />
        </div>
      ))}
    </>
  )
}

function FeaturesBanner() {
  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: fetchSiteSettings,
  })

  const features = [
    { icon: Zap, title: settings?.feature_1_title || 'Akses Instan', desc: settings?.feature_1_desc || 'Aset langsung tersedia setelah pembayaran yang aman.' },
    { icon: Compass, title: settings?.feature_2_title || 'Kualitas Terkurasi', desc: settings?.feature_2_desc || 'Setiap produk diuji dan diverifikasi secara teliti.' },
    { icon: Package, title: settings?.feature_3_title || 'Dukungan Premium', desc: settings?.feature_3_desc || 'Bantuan langsung tersedia untuk semua pertanyaan Anda.' },
  ]

  return (
    <section className="py-40 bg-[#0a0a0a] relative overflow-hidden flex items-center justify-center grain-bg">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ccff00]/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title} className="p-10 border border-white/10 bg-[#121212] group hover:border-[#ccff00] transition-colors duration-500">
              <div className="w-16 h-16 bg-[#1a1a1a] mb-8 flex items-center justify-center border border-white/5 group-hover:bg-[#ccff00]/10 transition-colors">
                <f.icon size={28} className="text-zinc-400 group-hover:text-[#ccff00] transition-colors" />
              </div>
              <h3 className="font-heading font-black text-2xl text-white tracking-wide uppercase mb-4">{f.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedSection />
      <FeaturesBanner />
      <PopularSection />
      <CategorySections />
    </>
  )
}
