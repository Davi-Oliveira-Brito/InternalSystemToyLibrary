'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.scss';
import { Game, Loan, GameCategory } from '@/types';

import Banner from '@/components/banner/page';
import ActionBar from '@/components/actionBar/page';
import GameCard from '@/components/gamecard/page';
import LoanModal from '@/components/modals/loanModal/page'
import ReturnModal from '@/components/modals/returnModal/page';

export default function ModoTrabalho() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('')
  const [unidade_slug, setUnidadeSlug] = useState('');
  const [games, setGames] = useState<Game[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | null>(null);

  // Modal state
  const [loaningGame, setLoaningGame] = useState<Game | null>(null);
  const [returningGame, setReturningGame] = useState<Game | null>(null);

  useEffect(() => {
    const auth = sessionStorage.getItem('auth');
    if (!auth) { router.push('/login'); return; }
    setName(sessionStorage.getItem('name') || '');
    setAvatar(sessionStorage.getItem('avatar_url') || '')
    setUnidadeSlug(sessionStorage.getItem('unidade_slug') || '');
  }, [router]);

  const fetchData = async (slug: string) => {
    setLoading(true);
    try {
      const [gamesRes, loansRes] = await Promise.all([
        fetch(`/api/games?unidade_slug=${slug}`),
        fetch(`/api/loans?unidade_slug=${slug}`),
      ]);
      const [gamesData, loansData] = await Promise.all([
        gamesRes.json(),
        loansRes.json(),
      ]);
      setGames(gamesData);
      setLoans(loansData);
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!unidade_slug) return;
    fetchData(unidade_slug);
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

  // Empréstimos ativos de um jogo específico
  const getGameLoans = (gameId: string) =>
    loans.filter((l) => l.game_id === gameId && !l.returned);

  const handleReturn = async (loanId: string) => {
    await fetch(`/api/loans/${loanId}`, { method: 'PATCH' });
    await fetchData(unidade_slug);
    // Se não sobrar mais empréstimos nesse jogo, fecha o modal
    if (returningGame) {
      const remaining = getGameLoans(returningGame.id).filter((l) => l.id !== loanId);
      if (remaining.length === 0) setReturningGame(null);
    }
  };

  return (
    <main className={styles.page}>
      <Banner
        backgroundImage="/cards/ModoTrabalho.png"
        username={name}
        avatar={avatar}
        title="Modo Trabalho"
        subtitle="Registre empréstimos e devoluções"
        
      />

      <ActionBar
        search={search}
        onSearchChange={setSearch}
        onAddClick={() => {}}
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
                availableCopies={0} mode="loan" isLoading />
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
                mode="loan"
                onLoan={() => setLoaningGame(game)}
                onReturn={() => setReturningGame(game)}
              />
            ))}

        {!loading && filtered.length === 0 && (
          <p className={styles.empty}>Nenhum jogo encontrado.</p>
        )}
      </section>

      {loaningGame && (
        <LoanModal
          gameId={loaningGame.id}
          gameName={loaningGame.name}
          unidade_slug={unidade_slug}
          onClose={() => setLoaningGame(null)}
          onSuccess={() => fetchData(unidade_slug)}
        />
      )}

      {returningGame && (
        <ReturnModal
          gameName={returningGame.name}
          loans={getGameLoans(returningGame.id)}
          onClose={() => setReturningGame(null)}
          onReturn={handleReturn}
        />
      )}
    </main>
  );
}