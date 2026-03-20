import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, name, email, unidade_slug, avatar_url, created_at')
    .order('name')

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const body = await req.json()

  const hashedPassword = await bcrypt.hash(body.password, 10)

  const { data, error } = await supabaseAdmin
    .from('users')
    .insert({
      name: body.name,
      email: body.email,
      password: hashedPassword,
      unidade_slug: body.unidade_slug,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}