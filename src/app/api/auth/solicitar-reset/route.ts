import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: Request) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email obrigatório.' }, { status: 400 })

  const { data: userRow } = await supabaseAdmin
    .from('users')
    .select('id, blocked')
    .eq('email', email)
    .single()

  if (userRow && !userRow.blocked) {
    await supabaseAdmin
      .from('users')
      .update({ reset_requested: true })
      .eq('id', userRow.id)
    return NextResponse.json({ ok: true })
  }

  const { data: adminRow } = await supabaseAdmin
    .from('admins')
    .select('id, blocked')
    .eq('email', email)
    .single()

  if (adminRow && !adminRow.blocked) {
    await supabaseAdmin
      .from('admins')
      .update({ reset_requested: true })
      .eq('id', adminRow.id)
  }

  // Retorna ok mesmo sem match para não revelar se o email existe
  return NextResponse.json({ ok: true })
}
