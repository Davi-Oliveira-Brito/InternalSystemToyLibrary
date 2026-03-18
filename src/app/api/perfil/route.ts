import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')

  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, unidade_slug, avatar_url')
    .eq('email', email)
    .single()

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(req: Request) {
  const body = await req.json()
  const { email, name, currentPassword, newPassword, avatar_url } = body

  if (newPassword) {
    const { data: user, error } = await supabase
      .from('users')
      .select('password')
      .eq('email', email)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })
    }

    if (user.password !== currentPassword) {
      return NextResponse.json({ error: 'Senha atual incorreta.' }, { status: 401 })
    }
  }

  const updates: any = {}
  if (name) updates.name = name
  if (newPassword) updates.password = newPassword
  if (avatar_url !== undefined) updates.avatar_url = avatar_url

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('email', email)
    .select('id, name, email, unidade_slug, avatar_url')
    .single()

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}