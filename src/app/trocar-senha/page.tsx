'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import styles from './page.module.scss'

export default function TrocarSenhaPage() {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    setError('')

    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/trocar-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao trocar senha.')
      }

      toast('Senha criada com sucesso!', { duration: 3000, className: 'toast' })
      router.push('/home')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <Image
          src="/logo clara.png"
          alt="Ludoteca"
          width={180}
          height={65}
          className={styles.logo}
          priority
        />

        <div className={styles.card}>
          <h1 className={styles.title}>Criar nova senha</h1>
          <p className={styles.subtitle}>Defina uma senha pessoal para continuar.</p>

          <div className={styles.fields}>
            <div className={styles.field}>
              <input
                type={showNew ? 'text' : 'password'}
                className={styles.input}
                placeholder=" "
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
              <label className={styles.label}>Nova senha</label>
              <button type="button" className={styles.toggle} onClick={() => setShowNew(p => !p)}>
                <Image src={showNew ? '/openedEyes.svg' : '/closedEyes.svg'} alt="toggle" width={20} height={20} />
              </button>
            </div>

            <div className={styles.field}>
              <input
                type={showConfirm ? 'text' : 'password'}
                className={styles.input}
                placeholder=" "
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
              <label className={styles.label}>Confirmar senha</label>
              <button type="button" className={styles.toggle} onClick={() => setShowConfirm(p => !p)}>
                <Image src={showConfirm ? '/openedEyes.svg' : '/closedEyes.svg'} alt="toggle" width={20} height={20} />
              </button>
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.button} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Salvando...' : 'Criar senha'}
          </button>
        </div>
      </div>
    </main>
  )
}
