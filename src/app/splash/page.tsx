'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Fraunces } from 'next/font/google'
import styles from './page.module.scss'

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300'],
  style: ['italic'],
  display: 'swap',
})

export default function SplashPage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => router.push('/login'), 2700)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <main className={styles.wrapper}>
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.ring1} />
        <div className={styles.ring2} />

        <div className={styles.diceA}>
          <span /><span /><span /><span /><span /><span />
        </div>
        <div className={styles.diceB}>
          <span /><span /><span /><span />
        </div>
        <div className={styles.diceC}>
          <span />
        </div>

        <div className={styles.tokenA} />
        <div className={styles.tokenB} />
        <div className={styles.tokenC} />
      </div>

      <div className={styles.content}>
        <div className={styles.glowWrap}>
          <Image
            src="/logo clara.png"
            alt="Ludoteca"
            width={220}
            height={66}
            className={styles.logo}
            priority
          />
        </div>
        <p className={`${styles.tagline} ${fraunces.className}`}>
          Sistema de Empréstimo de Jogos
        </p>
      </div>

      <div className={styles.progressTrack} aria-hidden="true">
        <div className={styles.progressFill} />
      </div>
    </main>
  )
}
