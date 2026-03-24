'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { compressAvatar } from '@/lib/imageUtils';
import Image from 'next/image';
import styles from './page.module.scss';
import { toast } from 'sonner';

export default function Perfil() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [unidade_slug, setUnidadeSlug] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const auth = sessionStorage.getItem('auth');
    if (!auth) { router.push('/login'); return; }

    const storedEmail = sessionStorage.getItem('email') || '';
    const storedName = sessionStorage.getItem('name') || '';
    const storedAvatar = sessionStorage.getItem('avatar_url') || '';
    const storedUnidade = sessionStorage.getItem('unidade_slug') || '';

    setEmail(storedEmail);
    setName(storedName);
    setNewName(storedName);
    setAvatarUrl(storedAvatar || null);
    setUnidadeSlug(storedUnidade);
  }, [router]);

  const initial = name ? name.charAt(0).toUpperCase() : '?';

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    sessionStorage.clear()
    router.push('/login')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    const { supabase } = await import('@/lib/supabase');
    const compressed = await compressAvatar(file);
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
    const { error } = await supabase.storage.from('avatars').upload(path, compressed, {
      contentType: 'image/jpeg',
      upsert: false,
    });
    if (error) throw new Error('Erro ao fazer upload da foto.');
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!newName.trim()) {
      toast('Nome não pode ficar vazio.' , {className: "toast"});
      return;
    }

    // Se preencheu nova senha, exige a atual
    if (newPassword.trim() && !currentPassword.trim()) {
      toast('Informe a senha atual para trocar a senha.' , {className: "toast"});
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let finalAvatarUrl: string | null | undefined = undefined;

      if (imageFile) {
        finalAvatarUrl = await uploadAvatar(imageFile);
      }

      const body: any = { email, name: newName.trim() };
      if (newPassword.trim()) {
        body.currentPassword = currentPassword.trim();
        body.newPassword = newPassword.trim();
      }
      if (finalAvatarUrl !== undefined) body.avatar_url = finalAvatarUrl;

      const res = await fetch('/api/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error || 'Erro ao salvar.');
      }

      sessionStorage.setItem('name', resData.name);
      if (resData.avatar_url) sessionStorage.setItem('avatar_url', resData.avatar_url);

      setName(resData.name);
      setAvatarUrl(resData.avatar_url);
      setImageFile(null);
      setImagePreview(null);
      setCurrentPassword('');
      setNewPassword('');
      toast('Perfil atualizado com sucesso!' , {className: "toast"});
    } catch (err: any) {
      toast(err.message || 'Erro ao salvar. Tente novamente.', {className: "toastAdmin"});
    } finally {
      setLoading(false);
    }
  };

  const currentAvatar = imagePreview || avatarUrl;

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.back()}>
          ← Voltar
        </button>
        <h1 className={styles.pageTitle}>Meu Perfil</h1>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Sair
        </button>
      </div>

      <div className={styles.content}>
        {/* Avatar */}
        <div className={styles.avatarSection}>
          <button className={styles.avatarWrapper} onClick={() => fileInputRef.current?.click()}>
            {currentAvatar ? (
              <Image src={currentAvatar} alt="Avatar" fill
                className={styles.avatarImage} unoptimized />
            ) : (
              <span className={styles.avatarInitial}>{initial}</span>
            )}
            <div className={styles.avatarOverlay}>
              <span>Trocar foto</span>
            </div>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*"
            className={styles.hiddenInput} onChange={handleFileChange} />
          <p className={styles.avatarHint}>Clique na foto para alterar</p>
        </div>

        {/* Infos fixas */}
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Email</span>
          <span className={styles.infoValue}>{email}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Unidade</span>
          <span className={styles.infoValue}>{unidade_slug}</span>
        </div>

        {/* Nome */}
        <div className={styles.field}>
          <label className={styles.label}>Nome</label>
          <input className={styles.input} type="text" value={newName}
            onChange={(e) => setNewName(e.target.value)} />
        </div>

        {/* Troca de senha */}
        <div className={styles.passwordSection}>
          <p className={styles.passwordTitle}>Trocar senha</p>
          <div className={styles.field}>
            <label className={styles.label}>Senha atual</label>
            <input className={styles.input} type="password" value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Nova senha</label>
            <input className={styles.input} type="password" value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Deixe vazio para não alterar" />
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.successMsg}>{success}</p>}

        <button className={styles.saveBtn} onClick={handleSave} disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar alterações'}
        </button>


      </div>
    </main>
  );
}