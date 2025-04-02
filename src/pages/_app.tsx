import '@/styles/globals.css';
import '@/styles/fonts.css';
import '@/styles/fontawesome.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from '@/lib/context/AuthContext';
import { ThemeProvider } from '@/lib/context/ThemeContext';
import { useEffect } from 'react';
import Head from 'next/head';
import loadFontAwesomeFonts from '@/lib/utils/fontLoader';
import { printAvailableFonts } from '@/lib/components/icons';
import preloadFontAwesomeFonts from '@/lib/utils/fontAwesomeFontLoader';

export default function App({ Component, pageProps }: AppProps) {
  // Initialize font loading when app mounts
  useEffect(() => {
    console.log('[App] Initializing font loading');
    
    // First try to load the fonts directly (preferred method)
    preloadFontAwesomeFonts()
      .then(success => {
        console.log(`[App] Direct FontAwesome font loading: ${success ? 'SUCCESS' : 'FAILED'}`);
        
        if (!success) {
          // Fall back to the older font loading mechanism if direct method fails
          loadFontAwesomeFonts()
            .then(fallbackSuccess => {
              console.log(`[App] Fallback FontAwesome font loading: ${fallbackSuccess ? 'SUCCESS' : 'FAILED'}`);
              
              if (!fallbackSuccess) {
                console.warn('[App] All FontAwesome font loading methods failed');
                printAvailableFonts();
              }
            });
        }
      })
      .catch(error => {
        console.error('[App] Error loading FontAwesome fonts:', error);
      });
    
    // Add window error handler to catch font loading errors
    const originalOnError = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
      // Check if it's a font loading error
      if (
        message && 
        (
          message.toString().includes('font') || 
          message.toString().includes('FontAwesome') ||
          message.toString().includes('.woff')
        )
      ) {
        console.error('[App] Caught font loading error:', message);
        // Attempt to reload fonts
        preloadFontAwesomeFonts();
      }
      
      // Call original handler
      if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error);
      }
      return false;
    };
    
    // Create link preload elements for critical font files
    if (typeof document !== 'undefined') {
      const fontFiles = [
        '/fonts/fa-solid-900.woff2',
        '/fonts/fa-regular-400.woff2'
      ];
      
      fontFiles.forEach(fontUrl => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = fontUrl;
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
        
        console.log(`[App] Preloaded font file: ${fontUrl}`);
      });
    }
  }, []);
  
  return (
    <AuthProvider>
      <ThemeProvider>
        <Head>
          {/* Load FontAwesome SVG+JS scripts */}
          <script defer src="/fonts/js/fontawesome.js"></script>
          <script defer src="/fonts/js/solid.js"></script>
          <script defer src="/fonts/js/regular.js"></script>
          <script defer src="/fonts/js/duotone.js"></script>
          <script defer src="/fonts/js/brands.js"></script>
        </Head>
        <Component {...pageProps} />
      </ThemeProvider>
    </AuthProvider>
  );
} 