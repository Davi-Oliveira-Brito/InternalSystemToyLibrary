'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import styles from './page.module.scss';

import AdminBanner from '@/components/adminBanner/page';
import UserCard from '@/components/UserCard/page';
import UserModal from '@/components/modals/userModal/page';
import ConfirmDeleteModal from '@/components/modals/deleteGamemodal/page';
import TempPasswordModal from './TempPasswordModal';

interface UserData {
  id: string;
  name: string;
  email: string;
  unidade_slug: string;
  avatar_url: string | null;
  blocked: boolean;
  must_change_password: boolean;
  reset_requested: boolean;
}

export default function AdminUsuarios() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState<{ name: string; password: string } | null>(null);

  useEffect(() => {
    const auth = sessionStorage.getItem('auth');
    const role = sessionStorage.getItem('role');
    if (!auth || role !== 'admin') { router.push('/login'); return; }
    setName(sessionStorage.getItem('name') || '');
    setAvatar(sessionStorage.getItem('avatar_url') || '');
  }, [router]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/usuarios');
      setUsers(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async () => {
    if (!deletingUser) return;
    setDeleteLoading(true);
    try {
      await fetch(`/api/admin/usuarios/${deletingUser.id}`, { method: 'DELETE' });
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
      setDeletingUser(null);
      toast('Estagiário removido.', { className: 'toastAdmin' });
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleResetSenha = async (user: UserData) => {
    try {
      const res = await fetch(`/api/admin/usuarios/${user.id}/reset-senha`, { method: 'POST' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResetPasswordData({ name: user.name, password: data.tempPassword });
      fetchUsers();
    } catch {
      toast.error('Erro ao resetar senha.');
    }
  };

  const handleToggleBlock = async (user: UserData) => {
    try {
      const res = await fetch(`/api/admin/usuarios/${user.id}/bloquear`, { method: 'POST' });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, blocked: updated.blocked } : u));
      toast(updated.blocked ? `${user.name} bloqueado.` : `${user.name} desbloqueado.`, { className: 'toastAdmin' });
    } catch {
      toast.error('Erro ao alterar status.');
    }
  };

  return (
    <main className={styles.page}>
      <AdminBanner
        backgroundImage="/cards/GerenciarJogos.png"
        avatar={avatar}
        username={name}
        title="Gerenciar Usuários"
        subtitle="Crie, edite e remova estagiários do sistema"
      />

      <div className={styles.content}>
        <div className={styles.topBar}>
          <p className={styles.count}>{users.length} estagiário{users.length !== 1 ? 's' : ''}</p>
          <button className={styles.addBtn} onClick={() => setShowAddModal(true)}>
            + Novo Estagiário
          </button>
        </div>

        <div className={styles.list}>
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <UserCard key={i} id="" name="" email="" unidade_slug=""
                  avatar_url={null} blocked={false} must_change_password={false} reset_requested={false}
                  onEdit={() => {}} onDelete={() => {}} onResetSenha={() => {}} onToggleBlock={() => {}}
                  isLoading />
              ))
            : users.map((user) => (
                <UserCard
                  key={user.id}
                  id={user.id}
                  name={user.name}
                  email={user.email}
                  unidade_slug={user.unidade_slug}
                  avatar_url={user.avatar_url}
                  blocked={user.blocked}
                  must_change_password={user.must_change_password}
                  reset_requested={user.reset_requested}
                  onEdit={() => setEditingUser(user)}
                  onDelete={() => setDeletingUser(user)}
                  onResetSenha={() => handleResetSenha(user)}
                  onToggleBlock={() => handleToggleBlock(user)}
                />
              ))}

          {!loading && users.length === 0 && (
            <p className={styles.empty}>Nenhum usuário cadastrado.</p>
          )}
        </div>
      </div>

      {showAddModal && (
        <UserModal onClose={() => setShowAddModal(false)} onSuccess={fetchUsers} />
      )}

      {editingUser && (
        <UserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={fetchUsers}
        />
      )}

      {deletingUser && (
        <ConfirmDeleteModal
          gameName={deletingUser.name}
          onClose={() => setDeletingUser(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}

      {resetPasswordData && (
        <TempPasswordModal
          userName={resetPasswordData.name}
          tempPassword={resetPasswordData.password}
          onClose={() => setResetPasswordData(null)}
        />
      )}
    </main>
  );
}
