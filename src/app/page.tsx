'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Raleway } from 'next/font/google'
import styles from './splash/page.module.scss'

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['200'],
  display: 'swap',
})

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => router.push('/login'), 2800)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <main className={styles.wrapper}>
      <div className={styles.content}>
        <Image
          src="/logo clara.png"
          alt="Ludoteca"
          width={200}
          height={60}
          className={styles.logo}
          priority
        />
        <p className={`${styles.tagline} ${raleway.className}`}>
          sistema de controle da Ludoteca
        </p>
      </div>

      <div className={styles.trace} aria-hidden="true" />
    </main>
  )
}