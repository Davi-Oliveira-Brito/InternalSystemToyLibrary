import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const unidade_slug = searchParams.get('unidade_slug')

  const { data, error } = await supabase
    .from('loans')
    .select('*')
    .eq('unidade_slug', unidade_slug)
    .eq('returned', false)
    .order('loaned_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const body = await req.json()

  // 1 jogo por aluno: só valida se o RA foi informado
  if (body.student_ra?.trim()) {
    const { data: existing } = await supabase
      .from('loans')
      .select('id, game_name')
      .eq('student_ra', body.student_ra.trim())
      .eq('unidade_slug', body.unidade_slug)
      .eq('returned', false)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: `Este aluno já possui "${existing.game_name}" emprestado. Devolva antes de emprestar outro.` },
        { status: 409 }
      )
    }
  }

  // Valida cópias disponíveis
  const { data: game } = await supabase
    .from('games')
    .select('total_copies')
    .eq('id', body.game_id)
    .single()

  const { count: activeLoans } = await supabase
    .from('loans')
    .select('*', { count: 'exact', head: true })
    .eq('game_id', body.game_id)
    .eq('returned', false)

  if (game && activeLoans !== null && activeLoans >= game.total_copies) {
    return NextResponse.json(
      { error: 'Não há cópias disponíveis deste jogo.' },
      { status: 409 }
    )
  }

  const { data, error } = await supabase
    .from('loans')
    .insert({
      game_id: body.game_id,
      game_name: body.game_name,
      student_name: body.student_name,
      student_ra: body.student_ra ?? '',
      student_class: body.student_class,
      unidade_slug: body.unidade_slug,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}