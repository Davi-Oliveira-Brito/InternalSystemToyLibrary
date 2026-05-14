"use client"

import Image from 'next/image'
import Link from 'next/link'
import styles from './page.module.scss'

interface Props {
  title: string
  subtitle: string
  image: string
  href: string
}

export default function MenuCard({ title, subtitle, image, href }: Props) {
  return (
    <Link href={href} className={styles.card}>
      <Image
        src={image}
        alt={title}
        fill
        className={styles.img}
        sizes="(max-width: 768px) 100vw, 700px"
      />
      <div className={styles.overlay} />
      <div className={styles.content}>
        <div className={styles.text}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
        <span className={styles.arrow}>›</span>
      </div>
    </Link>
  )
}
