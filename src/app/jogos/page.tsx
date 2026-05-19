'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import styles from './page.module.scss';
import { Game, GameCategory } from '@/types';

import Banner from '@/components/banner/page';
import ActionBar from '@/components/actionBar/page';
import GameCard from '@/components/gamecard/page';
import GameModal from '@/components/modals/gameModal/page';
import EditGameModal from '@/components/modals/editGameModal/page';
import ConfirmDeleteModal from '@/components/modals/deleteGamemodal/page';

export default function GerenciarJogos() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('')
  const [unidade_slug, setUnidadeSlug] = useState('');
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [deletingGame, setDeletingGame] = useState<Game | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem('auth');
    if (!auth) { router.push('/login'); return; }
    setName(sessionStorage.getItem('name') || '');
    setAvatar(sessionStorage.getItem('avatar_url') || '')
    setUnidadeSlug(sessionStorage.getItem('unidade_slug') || '');
  }, [router]);

  const fetchGames = async (slug: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/games?unidade_slug=${slug}`);
      const data = await res.json();
      setGames(data);
    } catch (err) {
      console.error('Erro ao buscar jogos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!unidade_slug) return;
    fetchGames(unidade_slug);
  }, [unidade_slug]);

  const total = games.length;
  const available = games.filter((g) => g.available_copies > 0).length;
  const loaned = games.reduce((acc, g) => acc + (g.total_copies - g.available_copies), 0);

  const filtered = useMemo(() => {
    return games.filter((g) => {
      const matchSearch = !search.trim() || g.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = !selectedCategory || g.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [games, search, selectedCategory]);

  const handleDelete = async () => {
    if (!deletingGame) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/games/${deletingGame.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Não foi possível excluir o jogo.');
        return;
      }
      setGames((prev) => prev.filter((g) => g.id !== deletingGame.id));
      setDeletingGame(null);
    } catch (err) {
      console.error('Erro ao excluir jogo:', err);
      toast.error('Erro ao excluir jogo.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <Banner
        backgroundImage="/cards/GerenciarJogos.png"
        avatar={avatar}
        username={name}
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
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <section className={styles.list}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
            <GameCard key={i} id="" name="" image_url={null} totalCopies={0}
              availableCopies={0} category="" mode="manage" isLoading />
          ))
          : filtered.map((game) => (
            <GameCard
              key={game.id}
              id={game.id}
              name={game.name}
              image_url={game.image_url}
              category={game.category}
              totalCopies={game.total_copies}
              availableCopies={game.available_copies}
              observacao={game.observacao}
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
        <GameModal unidade_slug={unidade_slug}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => fetchGames(unidade_slug)} />
      )}

      {editingGame && (
        <EditGameModal game={editingGame}
          onClose={() => setEditingGame(null)}
          onSuccess={() => fetchGames(unidade_slug)} />
      )}

      {deletingGame && (
        <ConfirmDeleteModal gameName={deletingGame.name}
          onClose={() => setDeletingGame(null)}
          onConfirm={handleDelete}
          loading={deleteLoading} />
      )}
    </main>
  );
}