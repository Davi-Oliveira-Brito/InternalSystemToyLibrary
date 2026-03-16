'use client';

import { useState } from 'react';
import Image from 'next/image';
import { UNIDADES } from '@/types';
import styles from './page.module.scss';

interface UserData {
  id?: string;
  name: string;
  email: string;
  unidade_slug: string;
}

interface UserModalProps {
  user?: UserData;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserModal({ user, onClose, onSuccess }: UserModalProps) {
  const isEdit = !!user?.id;
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [unidade_slug, setUnidadeSlug] = useState(user?.unidade_slug || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim() || !email.trim() || !unidade_slug) {
      setError('Nome, email e unidade são obrigatórios.');
      return;
    }
    if (!isEdit && !password.trim()) {
      setError('Senha é obrigatória para novo usuário.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const url = isEdit ? `/api/admin/usuarios/${user.id}` : '/api/admin/usuarios';
      const method = isEdit ? 'PUT' : 'POST';

      const body: any = { name: name.trim(), email: email.trim(), unidade_slug };
      if (password.trim()) body.password = password.trim();

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Erro ao salvar usuário.');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{isEdit ? 'Editar Usuário' : 'Novo Usuário'}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
            <Image src="/close.svg" alt="Fechar" width={20} height={20} />
          </button>
        </div>

        <div className={styles.fields}>
          <div className={styles.field}>
            <label className={styles.label}>Nome</label>
            <input className={styles.input} type="text" value={name}
              onChange={(e) => setName(e.target.value)} placeholder="Nome completo" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input className={styles.input} type="text" value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              {isEdit ? 'Nova Senha (deixe vazio para manter)' : 'Senha'}
            </label>
            <input className={styles.input} type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Unidade</label>
            <select className={styles.input} value={unidade_slug}
              onChange={(e) => setUnidadeSlug(e.target.value)}>
              <option value="">Selecione...</option>
              {UNIDADES.map((u) => (
                <option key={u.slug} value={u.slug}>{u.name}</option>
              ))}
            </select>
          </div>

          {error && <p className={styles.error}>{error}</p>}
        </div>

        <div className={styles.actions}>
          <button className={styles.btnCancel} onClick={onClose} disabled={loading}>Cancelar</button>
          <button className={styles.btnSave} onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}