'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './page.module.scss';

interface Loan {
  id: string;
  student_name: string;
  student_ra: string;
  student_class: string;
  loaned_at: string;
}

interface ReturnModalProps {
  gameName: string;
  loans: Loan[];
  onClose: () => void;
  onReturn: (loanId: string) => Promise<void>;
}

export default function ReturnModal({ gameName, loans, onClose, onReturn }: ReturnModalProps) {
  const [returningId, setReturningId] = useState<string | null>(null);

  const handleReturn = async (loanId: string) => {
    setReturningId(loanId);
    try {
      await onReturn(loanId);
    } finally {
      setReturningId(null);
    }
  };

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Devolver</h2>
            <p className={styles.gameName}>{gameName}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
            <Image src="/close.svg" alt="Fechar" width={20} height={20} />
          </button>
        </div>

        <div className={styles.list}>
          {loans.length === 0 ? (
            <p className={styles.empty}>Nenhum empréstimo ativo.</p>
          ) : (
            loans.map((loan) => (
              <div key={loan.id} className={styles.loanItem}>
                <div className={styles.loanInfo}>
                  <span className={styles.studentName}>{loan.student_name}</span>
                  <span className={styles.studentDetails}>
                    RA: {loan.student_ra} · Turma: {loan.student_class}
                  </span>
                  <span className={styles.loanedAt}>
                    Emprestado às {formatTime(loan.loaned_at)}
                  </span>
                </div>
                <button
                  className={styles.btnReturn}
                  onClick={() => handleReturn(loan.id)}
                  disabled={returningId === loan.id}
                >
                  {returningId === loan.id ? '...' : 'Devolver'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}