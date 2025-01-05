'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const companies = [
  {
    name: 'Microsoft',
    logo: '/logos/microsoft.svg',
  },
  {
    name: 'Google',
    logo: '/logos/google.svg',
  },
  {
    name: 'Amazon',
    logo: '/logos/amazon.svg',
  },
  {
    name: 'IBM',
    logo: '/logos/ibm.svg',
  },
  {
    name: 'Oracle',
    logo: '/logos/oracle.svg',
  }
];

export const TrustedCompanies = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="py-12 bg-[#111827]/50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-base font-medium text-gray-400 tracking-wider uppercase mb-8">
          Trusted by Leading Companies
        </h2>
        <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center justify-items-center transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          {companies.map((company) => (
            <div
              key={company.name}
              className="relative w-32 h-12 group"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src={company.logo}
                  alt={`${company.name} logo`}
                  fill
                  className="object-contain transition-all duration-200 filter brightness-50 group-hover:brightness-100"
                  sizes="(max-width: 128px) 100vw, 128px"
                  priority
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-sm font-medium text-white">
                  {company.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
