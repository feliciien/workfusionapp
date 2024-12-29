// The Header component containing the navigation bar
import Link from 'next/link';
import styles from './Header.module.css';

interface HeaderProps {}

export const Header: React.FC<HeaderProps> = () => {
  return (
    <header className={styles.header}>
      <nav>
        <Link href='/'>Home</Link>
        <Link href='/menu'>Menu</Link>
        <Link href='/reservations'>Reservations</Link>
        <Link href='/contact'>Contact</Link>
      </nav>
    </header>
  );
};
