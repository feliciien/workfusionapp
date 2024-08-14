// components/FontComponent.tsx

import { Inter } from '@next/font/google';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '700'],
});

const FontComponent = () => (
  <div style={{ fontFamily: inter.style.fontFamily }}>
    This text is using the Inter font.
  </div>
);

export default FontComponent;