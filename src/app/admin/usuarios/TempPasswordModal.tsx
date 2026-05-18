'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from '@/components/modals/userModal/page.module.scss';

interface Props {
  userName: string;
  tempPassword: string;
  onClose: () => void;
}

export default function TempPasswordModal({ userName, tempPassword, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Senha resetada</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
            <Image src="/close.svg" alt="Fechar" width={20} height={20} />
          </button>
        </div>

        <div className={styles.passwordBox}>
          <p className={styles.passwordLabel}>Nova senha temporária de <strong>{userName}</strong>:</p>
          <div className={styles.passwordRow}>
            <span className={styles.passwordValue}>{tempPassword}</span>
            <button className={styles.copyBtn} onClick={handleCopy}>
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
          <p className={styles.passwordHint}>O estagiário será obrigado a criar uma nova senha no próximo login.</p>
        </div>

        <div className={styles.actions}>
          <button className={styles.btnSave} onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
}
