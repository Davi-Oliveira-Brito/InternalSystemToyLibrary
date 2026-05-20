'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from './NavBar.module.scss'

const HIDDEN_PATHS = ['/', '/login', '/splash', '/trocar-senha']

interface NavItem {
  href: string
  label: string
  exact?: boolean
  icon: React.ReactNode
}

const IconHome = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)

const IconGames = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="14" rx="2"/>
    <path d="M6 10h4M8 8v4M15 11h.01M18 11h.01"/>
  </svg>
)

const IconWork = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
    <line x1="12" y1="12" x2="12" y2="16"/>
    <line x1="10" y1="14" x2="14" y2="14"/>
  </svg>
)

const IconChart = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
)

const IconUsers = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/>
    <path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
)

const IconPerson = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

const USER_ITEMS: NavItem[] = [
  { href: '/home',     label: 'Início',   icon: <IconHome />,   exact: true },
  { href: '/jogos',    label: 'Jogos',    icon: <IconGames /> },
  { href: '/trabalho', label: 'Trabalho', icon: <IconWork /> },
  { href: '/analises', label: 'Análises', icon: <IconChart /> },
  { href: '/perfil',   label: 'Perfil',   icon: <IconPerson /> },
]

const ADMIN_ITEMS: NavItem[] = [
  { href: '/admin',           label: 'Início',   icon: <IconHome />,   exact: true },
  { href: '/admin/usuarios',  label: 'Usuários', icon: <IconUsers /> },
  { href: '/admin/analises',  label: 'Análises', icon: <IconChart /> },
  { href: '/admin/perfil',    label: 'Perfil',   icon: <IconPerson /> },
]

export default function NavBar() {
  const pathname = usePathname()
  const [role,   setRole]   = useState<string | null>(null)
  const [uName,  setUName]  = useState('')
  const [uAvatar, setUAvatar] = useState('')

  useEffect(() => {
    setRole(sessionStorage.getItem('role'))
    setUName(sessionStorage.getItem('name') || '')
    setUAvatar(sessionStorage.getItem('avatar_url') || '')
  }, [pathname])

  const hidden = HIDDEN_PATHS.some(p => pathname === p)
  const showNav = !hidden && !!role

  useEffect(() => {
    if (showNav) {
      document.body.classList.add('has-nav')
    } else {
      document.body.classList.remove('has-nav')
    }
    return () => document.body.classList.remove('has-nav')
  }, [showNav])

  if (!showNav) return null

  const items = role === 'admin' ? ADMIN_ITEMS : USER_ITEMS

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)

  return (
    <>
      <nav className={styles.sidebar} aria-label="Navegação principal">
        <div className={styles.sidebarLogo}>
          <Image src="/logo escura.png" alt="Ludoteca" width={120} height={38} style={{ objectFit: 'contain' }} priority />
        </div>
        <ul className={styles.sidebarList}>
          {items.map(item => (
            <li key={item.href}>
              <Link href={item.href} className={`${styles.sidebarItem} ${isActive(item) ? styles.sidebarActive : ''}`}>
                <span className={styles.sidebarIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className={styles.sidebarUser}>
          <div className={styles.sidebarAvatar}>
            {uAvatar
              ? <Image src={uAvatar} alt={uName} width={32} height={32} className={styles.sidebarAvatarImg} unoptimized />
              : <span className={styles.sidebarAvatarInitial}>{uName.charAt(0).toUpperCase()}</span>
            }
          </div>
          <div className={styles.sidebarUserInfo}>
            <span className={styles.sidebarUserName}>{uName.split(' ')[0]}</span>
            <span className={styles.sidebarUserRole}>{role === 'admin' ? 'Administrador' : 'Estagiário'}</span>
          </div>
        </div>
      </nav>

      <nav className={styles.bottomBar} aria-label="Navegação principal">
        {items.map(item => (
          <Link key={item.href} href={item.href} className={`${styles.tab} ${isActive(item) ? styles.tabActive : ''}`}>
            <span className={styles.tabIcon}>{item.icon}</span>
            <span className={styles.tabLabel}>{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
