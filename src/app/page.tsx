'use client';
 
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the main page
    router.push('/');
  }, [router]);
  
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-pulse">Redirecionando...</div>
    </div>
  );
}