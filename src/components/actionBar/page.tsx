'use client';

import Image from 'next/image';
import styles from './page.module.scss';

interface ActionBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onAddClick: () => void;
  total: number;
  available: number;
  loaned: number;
  onFilterCategory?: () => void;
}

export default function ActionBar({
  search,
  onSearchChange,
  onAddClick,
  total,
  available,
  loaned,
  onFilterCategory,
}: ActionBarProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.controls}>
        <button className={styles.addButton} onClick={onAddClick} aria-label="Adicionar jogo">
          <Image src="/add.svg" alt="Adicionar" width={18} height={18} />
        </button>

        <div className={styles.searchWrapper}>
          <Image src="/search.svg" alt="Buscar" width={16} height={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Buscar Jogo..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <button className={styles.filterBtn} onClick={onFilterCategory}>
          <span className={styles.filterLabel}>Categoria</span>
          <Image src="/arrow.svg" alt="Filtrar categoria" width={12} height={12} />
        </button>
      </div>

      <div className={styles.stats}>
        <span className={styles.statWhite}>
          Total: <strong>{total}</strong>
        </span>
        <span className={styles.statGreen}>
          Disponíveis: <strong>{available}</strong>
        </span>
        <span className={styles.statRed}>
          Emprestados: <strong>{loaned}</strong>
        </span>
      </div>
    </div>
  );
}