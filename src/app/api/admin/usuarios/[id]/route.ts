import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { cargo, newCargo, unidade_slug } = await req.json()

  const oldTable = cargo === 'admin' ? 'admins' : 'users'
  const newTable = newCargo === 'admin' ? 'admins' : 'users'

  // Sem mudança de permissão — atualiza só unidade
  if (oldTable === newTable) {
    const updates: any = newCargo === 'admin' ? {} : { unidade_slug }
    const { data, error } = await supabaseAdmin
      .from(newTable)
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) return NextResponse.json({ error }, { status: 500 })
    return NextResponse.json({ ...data, cargo: newCargo })
  }

  // Mudança de permissão — migra entre tabelas
  const { data: old, error: fetchErr } = await supabaseAdmin
    .from(oldTable)
    .select('*')
    .eq('id', id)
    .single()

  if (fetchErr || !old) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })

  const { error: delErr } = await supabaseAdmin.from(oldTable).delete().eq('id', id)
  if (delErr) return NextResponse.json({ error: delErr }, { status: 500 })

  const newRecord: any = {
    id: old.id,
    name: old.name,
    email: old.email,
    password: old.password,
    avatar_url: old.avatar_url,
    blocked: old.blocked,
    must_change_password: old.must_change_password,
    reset_requested: old.reset_requested,
    created_at: old.created_at,
  }
  if (newTable === 'users') newRecord.unidade_slug = unidade_slug ?? null

  const { data, error: insErr } = await supabaseAdmin
    .from(newTable)
    .insert(newRecord)
    .select()
    .single()

  if (insErr) return NextResponse.json({ error: insErr }, { status: 500 })
  return NextResponse.json({ ...data, cargo: newCargo })
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(req.url)
  const cargo = searchParams.get('cargo')
  const table = cargo === 'admin' ? 'admins' : 'users'

  const { error } = await supabaseAdmin
    .from(table)
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ ok: true })
}
