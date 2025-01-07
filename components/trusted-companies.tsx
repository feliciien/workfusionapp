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
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleImageLoad = (name: string) => {
    setLoadedImages(prev => ({ ...prev, [name]: true }));
  };

  const allImagesLoaded = companies.every(company => loadedImages[company.name]);

  return (
    <section className="py-12 bg-[#111827]/50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-base font-medium text-gray-400 tracking-wider uppercase mb-8">
          Trusted by Leading Companies
        </h2>
        <div 
          className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center justify-items-center transition-opacity duration-500 ${
            mounted && allImagesLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {companies.map((company) => (
            <div
              key={company.name}
              className="relative w-32 h-12 group"
            >
              {!loadedImages[company.name] && mounted && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src={company.logo}
                  alt={`${company.name} logo`}
                  width={128}
                  height={48}
                  className={`transition-opacity duration-300 ${
                    loadedImages[company.name] ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    filter: 'brightness(0) invert(1)',
                    opacity: '0.7',
                  }}
                  onLoad={() => handleImageLoad(company.name)}
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
