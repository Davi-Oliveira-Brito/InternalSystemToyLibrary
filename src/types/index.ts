export interface User {
  id: string
  username: string
  password: string
  unidade: string
}

export interface Game {
  id: string
  name: string
  image: string | null
  totalCopies: number
  unidade: string
}

export interface Loan {
  id: string
  gameId: string
  gameName: string
  studentName: string
  studentRA: string
  studentClass: string
  loanedAt: string
  returned: boolean
  returnedAt?: string
  unidade: string
}