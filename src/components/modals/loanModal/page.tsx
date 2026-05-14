'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './page.module.scss';

interface LoanModalProps {
  gameId: string;
  gameName: string;
  unidade_slug: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LoanModal({ gameId, gameName, unidade_slug, onClose, onSuccess }: LoanModalProps) {
  const [studentName, setStudentName] = useState('');
  const [studentRa, setStudentRa] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!studentName.trim() || !studentRa.trim() || !studentClass.trim()) {
      setError('Nome, RA e Turma são obrigatórios.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_id: gameId,
          game_name: gameName,
          student_name: studentName.trim(),
          student_ra: studentRa.trim(),
          student_class: studentClass.trim(),
          unidade_slug,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro ao registrar empréstimo.');
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setError('Erro ao salvar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Emprestar</h2>
            <p className={styles.gameName}>{gameName}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
            <Image src="/close.svg" alt="Fechar" width={20} height={20} />
          </button>
        </div>

        <div className={styles.fields}>
          <div className={styles.field}>
            <label className={styles.label}>Nome do Aluno</label>
            <input className={styles.input} type="text" value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Ex: João Silva" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>RA</label>
            <input className={styles.input} type="text" value={studentRa}
              onChange={(e) => setStudentRa(e.target.value)}
              placeholder="Ex: 123456" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Turma</label>
            <input className={styles.input} type="text" value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
              placeholder="Ex: 9A" />
          </div>

          {error && <p className={styles.error}>{error}</p>}
        </div>

        <div className={styles.actions}>
          <button className={styles.btnCancel} onClick={onClose} disabled={loading}>Cancelar</button>
          <button className={styles.btnSave} onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}
