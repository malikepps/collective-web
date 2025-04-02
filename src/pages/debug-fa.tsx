import React, { useEffect, useState } from 'react';
import { DirectFontAwesome, SVGIcon, DirectSVG } from '@/lib/components/icons';
import Head from 'next/head';

const FontAwesomeDebugPage: React.FC = () => {
  const [fontawesomeStatus, setFontawesomeStatus] = useState<string>('Checking...');
  const [scriptTags, setScriptTags] = useState<string[]>([]);
  const [faObject, setFaObject] = useState<string>('Not found');
  
  useEffect(() => {
    // Check if FontAwesome scripts are loaded
    if (typeof window !== 'undefined') {
      // Check for FontAwesome object
      const fa = (window as any).FontAwesome;
      setFaObject(fa ? 'Found' : 'Not found');
      
      if (fa) {
        setFontawesomeStatus('FontAwesome object exists in window');
        console.log('FontAwesome object:', fa);
      } else {
        setFontawesomeStatus('FontAwesome object NOT found in window');
      }
      
      // Find all script tags related to FontAwesome
      const scripts = document.querySelectorAll('script');
      const faScripts = Array.from(scripts)
        .filter(script => script.src && script.src.includes('fontawesome'))
        .map(script => `${script.src} (${script.async ? 'async' : 'sync'}, ${script.defer ? 'defer' : 'no-defer'})`);
      
      setScriptTags(faScripts);
      
      // Force load the scripts if not found
      if (faScripts.length === 0) {
        const scriptSrcs = [
          '/fonts/js/fontawesome.js',
          '/fonts/js/solid.js',
          '/fonts/js/regular.js',
          '/fonts/js/duotone.js',
          '/fonts/js/brands.js'
        ];
        
        scriptSrcs.forEach(src => {
          const script = document.createElement('script');
          script.src = src;
          script.async = false;
          script.defer = true;
          document.head.appendChild(script);
          console.log(`Added script: ${src}`);
        });
      }
    }
  }, []);
  
  return (
    <div className="p-6">
      <Head>
        <title>FontAwesome Debug</title>
      </Head>
      
      <h1 className="text-2xl font-bold mb-4">FontAwesome Debug Page</h1>
      
      <div className="mb-8 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-bold mb-2">Script Status</h2>
        <p><strong>FontAwesome Object:</strong> {faObject}</p>
        <p><strong>Status:</strong> {fontawesomeStatus}</p>
        
        <h3 className="font-medium mt-4 mb-2">FontAwesome Script Tags:</h3>
        {scriptTags.length > 0 ? (
          <ul className="list-disc pl-6">
            {scriptTags.map((script, i) => (
              <li key={i}>{script}</li>
            ))}
          </ul>
        ) : (
          <p>No FontAwesome script tags found in document</p>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="p-4 bg-gray-100 rounded">
          <h3 className="font-medium mb-4">SVGIcon Component</h3>
          <div className="flex flex-col gap-4 items-center">
            <div className="p-2 bg-white rounded flex items-center justify-center" style={{ width: 60, height: 60 }}>
              <SVGIcon icon="heart" size={40} primaryColor="ff0000" />
            </div>
            <div className="p-2 bg-white rounded flex items-center justify-center" style={{ width: 60, height: 60 }}>
              <SVGIcon icon="rocket" size={40} primaryColor="0000ff" />
            </div>
            <div className="p-2 bg-black rounded flex items-center justify-center" style={{ width: 60, height: 60 }}>
              <SVGIcon icon="user" size={40} primaryColor="ffffff" />
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-gray-100 rounded">
          <h3 className="font-medium mb-4">DirectSVG Component</h3>
          <div className="flex flex-col gap-4 items-center">
            <div className="p-2 bg-white rounded flex items-center justify-center" style={{ width: 60, height: 60 }}>
              <DirectSVG icon="heart" size={40} color="#ff0000" />
            </div>
            <div className="p-2 bg-white rounded flex items-center justify-center" style={{ width: 60, height: 60 }}>
              <DirectSVG icon="rocket" size={40} color="#0000ff" />
            </div>
            <div className="p-2 bg-black rounded flex items-center justify-center" style={{ width: 60, height: 60 }}>
              <DirectSVG icon="user" size={40} color="#ffffff" />
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-gray-100 rounded">
          <h3 className="font-medium mb-4">DirectFontAwesome (Legacy)</h3>
          <div className="flex flex-col gap-4 items-center">
            <div className="p-2 bg-white rounded flex items-center justify-center" style={{ width: 60, height: 60 }}>
              <DirectFontAwesome icon="heart" size={40} color="#ff0000" />
            </div>
            <div className="p-2 bg-white rounded flex items-center justify-center" style={{ width: 60, height: 60 }}>
              <DirectFontAwesome icon="rocket" size={40} color="#0000ff" />
            </div>
            <div className="p-2 bg-black rounded flex items-center justify-center" style={{ width: 60, height: 60 }}>
              <DirectFontAwesome icon="user" size={40} color="#ffffff" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-bold mb-4">Manual Testing</h2>
        <p className="mb-2">Testing direct FA class usage:</p>
        
        <div className="flex gap-4 mb-4">
          <div className="p-2 bg-white rounded flex items-center justify-center" style={{ width: 60, height: 60 }}>
            <i className="fa-solid fa-heart" style={{ fontSize: '40px', color: 'red' }}></i>
          </div>
          <div className="p-2 bg-white rounded flex items-center justify-center" style={{ width: 60, height: 60 }}>
            <i className="fa-solid fa-rocket" style={{ fontSize: '40px', color: 'blue' }}></i>
          </div>
          <div className="p-2 bg-black rounded flex items-center justify-center" style={{ width: 60, height: 60 }}>
            <i className="fa-solid fa-user" style={{ fontSize: '40px', color: 'white' }}></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FontAwesomeDebugPage; 