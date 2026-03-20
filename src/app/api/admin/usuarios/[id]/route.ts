import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const updates: any = {
    name: body.name,
    email: body.email,
    unidade_slug: body.unidade_slug,
  }
  if (body.password) updates.password = await bcrypt.hash(body.password, 10)

  const { data, error } = await supabaseAdmin
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { error } = await supabaseAdmin
    .from('users')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ ok: true })
}