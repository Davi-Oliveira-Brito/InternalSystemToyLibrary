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
  observacao?: string | null;
}

interface ReturnModalProps {
  gameName: string;
  loans: Loan[];
  onClose: () => void;
  onReturn: (loanId: string) => Promise<void>;
}

const PRAZO_MINUTOS = 30;

function getElapsed(loaned_at: string, now: number) {
  const iso = loaned_at.endsWith('Z') ? loaned_at : loaned_at + 'Z';
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000));
}

export default function ReturnModal({ gameName, loans, onClose, onReturn }: ReturnModalProps) {
  const [returningId, setReturningId] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleReturn = async (loanId: string) => {
    setReturningId(loanId);
    try {
      await onReturn(loanId);
    } finally {
      setReturningId(null);
    }
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
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
            loans.map((loan) => {
              const minutes = getElapsed(loan.loaned_at, now);
              const overdue = minutes > PRAZO_MINUTOS;

              return (
                <div key={loan.id} className={`${styles.loanItem} ${overdue ? styles.overdueItem : ''}`}>
                  <div className={styles.loanInfo}>
                    <div className={styles.loanTop}>
                      <span className={styles.studentName}>{loan.student_name}</span>
                      {overdue && (
                        <span className={styles.overdueTag}>+{minutes - PRAZO_MINUTOS} min atrasado</span>
                      )}
                    </div>
                    <span className={styles.studentDetails}>
                      RA: {loan.student_ra} · Turma: {loan.student_class}
                    </span>
                    <span className={styles.loanedAt}>
                      Emprestado às {formatTime(loan.loaned_at)} · <strong>{minutes} min</strong>
                    </span>
                    {loan.observacao && (
                      <span className={styles.observacao}>📝 {loan.observacao}</span>
                    )}
                  </div>
                  <button
                    className={styles.btnReturn}
                    onClick={() => handleReturn(loan.id)}
                    disabled={returningId === loan.id}
                  >
                    {returningId === loan.id ? '...' : 'Devolver'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
