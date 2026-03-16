import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  const { email, password } = await req.json()

  // login como admin primeiro
  const { data: admin } = await supabase
    .from('admins')
    .select('*')
    .eq('email', email)
    .eq('password', password)
    .single()

  if (admin) {
    return NextResponse.json({
      ok: true,
      role: 'admin',
      name: admin.name,
      email: admin.email,
      avatar_url: admin.avatar_url ?? null,
      unidade_slug: null,
    })
  }

  // login como usuário (estagiário)
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('password', password)
    .single()

  if (user) {
    return NextResponse.json({
      ok: true,
      role: 'user',
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url ?? null,
      unidade_slug: user.unidade_slug,
    })
  }

  return NextResponse.json({ ok: false }, { status: 401 })
}