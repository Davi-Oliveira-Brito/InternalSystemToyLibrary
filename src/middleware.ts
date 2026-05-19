import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/jwt'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth')
  ) {
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

  // Força troca de senha no primeiro login
  if (
    payload.must_change_password &&
    !pathname.startsWith('/trocar-senha') &&
    !pathname.startsWith('/api/trocar-senha') &&
    !pathname.startsWith('/api/auth')
  ) {
    return NextResponse.redirect(new URL('/trocar-senha', req.url))
  }

  // Protege rotas /admin — só admin pode acessar
  if (pathname.startsWith('/admin') && payload.role !== 'admin') {
    return NextResponse.redirect(new URL('/home', req.url))
  }

  // Admin não acessa rotas de estagiário
  if (payload.role === 'admin' && !pathname.startsWith('/admin') && !pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

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
