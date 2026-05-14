'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import styles from './page.module.scss'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)

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
        toast(`Bem vindo ${data.name}`, { duration: 3500, className: 'toastAdmin' })
        router.push('/admin')
      } else {
        toast(`Bem vindo ${data.name}`, { duration: 3500, className: 'toast' })
        router.push('/home')
      }
    } else {
      toast.error('Email ou senha incorretos.')
    }

    setLoading(false)
  }

  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <Image
          src="/logo clara.png"
          alt="Ludoteca"
          width={220}
          height={80}
          className={styles.logo}
          priority
        />

        <div className={styles.forms}>
          <div className={styles.field}>
            <input
              type="text"
              className={styles.input}
              placeholder=" "
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
            <label className={styles.label}>Email</label>
          </div>

          <div className={styles.field}>
            <input
              type={showPassword ? 'text' : 'password'}
              className={styles.input}
              placeholder=" "
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
            <label className={styles.label}>Senha</label>
            <button
              type="button"
              className={styles.toggle}
              onClick={() => setShowPassword(p => !p)}
              aria-label="Mostrar senha"
            >
              <Image
                src={showPassword ? '/openedEyes.svg' : '/closedEyes.svg'}
                alt="toggle senha"
                width={20}
                height={20}
              />
            </button>
          </div>
        </div>

        <button
          className={styles.button}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </div>
    </main>
  )
}
