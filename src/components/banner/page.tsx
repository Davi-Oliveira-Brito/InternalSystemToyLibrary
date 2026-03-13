'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './page.module.scss';

interface BannerProps {
  backgroundImage: string;
  email: string;
  title: string;
  subtitle: string;
}

export default function Banner({ backgroundImage, email, title, subtitle }: BannerProps) {
  const router = useRouter();
  const initial = email.charAt(0).toUpperCase();
  //username

  const handleAvatarClick = () => {
    router.push('/perfil');
  };

  return (
    <div className={styles.banner} style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className={styles.overlay} />

      <div className={styles.topBar}>
        <Link href="/home" className={styles.logoLink}>
          <Image
            src="/logo.png"
            alt="Sistema Interno Ludoteca"
            width={160}
            height={40}
            className={styles.logo}
            priority
          />
        </Link>

        <button
          className={styles.avatar}
          onClick={handleAvatarClick}
          aria-label="Ir para perfil"
        >
          {initial}
        </button>
      </div>

      <div className={styles.content}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
    </div>
  );
}