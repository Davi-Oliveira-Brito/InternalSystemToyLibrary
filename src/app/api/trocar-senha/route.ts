import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { signToken } from '@/lib/jwt'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  const email = req.headers.get('x-user-email')
  if (!email) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })

  const { newPassword } = await req.json()
  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: 'A senha deve ter pelo menos 6 caracteres.' }, { status: 400 })
  }

  const hashed = await bcrypt.hash(newPassword, 10)

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .update({ password: hashed, must_change_password: false })
    .eq('email', email)
    .select('id, name, email, unidade_slug, avatar_url')
    .single()

  if (error || !user) return NextResponse.json({ error: 'Erro ao atualizar senha.' }, { status: 500 })

  const token = await signToken({
    role: 'user',
    name: user.name,
    email: user.email,
    avatar_url: user.avatar_url ?? null,
    unidade_slug: user.unidade_slug,
    must_change_password: false,
  })

  const res = NextResponse.json({ ok: true })
  res.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  })

  return res
}
