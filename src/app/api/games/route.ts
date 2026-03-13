import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const unidade = searchParams.get('unidade')

  // Busca jogos + conta empréstimos ativos por jogo
  const { data: games, error } = await supabase
    .from('games')
    .select(`
      *,
      active_loans:loans(count)
    `)
    .eq('unidade', unidade)
    .eq('loans.returned', false)
    .order('name')

  if (error) return NextResponse.json({ error }, { status: 500 })

  // Calcula available_copies para cada jogo
  const gamesWithAvailability = games.map((game: any) => {
    const activeLoans = game.active_loans?.[0]?.count ?? 0
    return {
      ...game,
      active_loans: undefined,
      available_copies: Math.max(0, game.total_copies - activeLoans),
    }
  })

  return NextResponse.json(gamesWithAvailability)
}

export async function POST(req: Request) {
  const body = await req.json()

  const { data, error } = await supabase
    .from('games')
    .insert({
      name: body.name,
      image: body.image || null,
      total_copies: body.total_copies || 1,
      unidade: body.unidade,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}