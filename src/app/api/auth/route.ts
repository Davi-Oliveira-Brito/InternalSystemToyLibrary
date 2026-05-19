import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { signToken } from '@/lib/jwt'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  const { email, password } = await req.json()

  // Tenta login como admin
  const { data: admin } = await supabaseAdmin
    .from('admins')
    .select('*')
    .eq('email', email)
    .single()

  if (admin && await bcrypt.compare(password, admin.password)) {
    if (admin.blocked) {
      return NextResponse.json({ ok: false, blocked: true }, { status: 401 })
    }

    const token = await signToken({
      role: 'admin',
      name: admin.name,
      email: admin.email,
      avatar_url: admin.avatar_url ?? null,
      unidade_slug: null,
      must_change_password: admin.must_change_password ?? false,
    })

    const res = NextResponse.json({
      ok: true,
      role: 'admin',
      name: admin.name,
      email: admin.email,
      avatar_url: admin.avatar_url ?? null,
      unidade_slug: null,
      must_change_password: admin.must_change_password ?? false,
    })

    res.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })

    return res
  }

  // Tenta login como usuário
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (user && await bcrypt.compare(password, user.password)) {
    if (user.blocked) {
      return NextResponse.json({ ok: false, blocked: true }, { status: 401 })
    }

    const token = await signToken({
      role: 'user',
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url ?? null,
      unidade_slug: user.unidade_slug,
      must_change_password: user.must_change_password ?? false,
    })

    const res = NextResponse.json({
      ok: true,
      role: 'user',
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url ?? null,
      unidade_slug: user.unidade_slug,
      must_change_password: user.must_change_password ?? false,
    })

    res.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })

    return res
  }

  return NextResponse.json({ ok: false }, { status: 401 })
}
