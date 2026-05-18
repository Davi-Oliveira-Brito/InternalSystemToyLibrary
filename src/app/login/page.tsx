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

  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)

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
      } else if (data.must_change_password) {
        router.push('/trocar-senha')
      } else {
        toast(`Bem vindo ${data.name}`, { duration: 3500, className: 'toast' })
        router.push('/home')
      }
    } else if (data.blocked) {
      toast.error('Conta bloqueada. Entre em contato com o administrador.')
    } else {
      toast.error('Email ou senha incorretos.')
    }

    setLoading(false)
  }

  async function handleForgot() {
    if (!forgotEmail.trim()) return
    setForgotLoading(true)
    await fetch('/api/auth/solicitar-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: forgotEmail.trim() }),
    })
    setForgotLoading(false)
    setForgotSent(true)
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

        {!forgotOpen ? (
          <>
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

            <button
              className={styles.forgotLink}
              onClick={() => setForgotOpen(true)}
            >
              Esqueci a senha
            </button>
          </>
        ) : (
          <div className={styles.forgotBox}>
            <p className={styles.forgotTitle}>Esqueci a senha</p>

            {forgotSent ? (
              <p className={styles.forgotSuccess}>
                Solicitação enviada! Aguarde o administrador entrar em contato com sua nova senha.
              </p>
            ) : (
              <>
                <p className={styles.forgotDesc}>
                  Informe seu email e o administrador receberá sua solicitação.
                </p>
                <div className={styles.field}>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder=" "
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleForgot()}
                    autoComplete="email"
                  />
                  <label className={styles.label}>Email</label>
                </div>
                <button
                  className={styles.button}
                  onClick={handleForgot}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? 'Enviando...' : 'Solicitar reset'}
                </button>
              </>
            )}

            <button
              className={styles.forgotLink}
              onClick={() => { setForgotOpen(false); setForgotSent(false); setForgotEmail('') }}
            >
              Voltar ao login
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
