'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './page.module.scss';

interface Game {
  id: string;
  name: string;
  image: string;
  total_copies: number;
}

interface EditGameModalProps {
  game: Game;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditGameModal({ game, onClose, onSuccess }: EditGameModalProps) {
  const [name, setName] = useState(game.name);
  const [image, setImage] = useState(game.image || '');
  const [totalCopies, setTotalCopies] = useState(String(game.total_copies));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim() || !totalCopies) {
      setError('Nome e quantidade são obrigatórios.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/games/${game.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          image: image.trim() || null,
          total_copies: Number(totalCopies),
        }),
      });

      if (!res.ok) throw new Error('Erro ao editar jogo.');

      onSuccess();
      onClose();
    } catch (err) {
      setError('Erro ao salvar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Editar</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
            <Image src="/close.svg" alt="Fechar" width={20} height={20} />
          </button>
        </div>

        <div className={styles.fields}>
          <div className={styles.field}>
            <label className={styles.label}>Nome</label>
            <input
              className={styles.input}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Uno Cards"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>URL da Imagem</label>
            <input
              className={styles.input}
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Quantidade</label>
            <input
              className={styles.input}
              type="number"
              min={1}
              value={totalCopies}
              onChange={(e) => setTotalCopies(e.target.value)}
              placeholder="Ex: 3"
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}
        </div>

        <div className={styles.actions}>
          <button className={styles.btnCancel} onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button className={styles.btnSave} onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}