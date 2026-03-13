'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import styles from './page.module.scss'
import MenuCard from '@/components/card/page'

export default function HomePage() {
  const router = useRouter()
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (!sessionStorage.getItem('auth')) {
      router.push('/login')
      return
    }
    setEmail(sessionStorage.getItem('email') || '')
  }, [])

  const firstName = email.split(' ')[0]
  //username
  const initial = firstName.charAt(0).toUpperCase()

  return (
    <main className={styles.main}>

      <header className={styles.header}>
        <Image
          src="/logo.png"
          alt="Ludoteca"
          width={160}
          height={50}
          className={styles.logo}
          priority
        />
        <div className={styles.avatar}>
          {initial}
        </div>
      </header>

      <div className={styles.greeting}>
        <p className={styles.greetingText}>
          Olá, <strong>{firstName}!</strong>
        </p>
        <p className={styles.greetingSubtitle}>
          Seja bem-vindo(a) ao <strong>Sistema Interno Ludoteca</strong>
        </p>
      </div>

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