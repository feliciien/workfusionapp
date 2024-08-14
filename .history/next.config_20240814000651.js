// components/FontComponent.js

import { Inter } from '@next/font/google';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '700'],
});

function FontComponent() {
  return (
    <div style={{ fontFamily: inter.style.fontFamily }}>
      This text is using the Inter font.
    </div>
  );
}

export default FontComponent;