import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { User } from '@/types'

export async function POST(req: Request) {
  const { username, password } = await req.json()

  const filePath = path.join(process.cwd(), 'data', 'users.json')
  const users: User[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

  const user = users.find(
    (u) => u.username === username && u.password === password
  )

  if (!user) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  return NextResponse.json({
    ok: true,
    unidade: user.unidade,
    username: user.username,
  })
}