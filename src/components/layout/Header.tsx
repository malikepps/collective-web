import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

export default function Header() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserMenuOpen(false);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    // Close user menu if it's open
    if (userMenuOpen) setUserMenuOpen(false);
  };
  
  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
    // Close mobile menu if it's open
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };
  
  return (
    <header className="bg-card shadow-md">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              {/* Replace with your logo */}
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center mr-2">
                <span className="text-white text-lg">✨</span>
              </div>
              <span className="text-xl font-bold text-white">Collective</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:ml-6 md:flex md:space-x-6">
              <Link 
                href="/" 
                className={`px-3 py-2 text-sm font-medium ${
                  router.pathname === '/' 
                    ? 'text-primary' 
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Home
              </Link>
              <Link 
                href="/explore" 
                className={`px-3 py-2 text-sm font-medium ${
                  router.pathname.startsWith('/explore') 
                    ? 'text-primary' 
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Explore
              </Link>
              {user && (
                <Link 
                  href="/profile" 
                  className={`px-3 py-2 text-sm font-medium ${
                    router.pathname.startsWith('/profile') 
                      ? 'text-primary' 
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  My Profile
                </Link>
              )}
            </nav>
          </div>
          
          <div className="flex items-center">
            {/* User Menu (Desktop) */}
            {!loading && (
              <>
                {user ? (
                  <div className="ml-3 relative">
                    <div>
                      <button
                        onClick={toggleUserMenu}
                        className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        id="user-menu"
                        aria-expanded="false"
                        aria-haspopup="true"
                      >
                        <span className="sr-only">Open user menu</span>
                        <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-700">
                          {user.photoURL ? (
                            <Image
                              src={user.photoURL}
                              alt={user.displayName || 'User'}
                              width={32}
                              height={32}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-white">
                              {user.displayName?.[0]?.toUpperCase() || '👤'}
                            </div>
                          )}
                        </div>
                      </button>
                    </div>
                    
                    {/* User Dropdown Menu */}
                    {userMenuOpen && (
                      <div
                        className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-card ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="user-menu"
                      >
                        <div className="py-1" role="none">
                          <Link
                            href="/profile"
                            className="block px-4 py-2 text-sm text-white/90 hover:bg-gray-700"
                            role="menuitem"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            Your Profile
                          </Link>
                          <Link
                            href="/settings"
                            className="block px-4 py-2 text-sm text-white/90 hover:bg-gray-700"
                            role="menuitem"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            Settings
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-white/90 hover:bg-gray-700"
                            role="menuitem"
                          >
                            Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="hidden md:flex items-center space-x-2">
                    <Link
                      href="/login"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
                    >
                      Sign in
                    </Link>
                  </div>
                )}
              </>
            )}
            
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden ml-3">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-white/70 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {/* Icon when menu is closed */}
                {!mobileMenuOpen ? (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                ) : (
                  // Icon when menu is open
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                router.pathname === '/'
                  ? 'bg-gray-900 text-primary'
                  : 'text-white/70 hover:bg-gray-700 hover:text-white'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/explore"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                router.pathname.startsWith('/explore')
                  ? 'bg-gray-900 text-primary'
                  : 'text-white/70 hover:bg-gray-700 hover:text-white'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Explore
            </Link>
            {user ? (
              <>
                <Link
                  href="/profile"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    router.pathname.startsWith('/profile')
                      ? 'bg-gray-900 text-primary'
                      : 'text-white/70 hover:bg-gray-700 hover:text-white'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Profile
                </Link>
                <Link
                  href="/settings"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    router.pathname.startsWith('/settings')
                      ? 'bg-gray-900 text-primary'
                      : 'text-white/70 hover:bg-gray-700 hover:text-white'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white/70 hover:bg-gray-700 hover:text-white"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="block px-3 py-2 rounded-md text-base font-medium bg-primary text-white hover:bg-primary/90"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
} 