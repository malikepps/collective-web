import '@/styles/globals.css';
import '@/styles/fonts.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from '@/lib/context/AuthContext';
import { ThemeProvider } from '@/lib/context/ThemeContext';
import { useEffect } from 'react';
import loadFontAwesomeFonts from '@/lib/utils/fontLoader';
import { printAvailableFonts } from '@/lib/components/icons';

export default function App({ Component, pageProps }: AppProps) {
  // Initialize font loading when app mounts
  useEffect(() => {
    console.log('[App] Initializing font loading');
    
    // Load FontAwesome fonts
    loadFontAwesomeFonts()
      .then(success => {
        console.log(`[App] FontAwesome fonts loaded: ${success ? 'SUCCESS' : 'FAILED'}`);
        
        // Print available fonts for debugging
        if (!success) {
          console.warn('[App] FontAwesome fonts failed to load, check font files');
          printAvailableFonts();
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
        loadFontAwesomeFonts();
      }
      
      // Call original handler
      if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error);
      }
      return false;
    };
  }, []);
  
  return (
    <AuthProvider>
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </AuthProvider>
  );
} 