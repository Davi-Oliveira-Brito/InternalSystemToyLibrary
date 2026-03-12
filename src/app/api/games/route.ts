import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const unidade = searchParams.get('unidade')

  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('unidade', unidade)
    .order('name')

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
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