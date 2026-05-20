'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.scss';
import AdminPageHeader from '@/components/adminPageHeader/AdminPageHeader';
import MenuCard from '@/components/card/page';

const cards = [
  {
    id: 1,
    href: '/admin/usuarios',
    image: '/cards/GerenciarJogos.png',
    title: 'Gerenciar Usuários',
    subtitle: 'Crie, edite e remova usuários do sistema',
  },
  {
    id: 2,
    href: '/admin/analises',
    image: '/cards/Analises.png',
    title: 'Resumo da Semana',
    subtitle: 'Visualize estatísticas de todas as unidades',
  },
]

export default function AdminHome() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    const auth = sessionStorage.getItem('auth');
    const role = sessionStorage.getItem('role');
    if (!auth || role !== 'admin') { router.push('/login'); return; }
    setName(sessionStorage.getItem('name') || '');
    setAvatar(sessionStorage.getItem('avatar_url') || '');
  }, [router]);

  return (
    <main className={styles.page}>
      <AdminPageHeader
        title={`Olá, ${name.split(' ')[0] || 'Admin'}!`}
        subtitle="Painel Administrativo — Sistema Interno Ludoteca"
      />

      <section className={styles.content}>
        {cards.map((card) => (
          <MenuCard
            key={card.id}
            title={card.title}
            subtitle={card.subtitle}
            image={card.image}
            href={card.href}
          />
        ))}
      </section>
    </main>
  );
}