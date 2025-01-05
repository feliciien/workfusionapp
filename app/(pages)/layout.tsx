'use client';

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
