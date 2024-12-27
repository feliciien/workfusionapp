import { create } from 'zustand';
import { useEffect, useState } from 'react';

export const useSubscription = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const response = await fetch('/api/subscription');
        const data = await response.json();
        setIsPro(data.isPro);
      } catch (error) {
        console.error('Error checking subscription:', error);
        setIsPro(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, []);

  return {
    isLoading,
    isPro
  };
};
