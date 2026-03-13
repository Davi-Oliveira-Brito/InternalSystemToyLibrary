'use client';

import Image from 'next/image';
import styles from './page.module.scss';

interface GameCardProps {
  id: string;
  name: string;
  image: string;
  totalCopies: number;
  availableCopies: number;
  mode: 'manage' | 'loan';
  onEdit?: () => void;
  onDelete?: () => void;
  onLoan?: () => void;
  isLoading?: boolean;
}

export default function GameCard({
  id,
  name,
  image,
  totalCopies,
  availableCopies,
  mode,
  onEdit,
  onDelete,
  onLoan,
  isLoading = false,
}: GameCardProps) {
  const unavailable = availableCopies === 0;

  if (isLoading) {
    return (
      <div className={`${styles.card} ${styles.skeleton}`}>
        <div className={styles.imageSkeleton} />
        <div className={styles.bodySkeleton}>
          <div className={styles.skeletonLine} style={{ width: '60%' }} />
          <div className={styles.skeletonLine} style={{ width: '40%' }} />
          <div className={styles.skeletonLine} style={{ width: '40%' }} />
          <div className={styles.skeletonButtons} />
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.card} ${unavailable && mode === 'loan' ? styles.unavailable : ''}`}>
      <div className={styles.imageWrapper}>
        <Image
          src={image || '/placeholder-game.png'}
          alt={name}
          fill
          className={styles.image}
          sizes="(max-width: 768px) 40vw, 200px"
        />
      </div>

      <div className={styles.body}>
        <h2 className={styles.name}>{name}</h2>

        <div className={styles.info}>
          <span className={styles.infoRow}>
            Total: <strong>{totalCopies}</strong>
          </span>
          <span className={styles.infoRow}>
            Disponível:{' '}
            <strong className={availableCopies === 0 ? styles.zero : ''}>
              {availableCopies}
            </strong>
          </span>
        </div>

        <div className={styles.actions}>
          {mode === 'manage' && (
            <>
              <button className={styles.btnEdit} onClick={onEdit} aria-label="Editar jogo">
                <EditIcon />
                Editar
              </button>
              <button className={styles.btnDelete} onClick={onDelete} aria-label="Excluir jogo">
                <CloseIcon />
                Excluir
              </button>
            </>
          )}

          {mode === 'loan' && (
            <button
              className={styles.btnLoan}
              onClick={onLoan}
              disabled={unavailable}
              aria-label="Emprestar jogo"
            >
              {unavailable ? 'Indisponível' : 'Emprestar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}