'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.scss';
import { UNIDADES } from '@/types';

import AdminBanner from '@/components/adminBanner/page';
import StatCard from '@/components/statCard/page';

interface Analytics {
  week_start: string;
  total_loans: number;
  total_returns: number;
  open_loans: number;
  total_games: number;
  never_borrowed: number;
  unique_students: number;
  top_game: { name: string; count: number } | null;
  top_student: { name: string; ra: string; count: number } | null;
  top_class: { name: string; count: number } | null;
  peak_hour: string | null;
}

export default function AdminAnalises() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [selectedSlug, setSelectedSlug] = useState<string>(UNIDADES[0].slug);
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = sessionStorage.getItem('auth');
    const role = sessionStorage.getItem('role');
    if (!auth || role !== 'admin') { router.push('/login'); return; }
    setName(sessionStorage.getItem('name') || '');
  }, [router]);

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/analises?unidade_slug=${selectedSlug}`);
        setData(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [selectedSlug]);

  const unidadeName = UNIDADES.find((u) => u.slug === selectedSlug)?.name ?? '';
  const weekLabel = data
    ? `Semana de ${new Date(data.week_start).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`
    : 'Esta semana';

  return (
    <main className={styles.page}>
      <AdminBanner
        backgroundImage="/cards/Analises.png"
        username={name}
        title="Resumo da Semana"
        subtitle="Estatísticas por unidade"
      />

      <div className={styles.content}>
        {/* Seletor de unidade */}
        <div className={styles.unidadeSelector}>
          {UNIDADES.map((u) => (
            <button
              key={u.slug}
              className={`${styles.unidadeBtn} ${selectedSlug === u.slug ? styles.unidadeBtnActive : ''}`}
              onClick={() => setSelectedSlug(u.slug)}
            >
              {u.name.replace('Unidade ', '')}
            </button>
          ))}
        </div>

        <p className={styles.weekLabel}>{weekLabel} · {unidadeName}</p>

        <h2 className={styles.sectionTitle}>Empréstimos</h2>
        <div className={styles.grid}>
          <StatCard variant="light" label="Total na semana" value={data?.total_loans ?? 0} accent="yellow" isLoading={loading} />
          <StatCard variant="light" label="Devolvidos" value={data?.total_returns ?? 0} accent="green" isLoading={loading} />
          <StatCard variant="light" label="Em aberto agora" value={data?.open_loans ?? 0}
            accent={data && data.open_loans > 0 ? 'red' : 'default'} isLoading={loading} />
          <StatCard variant="light" label="Horário de pico" value={data?.peak_hour ?? '—'}
            sub="hora com mais empréstimos" isLoading={loading} />
        </div>

        <h2 className={styles.sectionTitle}>Jogos</h2>
        <div className={styles.grid}>
          <StatCard variant="light" label="Total cadastrados" value={data?.total_games ?? 0} isLoading={loading} />
          <StatCard variant="light" label="Jogo mais emprestado" value={data?.top_game?.name ?? '—'}
            sub={data?.top_game ? `${data.top_game.count}x na semana` : undefined}
            accent="yellow" isLoading={loading} />
          <StatCard variant="light" label="Sem empréstimo na semana" value={data?.never_borrowed ?? 0}
            sub="jogos não utilizados"
            accent={data && data.never_borrowed > 0 ? 'red' : 'green'} isLoading={loading} />
        </div>

        <h2 className={styles.sectionTitle}>Alunos</h2>
        <div className={styles.grid}>
          <StatCard variant="light" label="Alunos únicos atendidos" value={data?.unique_students ?? 0} accent="green" isLoading={loading} />
          <StatCard variant="light" label="Aluno destaque" value={data?.top_student?.name ?? '—'}
            sub={data?.top_student ? `RA ${data.top_student.ra} · ${data.top_student.count}x` : undefined}
            accent="yellow" isLoading={loading} />
          <StatCard variant="light" label="Turma mais ativa" value={data?.top_class?.name ?? '—'}
            sub={data?.top_class ? `${data.top_class.count} empréstimos` : undefined}
            accent="yellow" isLoading={loading} />
        </div>
      </div>
    </main>
  );
}