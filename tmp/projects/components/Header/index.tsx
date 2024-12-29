// Header component with navigation
import React from 'react';
import Link from 'next/link';
import styles from './Header.module.css';

const Header = () => (
  <header className={styles.header}>
    <nav className={styles.navbar}>
      <Link href='/'>
        <a className={styles.logo}>Gourmet Place</a>
      </Link>
      <div className={styles.menu}>
        <Link href='/menu'>
          <a>Menu</a>
        </Link>
        <Link href='/reservation'>
          <a>Reservation</a>
        </Link>
        <Link href='/contact'>
          <a>Contact</a>
        </Link>
      </div>
    </nav>
  </header>
);

export default Header;
