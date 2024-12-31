// Header component with navigation
import React from 'react';
import Link from 'next/link';
import styles from './Header.module.css';

export const Header = () => (
  <header className={styles.header}>
    <nav className={styles.navbar}>
      <Link href='/' className={styles.logo}>
        Gourmet Place
      </Link>
      <div className={styles.menu}>
        <Link href='/menu'>
          Menu
        </Link>
        <Link href='/reservation'>
          Reservation
        </Link>
        <Link href='/contact'>
          Contact
        </Link>
      </div>
    </nav>
  </header>
);
