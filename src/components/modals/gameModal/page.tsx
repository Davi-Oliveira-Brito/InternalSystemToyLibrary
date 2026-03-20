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
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasFile = imageFile !== null;
  const hasUrl = imageUrl.trim() !== '';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImageUrl(''); // desativa URL
    setImagePreview(URL.createObjectURL(file));
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
    if (e.target.value.trim()) {
      // desativa upload
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const clearFile = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadImage = async (file: File): Promise<string> => {
    const compressed = await compressImage(file);
    const ext = 'jpg';
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('games').upload(path, compressed, {
      contentType: 'image/jpeg',
      upsert: false,
    });
    if (error) throw new Error('Erro ao fazer upload da imagem.');
    const { data } = supabase.storage.from('games').getPublicUrl(path);
    return data.publicUrl;
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

      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      } else if (imageUrl.trim()) {
        finalImageUrl = imageUrl.trim();
      }

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
          {/* Nome */}
          <div className={styles.field}>
            <label className={styles.label}>Nome</label>
            <input className={styles.input} type="text" value={name}
              onChange={(e) => setName(e.target.value)} placeholder="Ex: Uno Cards" />
          </div>

          {/* Categoria */}
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

          {/* Quantidade */}
          <div className={styles.field}>
            <label className={styles.label}>Quantidade</label>
            <input className={styles.input} type="number" min={1} value={totalCopies}
              onChange={(e) => setTotalCopies(e.target.value)} placeholder="Ex: 3" />
          </div>

          {/* Imagem — upload */}
          <div className={`${styles.field} ${hasUrl ? styles.fieldDisabled : ''}`}>
            <label className={styles.label}>Upload de Imagem</label>
            <div className={styles.uploadWrapper}>
              <button type="button" className={styles.uploadBtn}
                onClick={() => !hasUrl && fileInputRef.current?.click()}
                disabled={hasUrl}>
                {imagePreview ? 'Trocar imagem' : 'Escolher arquivo'}
              </button>
              {imagePreview && (
                <div className={styles.previewWrapper}>
                  <Image src={imagePreview} alt="Preview" width={48} height={48} className={styles.preview} />
                  <button type="button" className={styles.clearBtn} onClick={clearFile}>✕</button>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*"
                className={styles.hiddenInput} onChange={handleFileChange} />
            </div>
          </div>

          {/* Imagem — URL */}
          <div className={`${styles.field} ${hasFile ? styles.fieldDisabled : ''}`}>
            <label className={styles.label}>URL da Imagem</label>
            <input className={styles.input} type="text" value={imageUrl}
              onChange={handleUrlChange} placeholder="https://..."
              disabled={hasFile} />
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