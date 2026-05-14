'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import styles from './page.module.scss'
import MenuCard from '@/components/card/page'

const PRAZO_MINUTOS = 30

export default function HomePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('')
  const [overdueCount, setOverdueCount] = useState(0)

  useEffect(() => {
    if (!sessionStorage.getItem('auth')) {
      router.push('/login')
      return
    }
    setAvatar(sessionStorage.getItem('avatar_url') || '')
    setName(sessionStorage.getItem('name') || '')

    const unidade = sessionStorage.getItem('unidade_slug')
    if (!unidade) return

    const checkOverdue = () => {
      fetch(`/api/loans?unidade_slug=${unidade}`)
        .then(r => r.json())
        .then((loans: { loaned_at: string }[]) => {
          const now = Date.now()
          const count = loans.filter((l: { loaned_at: string }) => {
            const iso = l.loaned_at.endsWith('Z') ? l.loaned_at : l.loaned_at + 'Z'
            return (now - new Date(iso).getTime()) > PRAZO_MINUTOS * 60000
          }).length
          setOverdueCount(count)
        })
        .catch(() => {})
    }

    checkOverdue()
    const interval = setInterval(checkOverdue, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleAvatarClick = () => {
    router.push('/perfil');
  };

  const firstName = name.split(' ')[0]
  //username
  const initial = firstName.charAt(0).toUpperCase()

  return (
    <main className={styles.main}>

      <header className={styles.header}>
        <Image
          src="/logo escura.png"
          alt="Ludoteca"
          width={160}
          height={50}
          className={styles.logo}
          priority
        />
        <button className={styles.avatar} onClick={handleAvatarClick} aria-label="Ir para perfil">
          {avatar ? (
            <Image
              src={avatar}
              alt="Foto"
              width={44}
              height={44}
              className={styles.avatar}
              unoptimized
              priority
            />
          ) : (
            <div className={styles.avatarBtn}>
              {initial}
            </div>
          )}
        </button>
      </header>

      <div className={styles.greeting}>
        <p className={styles.greetingText}>
          Olá, <strong>{firstName}!</strong>
        </p>
        <p className={styles.greetingSubtitle}>
          Seja bem-vindo(a) ao <strong>Sistema Interno Ludoteca</strong>
        </p>
      </div>

      {overdueCount > 0 && (
        <Link href="/trabalho" className={styles.overdueAlert}>
          <div className={styles.overdueIcon}>⚠️</div>
          <div className={styles.overdueText}>
            <strong>{overdueCount} {overdueCount === 1 ? 'jogo' : 'jogos'} com prazo vencido</strong>
            <span>Acesse o Modo Trabalho para registrar as devoluções</span>
          </div>
          <span className={styles.overdueArrow}>›</span>
        </Link>
      )}

      <div className={styles.cards}>
        <MenuCard
          title="Gerenciar Jogos"
          subtitle="Cadastre, edite e organize os jogos disponíveis"
          image="/cards/GerenciarJogos.png"
          href="/jogos"
        />
        <MenuCard
          title="Resumo da Semana"
          subtitle="Visualize estatísticas de empréstimos"
          image="/cards/Analises.png"
          href="/analises"
        />
        <MenuCard
          title="Modo Trabalho"
          subtitle="Registre empréstimos e devoluções"
          image="/cards/ModoTrabalho.png"
          href="/trabalho"
        />
      </div>

    </main>
  )
}