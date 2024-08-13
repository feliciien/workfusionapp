import { useEffect } from 'react';
import Crisp from 'crisp-sdk-web';

export const CrispChat = () => {
  useEffect(() => {
    const websiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;

    if (websiteId) {
      Crisp.configure(websiteId);
    } else {
      console.error('Crisp website ID is not set.');
    }
  }, []);

  return null;
};