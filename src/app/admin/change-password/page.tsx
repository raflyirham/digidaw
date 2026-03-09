'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { KeyRound, Eye, EyeOff } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

const schema = z
  .object({
    current_password: z.string().min(1, 'Password saat ini diperlukan'),
    new_password: z.string().min(6, 'Password baru minimal 6 karakter'),
    confirm_password: z.string().min(1, 'Konfirmasi password diperlukan'),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirm_password'],
  })

type FormData = z.infer<typeof schema>

export default function AdminChangePasswordPage() {
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: data.current_password,
          new_password: data.new_password,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? 'Gagal mengubah password')
        return
      }
      toast.success('Password berhasil diubah!')
      reset()
    } catch {
      toast.error('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-3xl font-heading font-black text-white">Ubah Password</h1>
        <p className="text-zinc-400 text-sm mt-1">Pastikan gunakan password yang kuat dan tidak mudah ditebak</p>
      </div>

      <div className="studio-card p-6">
        <div className="w-14 h-14 bg-[#ccff00]/10 rounded-2xl flex items-center justify-center mb-6">
          <KeyRound size={26} className="text-[#ccff00]" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative">
            <Input
              {...register('current_password')}
              label="Password Saat Ini"
              type={showCurrent ? 'text' : 'password'}
              placeholder="••••••••"
              error={errors.current_password?.message}
              required
              id="current_password"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-8 text-zinc-500 hover:text-white transition-colors"
            >
              {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="relative">
            <Input
              {...register('new_password')}
              label="Password Baru"
              type={showNew ? 'text' : 'password'}
              placeholder="Minimal 6 karakter"
              error={errors.new_password?.message}
              required
              id="new_password"
              helperText="Minimal 6 karakter"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-8 text-zinc-500 hover:text-white transition-colors"
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <Input
            {...register('confirm_password')}
            label="Konfirmasi Password Baru"
            type="password"
            placeholder="Ulangi password baru"
            error={errors.confirm_password?.message}
            required
            id="confirm_password"
          />

          <Button type="submit" loading={loading} size="lg" className="w-full mt-2">
            Ubah Password
          </Button>
        </form>
      </div>
    </div>
  )
}
