import { Suspense } from 'react';
import Navbar from './navbar-server';

export default function NavbarWrapper() {
  return (
    <Suspense fallback={<div className="h-16 w-full bg-gray-900" />}>
      <Navbar />
    </Suspense>
  );
}
