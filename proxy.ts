import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/app/lib/session'

const protectedRoutes = ['/projects', '/users']
const authRoutes = ['/login', '/register']

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))
  const isAuthRoute = authRoutes.includes(path)

  const cookie = req.cookies.get('session')?.value
  const session = await decrypt(cookie)

  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (isAuthRoute && session?.userId) {
    return NextResponse.redirect(new URL('/projects', req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/projects/:path*', '/users/:path*', '/login', '/register'],
}
