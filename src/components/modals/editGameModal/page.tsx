'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { GAME_CATEGORIES, GameCategory } from '@/types';
import styles from './page.module.scss';

interface Game {
  id: string;
  name: string;
  image_url: string | null;
  category: GameCategory | null;
  total_copies: number;
}

interface EditGameModalProps {
  game: Game;
  onClose: () => void;
  onSuccess: () => void;
}

function isSupabaseUrl(url: string | null): boolean {
  if (!url) return false;
  return url.includes('.supabase.co/storage');
}

export default function EditGameModal({ game, onClose, onSuccess }: EditGameModalProps) {
  const [name, setName] = useState(game.name);
  const [category, setCategory] = useState<GameCategory | ''>(game.category || '');
  const [totalCopies, setTotalCopies] = useState(String(game.total_copies));

  // Se a imagem atual veio do Storage, não preenche o campo URL
  const initialUrl = game.image_url && !isSupabaseUrl(game.image_url) ? game.image_url : '';
  const [imageUrl, setImageUrl] = useState(initialUrl);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Se veio do Storage, mostra como preview atual
  const [imagePreview, setImagePreview] = useState<string | null>(
    game.image_url && isSupabaseUrl(game.image_url) ? game.image_url : null
  );
  const [isExistingStorageImage, setIsExistingStorageImage] = useState(
    game.image_url ? isSupabaseUrl(game.image_url) : false
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasFile = imageFile !== null;
  const hasUrl = imageUrl.trim() !== '' && !hasFile;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImageUrl('');
    setIsExistingStorageImage(false);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
    if (e.target.value.trim()) {
      setImageFile(null);
      setImagePreview(null);
      setIsExistingStorageImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setIsExistingStorageImage(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = document.createElement('img');
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const MAX = 1200;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
          else { width = Math.round((width * MAX) / height); height = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.82);
      };
      img.src = url;
    });
  };

  const uploadImage = async (file: File): Promise<string> => {
    const compressed = await compressImage(file);
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
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
      } else if (hasUrl) {
        finalImageUrl = imageUrl.trim();
      } else if (isExistingStorageImage) {
        // Mantém a imagem atual do Storage
        finalImageUrl = game.image_url;
      }

      const res = await fetch(`/api/games/${game.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          image_url: finalImageUrl,
          category: category || null,
          total_copies: Number(totalCopies),
        }),
      });

      if (!res.ok) throw new Error('Erro ao editar jogo.');
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
          <h2 className={styles.title}>Editar</h2>
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

          {/* Upload */}
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
                  <Image src={imagePreview} alt="Preview" width={48} height={48}
                    className={styles.preview} unoptimized />
                  <button type="button" className={styles.clearBtn} onClick={clearImage}>✕</button>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*"
                className={styles.hiddenInput} onChange={handleFileChange} />
            </div>
          </div>

          {/* URL */}
          <div className={`${styles.field} ${hasFile || isExistingStorageImage ? styles.fieldDisabled : ''}`}>
            <label className={styles.label}>URL da Imagem</label>
            <input className={styles.input} type="text" value={imageUrl}
              onChange={handleUrlChange} placeholder="https://..."
              disabled={hasFile || isExistingStorageImage} />
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