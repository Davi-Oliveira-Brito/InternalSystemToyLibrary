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
  const [unidade_slug, setUnidadeSlug] = useState(user?.unidade_slug || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSave = async () => {
    if (isEdit) {
      if (!unidade_slug) { setError('Selecione uma unidade.'); return; }
    } else {
      if (!name.trim() || !email.trim() || !unidade_slug) {
        setError('Todos os campos são obrigatórios.');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      const url = isEdit ? `/api/admin/usuarios/${user!.id}` : '/api/admin/usuarios';
      const method = isEdit ? 'PUT' : 'POST';
      const body = isEdit
        ? { unidade_slug }
        : { name: name.trim(), email: email.trim(), unidade_slug };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Erro ao salvar usuário.');
      }

      const data = await res.json();
      onSuccess();

      if (!isEdit && data.tempPassword) {
        setTempPassword(data.tempPassword);
      } else {
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (tempPassword) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <h2 className={styles.title}>Estagiário criado!</h2>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
              <Image src="/close.svg" alt="Fechar" width={20} height={20} />
            </button>
          </div>

          <div className={styles.passwordBox}>
            <p className={styles.passwordLabel}>Senha temporária — compartilhe com o estagiário:</p>
            <div className={styles.passwordRow}>
              <span className={styles.passwordValue}>{tempPassword}</span>
              <button className={styles.copyBtn} onClick={handleCopy}>
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            <p className={styles.passwordHint}>O estagiário será obrigado a criar uma nova senha no primeiro login.</p>
          </div>

          <div className={styles.actions}>
            <button className={styles.btnSave} onClick={onClose}>Fechar</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{isEdit ? 'Trocar Unidade' : 'Novo Estagiário'}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
            <Image src="/close.svg" alt="Fechar" width={20} height={20} />
          </button>
        </div>

        <div className={styles.fields}>
          {!isEdit && (
            <>
              <div className={styles.field}>
                <label className={styles.label}>Nome</label>
                <input className={styles.input} type="text" value={name}
                  onChange={(e) => setName(e.target.value)} placeholder="Nome completo" />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input className={styles.input} type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" />
              </div>
            </>
          )}

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
