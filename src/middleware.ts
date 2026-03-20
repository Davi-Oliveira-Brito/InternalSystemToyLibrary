import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/jwt'

// Rotas que não precisam de autenticação
const PUBLIC_ROUTES = ['/login', '/splash', '/api/auth']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Libera rotas públicas
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  const token = req.cookies.get('token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const payload = await verifyToken(token)

  if (!payload) {
    const res = NextResponse.redirect(new URL('/login', req.url))
    res.cookies.delete('token')
    return res
  }

  // Protege rotas /admin — só admin pode acessar
  if (pathname.startsWith('/admin') && payload.role !== 'admin') {
    return NextResponse.redirect(new URL('/home', req.url))
  }

  // Injeta dados do usuário no header para uso nas APIs
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-user-email', payload.email)
  requestHeaders.set('x-user-role', payload.role)
  requestHeaders.set('x-user-unidade', payload.unidade_slug ?? '')

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.png|cards|.*\\.svg$|.*\\.png$).*)',
  ],
}