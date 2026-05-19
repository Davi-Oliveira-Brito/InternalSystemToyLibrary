export type GameCategory = 'Cartas' | 'Tabuleiro' | 'RPG' | 'Cooperativo' | 'Estratégia' | 'Outro'

export const GAME_CATEGORIES: GameCategory[] = [
  'Cartas',
  'Tabuleiro',
  'RPG',
  'Cooperativo',
  'Estratégia',
  'Outro',
]

export const UNIDADES = [
  { slug: 'morumbi',      name: 'Unidade Morumbi' },
  { slug: 'valinhos',     name: 'Unidade Valinhos' },
  { slug: 'panamby',      name: 'Unidade Panamby' },
  { slug: 'vila-andrade', name: 'Unidade Vila Andrade' },
] as const

export type UnidadeSlug = typeof UNIDADES[number]['slug']

export interface Unidade {
  id: string
  slug: string
  name: string
  created_at: string
}

export interface Admin {
  id: string
  name: string
  email: string
  password: string
  avatar_url: string | null
  created_at: string
}

export interface User {
  id: string
  name: string
  email: string
  password: string
  unidade_slug: string
  avatar_url: string | null
  must_change_password: boolean
  blocked: boolean
  reset_requested: boolean
  created_at: string
}

export interface Game {
  id: string
  name: string
  image_url: string | null
  category: GameCategory | null
  total_copies: number
  unidade_slug: string
  created_at: string
  available_copies: number
  observacao: string | null
}

export interface Loan {
  id: string
  game_id: string
  game_name: string
  student_name: string
  student_ra: string
  student_class: string
  unidade_slug: string
  loaned_at: string
  returned: boolean
  returned_at: string | null
}

export interface SessionData {
  role: 'admin' | 'user'
  name: string
  email: string
  avatar_url: string | null
  unidade_slug: string | null
  must_change_password?: boolean
}