'use client';

import styles from './page.module.scss';

interface UserCardProps {
  id: string;
  name: string;
  email: string;
  unidade_slug: string;
  onEdit: () => void;
  onDelete: () => void;
  isLoading?: boolean;
}

const UNIDADE_NAMES: Record<string, string> = {
  'morumbi': 'Morumbi',
  'valinhos': 'Valinhos',
  'panamby': 'Panamby',
  'vila-andrade': 'Vila Andrade',
}

export default function UserCard({ id, name, email, unidade_slug, onEdit, onDelete, isLoading }: UserCardProps) {
  const initial = name ? name.charAt(0).toUpperCase() : '?';

  if (isLoading) {
    return (
      <div className={`${styles.card} ${styles.skeleton}`}>
        <div className={styles.skeletonAvatar} />
        <div className={styles.skeletonBody}>
          <div className={styles.skeletonLine} style={{ width: '55%' }} />
          <div className={styles.skeletonLine} style={{ width: '70%' }} />
          <div className={styles.skeletonLine} style={{ width: '40%' }} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.avatar}>{initial}</div>

      <div className={styles.body}>
        <span className={styles.name}>{name}</span>
        <span className={styles.email}>{email}</span>
        <span className={styles.unidade}>{UNIDADE_NAMES[unidade_slug] ?? unidade_slug}</span>
      </div>

      <div className={styles.actions}>
        <button className={styles.btnEdit} onClick={onEdit} aria-label="Editar usuário">
          Editar
        </button>
        <button className={styles.btnDelete} onClick={onDelete} aria-label="Excluir usuário">
          Excluir
        </button>
      </div>
    </div>
  );
}