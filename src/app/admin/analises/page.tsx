'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.scss';
import { UNIDADES } from '@/types';

import AdminPageHeader from '@/components/adminPageHeader/AdminPageHeader';
import StatCard from '@/components/statCard/page';

interface Analytics {
  period_from: string;
  period_to: string;
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

type PeriodKey = 'this-week' | 'last-week' | 'this-month' | 'last-month' | 'custom';

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: 'this-week',  label: 'Esta semana' },
  { key: 'last-week',  label: 'Semana passada' },
  { key: 'this-month', label: 'Este mês' },
  { key: 'last-month', label: 'Mês passado' },
  { key: 'custom',     label: 'Personalizado' },
];

function getPeriodDates(key: PeriodKey, customFrom?: string, customTo?: string) {
  const now = new Date();
  if (key === 'this-week') {
    const d = now.getDay();
    const from = new Date(now); from.setDate(now.getDate() + (d === 0 ? -6 : 1 - d)); from.setHours(0, 0, 0, 0);
    const to = new Date(from); to.setDate(from.getDate() + 6); to.setHours(23, 59, 59, 999);
    return { from, to };
  }
  if (key === 'last-week') {
    const d = now.getDay();
    const mon = new Date(now); mon.setDate(now.getDate() + (d === 0 ? -6 : 1 - d)); mon.setHours(0, 0, 0, 0);
    const from = new Date(mon); from.setDate(mon.getDate() - 7);
    const to = new Date(mon); to.setDate(mon.getDate() - 1); to.setHours(23, 59, 59, 999);
    return { from, to };
  }
  if (key === 'this-month') {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { from, to };
  }
  if (key === 'last-month') {
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const to   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return { from, to };
  }
  const from = customFrom ? new Date(customFrom + 'T00:00:00') : new Date();
  const to   = customTo   ? new Date(customTo   + 'T23:59:59') : new Date();
  return { from, to };
}

function periodLabel(key: PeriodKey, from: Date, to: Date) {
  const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const fmtMonth = (d: Date) => d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  if (key === 'this-week')  return `Esta semana · ${fmt(from)} – ${fmt(to)}`;
  if (key === 'last-week')  return `Semana passada · ${fmt(from)} – ${fmt(to)}`;
  if (key === 'this-month') return `Este mês · ${fmtMonth(from)}`;
  if (key === 'last-month') return `Mês passado · ${fmtMonth(from)}`;
  return `${fmt(from)} – ${fmt(to)}`;
}

