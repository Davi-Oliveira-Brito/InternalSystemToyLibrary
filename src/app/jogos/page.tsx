'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.scss';

import Banner from '@/components/banner/page';
import ActionBar from '@/components/actionBar/page';
import GameCard from '@/components/gamecard/page';
import GameModal from '@/components/modals/gameModal/page';
import EditGameModal from '@/components/modals/editGameModal/page';
import ConfirmDeleteModal from '@/components/modals/deleteGamemodal/page';

interface Game {
  id: string;
  name: string;
  image: string;
  total_copies: number;
  unidade: string;
  available_copies: number; // calculado via join com loans
}

export default function GerenciarJogos() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [unidade, setUnidade] = useState('');
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [deletingGame, setDeletingGame] = useState<Game | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Auth guard
  useEffect(() => {
    const auth = sessionStorage.getItem('auth');
    if (!auth) {
      router.push('/login');
      return;
    }
    setUsername(sessionStorage.getItem('username') || '');
    setUnidade(sessionStorage.getItem('unidade') || '');
  }, [router]);

  const fetchGames = async (currentUnidade: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/games?unidade=${currentUnidade}`);
      const data = await res.json();
      setGames(data);
    } catch (err) {
      console.error('Erro ao buscar jogos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!unidade) return;
    fetchGames(unidade);
  }, [unidade]);

  // Stats
  const total = games.length;
  const available = games.filter((g) => g.available_copies > 0).length;
  const loaned = games.reduce((acc, g) => acc + (g.total_copies - g.available_copies), 0);

  // Filtered list
  const filtered = useMemo(() => {
    if (!search.trim()) return games;
    return games.filter((g) =>
      g.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [games, search]);

  const handleDelete = async () => {
    if (!deletingGame) return;
    setDeleteLoading(true);
    try {
      await fetch(`/api/games/${deletingGame.id}`, { method: 'DELETE' });
      setGames((prev) => prev.filter((g) => g.id !== deletingGame.id));
      setDeletingGame(null);
    } catch (err) {
      console.error('Erro ao excluir jogo:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <Banner
        backgroundImage="/cards/GerenciarJogos.png"
        username={username}
        title="Gerenciar Jogos"
        subtitle="Cadastre, edite e organize os jogos disponíveis"
      />

      <ActionBar
        search={search}
        onSearchChange={setSearch}
        onAddClick={() => setShowAddModal(true)}
        total={total}
        available={available}
        loaned={loaned}
      />

      <section className={styles.list}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <GameCard
                key={i}
                id=""
                name=""
                image=""
                totalCopies={0}
                availableCopies={0}
                mode="manage"
                isLoading
              />
            ))
          : filtered.map((game) => (
              <GameCard
                key={game.id}
                id={game.id}
                name={game.name}
                image={game.image}
                totalCopies={game.total_copies}
                availableCopies={game.available_copies}
                mode="manage"
                onEdit={() => setEditingGame(game)}
                onDelete={() => setDeletingGame(game)}
              />
            ))}

        {!loading && filtered.length === 0 && (
          <p className={styles.empty}>Nenhum jogo encontrado.</p>
        )}
      </section>

      {showAddModal && (
        <GameModal
          unidade={unidade}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => fetchGames(unidade)}
        />
      )}

      {editingGame && (
        <EditGameModal
          game={editingGame}
          onClose={() => setEditingGame(null)}
          onSuccess={() => fetchGames(unidade)}
        />
      )}
      {deletingGame && (
        <ConfirmDeleteModal
          gameName={deletingGame.name}
          onClose={() => setDeletingGame(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}
    </main>
  );
}