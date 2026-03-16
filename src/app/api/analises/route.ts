import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const unidade_slug = searchParams.get('unidade_slug')

  // Início da semana
  const now = new Date()
  const day = now.getDay()
  const diffToMonday = (day === 0 ? -6 : 1 - day)
  const monday = new Date(now)
  monday.setDate(now.getDate() + diffToMonday)
  monday.setHours(0, 0, 0, 0)
  const weekStart = monday.toISOString()

  // Todos os empréstimos da semana
  const { data: weekLoans, error } = await supabase
    .from('loans')
    .select('*')
    .eq('unidade_slug', unidade_slug)
    .gte('loaned_at', weekStart)

  if (error) return NextResponse.json({ error }, { status: 500 })

  // Total de jogos cadastrados
  const { count: totalGames } = await supabase
    .from('games')
    .select('*', { count: 'exact', head: true })
    .eq('unidade_slug', unidade_slug)

  // Empréstimos em aberto agora
  const { count: openLoans } = await supabase
    .from('loans')
    .select('*', { count: 'exact', head: true })
    .eq('unidade_slug', unidade_slug)
    .eq('returned', false)

  // Calculos Locais
  const totalLoans = weekLoans.length
  const totalReturns = weekLoans.filter((l: any) => l.returned).length

  // Jogo mais emprestado
  const gameCount: Record<string, { name: string; count: number }> = {}
  for (const l of weekLoans) {
    if (!gameCount[l.game_id]) gameCount[l.game_id] = { name: l.game_name, count: 0 }
    gameCount[l.game_id].count++
  }
  const topGame = Object.values(gameCount).sort((a, b) => b.count - a.count)[0] ?? null

  // Horário de pico
  const hourCount: Record<number, number> = {}
  for (const l of weekLoans) {
    const hour = new Date(l.loaned_at).getHours()
    hourCount[hour] = (hourCount[hour] ?? 0) + 1
  }
  const peakHourEntry = Object.entries(hourCount).sort((a, b) => Number(b[1]) - Number(a[1]))[0]
  const peakHour = peakHourEntry ? `${peakHourEntry[0]}h` : null

  // Aluno que mais pegou empréstimo
  const studentCount: Record<string, { name: string; ra: string; count: number }> = {}
  for (const l of weekLoans) {
    if (!studentCount[l.student_ra]) {
      studentCount[l.student_ra] = { name: l.student_name, ra: l.student_ra, count: 0 }
    }
    studentCount[l.student_ra].count++
  }
  const topStudent = Object.values(studentCount).sort((a, b) => b.count - a.count)[0] ?? null

  // Total de alunos únicos
  const uniqueStudents = Object.keys(studentCount).length

  // Turma que mais usou
  const classCount: Record<string, number> = {}
  for (const l of weekLoans) {
    classCount[l.student_class] = (classCount[l.student_class] ?? 0) + 1
  }
  const topClass = Object.entries(classCount).sort((a, b) => b[1] - a[1])[0] ?? null

  // Jogos que não foram emprestados na semana
  const borrowedGameIds = new Set(weekLoans.map((l: any) => l.game_id))
  const { data: allGames } = await supabase
    .from('games')
    .select('id')
    .eq('unidade_slug', unidade_slug)
  const neverBorrowed = (allGames?.length ?? 0) - borrowedGameIds.size

  return NextResponse.json({
    week_start: weekStart,
    total_loans: totalLoans,
    total_returns: totalReturns,
    open_loans: openLoans ?? 0,
    total_games: totalGames ?? 0,
    never_borrowed: neverBorrowed,
    unique_students: uniqueStudents,
    top_game: topGame,
    top_student: topStudent,
    top_class: topClass ? { name: topClass[0], count: topClass[1] } : null,
    peak_hour: peakHour,
  })
}