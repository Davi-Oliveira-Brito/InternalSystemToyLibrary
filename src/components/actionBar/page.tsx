'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { GAME_CATEGORIES, GameCategory } from '@/types';
import styles from './page.module.scss';

interface ActionBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onAddClick: () => void;
  total: number;
  available: number;
  loaned: number;
  selectedCategory: GameCategory | null;
  onCategoryChange: (category: GameCategory | null) => void;
}

export default function ActionBar({
  search,
  onSearchChange,
  onAddClick,
  total,
  available,
  loaned,
  selectedCategory,
  onCategoryChange,
}: ActionBarProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (cat: GameCategory | null) => {
    onCategoryChange(cat);
    setOpen(false);
  };

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

        <div className={styles.filterWrapper} ref={dropdownRef}>
          <button
            className={`${styles.filterBtn} ${selectedCategory ? styles.filterActive : ''}`}
            onClick={() => setOpen((v) => !v)}
          >
            <span className={styles.filterLabel}>
              {selectedCategory || 'Categoria'}
            </span>
            <Image
              src="/arrow.svg"
              alt=""
              width={12}
              height={12}
              className={`${styles.filterArrow} ${open ? styles.filterArrowOpen : ''}`}
            />
          </button>

          {open && (
            <div className={styles.dropdown}>
              <button
                className={`${styles.dropdownItem} ${!selectedCategory ? styles.dropdownItemActive : ''}`}
                onClick={() => handleSelect(null)}
              >
                Todas
              </button>
              {GAME_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`${styles.dropdownItem} ${selectedCategory === cat ? styles.dropdownItemActive : ''}`}
                  onClick={() => handleSelect(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
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