'use client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import styles from './page.module.scss'

export default function SplashPage() {
  const router = useRouter()

  return (
    <main className={styles.wrapper} onClick={() => router.push('/login')}>
      <div className={styles.content}>
        <Image
          src="/logo.png"
          alt="Ludoteca"
          width={220}
          height={80}
          className={styles.logo}
          priority
        />
      </div>
      <p className={styles.hint}>Clique na tela para prosseguir</p>
    </main>
  )
}