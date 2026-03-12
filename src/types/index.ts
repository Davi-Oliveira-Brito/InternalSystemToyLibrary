export interface User {
  id: string
  username: string
  password: string
  unidade: string
  created_at: string
}

export interface Game {
  id: string
  name: string
  image: string | null
  total_copies: number
  unidade: string
  created_at: string
}

export interface Loan {
  id: string
  game_id: string
  game_name: string
  student_name: string
  student_ra: string
  student_class: string
  unidade: string
  loaned_at: string
  returned: boolean
  returned_at: string | null
}