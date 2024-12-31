// Footer component
import React from 'react';
import styles from './Footer.module.css';

export const Footer = () => (
  <footer className={styles.footer}>
    <p>&copy; {new Date().getFullYear()} Gourmet Place. All rights reserved.</p>
  </footer>
);
