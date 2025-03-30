import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function IndexRouter() {
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Not logged in, redirect to onboarding
        console.log('No authenticated user, redirecting to onboarding');
        router.push('/onboarding');
        return;
      }

      console.log('User authenticated, redirecting to home page');
      router.push('/home');
    });

    return () => unsubscribe();
  }, [router]);

  // Display loading state
  return (
    <div className="min-h-screen bg-[#1D1D1D] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
} 