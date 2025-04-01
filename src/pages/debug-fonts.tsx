import React, { useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import FontAwesomeDebugger from '@/components/debug/FontAwesomeDebugger';
import Head from 'next/head';
import { loadFontAwesomeCSS, printAvailableFonts } from '@/lib/components/icons';

export default function DebugFontsPage() {
  useEffect(() => {
    // Force load CSS and check if fonts are available
    if (typeof window !== 'undefined') {
      console.log('[DEBUG PAGE] Initializing font debugging');
      loadFontAwesomeCSS();
      
      // Check font status after a brief delay
      setTimeout(() => {
        printAvailableFonts();
      }, 1000);
    }
  }, []);
  
  return (
    <Layout title="Font Debugging">
      <Head>
        <title>FontAwesome Debugging | Collective</title>
        <meta name="robots" content="noindex" />
      </Head>
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">FontAwesome Debugging</h1>
        <p className="mb-8">
          This page helps diagnose issues with FontAwesome icons in the Collective web app.
        </p>
        
        <FontAwesomeDebugger />
      </div>
    </Layout>
  );
} 