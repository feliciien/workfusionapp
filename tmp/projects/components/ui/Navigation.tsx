import React from 'react';
import Link from 'next/link';

const Navigation = () => (
  <nav>
    <ul>
      <li><Link href='/'>Home</Link></li>
      <li><Link href='/menu'>Menu</Link></li>
      <li><Link href='/contact'>Contact</Link></li>
    </ul>
  </nav>
);

export default Navigation;