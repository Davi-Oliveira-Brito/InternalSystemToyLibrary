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
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, name, email, unidade_slug, avatar_url, blocked, must_change_password, reset_requested, created_at')
    .order('name')

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const body = await req.json()

  const tempPassword = generateTempPassword()
  const hashedPassword = await bcrypt.hash(tempPassword, 10)

  const { data, error } = await supabaseAdmin
    .from('users')
    .insert({
      name: body.name,
      email: body.email,
      password: hashedPassword,
      unidade_slug: body.unidade_slug,
      must_change_password: true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ ...data, tempPassword })
}
