// components/docs-mobile-navbar.tsx

"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const DocsMobileNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const docsLinks = [
    { href: "/docs/introduction", label: "Introduction" },
    { href: "/docs/getting-started", label: "Getting Started" },
    { href: "/docs/api-reference", label: "API Reference" },
    { href: "/docs/examples", label: "Examples" },
    // Add more documentation links as needed
  ];

  return (
    <div className="md:hidden fixed bottom-4 right-4 z-50">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full shadow-lg">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="bg-white p-4">
          <nav className="space-y-4">
            {docsLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <a onClick={() => setIsOpen(false)} className="block text-lg font-medium text-gray-700 hover:text-gray-900">
                  {link.label}
                </a>
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default DocsMobileNavbar;
