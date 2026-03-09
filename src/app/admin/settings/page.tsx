'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { fetchCategories } from '@/lib/api'
import { Category } from '@/types'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

export default function AdminSettingsPage() {
  const qc = useQueryClient()
  
  // Existing states
  const [waNumber, setWaNumber] = useState('')
  const [selectedCatIds, setSelectedCatIds] = useState<string[]>([])
  const [siteName, setSiteName] = useState('')
  
  // New States
  const [seo, setSeo] = useState({
    site_title: '',
    site_description: '',
    site_favicon_url: '',
  })
  const [faviconFile, setFaviconFile] = useState<File | null>(null)
  
  const [hero, setHero] = useState({
    hero_badge: '',
    hero_title: '',
    hero_description: '',
  })
  
  const [stats, setStats] = useState({
    stat_1_value: '',
    stat_1_label: '',
    stat_2_value: '',
    stat_2_label: '',
    stat_3_value: '',
    stat_3_label: '',
  })
  
  const [features, setFeatures] = useState({
    feature_1_title: '',
    feature_1_desc: '',
    feature_2_title: '',
    feature_2_desc: '',
    feature_3_title: '',
    feature_3_desc: '',
  })
  
  const [footer, setFooter] = useState({
    footer_description: '',
    footer_copyright: '',
  })

  const [loading, setLoading] = useState(false)

  const { data: settings } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => { const r = await fetch('/api/admin/settings'); return r.json() as Promise<Record<string, string>> },
  })

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  useEffect(() => {
    if (settings) {
      setWaNumber(settings.whatsapp_number ?? '')
      setSiteName(settings.site_name ?? '')
      try {
        setSelectedCatIds(JSON.parse(settings.featured_category_ids ?? '[]'))
      } catch {
        setSelectedCatIds([])
      }
      
      setSeo({
        site_title: settings.site_title ?? '',
        site_description: settings.site_description ?? '',
        site_favicon_url: settings.site_favicon_url ?? '',
      })
      
      setHero({
        hero_badge: settings.hero_badge ?? '',
        hero_title: settings.hero_title ?? '',
        hero_description: settings.hero_description ?? '',
      })
      
      setStats({
        stat_1_value: settings.stat_1_value ?? '',
        stat_1_label: settings.stat_1_label ?? '',
        stat_2_value: settings.stat_2_value ?? '',
        stat_2_label: settings.stat_2_label ?? '',
        stat_3_value: settings.stat_3_value ?? '',
        stat_3_label: settings.stat_3_label ?? '',
      })

      setFeatures({
        feature_1_title: settings.feature_1_title ?? '',
        feature_1_desc: settings.feature_1_desc ?? '',
        feature_2_title: settings.feature_2_title ?? '',
        feature_2_desc: settings.feature_2_desc ?? '',
        feature_3_title: settings.feature_3_title ?? '',
        feature_3_desc: settings.feature_3_desc ?? '',
      })

      setFooter({
        footer_description: settings.footer_description ?? '',
        footer_copyright: settings.footer_copyright ?? '',
      })
    }
  }, [settings])

  const handleToggleCategory = (id: string) => {
    setSelectedCatIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      let finalFaviconUrl = seo.site_favicon_url

      if (faviconFile) {
        const supabase = createClient()
        const fileExt = faviconFile.name.split('.').pop()
        const fileName = `favicon-${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('site-settings')
          .upload(fileName, faviconFile)
          
        if (uploadError) {
          toast.error('Gagal mengupload favicon: ' + uploadError.message)
          setLoading(false)
          return
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('site-settings')
          .getPublicUrl(fileName)
          
        finalFaviconUrl = publicUrl
      }

      const r = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatsapp_number: waNumber,
          site_name: siteName,
          featured_category_ids: JSON.stringify(selectedCatIds),
          ...seo,
          site_favicon_url: finalFaviconUrl,
          ...hero,
          ...stats,
          ...features,
          ...footer
        }),
      })
      if (!r.ok) throw new Error('Gagal menyimpan pengaturan')
      
      setSeo((prev) => ({ ...prev, site_favicon_url: finalFaviconUrl }))
      setFaviconFile(null)
      
      qc.invalidateQueries({ queryKey: ['site-settings'] })
      qc.invalidateQueries({ queryKey: ['admin-settings'] })
      toast.success('Pengaturan disimpan!')
    } catch {
      toast.error('Gagal menyimpan pengaturan')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFaviconFile(e.target.files[0])
    }
  }

  return (
    <div className="space-y-8 pb-20 w-full">
      <div>
        <h1 className="text-3xl font-heading font-black text-white">Pengaturan</h1>
        <p className="text-zinc-400 text-sm mt-1">Konfigurasi umum toko dan tampilan Digidaw</p>
      </div>

      <div className="space-y-8">
        {/* SEO & Identitas */}
        <div className="studio-card p-6 space-y-6">
          <h2 className="font-heading font-black text-white text-xl border-b border-white/10 pb-4">SEO & Identitas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nama Website"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="Digidaw"
            />
            <Input
              label="Nomor WhatsApp"
              value={waNumber}
              onChange={(e) => setWaNumber(e.target.value)}
              placeholder="6281234567890"
              helperText="Awali dengan 62 (contoh: 62812...)"
            />
          </div>

          <Input
            label="SEO Title"
            value={seo.site_title}
            onChange={(e) => setSeo({ ...seo, site_title: e.target.value })}
            placeholder="Digidaw - Toko Produk Digital"
          />
          
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-2 tracking-widest uppercase">
              SEO Description
            </label>
            <textarea
              className="w-full bg-[#121212] border border-white/10 text-white rounded-none px-4 py-3 focus:outline-none focus:border-[#ccff00] transition-colors resize-y min-h-[100px]"
              value={seo.site_description}
              onChange={(e) => setSeo({ ...seo, site_description: e.target.value })}
              placeholder="Deskripsi website..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-2 tracking-widest uppercase">
              Favicon Icon (Opsional)
            </label>
            <div className="flex items-center gap-4 mt-2">
              {seo.site_favicon_url && !faviconFile && (
                <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center rounded overflow-hidden">
                  <Image src={seo.site_favicon_url} alt="Favicon" width={24} height={24} className="object-cover" />
                </div>
              )}
              {faviconFile && (
                <div className="w-12 h-12 bg-[#ccff00]/20 border border-[#ccff00] flex items-center justify-center rounded text-xs text-[#ccff00]">
                  Baru
                </div>
              )}
              <input
                type="file"
                accept="image/png, image/jpeg, image/x-icon, image/svg+xml, image/webp"
                onChange={handleFileChange}
                className="text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-bold file:bg-[#ccff00] file:text-black hover:file:bg-[#b3e600] file:cursor-pointer transition-all"
              />
            </div>
            {faviconFile && (
              <p className="text-xs text-zinc-500 mt-2">File akan diunggah saat Anda menyimpan perubahan.</p>
            )}
          </div>
        </div>

        {/* Hero Section */}
        <div className="studio-card p-6 space-y-6">
          <h2 className="font-heading font-black text-white text-xl border-b border-white/10 pb-4">Tampilan Beranda - Hero</h2>
          <Input
            label="Badge Text"
            value={hero.hero_badge}
            onChange={(e) => setHero({ ...hero, hero_badge: e.target.value })}
            placeholder="Elemen Digital Premium"
          />
          <Input
            label="Hero Title"
            value={hero.hero_title}
            onChange={(e) => setHero({ ...hero, hero_title: e.target.value })}
            placeholder="Bangun Lebih Cepat."
          />
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-2 tracking-widest uppercase">
              Hero Description
            </label>
            <textarea
              className="w-full bg-[#121212] border border-white/10 text-white rounded-none px-4 py-3 focus:outline-none focus:border-[#ccff00] transition-colors resize-y min-h-[100px]"
              value={hero.hero_description}
              onChange={(e) => setHero({ ...hero, hero_description: e.target.value })}
            />
          </div>
        </div>

        {/* Home Categories */}
        <div className="studio-card p-6 space-y-6">
          <h2 className="font-heading font-black text-white text-xl border-b border-white/10 pb-4">Tampilan Beranda - Kategori</h2>
          <div>
            <p className="text-zinc-400 text-sm mb-4">
              Pilih kategori yang ditampilkan di halaman beranda. Jika tidak ada yang dipilih, 3 kategori teratas akan ditampilkan.
            </p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleToggleCategory(cat.id)}
                  className={`px-4 py-2 text-sm font-bold transition-all border-2 ${
                    selectedCatIds.includes(cat.id)
                      ? 'bg-[#ccff00] text-black border-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.2)]'
                      : 'bg-transparent text-zinc-400 border-white/20 hover:border-[#ccff00] hover:text-[#ccff00]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="studio-card p-6 space-y-6">
          <h2 className="font-heading font-black text-white text-xl border-b border-white/10 pb-4">Tampilan Beranda - Statistik</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <Input label="Stat 1 Value" value={stats.stat_1_value} onChange={(e) => setStats({ ...stats, stat_1_value: e.target.value })} placeholder="50+" />
              <Input label="Stat 1 Label" value={stats.stat_1_label} onChange={(e) => setStats({ ...stats, stat_1_label: e.target.value })} placeholder="Aset Digital" />
            </div>
            <div className="space-y-4">
              <Input label="Stat 2 Value" value={stats.stat_2_value} onChange={(e) => setStats({ ...stats, stat_2_value: e.target.value })} placeholder="1K+" />
              <Input label="Stat 2 Label" value={stats.stat_2_label} onChange={(e) => setStats({ ...stats, stat_2_label: e.target.value })} placeholder="Kreator Bahagia" />
            </div>
            <div className="space-y-4">
              <Input label="Stat 3 Value" value={stats.stat_3_value} onChange={(e) => setStats({ ...stats, stat_3_value: e.target.value })} placeholder="4.9" />
              <Input label="Stat 3 Label" value={stats.stat_3_label} onChange={(e) => setStats({ ...stats, stat_3_label: e.target.value })} placeholder="Rata-rata Penilaian" />
            </div>
          </div>
        </div>

        {/* Features Info */}
        <div className="studio-card p-6 space-y-6">
          <h2 className="font-heading font-black text-white text-xl border-b border-white/10 pb-4">Tampilan Beranda - Fitur</h2>
          <div className="space-y-6 flex flex-col gap-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Fitur 1 Judul" value={features.feature_1_title} onChange={(e) => setFeatures({ ...features, feature_1_title: e.target.value })} placeholder="Akses Instan" />
              <Input label="Fitur 1 Deskripsi" value={features.feature_1_desc} onChange={(e) => setFeatures({ ...features, feature_1_desc: e.target.value })} placeholder="Aset langsung tersedia setelah pembayaran yang aman." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Fitur 2 Judul" value={features.feature_2_title} onChange={(e) => setFeatures({ ...features, feature_2_title: e.target.value })} placeholder="Kualitas Terkurasi" />
              <Input label="Fitur 2 Deskripsi" value={features.feature_2_desc} onChange={(e) => setFeatures({ ...features, feature_2_desc: e.target.value })} placeholder="Setiap produk diuji dan diverifikasi secara teliti." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Fitur 3 Judul" value={features.feature_3_title} onChange={(e) => setFeatures({ ...features, feature_3_title: e.target.value })} placeholder="Dukungan Premium" />
              <Input label="Fitur 3 Deskripsi" value={features.feature_3_desc} onChange={(e) => setFeatures({ ...features, feature_3_desc: e.target.value })} placeholder="Bantuan langsung tersedia untuk semua pertanyaan Anda." />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="studio-card p-6 space-y-6">
          <h2 className="font-heading font-black text-white text-xl border-b border-white/10 pb-4">Tampilan Footer</h2>
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-2 tracking-widest uppercase">
              Footer Description
            </label>
            <textarea
              className="w-full bg-[#121212] border border-white/10 text-white rounded-none px-4 py-3 focus:outline-none focus:border-[#ccff00] transition-colors resize-y min-h-[100px]"
              value={footer.footer_description}
              onChange={(e) => setFooter({ ...footer, footer_description: e.target.value })}
            />
          </div>
          <Input label="Copyright Text" value={footer.footer_copyright} onChange={(e) => setFooter({ ...footer, footer_copyright: e.target.value })} placeholder="Digidaw Studio." />
        </div>

        <div className="sticky bottom-6 flex justify-end z-10 w-full">
          <Button onClick={handleSave} loading={loading} size="lg" className="shadow-[0_0_30px_rgba(204,255,0,0.3)]">
            Simpan Seluruh Pengaturan
          </Button>
        </div>
      </div>
    </div>
  )
}
