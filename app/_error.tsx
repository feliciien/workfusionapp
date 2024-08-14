// app/_error.tsx
import { useEffect } from 'react';

export default function ErrorPage({ error }: { error: Error }) {
  useEffect(() => {
    console.error('Custom error page:', error);
  }, [error]);

  return <h1>Something went wrong.</h1>;
}
