import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  const { email, password } = await req.json()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('password', password)
    .single()

  if (error || !data) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  return NextResponse.json({
    ok: true,
    unidade: data.unidade,
    email: data.email,
  })
}