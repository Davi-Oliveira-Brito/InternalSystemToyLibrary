import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const unidade_slug = searchParams.get('unidade_slug')
  const dateFrom = searchParams.get('date_from')
  const dateTo   = searchParams.get('date_to')

  let periodFrom: string
  let periodTo: string

  if (dateFrom && dateTo) {
    periodFrom = dateFrom
    periodTo   = dateTo
  } else {
    const now = new Date()
    const day = now.getDay()
    const monday = new Date(now)
    monday.setDate(now.getDate() + (day === 0 ? -6 : 1 - day))
    monday.setHours(0, 0, 0, 0)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)
    periodFrom = monday.toISOString()
    periodTo   = sunday.toISOString()
  }

  const { data: periodLoans, error } = await supabase
    .from('loans')
    .select('*')
    .eq('unidade_slug', unidade_slug)
    .gte('loaned_at', periodFrom)
    .lte('loaned_at', periodTo)

  if (error) return NextResponse.json({ error }, { status: 500 })

  const { count: totalGames } = await supabase
    .from('games')
    .select('*', { count: 'exact', head: true })
    .eq('unidade_slug', unidade_slug)

  const { count: openLoans } = await supabase
    .from('loans')
    .select('*', { count: 'exact', head: true })
    .eq('unidade_slug', unidade_slug)
    .eq('returned', false)

  const totalLoans   = periodLoans.length
  const totalReturns = periodLoans.filter((l: any) => l.returned).length

  const gameCount: Record<string, { name: string; count: number }> = {}
  for (const l of periodLoans) {
    if (!gameCount[l.game_id]) gameCount[l.game_id] = { name: l.game_name, count: 0 }
    gameCount[l.game_id].count++
  }
  const topGame = Object.values(gameCount).sort((a, b) => b.count - a.count)[0] ?? null

  const hourCount: Record<number, number> = {}
  for (const l of periodLoans) {
    const hour = new Date(l.loaned_at).getHours()
    hourCount[hour] = (hourCount[hour] ?? 0) + 1
  }
  const peakHourEntry = Object.entries(hourCount).sort((a, b) => Number(b[1]) - Number(a[1]))[0]
  const peakHour = peakHourEntry ? `${peakHourEntry[0]}h` : null

  const studentCount: Record<string, { name: string; ra: string; count: number }> = {}
  for (const l of periodLoans) {
    const key = l.student_ra || l.student_name
    if (!studentCount[key]) studentCount[key] = { name: l.student_name, ra: l.student_ra, count: 0 }
    studentCount[key].count++
  }
  const topStudent = Object.values(studentCount).sort((a, b) => b.count - a.count)[0] ?? null
  const uniqueStudents = Object.keys(studentCount).length

  const classCount: Record<string, number> = {}
  for (const l of periodLoans) {
    classCount[l.student_class] = (classCount[l.student_class] ?? 0) + 1
  }
  const topClassEntry = Object.entries(classCount).sort((a, b) => b[1] - a[1])[0] ?? null

  const borrowedGameIds = new Set(periodLoans.map((l: any) => l.game_id))
  const { data: allGames } = await supabase
    .from('games').select('id').eq('unidade_slug', unidade_slug)
  const neverBorrowed = (allGames?.length ?? 0) - borrowedGameIds.size

  return NextResponse.json({
    period_from: periodFrom,
    period_to:   periodTo,
    week_start:  periodFrom,
    total_loans: totalLoans,
    total_returns: totalReturns,
    open_loans: openLoans ?? 0,
    total_games: totalGames ?? 0,
    never_borrowed: neverBorrowed,
    unique_students: uniqueStudents,
    top_game: topGame,
    top_student: topStudent,
    top_class: topClassEntry ? { name: topClassEntry[0], count: topClassEntry[1] } : null,
    peak_hour: peakHour,
  })
}
