import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'

function extractStoragePath(url: string): { bucket: string; path: string } | null {
  try {
    const match = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/)
    if (!match) return null
    return { bucket: match[1], path: match[2] }
  } catch {
    return null
  }
}

function isSupabaseUrl(url: string | null): boolean {
  if (!url) return false
  return url.includes('.supabase.co/storage')
}

async function deleteStorageImage(url: string) {
  const extracted = extractStoragePath(url)
  if (!extracted) return
  await supabase.storage.from(extracted.bucket).remove([extracted.path])
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const { data: current } = await supabase
    .from('games')
    .select('image_url')
    .eq('id', id)
    .single()

  const { data, error } = await supabase
    .from('games')
    .update({
      name: body.name,
      image_url: body.image_url || null,
      category: body.category || null,
      total_copies: body.total_copies,
      observacao: body.observacao ?? null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error }, { status: 500 })

  // Se trocou a imagem e a antiga era do Storage, apaga
  const oldUrl = current?.image_url
  const newUrl = body.image_url
  if (oldUrl && oldUrl !== newUrl && isSupabaseUrl(oldUrl)) {
    await deleteStorageImage(oldUrl)
  }

  return NextResponse.json(data)
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Bloqueia se houver empréstimos em aberto
  const { count: openLoans } = await supabase
    .from('loans')
    .select('*', { count: 'exact', head: true })
    .eq('game_id', id)
    .eq('returned', false)

  if (openLoans && openLoans > 0) {
    return NextResponse.json(
      { error: `Este jogo tem ${openLoans} empréstimo(s) em aberto. Registre a devolução antes de excluir.` },
      { status: 409 }
    )
  }

  // Busca imagem antes de deletar
  const { data: game } = await supabase
    .from('games')
    .select('image_url')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('games')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error }, { status: 500 })

  // Apaga imagem do Storage se for do Supabase
  if (game?.image_url && isSupabaseUrl(game.image_url)) {
    await deleteStorageImage(game.image_url)
  }

  return NextResponse.json({ ok: true })
}