'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './page.module.scss';

interface UserCardProps {
  id: string;
  name: string;
  email: string;
  unidade_slug: string;
  avatar_url: string | null;
  blocked: boolean;
  must_change_password: boolean;
  reset_requested: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onResetSenha: () => void;
  onToggleBlock: () => void;
  isLoading?: boolean;
}

const UNIDADE_NAMES: Record<string, string> = {
  'morumbi': 'Morumbi',
  'valinhos': 'Valinhos',
  'panamby': 'Panamby',
  'vila-andrade': 'Vila Andrade',
}

export default function UserCard({
  name, email, unidade_slug, avatar_url, blocked, must_change_password, reset_requested,
  onEdit, onDelete, onResetSenha, onToggleBlock, isLoading,
}: UserCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const initial = name ? name.charAt(0).toUpperCase() : '?';

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  if (isLoading) {
    return (
      <div className={`${styles.card} ${styles.skeleton}`}>
        <div className={styles.skeletonAvatar} />
        <div className={styles.skeletonBody}>
          <div className={styles.skeletonLine} style={{ width: '45%' }} />
          <div className={styles.skeletonLine} style={{ width: '65%' }} />
          <div className={styles.skeletonLine} style={{ width: '30%' }} />
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.card} ${blocked ? styles.cardBlocked : ''}`}>
      <div className={`${styles.avatar} ${blocked ? styles.avatarBlocked : ''}`}>
        {avatar_url
          ? <Image src={avatar_url} alt={name} width={44} height={44} className={styles.avatarImg} />
          : initial
        }
      </div>

      <div className={styles.body}>
        <span className={styles.name}>{name}</span>
        <span className={styles.email}>{email}</span>
        <div className={styles.badges}>
          <span className={styles.unidade}>{UNIDADE_NAMES[unidade_slug] ?? unidade_slug}</span>
          {blocked && <span className={styles.badgeBlocked}>Bloqueado</span>}
          {reset_requested && !blocked && (
            <span className={styles.badgeReset}>Solicitou reset</span>
          )}
          {must_change_password && !blocked && !reset_requested && (
            <span className={styles.badgePending}>Senha pendente</span>
          )}
        </div>
      </div>

      <div className={styles.menuWrapper} ref={menuRef}>
        <button
          className={styles.menuBtn}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Ações"
        >
          <span />
          <span />
          <span />
          {reset_requested && <div className={styles.menuDot} />}
        </button>

        {menuOpen && (
          <div className={styles.dropdown}>
            <button className={styles.dropdownItem} onClick={() => { onEdit(); setMenuOpen(false); }}>
              Trocar unidade
            </button>
            <button className={styles.dropdownItem} onClick={() => { onResetSenha(); setMenuOpen(false); }}>
              Resetar senha
            </button>
            <button
              className={`${styles.dropdownItem} ${blocked ? styles.dropdownUnblock : styles.dropdownBlock}`}
              onClick={() => { onToggleBlock(); setMenuOpen(false); }}
            >
              {blocked ? 'Desbloquear' : 'Bloquear'}
            </button>
            <div className={styles.dropdownDivider} />
            <button
              className={`${styles.dropdownItem} ${styles.dropdownDelete}`}
              onClick={() => { onDelete(); setMenuOpen(false); }}
            >
              Excluir
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
