import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export const useSubscription = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const checkSubscription = async () => {
      if (!session?.user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/subscription?userId=${session.user.id}`);
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