export default function AdminAnalises() {
  const router = useRouter();
  const [name, setName]       = useState('');
  const [avatar, setAvatar]   = useState('');
  const [selectedSlug, setSelectedSlug] = useState<string>(UNIDADES[0].slug);
  const [periodKey, setPeriodKey] = useState<PeriodKey>('this-week');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo,   setCustomTo]   = useState('');
  const [data,    setData]    = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const auth = sessionStorage.getItem('auth');
    const role = sessionStorage.getItem('role');
    if (!auth || role !== 'admin') { router.push('/login'); return; }
    setName(sessionStorage.getItem('name') || '');
    setAvatar(sessionStorage.getItem('avatar_url') || '');
    const today = new Date().toISOString().split('T')[0];
    setCustomFrom(today);
    setCustomTo(today);
  }, [router]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false);
    }
    if (exportOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [exportOpen]);

  useEffect(() => {
    if (periodKey === 'custom' && (!customFrom || !customTo)) return;
    const { from, to } = getPeriodDates(periodKey, customFrom, customTo);
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/analises?unidade_slug=${selectedSlug}&date_from=${from.toISOString()}&date_to=${to.toISOString()}`
        );
        setData(await res.json());
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [selectedSlug, periodKey, customFrom, customTo]);

  const unidadeName = UNIDADES.find(u => u.slug === selectedSlug)?.name ?? '';
  const { from: pFrom, to: pTo } = getPeriodDates(periodKey, customFrom, customTo);
  const label = periodLabel(periodKey, pFrom, pTo);

  function exportCSV() {
    if (!data) return;
    const rows = [
      ['Relatório de Análises — Ludoteca'],
      ['Unidade', unidadeName],
      ['Período', label],
      ['Gerado em', new Date().toLocaleDateString('pt-BR')],
      [],
      ['EMPRÉSTIMOS'],
      ['Total no período',  data.total_loans],
      ['Devolvidos',        data.total_returns],
      ['Em aberto agora',   data.open_loans],
      ['Horário de pico',   data.peak_hour ?? '—'],
      [],
      ['JOGOS'],
      ['Total cadastrados',         data.total_games],
      ['Mais emprestado',           data.top_game ? `${data.top_game.name} (${data.top_game.count}x)` : '—'],
      ['Sem uso no período',        data.never_borrowed],
      [],
      ['ALUNOS'],
      ['Alunos únicos atendidos',  data.unique_students],
      ['Aluno destaque',           data.top_student ? `${data.top_student.name} — RA ${data.top_student.ra} (${data.top_student.count}x)` : '—'],
      ['Turma mais ativa',         data.top_class ? `${data.top_class.name} (${data.top_class.count} empréstimos)` : '—'],
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ludoteca_${selectedSlug}_${pFrom.toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  }

  function openPDF() {
    if (!data) return;
    setExportOpen(false);

    const logoUrl = `${window.location.origin}/logo%20escura.png`;

    const num = (val: string | number, color: string) =>
      `<div class="kpi-value" style="color:${color}">${val}</div>`;

    const card = (label: string, value: string | number, color = '#0f172a', sub = '', wide = false) => `
      <div class="kpi${wide ? ' wide' : ''}">
        <div class="kpi-label">${label}</div>
        ${num(value, color)}
        ${sub ? `<div class="kpi-sub">${sub}</div>` : ''}
      </div>`;

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Relatório — Ludoteca · ${unidadeName}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fff;color:#0f172a;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .page{max-width:800px;margin:0 auto;background:#fff;min-height:100vh;display:flex;flex-direction:column}

  /* Accent bar */
  .accent{height:4px;background:linear-gradient(90deg,#022E63,#1d4ed8)}

  /* Header */
  .header{padding:28px 44px 24px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e2e8f0}
  .logo{height:30px;object-fit:contain}
  .header-right{text-align:right}
  .report-tag{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#94a3b8;margin-bottom:4px}
  .unit{font-size:20px;font-weight:800;color:#022E63;line-height:1.1}
  .period-str{font-size:12px;color:#64748b;margin-top:3px}

  /* Body */
  .body{padding:32px 44px 44px;display:flex;flex-direction:column;gap:28px;flex:1}

  /* Section */
  .section{display:flex;flex-direction:column;gap:12px}
  .section-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:#94a3b8;padding-bottom:8px;border-bottom:1px solid #f1f5f9}

  /* Grid */
  .g4{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
  .g3{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}

  /* Card */
  .kpi{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px 16px;border-left:3px solid #e2e8f0}
  .kpi.wide{grid-column:span 2}
  .kpi-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;margin-bottom:8px}
  .kpi-value{font-size:24px;font-weight:800;line-height:1;word-break:break-word}
  .kpi-value.sm{font-size:15px;line-height:1.3;padding-top:2px}
  .kpi-sub{font-size:11px;color:#94a3b8;margin-top:5px;line-height:1.4}

  /* Footer */
  .footer{padding:16px 44px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center}
  .footer-brand{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#022E63}
  .footer-meta{font-size:11px;color:#94a3b8}

  @media print{@page{margin:0;size:A4 portrait}body{background:#fff}.page{box-shadow:none}}
</style>
</head>
<body>
<div class="page">
  <div class="accent"></div>

  <div class="header">
    <img class="logo" src="${logoUrl}" alt="Ludoteca" />
    <div class="header-right">
      <div class="report-tag">Relatório de Análises</div>
      <div class="unit">${unidadeName}</div>
      <div class="period-str">${label}</div>
    </div>
  </div>

  <div class="body">

    <div class="section">
      <div class="section-label">Empréstimos</div>
      <div class="g4">
        ${card('Total no período',  data.total_loans,   '#022E63')}
        ${card('Devolvidos',        data.total_returns, '#16a34a')}
        ${card('Em aberto agora',   data.open_loans,    data.open_loans > 0 ? '#dc2626' : '#0f172a', 'ativos no momento')}
        ${card('Horário de pico',   data.peak_hour ?? '—', '#d97706', 'hora com mais saídas')}
      </div>
    </div>

    <div class="section">
      <div class="section-label">Jogos</div>
      <div class="g3">
        ${card('Total cadastrados', data.total_games, '#0f172a')}
        <div class="kpi wide" style="border-left-color:#022E63">
          <div class="kpi-label">Mais emprestado</div>
          <div class="kpi-value sm" style="color:#022E63">${data.top_game?.name ?? '—'}</div>
          ${data.top_game ? `<div class="kpi-sub">${data.top_game.count}× no período</div>` : ''}
        </div>
        ${card('Sem uso', data.never_borrowed, data.never_borrowed > 0 ? '#dc2626' : '#16a34a', 'jogos não utilizados')}
      </div>
    </div>

    <div class="section">
      <div class="section-label">Alunos</div>
      <div class="g3">
        ${card('Alunos únicos', data.unique_students, '#16a34a', 'atendidos no período')}
        <div class="kpi" style="border-left-color:#022E63">
          <div class="kpi-label">Aluno destaque</div>
          <div class="kpi-value sm" style="color:#022E63">${data.top_student?.name ?? '—'}</div>
          ${data.top_student ? `<div class="kpi-sub">RA ${data.top_student.ra} &middot; ${data.top_student.count}× no período</div>` : ''}
        </div>
        <div class="kpi" style="border-left-color:#022E63">
          <div class="kpi-label">Turma mais ativa</div>
          <div class="kpi-value sm" style="color:#022E63">${data.top_class?.name ?? '—'}</div>
          ${data.top_class ? `<div class="kpi-sub">${data.top_class.count} empréstimos no período</div>` : ''}
        </div>
      </div>
    </div>

  </div>

  <div class="footer">
    <div class="footer-brand">Ludoteca · Porto Seguro</div>
    <div class="footer-meta">Gerado em ${new Date().toLocaleString('pt-BR')}</div>
  </div>
</div>
<script>window.onload = () => window.print()</script>
</body>
</html>`;

    const w = window.open('', '_blank', 'width=860,height=720');
    if (w) { w.document.write(html); w.document.close(); }
  }

  return (
    <main className={styles.page}>
      <AdminPageHeader title="Análises" subtitle="Estatísticas por unidade e período" />

      <div className={styles.content}>
        {/* Filtros */}
        <div className={styles.filters}>
          <select className={styles.filterSelect} value={selectedSlug}
            onChange={e => setSelectedSlug(e.target.value)}>
            {UNIDADES.map(u => (
              <option key={u.slug} value={u.slug}>{u.name}</option>
            ))}
          </select>

          <select className={styles.filterSelect} value={periodKey}
            onChange={e => setPeriodKey(e.target.value as PeriodKey)}>
            {PERIODS.map(p => (
              <option key={p.key} value={p.key}>{p.label}</option>
            ))}
          </select>

          {periodKey === 'custom' && (
            <div className={styles.customRange}>
              <input type="date" className={styles.dateInput} value={customFrom}
                onChange={e => setCustomFrom(e.target.value)} />
              <span className={styles.dateSep}>–</span>
              <input type="date" className={styles.dateInput} value={customTo}
                onChange={e => setCustomTo(e.target.value)} />
            </div>
          )}
        </div>

        {/* Header da seção */}
        <div className={styles.topRow}>
          <p className={styles.weekLabel}>{label} · {unidadeName}</p>

          <div className={styles.exportWrapper} ref={exportRef}>
            <button className={styles.exportBtn} onClick={() => setExportOpen(o => !o)}
              disabled={loading || !data}>
              Exportar
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {exportOpen && (
              <div className={styles.exportDropdown}>
                <button className={styles.exportItem} onClick={exportCSV}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
                  </svg>
                  Exportar CSV (Excel)
                </button>
                <button className={styles.exportItem} onClick={openPDF}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 6 2 18 2 18 9"/>
                    <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
                    <rect x="6" y="14" width="12" height="8"/>
                  </svg>
                  Gerar PDF
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <h2 className={styles.sectionTitle}>Empréstimos</h2>
        <div className={styles.grid}>
          <StatCard variant="light" label="Total no período"  value={data?.total_loans ?? 0}    accent="yellow" isLoading={loading} />
          <StatCard variant="light" label="Devolvidos"        value={data?.total_returns ?? 0}  accent="green"  isLoading={loading} />
          <StatCard variant="light" label="Em aberto agora"   value={data?.open_loans ?? 0}
            accent={data && data.open_loans > 0 ? 'red' : 'default'} isLoading={loading} />
          <StatCard variant="light" label="Horário de pico"   value={data?.peak_hour ?? '—'}
            sub="hora com mais saídas" isLoading={loading} />
        </div>

        <h2 className={styles.sectionTitle}>Jogos</h2>
        <div className={styles.grid}>
          <StatCard variant="light" label="Total cadastrados"   value={data?.total_games ?? 0} isLoading={loading} />
          <StatCard variant="light" label="Mais emprestado"     value={data?.top_game?.name ?? '—'}
            sub={data?.top_game ? `${data.top_game.count}× no período` : undefined} accent="yellow" isLoading={loading} />
          <StatCard variant="light" label="Sem uso no período"  value={data?.never_borrowed ?? 0}
            sub="jogos não utilizados"
            accent={data && data.never_borrowed > 0 ? 'red' : 'green'} isLoading={loading} />
        </div>

        <h2 className={styles.sectionTitle}>Alunos</h2>
        <div className={styles.grid}>
          <StatCard variant="light" label="Alunos únicos"   value={data?.unique_students ?? 0}  accent="green" isLoading={loading} />
          <StatCard variant="light" label="Aluno destaque"  value={data?.top_student?.name ?? '—'}
            sub={data?.top_student ? `RA ${data.top_student.ra} · ${data.top_student.count}×` : undefined}
            accent="yellow" isLoading={loading} />
          <StatCard variant="light" label="Turma mais ativa" value={data?.top_class?.name ?? '—'}
            sub={data?.top_class ? `${data.top_class.count} empréstimos` : undefined}
            accent="yellow" isLoading={loading} />
        </div>
      </div>
    </main>
  );
}
