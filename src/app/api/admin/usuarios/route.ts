import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  const bytes = randomBytes(8)
  return Array.from(bytes).map(b => chars[b % chars.length]).join('')
}

export async function GET() {
  const [adminsRes, usersRes] = await Promise.all([
    supabaseAdmin
      .from('admins')
      .select('id, name, email, avatar_url, blocked, must_change_password, reset_requested, created_at')
      .order('name'),
    supabaseAdmin
      .from('users')
      .select('id, name, email, unidade_slug, avatar_url, blocked, must_change_password, reset_requested, created_at')
      .order('name'),
  ])

  if (adminsRes.error) return NextResponse.json({ error: adminsRes.error }, { status: 500 })
  if (usersRes.error) return NextResponse.json({ error: usersRes.error }, { status: 500 })

  const admins = (adminsRes.data ?? []).map(a => ({ ...a, cargo: 'admin', unidade_slug: null }))
  const users = (usersRes.data ?? []).map(u => ({ ...u, cargo: 'estagiario' }))

  const combined = [...admins, ...users].sort((a, b) => a.name.localeCompare(b.name))
  return NextResponse.json(combined)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { name, email, unidade_slug, cargo } = body

  const tempPassword = generateTempPassword()
  const hashedPassword = await bcrypt.hash(tempPassword, 10)

  if (cargo === 'admin') {
    const { data, error } = await supabaseAdmin
      .from('admins')
      .insert({ name, email, password: hashedPassword, must_change_password: true })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ...data, cargo: 'admin', tempPassword })
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .insert({ name, email, password: hashedPassword, unidade_slug, must_change_password: true })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ...data, cargo: 'estagiario', tempPassword })
}
