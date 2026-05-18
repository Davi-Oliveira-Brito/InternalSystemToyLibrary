import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: Request) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email obrigatório.' }, { status: 400 })

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id, blocked')
    .eq('email', email)
    .single()

  if (!user || user.blocked) {
    // Retorna ok mesmo assim para não revelar se o email existe
    return NextResponse.json({ ok: true })
  }

  await supabaseAdmin
    .from('users')
    .update({ reset_requested: true })
    .eq('id', user.id)

  return NextResponse.json({ ok: true })
}
