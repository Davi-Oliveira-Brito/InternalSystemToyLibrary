'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './page.module.scss';

interface BannerProps {
  backgroundImage: string;
  username: string;
  avatar: string;
  title: string;
  subtitle: string;
}

export default function Banner({ backgroundImage, username, title, subtitle, avatar }: BannerProps) {
  const router = useRouter();
  const initial = username ? username.charAt(0).toUpperCase() : '?';
  const handleAvatarClick = () => {
    router.push('/perfil');
  };

  return (
    <div className={styles.banner}>
      <div className={styles.topBar}>
        <Link href="/home" className={styles.logoLink}>
          <Image
            src="/logo clara.png"
            alt="Sistema Interno Ludoteca"
            width={160}
            height={40}
            className={styles.logo}
            priority
          />
        </Link>

        <button className={styles.avatar} onClick={handleAvatarClick} aria-label="Ir para perfil">
          {avatar ? (
            <Image
              src={avatar}
              alt="Foto"
              width={44}
              height={44}
              className={styles.avatar}
              unoptimized
              priority
            />
          ) : (
            <div className={styles.avatarBtn}>
              {initial}
            </div>
          )}
        </button>
      </div>

      <div className={styles.content}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
    </div>
  );
}