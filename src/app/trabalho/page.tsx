'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.scss';
import { Game, Loan, GameCategory } from '@/types';

import Banner from '@/components/banner/page';
import ActionBar from '@/components/actionBar/page';
import GameCard from '@/components/gamecard/page';
import LoanModal from '@/components/modals/loanModal/page';
import ReturnModal from '@/components/modals/returnModal/page';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `há ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `há ${hours}h`;
  return `há ${Math.floor(hours / 24)}d`;
}

export default function ModoTrabalho() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [unidade_slug, setUnidadeSlug] = useState('');
  const [games, setGames] = useState<Game[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'jogos' | 'emprestimos'>('jogos');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | null>(null);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');

  const [loaningGame, setLoaningGame] = useState<Game | null>(null);
  const [returningGame, setReturningGame] = useState<Game | null>(null);
  const [returningLoan, setReturningLoan] = useState<string | null>(null);

  useEffect(() => {
    const auth = sessionStorage.getItem('auth');
    if (!auth) { router.push('/login'); return; }
    setName(sessionStorage.getItem('name') || '');
    setAvatar(sessionStorage.getItem('avatar_url') || '');
    setUnidadeSlug(sessionStorage.getItem('unidade_slug') || '');
  }, [router]);

  const fetchData = async (slug: string) => {
    setLoading(true);
    try {
      const [gamesRes, loansRes] = await Promise.all([
        fetch(`/api/games?unidade_slug=${slug}`),
        fetch(`/api/loans?unidade_slug=${slug}`),
      ]);
      setGames(await gamesRes.json());
      setLoans(await loansRes.json());
    } catch (err) {
      console.error(err);
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

  const filteredGames = useMemo(() => {
    return games.filter((g) => {
      const matchSearch = !search.trim() || g.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = !selectedCategory || g.category === selectedCategory;
      const matchAvailable = !onlyAvailable || g.available_copies > 0;
      return matchSearch && matchCategory && matchAvailable;
    });
  }, [games, search, selectedCategory, onlyAvailable]);

  const filteredLoans = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    if (!q) return loans;
    return loans.filter(
      (l) =>
        l.student_name.toLowerCase().includes(q) ||
        l.student_class.toLowerCase().includes(q)
    );
  }, [loans, studentSearch]);

  const getGameLoans = (gameId: string) =>
    loans.filter((l) => l.game_id === gameId && !l.returned);

  const handleReturn = async (loanId: string) => {
    await fetch(`/api/loans/${loanId}`, { method: 'PATCH' });
    await fetchData(unidade_slug);
    if (returningGame) {
      const remaining = getGameLoans(returningGame.id).filter((l) => l.id !== loanId);
      if (remaining.length === 0) setReturningGame(null);
    }
  };

  const handleQuickReturn = async (loanId: string) => {
    setReturningLoan(loanId);
    await fetch(`/api/loans/${loanId}`, { method: 'PATCH' });
    await fetchData(unidade_slug);
    setReturningLoan(null);
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

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'jogos' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('jogos')}
        >
          Jogos
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'emprestimos' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('emprestimos')}
        >
          Empréstimos
          {loans.length > 0 && (
            <span className={styles.tabBadge}>{loans.length}</span>
          )}
        </button>
      </div>

      {activeTab === 'jogos' ? (
        <>
          <ActionBar
            search={search}
            onSearchChange={setSearch}
            onAddClick={() => {}}
            total={total}
            available={available}
            loaned={loaned}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onlyAvailable={onlyAvailable}
            onOnlyAvailableChange={setOnlyAvailable}
            hideAdd
          />

          <section className={styles.list}>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <GameCard key={i} id="" name="" image_url={null} totalCopies={0}
                    availableCopies={0} mode="loan" isLoading />
                ))
              : filteredGames.map((game) => (
                  <GameCard
                    key={game.id}
                    id={game.id}
                    name={game.name}
                    image_url={game.image_url}
                    category={game.category}
                    totalCopies={game.total_copies}
                    availableCopies={game.available_copies}
                    observacao={game.observacao}
                    mode="loan"
                    onLoan={() => setLoaningGame(game)}
                    onReturn={() => setReturningGame(game)}
                  />
                ))}
            {!loading && filteredGames.length === 0 && (
              <p className={styles.empty}>Nenhum jogo encontrado.</p>
            )}
          </section>
        </>
      ) : (
        <div className={styles.loansContainer}>
          <div className={styles.loansSearch}>
            <Image src="/search.svg" alt="Buscar" width={16} height={16} className={styles.loansSearchIcon} />
            <input
              className={styles.loansSearchInput}
              type="text"
              placeholder="Buscar por aluno ou turma..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className={styles.loansList}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={`${styles.loanItem} ${styles.loanSkeleton}`}>
                  <div className={styles.skeletonAvatar} />
                  <div className={styles.skeletonBody}>
                    <div className={styles.skeletonLine} style={{ width: '50%' }} />
                    <div className={styles.skeletonLine} style={{ width: '70%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredLoans.length === 0 ? (
            <p className={styles.empty}>
              {studentSearch ? 'Nenhum empréstimo encontrado.' : 'Nenhum empréstimo ativo.'}
            </p>
          ) : (
            <div className={styles.loansList}>
              {filteredLoans.map((loan) => {
                const gameImg = games.find(g => g.id === loan.game_id)?.image_url ?? null;
                return (
                <div key={loan.id} className={styles.loanItem}>
                  <div className={styles.loanGameInitial}>
                    {gameImg
                      ? <Image src={gameImg} alt={loan.game_name} width={40} height={40} className={styles.loanGameImg} unoptimized />
                      : loan.game_name.charAt(0).toUpperCase()
                    }
                  </div>
                  <div className={styles.loanBody}>
                    <span className={styles.loanGame}>{loan.game_name}</span>
                    <span className={styles.loanStudent}>
                      {loan.student_name}
                      <span className={styles.loanClass}> · {loan.student_class}</span>
                      {loan.student_ra && (
                        <span className={styles.loanRa}> · RA {loan.student_ra}</span>
                      )}
                    </span>
                    <span className={styles.loanTime}>{timeAgo(loan.loaned_at)}</span>
                  </div>
                  <button
                    className={styles.loanReturnBtn}
                    onClick={() => handleQuickReturn(loan.id)}
                    disabled={returningLoan === loan.id}
                  >
                    {returningLoan === loan.id ? '...' : 'Devolver'}
                  </button>
                </div>
                );
              })}
            </div>
          )}
        </div>
      )}

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
