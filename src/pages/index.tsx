import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Not logged in, redirect to onboarding
        console.log('No authenticated user, redirecting to onboarding');
        router.push('/onboarding');
        return;
      }

      console.log('User authenticated:', user.uid, user.isAnonymous ? '(anonymous)' : '');

      // Get user data from Firestore
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('User data retrieved from Firestore');
          setUsername(userData.display_name || '');
          setPhotoUrl(userData.photo_url || '');
        } else {
          console.log('User document does not exist');
          // User is authenticated but document doesn't exist yet
          // This can happen during onboarding - redirect back
          if (window.location.pathname !== '/onboarding') {
            router.push('/onboarding');
            return;
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1D1D1D] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1D1D1D] flex flex-col">
      {/* Header */}
      <header className="bg-[#1D1D1D] border-b border-gray-800 py-4 px-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <h1 className="text-white text-xl font-marfa">Collective</h1>
          {photoUrl ? (
            <img 
              src={photoUrl} 
              alt="Profile" 
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">{username.charAt(0)}</span>
            </div>
          )}
        </div>
      </header>

      {/* Organization quick access */}
      <div className="bg-[#1D1D1D] py-4 px-4 border-b border-gray-800">
        <div className="max-w-md mx-auto">
          <h2 className="text-white text-lg font-marfa mb-3">Communities</h2>
          <div className="flex space-x-4 overflow-x-auto pb-2 -mx-1 px-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div 
                key={i} 
                className="flex-shrink-0 w-16 flex flex-col items-center"
              >
                <div className="w-14 h-14 bg-gray-700 rounded-full mb-1"></div>
                <span className="text-white text-xs text-center">Community {i}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-md mx-auto py-4 px-4">
          <div className="mb-6">
            <div className="bg-[#2A2A2A] rounded-xl p-4 mb-1">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-gray-700 rounded-full mr-3"></div>
                <div>
                  <p className="text-white font-marfa text-sm">Nonprofit Name</p>
                  <p className="text-gray-400 text-xs">Just now</p>
                </div>
              </div>
              <p className="text-white mb-4">Welcome to Collective! This is where you'll see updates from the communities you follow.</p>
              <div className="bg-gray-700 rounded-lg h-48 w-full"></div>
            </div>
            <div className="flex justify-between items-center px-2">
              <div className="flex items-center space-x-2">
                <button className="text-gray-400 flex items-center space-x-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  <span>Like</span>
                </button>
              </div>
              <button className="text-gray-400 flex items-center space-x-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                </svg>
                <span>Comment</span>
              </button>
            </div>
          </div>

          {/* Empty state */}
          <div className="text-center py-10">
            <p className="text-gray-400 mb-2">Welcome, {username}!</p>
            <p className="text-gray-500 text-sm">Follow communities to see their updates in your feed.</p>
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="bg-[#1D1D1D] border-t border-gray-800 py-3 px-4 sticky bottom-0">
        <div className="max-w-md mx-auto flex justify-around">
          <button className="text-green-500 flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1">Home</span>
          </button>
          <button className="text-gray-500 flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs mt-1">Discover</span>
          </button>
          <button className="text-gray-500 flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="text-xs mt-1">Alerts</span>
          </button>
          <button className="text-gray-500 flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
} 