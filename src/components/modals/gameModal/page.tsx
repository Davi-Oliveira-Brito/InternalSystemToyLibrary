'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { GAME_CATEGORIES, GameCategory } from '@/types';
import { compressImage } from '@/lib/imageUtils';
import styles from './page.module.scss';

interface GameModalProps {
  unidade_slug: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GameModal({ unidade_slug, onClose, onSuccess }: GameModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<GameCategory | ''>('');
  const [totalCopies, setTotalCopies] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const applyFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearFile = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) applyFile(file);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const compressed = await compressImage(file);
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
    const { error } = await supabase.storage.from('games').upload(path, compressed, {
      contentType: 'image/jpeg',
      upsert: false,
    });
    if (error) throw new Error('Erro ao fazer upload da imagem.');
    return supabase.storage.from('games').getPublicUrl(path).data.publicUrl;
  };

  const handleSave = async () => {
    if (!name.trim() || !totalCopies) {
      setError('Nome e quantidade são obrigatórios.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      let finalImageUrl: string | null = null;
      if (imageFile) finalImageUrl = await uploadImage(imageFile);

      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          image_url: finalImageUrl,
          category: category || null,
          total_copies: Number(totalCopies),
          unidade_slug,
        }),
      });

      if (!res.ok) throw new Error('Erro ao cadastrar jogo.');
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
          <h2 className={styles.title}>Adicionar Jogo</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
            <Image src="/close.svg" alt="Fechar" width={20} height={20} />
          </button>
        </div>

        <div className={styles.fields}>
          <div className={styles.field}>
            <label className={styles.label}>Nome</label>
            <input className={styles.input} type="text" value={name}
              onChange={(e) => setName(e.target.value)} placeholder="Ex: Uno Cards" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Categoria</label>
            <select className={styles.input} value={category}
              onChange={(e) => setCategory(e.target.value as GameCategory | '')}>
              <option value="">Selecione...</option>
              {GAME_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Quantidade</label>
            <input className={styles.input} type="number" min={1} value={totalCopies}
              onChange={(e) => setTotalCopies(e.target.value)} placeholder="Ex: 3" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Imagem <span className={styles.optional}>(opcional)</span></label>

            {imagePreview ? (
              <div className={styles.previewZone}>
                <Image src={imagePreview} alt="Preview" width={72} height={72} className={styles.preview} />
                <div className={styles.previewInfo}>
                  <span className={styles.previewName}>{imageFile?.name}</span>
                  <button type="button" className={styles.clearBtn} onClick={clearFile}>
                    Remover
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`${styles.dropZone} ${isDragging ? styles.dropZoneDragging : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <svg className={styles.dropIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span className={styles.dropText}>
                  {isDragging ? 'Solte aqui' : 'Arraste ou clique para selecionar'}
                </span>
                <span className={styles.dropHint}>PNG, JPG, WEBP</span>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className={styles.hiddenInput}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) applyFile(f); }}
            />
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
