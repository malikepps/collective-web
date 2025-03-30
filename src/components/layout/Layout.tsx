import React, { ReactNode } from 'react';
import Head from 'next/head';
import Header from './Header';
import { useTheme } from '@/lib/context/ThemeContext';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'Collective - Support Nonprofits' 
}) => {
  const { appBackgroundColor } = useTheme();
  
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <meta name="description" content="Support your favorite nonprofits with Collective" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div 
        className="min-h-screen flex flex-col"
        style={{ 
          backgroundColor: appBackgroundColor || '#121212',
          color: '#ffffff'
        }}
      >
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <footer className="bg-card py-6">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-white/60 text-sm">© {new Date().getFullYear()} Collective. All rights reserved.</p>
              </div>
              <div className="flex space-x-6">
                <a href="#" className="text-white/60 hover:text-white text-sm">Privacy Policy</a>
                <a href="#" className="text-white/60 hover:text-white text-sm">Terms of Service</a>
                <a href="#" className="text-white/60 hover:text-white text-sm">Contact Us</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Layout; 