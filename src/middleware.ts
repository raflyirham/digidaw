import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAdminToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAdminUIRoute = pathname.startsWith('/admin')
  const isAdminAPIRoute = pathname.startsWith('/api/admin')

  // Protected routes check
  if (isAdminUIRoute || isAdminAPIRoute) {
    const isPublicRoute = pathname === '/admin/login' || pathname === '/api/admin/login'

    if (!isPublicRoute) {
      const token = request.cookies.get('admin-token')?.value
      let isAuthenticated = false

      if (token) {
        const payload = await verifyAdminToken(token)
        if (payload) isAuthenticated = true
      }

      if (!isAuthenticated) {
        if (isAdminAPIRoute) {
          return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
        } else {
          const loginUrl = new URL('/admin/login', request.url)
          return NextResponse.redirect(loginUrl)
        }
      }
    }

    // Redirect /admin/login to /admin if already logged in
    if (pathname === '/admin/login') {
      const token = request.cookies.get('admin-token')?.value
      if (token) {
        const payload = await verifyAdminToken(token)
        if (payload) {
          return NextResponse.redirect(new URL('/admin', request.url))
        }
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
