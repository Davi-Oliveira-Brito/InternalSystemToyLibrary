import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { signToken } from '@/lib/jwt'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  const email = req.headers.get('x-user-email')
  const role = req.headers.get('x-user-role')
  if (!email || !role) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })

  const { newPassword } = await req.json()
  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: 'A senha deve ter pelo menos 6 caracteres.' }, { status: 400 })
  }

  const hashed = await bcrypt.hash(newPassword, 10)

  let tokenPayload: Parameters<typeof signToken>[0]

  if (role === 'admin') {
    const { data, error } = await supabaseAdmin
      .from('admins')
      .update({ password: hashed, must_change_password: false })
      .eq('email', email)
      .select('id, name, email, avatar_url')
      .single()
    if (error || !data) return NextResponse.json({ error: 'Erro ao atualizar senha.' }, { status: 500 })
    tokenPayload = { role: 'admin', name: data.name, email: data.email, avatar_url: data.avatar_url ?? null, unidade_slug: null, must_change_password: false }
  } else {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ password: hashed, must_change_password: false })
      .eq('email', email)
      .select('id, name, email, unidade_slug, avatar_url')
      .single()
    if (error || !data) return NextResponse.json({ error: 'Erro ao atualizar senha.' }, { status: 500 })
    tokenPayload = { role: 'user', name: data.name, email: data.email, avatar_url: data.avatar_url ?? null, unidade_slug: data.unidade_slug, must_change_password: false }
  }

  const token = await signToken(tokenPayload)

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
