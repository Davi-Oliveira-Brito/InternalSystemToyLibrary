'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import styles from './page.module.scss'
import Input from '@/components/Input/page'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (data.ok) {
      sessionStorage.setItem('auth', '1')
      sessionStorage.setItem('role', data.role)
      sessionStorage.setItem('name', data.name)
      sessionStorage.setItem('email', data.email)
      sessionStorage.setItem('avatar_url', data.avatar_url ?? '')
      sessionStorage.setItem('unidade_slug', data.unidade_slug ?? '')

      if (data.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/home')
      }
    } else {
      setError('Email ou senha incorretos.')
    }

    setLoading(false)
  }

  return (
    <main className={styles.main}>
      <div className={styles.content}>

        <Image
          src="/logo.png"
          alt="Ludoteca"
          width={220}
          height={80}
          className={styles.logo}
          priority
        />

        <div className={styles.forms}>
          <Input
            type="text"
            label="Email"
            placeholder=" "
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <Input
            type="password"
            label="Senha"
            placeholder=" "
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          {error && <p className={styles.error}>{error}</p>}
        </div>

        <button
          className={styles.button}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Entrando...' : 'Login'}
        </button>

      </div>
    </main>
  )
}