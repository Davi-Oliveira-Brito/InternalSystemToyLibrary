'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.scss';

import Banner from '@/components/banner/page';
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

export default function Analises() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('')
  const [unidade_slug, setUnidadeSlug] = useState('');
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = sessionStorage.getItem('auth');
    if (!auth) { router.push('/login'); return; }
    setName(sessionStorage.getItem('name') || '');
    setAvatar(sessionStorage.getItem('avatar_url') || '');
    setUnidadeSlug(sessionStorage.getItem('unidade_slug') || '');
  }, [router]);

  useEffect(() => {
    if (!unidade_slug) return;
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/analises?unidade_slug=${unidade_slug}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Erro ao buscar análises:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [unidade_slug]);

  const weekLabel = data
    ? `Semana de ${new Date(data.week_start).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`
    : 'Esta semana';

  return (
    <main className={styles.page}>
      <Banner
        backgroundImage="/cards/Analises.png"
        username={name}
        avatar={avatar}
        title="Resumo da Semana"
        subtitle="Visualize estatísticas de empréstimos"
      />

      <div className={styles.content}>
        <p className={styles.weekLabel}>{weekLabel}</p>

        {/* Empréstimos */}
        <h2 className={styles.sectionTitle}>Empréstimos</h2>
        <div className={styles.grid}>
          <StatCard
            label="Total na semana"
            value={data?.total_loans ?? 0}
            accent="yellow"
            isLoading={loading}
          />
          <StatCard
            label="Devolvidos"
            value={data?.total_returns ?? 0}
            accent="green"
            isLoading={loading}
          />
          <StatCard
            label="Em aberto agora"
            value={data?.open_loans ?? 0}
            accent={data && data.open_loans > 0 ? 'red' : 'default'}
            isLoading={loading}
          />
          <StatCard
            label="Horário de pico"
            value={data?.peak_hour ?? '—'}
            sub="hora com mais empréstimos"
            isLoading={loading}
          />
        </div>

        {/* Jogos */}
        <h2 className={styles.sectionTitle}>Jogos</h2>
        <div className={styles.grid}>
          <StatCard
            label="Total cadastrados"
            value={data?.total_games ?? 0}
            isLoading={loading}
          />
          <StatCard
            label="Jogo mais emprestado"
            value={data?.top_game?.name ?? '—'}
            sub={data?.top_game ? `${data.top_game.count}x na semana` : undefined}
            accent="yellow"
            isLoading={loading}
          />
          <StatCard
            label="Sem empréstimo na semana"
            value={data?.never_borrowed ?? 0}
            sub="jogos não utilizados"
            accent={data && data.never_borrowed > 0 ? 'red' : 'green'}
            isLoading={loading}
          />
        </div>

        {/* Alunos */}
        <h2 className={styles.sectionTitle}>Alunos</h2>
        <div className={styles.grid}>
          <StatCard
            label="Alunos únicos atendidos"
            value={data?.unique_students ?? 0}
            accent="green"
            isLoading={loading}
          />
          <StatCard
            label="Aluno destaque"
            value={data?.top_student?.name ?? '—'}
            sub={data?.top_student
              ? `RA ${data.top_student.ra} · ${data.top_student.count}x`
              : undefined}
            accent="yellow"
            isLoading={loading}
          />
          <StatCard
            label="Turma mais ativa"
            value={data?.top_class?.name ?? '—'}
            sub={data?.top_class ? `${data.top_class.count} empréstimos` : undefined}
            accent="yellow"
            isLoading={loading}
          />
        </div>
      </div>
    </main>
  );
}