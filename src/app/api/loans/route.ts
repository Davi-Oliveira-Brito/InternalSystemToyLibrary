import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const unidade = searchParams.get('unidade')

  const { data, error } = await supabase
    .from('loans')
    .select('*')
    .eq('unidade', unidade)
    .eq('returned', false)
    .order('loaned_at', { ascending: false })

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const body = await req.json()

  const { data, error } = await supabase
    .from('loans')
    .insert({
      game_id: body.game_id,
      game_name: body.game_name,
      student_name: body.student_name,
      student_ra: body.student_ra,
      student_class: body.student_class,
      unidade: body.unidade,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}