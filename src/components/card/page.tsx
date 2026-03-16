"use client"

import Image from 'next/image'
import Link from 'next/link'
import styles from './page.module.scss'

interface Props {
  title: string
  subtitle: string
  image: string
  href: string
  variant?: 'dark' | 'light'
}

export default function MenuCard({ title, subtitle, image, href, variant = 'dark' }: Props) {
  return (
    <Link href={href} className={`${styles.card} ${variant === 'light' ? styles.cardLight : ''}`}>
      <div className={styles.image}>
        <Image
          src={image}
          alt={title}
          fill
          className={styles.img}
        />
      </div>
      <div className={styles.content}>
        <div>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
        <span className={styles.saiba}>saiba mais</span>
      </div>
    </Link>
  )
}