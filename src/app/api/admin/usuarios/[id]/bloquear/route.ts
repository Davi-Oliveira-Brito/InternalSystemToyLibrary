import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { cargo } = await req.json()
  const table = cargo === 'admin' ? 'admins' : 'users'

  const { data: user, error: fetchError } = await supabaseAdmin
    .from(table)
    .select('blocked')
    .eq('id', id)
    .single()

  if (fetchError || !user) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })

  const { data, error } = await supabaseAdmin
    .from(table)
    .update({ blocked: !user.blocked })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
