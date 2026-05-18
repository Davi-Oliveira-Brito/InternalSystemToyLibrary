import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: user, error: fetchError } = await supabaseAdmin
    .from('users')
    .select('blocked')
    .eq('id', id)
    .single()

  if (fetchError || !user) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })

  const { data, error } = await supabaseAdmin
    .from('users')
    .update({ blocked: !user.blocked })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}
