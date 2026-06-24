import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'
import bcrypt from 'bcryptjs'

function isSupabaseUrl(url: string | null): boolean {
  if (!url) return false
  return url.includes('.supabase.co/storage')
}

function extractStoragePath(url: string): { bucket: string; path: string } | null {
  const match = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/)
  if (!match) return null
  return { bucket: match[1], path: match[2] }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')

  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, unidade_slug, avatar_url')
    .eq('email', email)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(req: Request) {
  const body = await req.json()
  const { email, name, currentPassword, newPassword, avatar_url } = body

  if (newPassword) {
    const { data: user, error } = await supabase
      .from('users')
      .select('password')
      .eq('email', email)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })
    }

    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Senha atual incorreta.' }, { status: 401 })
    }
  }

  // Busca avatar atual para cleanup
  const { data: current } = await supabase
    .from('users')
    .select('avatar_url')
    .eq('email', email)
    .single()

  const updates: any = {}
  if (name) updates.name = name
  if (newPassword) updates.password = await bcrypt.hash(newPassword, 10)
  if (avatar_url !== undefined) updates.avatar_url = avatar_url

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('email', email)
    .select('id, name, email, unidade_slug, avatar_url')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Deleta avatar antigo do Storage se trocou
  const oldUrl = current?.avatar_url
  if (oldUrl && oldUrl !== avatar_url && isSupabaseUrl(oldUrl)) {
    const extracted = extractStoragePath(oldUrl)
    if (extracted) {
      await supabase.storage.from(extracted.bucket).remove([extracted.path])
    }
  }

  return NextResponse.json(data)
}