'use client';

import styles from './page.module.scss';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: 'default' | 'green' | 'red' | 'yellow';
  isLoading?: boolean;
}

export default function StatCard({ label, value, sub, accent = 'default', isLoading }: StatCardProps) {
  if (isLoading) {
    return (
      <div className={styles.card}>
        <div className={styles.skeletonLabel} />
        <div className={styles.skeletonValue} />
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <span className={styles.label}>{label}</span>
      <span className={`${styles.value} ${styles[accent]}`}>{value}</span>
      {sub && <span className={styles.sub}>{sub}</span>}
    </div>
  );
}