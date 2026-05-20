import styles from './AdminPageHeader.module.scss'

interface AdminPageHeaderProps {
  title: string
  subtitle?: string
}

export default function AdminPageHeader({ title, subtitle }: AdminPageHeaderProps) {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  )
}
