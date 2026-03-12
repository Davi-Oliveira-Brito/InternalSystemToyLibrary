import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PATCH(_: Request, { params }: { params: { id: string } }) {
  const { data, error } = await supabase
    .from('loans')
    .update({
      returned: true,
      returned_at: new Date().toISOString(),
    })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { error } = await supabase
    .from('loans')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ ok: true })
}