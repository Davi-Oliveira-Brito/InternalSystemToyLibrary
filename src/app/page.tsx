'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import styles from './page.module.scss'

interface LoginForm {
  username: string
  password: string
}

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState<LoginForm>({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()

    if (data.ok) {
      sessionStorage.setItem('auth', '1')
      sessionStorage.setItem('unidade', data.unidade)
      sessionStorage.setItem('username', data.username)
      router.push('/dashboard')
    } else {
      setError('Usuário ou senha incorretos.')
    }

    setLoading(false)
  }

  return (
    <main className={styles.wrapper}>
      <div className={styles.card}>

        <div className={styles.logo}>
          <Image
            src="/image.png"
            alt="Logo"
            width={110}
            height={65}
            className="object-contain"
          />
          <span className={styles.subtitle}>Controle de jogos</span>
        </div>

        <div className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Usuário</label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="seu usuário"
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Senha</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              className={styles.input}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            onClick={handleLogin}
            disabled={loading}
            className={styles.btn}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </div>

      </div>
    </main>
  )
}