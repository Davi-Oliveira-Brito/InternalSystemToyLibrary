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
  onFilterOrder?: () => void;
}

export default function ActionBar({
  search,
  onSearchChange,
  onAddClick,
  total,
  available,
  loaned,
  onFilterCategory,
  onFilterOrder,
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
          Categoria
          <Image src="/arrow.svg" alt="" width={12} height={12} />
        </button>

        <button className={styles.filterBtn} onClick={onFilterOrder}>
          Ordenar
          <Image src="/arrow.svg" alt="" width={12} height={12} />
        </button>
      </div>

      <div className={styles.stats}>
        <span className={styles.statItem}>
          Total: <strong className={styles.statWhite}>{total}</strong>
        </span>
        <span className={styles.statItem}>
          Disponíveis: <strong className={styles.statGreen}>{available}</strong>
        </span>
        <span className={styles.statItem}>
          Emprestados: <strong className={styles.statRed}>{loaned}</strong>
        </span>
      </div>
    </div>
  );
}