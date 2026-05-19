'use client';

import Image from 'next/image';
import styles from './page.module.scss';

interface ConfirmDeleteModalProps {
  gameName: string;
  itemType?: string;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export default function ConfirmDeleteModal({
  gameName,
  itemType = 'jogo',
  onClose,
  onConfirm,
  loading = false,
}: ConfirmDeleteModalProps) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <span className={styles.excluir}>Excluir:</span> {gameName}
          </h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
            <Image src="/close.svg" alt="Fechar" width={20} height={20} />
          </button>
        </div>

        <p className={styles.message}>Tem certeza que deseja excluir esse {itemType}?</p>

        <div className={styles.actions}>
          <button className={styles.btnNo} onClick={onClose} disabled={loading}>
            Não
          </button>
          <button className={styles.btnYes} onClick={onConfirm} disabled={loading}>
            {loading ? 'Excluindo...' : 'Sim'}
          </button>
        </div>
      </div>
    </div>
  );
}