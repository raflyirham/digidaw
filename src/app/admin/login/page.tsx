'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Zap, Eye, EyeOff } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

const schema = z.object({
  username: z.string().min(1, 'Username diperlukan'),
  password: z.string().min(1, 'Password diperlukan'),
})
type FormData = z.infer<typeof schema>

export default function AdminLoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? 'Login gagal')
        return
      }
      router.push('/admin')
      router.refresh()
    } catch {
      toast.error('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black grain-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="studio-card shadow-2xl p-8 z-20 relative bg-[#121212]">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-[#ccff00] rounded-none flex items-center justify-center mx-auto mb-4 neon-border">
              <Zap size={28} className="text-black" />
            </div>
            <h1 className="text-2xl font-heading font-black text-white">Admin Digidaw</h1>
            <p className="text-zinc-500 text-sm mt-1">Masuk ke panel administrasi</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              {...register('username')}
              label="Username"
              placeholder="admin"
              error={errors.username?.message}
              required
              id="username"
              autoComplete="username"
            />

            <div className="relative">
              <Input
                {...register('password')}
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                error={errors.password?.message}
                required
                id="password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-zinc-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
              Masuk
            </Button>
          </form>
        </div>

        <p className="text-center text-zinc-600 text-xs mt-6">
          &copy; {new Date().getFullYear()} Digidaw. Panel Admin.
        </p>
      </div>
    </div>
  )
}
