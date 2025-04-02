import React, { useState, useEffect } from 'react';
import { FAIcon, IconStyle } from '@/lib/components/icons';
import Head from 'next/head';

interface FontTest {
  family: string;
  loaded: boolean;
}

const FontTestPage: React.FC = () => {
  const [fontTests, setFontTests] = useState<FontTest[]>([]);
  const [jsAvailable, setJsAvailable] = useState<boolean>(false);
  const [fileCheck, setFileCheck] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    setIsLoading(true);
    
    // Check font availability
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        const families = [
          '"Font Awesome 6 Pro Solid"',
          'FontAwesome6Pro-Solid',
          '"Font Awesome 6 Pro Regular"',
          'FontAwesome6Pro-Regular',
          '"Font Awesome 6 Duotone Solid"',
          'FontAwesome6Duotone-Solid',
          '"Font Awesome 6 Brands Regular"',
          'FontAwesome6Brands-Regular'
        ];
        
        const tests = families.map(family => ({
          family,
          loaded: document.fonts.check(`1em ${family}`)
        }));
        
        setFontTests(tests);
      });
    }
    
    // Check if FontAwesome JS is available
    const checkJsAvailability = () => {
      const fa = (window as any).FontAwesome;
      setJsAvailable(!!fa && typeof fa.dom === 'object' && typeof fa.dom.i2svg === 'function');
    };
    
    checkJsAvailability();
    
    // Check again after a delay in case it loads asynchronously
    setTimeout(checkJsAvailability, 2000);
    
    // Fetch file check endpoint
    fetch('/api/font-check')
      .then(response => response.json())
      .then(data => {
        setFileCheck(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error checking files:', error);
        setIsLoading(false);
      });
  }, []);
  
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Head>
        <title>FontAwesome Diagnostics</title>
      </Head>
      
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">FontAwesome Diagnostics</h1>
        
        {isLoading ? (
          <div className="text-center py-10">Loading diagnostics...</div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">FontAwesome JS Availability</h2>
              <div className={`py-2 px-4 rounded ${jsAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {jsAvailable ? 'FontAwesome JS is available' : 'FontAwesome JS is NOT available'}
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Font Families</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fontTests.map((test, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded border ${test.loaded ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                  >
                    <div className="text-sm font-mono mb-1">{test.family}</div>
                    <div className={`text-sm font-semibold ${test.loaded ? 'text-green-600' : 'text-red-600'}`}>
                      {test.loaded ? 'Loaded' : 'Not Loaded'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Server Files</h2>
              
              <div className="mb-4">
                <h3 className="font-medium mb-2">Font Files</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {fileCheck?.fontFiles.map((file: any, index: number) => (
                    <div 
                      key={index} 
                      className={`p-2 rounded text-sm ${file.exists ? 'bg-green-50' : 'bg-red-50'}`}
                    >
                      <div className="font-mono">{file.path}</div>
                      <div className={`text-xs font-semibold ${file.exists ? 'text-green-600' : 'text-red-600'}`}>
                        {file.exists ? `Exists (${Math.round(file.size / 1024)}kb)` : 'Missing'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">JS Files</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {fileCheck?.jsFiles.map((file: any, index: number) => (
                    <div 
                      key={index} 
                      className={`p-2 rounded text-sm ${file.exists ? 'bg-green-50' : 'bg-red-50'}`}
                    >
                      <div className="font-mono">{file.path}</div>
                      <div className={`text-xs font-semibold ${file.exists ? 'text-green-600' : 'text-red-600'}`}>
                        {file.exists ? `Exists (${Math.round(file.size / 1024)}kb)` : 'Missing'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Icon Tests</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Solid Icons */}
                <div className="p-4 border rounded text-center">
                  <div className="mb-2 text-sm font-medium">Solid</div>
                  <div className="flex justify-center mb-2">
                    <FAIcon icon="heart" size={32} style={IconStyle.SOLID} />
                  </div>
                  <div className="text-xs text-gray-500">heart</div>
                </div>
                
                {/* Regular Icons */}
                <div className="p-4 border rounded text-center">
                  <div className="mb-2 text-sm font-medium">Regular</div>
                  <div className="flex justify-center mb-2">
                    <FAIcon icon="user" size={32} style={IconStyle.REGULAR} />
                  </div>
                  <div className="text-xs text-gray-500">user</div>
                </div>
                
                {/* Duotone Icons */}
                <div className="p-4 border rounded text-center">
                  <div className="mb-2 text-sm font-medium">Duotone</div>
                  <div className="flex justify-center mb-2">
                    <FAIcon 
                      icon="star" 
                      size={32} 
                      style={IconStyle.DUOTONE}
                      primaryColor="#ff9500"
                      secondaryColor="#ffcc00"
                    />
                  </div>
                  <div className="text-xs text-gray-500">star</div>
                </div>
                
                {/* Brands Icons */}
                <div className="p-4 border rounded text-center">
                  <div className="mb-2 text-sm font-medium">Brands</div>
                  <div className="flex justify-center mb-2">
                    <FAIcon icon="github" size={32} style={IconStyle.BRANDS} />
                  </div>
                  <div className="text-xs text-gray-500">github</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FontTestPage; 