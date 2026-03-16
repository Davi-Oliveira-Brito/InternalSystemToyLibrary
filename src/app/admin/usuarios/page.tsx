'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.scss';

import AdminBanner from '@/components/adminBanner/page';
import UserCard from '@/components/UserCard/page';
import UserModal from '@/components/modals/userModal/page';
import ConfirmDeleteModal from '@/components/modals/deleteGamemodal/page';

interface UserData {
  id: string;
  name: string;
  email: string;
  unidade_slug: string;
  avatar_url: string | null;
}

export default function AdminUsuarios() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem('auth');
    const role = sessionStorage.getItem('role');
    if (!auth || role !== 'admin') { router.push('/login'); return; }
    setName(sessionStorage.getItem('name') || '');
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
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <AdminBanner
        backgroundImage="/cards/GerenciarJogos.png"
        username={name}
        title="Gerenciar Usuários"
        subtitle="Crie, edite e remova estagiários do sistema"
      />

      <div className={styles.content}>
        <div className={styles.topBar}>
          <p className={styles.count}>{users.length} estagiário{users.length !== 1 ? 's' : ''}</p>
          <button className={styles.addBtn} onClick={() => setShowAddModal(true)}>
            + Novo Usuário
          </button>
        </div>

        <div className={styles.list}>
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <UserCard key={i} id="" name="" email="" unidade_slug=""
                  onEdit={() => {}} onDelete={() => {}} isLoading />
              ))
            : users.map((user) => (
                <UserCard
                  key={user.id}
                  id={user.id}
                  name={user.name}
                  email={user.email}
                  unidade_slug={user.unidade_slug}
                  onEdit={() => setEditingUser(user)}
                  onDelete={() => setDeletingUser(user)}
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
    </main>
  );
}