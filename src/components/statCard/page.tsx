'use client';

import styles from './page.module.scss';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: 'default' | 'green' | 'red' | 'yellow';
  isLoading?: boolean;
  variant?: 'dark' | 'light';
}

export default function StatCard({ label, value, sub, accent = 'default', isLoading, variant = 'dark' }: StatCardProps) {
  if (isLoading) {
    return (
      <div className={`${styles.card} ${variant === 'light' ? styles.cardLight : ''}`}>
        <div className={styles.skeletonLabel} />
        <div className={styles.skeletonValue} />
      </div>
    );
  }

  return (
    <div className={`${styles.card} ${variant === 'light' ? styles.cardLight : ''}`}>
      <span className={styles.label}>{label}</span>
      <span className={`${styles.value} ${styles[accent]}`}>{value}</span>
      {sub && <span className={styles.sub}>{sub}</span>}
    </div>
  );
}