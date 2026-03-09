'use client'

import AdminSidebar from '@/components/admin/AdminSidebar'
import { usePathname } from 'next/navigation'

export default function AdminLayoutClient({ children, initialSettings }: { children: React.ReactNode, initialSettings: Record<string, string> }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'

  // If on login page, render without sidebar and layout wrapper
  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <AdminSidebar initialSettings={initialSettings} />
      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-8 lg:p-10">{children}</div>
      </div>
    </div>
  )
}
