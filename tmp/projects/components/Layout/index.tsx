// Layout component that wraps around pages
import React, { ReactNode } from 'react';
import { Header } from '../Header';
import { Footer } from '../Footer';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => (
  <div>
    <Header />
    <main>{children}</main>
    <Footer />
  </div>
);
