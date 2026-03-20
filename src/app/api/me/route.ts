import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })

  return NextResponse.json(payload)
}