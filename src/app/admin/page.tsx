'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.scss';
import AdminBanner from '@/components/adminBanner/page';
import MenuCard from '@/components/card/page';

const cards = [
  {
    href: '/admin/usuarios',
    image: '/cards/GerenciarJogos.png',
    title: 'Gerenciar Usuários',
    subtitle: 'Crie, edite e remova estagiários do sistema',
  },
  {
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
      <AdminBanner
        backgroundImage="/cards/GerenciarJogos.png"
        avatar={avatar}
        username={name}
        title={`Olá, ${name.split(' ')[0]}!`}
        subtitle="Painel Administrativo — Sistema Interno Ludoteca"
      />

      <section className={styles.content}>
        {cards.map((card) => (
          <MenuCard
            variant="light"
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