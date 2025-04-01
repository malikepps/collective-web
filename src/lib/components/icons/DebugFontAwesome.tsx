import React, { useEffect, useState } from 'react';
import FontAwesomeIcon, { IconStyle } from './FontAwesomeIcon';
import DirectFontAwesome from './DirectFontAwesome';
import { printAvailableFonts } from './FontAwesome';

const DebugFontAwesome: React.FC = () => {
  const [fontsChecked, setFontsChecked] = useState(false);
  const [fontStatus, setFontStatus] = useState<Record<string, boolean>>({});
  
  // Test icons that we know should be in the font
  const testIcons = ['heart', 'rocket', 'comment', 'star', 'check'];
  
  // Check if fonts are loaded
  useEffect(() => {
    console.log('[FONT-DEBUG] DebugFontAwesome component mounted');
    
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const fonts = document.fonts;
      if (fonts) {
        fonts.ready.then(() => {
          console.log('[FONT-DEBUG] Font loading complete, checking availability');
          
          const fontFamilies = [
            '"Font Awesome 6 Pro Solid"',
            '"FontAwesome6Pro-Solid"',
            '"Font Awesome 6 Pro Regular"',
            '"FontAwesome6Pro-Regular"',
            '"Font Awesome 6 Duotone Solid"',
            '"FontAwesome6Duotone-Solid"',
            '"Font Awesome 6 Brands Regular"',
            '"FontAwesome6Brands-Regular"'
          ];
          
          const status: Record<string, boolean> = {};
          
          fontFamilies.forEach(family => {
            status[family] = fonts.check(`1em ${family}`);
          });
          
          setFontStatus(status);
          setFontsChecked(true);
          
          // Also run the print available fonts function
          printAvailableFonts();
        });
      }
    }
  }, []);
  
  // Try loading the fonts dynamically
  const forceLoadFonts = () => {
    console.log('[FONT-DEBUG] Attempting to force load fonts');
    
    // Create a helper function to load a font file
    const loadFontFile = (url: string) => {
      console.log(`[FONT-DEBUG] Loading font from: ${url}`);
      
      const link = document.createElement('link');
      link.href = url;
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      
      document.head.appendChild(link);
      
      // Also try with @font-face
      const style = document.createElement('style');
      const fontName = url.split('/').pop()?.split('.')[0] || 'unknown';
      
      style.textContent = `
        @font-face {
          font-family: '${fontName}-Debug';
          src: url('${url}') format('woff2');
          font-weight: normal;
          font-style: normal;
          font-display: block;
        }
      `;
      
      document.head.appendChild(style);
    };
    
    // Load all font files
    loadFontFile('/fonts/fa-solid-900.woff2');
    loadFontFile('/fonts/fa-regular-400.woff2');
    loadFontFile('/fonts/fa-duotone-900.woff2');
    loadFontFile('/fonts/fa-duotone-regular-400.woff2');
    loadFontFile('/fonts/fa-brands-400.woff2');
    
    // Check again after a short delay
    setTimeout(() => {
      if (typeof document !== 'undefined') {
        const fonts = document.fonts;
        if (fonts) {
          fonts.ready.then(() => {
            console.log('[FONT-DEBUG] Rechecking font availability after force load');
            
            const fontFamilies = [
              '"Font Awesome 6 Pro Solid"',
              '"FontAwesome6Pro-Solid"',
              '"Font Awesome 6 Pro Regular"',
              '"FontAwesome6Pro-Regular"',
              '"Font Awesome 6 Duotone Solid"',
              '"FontAwesome6Duotone-Solid"',
              '"Font Awesome 6 Brands Regular"',
              '"FontAwesome6Brands-Regular"'
            ];
            
            const status: Record<string, boolean> = {};
            
            fontFamilies.forEach(family => {
              status[family] = fonts.check(`1em ${family}`);
            });
            
            setFontStatus(status);
            
            // Log all loaded fonts
            try {
              const loadedFonts = Array.from(fonts).map(font => `${font.family} (${font.style}, ${font.weight})`);
              console.log('[FONT-DEBUG] All loaded fonts after force load:');
              console.table(loadedFonts);
            } catch (e) {
              console.error('[FONT-DEBUG] Error listing loaded fonts:', e);
            }
          });
        }
      }
    }, 1000);
  };
  
  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold mb-4">FontAwesome Debug Panel</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Font Loading Status</h3>
        {fontsChecked ? (
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(fontStatus).map(([family, loaded]) => (
              <div key={family} className="flex items-center">
                <span className={`inline-block w-4 h-4 rounded-full mr-2 ${loaded ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="font-mono text-sm">{family}: {loaded ? 'Loaded ✅' : 'Not Loaded ❌'}</span>
              </div>
            ))}
          </div>
        ) : (
          <p>Checking font status...</p>
        )}
        
        <button 
          onClick={forceLoadFonts}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Force Load Fonts
        </button>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">FontAwesomeIcon Component Test</h3>
        <div className="grid grid-cols-3 gap-4">
          {testIcons.map(icon => (
            <div key={`fa-${icon}`} className="flex flex-col items-center p-2 bg-gray-700 rounded">
              <FontAwesomeIcon icon={icon} size={32} style={IconStyle.CLASSIC} />
              <span className="mt-2 text-xs">{icon} (classic)</span>
            </div>
          ))}
          
          {testIcons.map(icon => (
            <div key={`fa-regular-${icon}`} className="flex flex-col items-center p-2 bg-gray-700 rounded">
              <FontAwesomeIcon icon={icon} size={32} style={IconStyle.REGULAR} />
              <span className="mt-2 text-xs">{icon} (regular)</span>
            </div>
          ))}
          
          {testIcons.map(icon => (
            <div key={`fa-duotone-${icon}`} className="flex flex-col items-center p-2 bg-gray-700 rounded">
              <FontAwesomeIcon 
                icon={icon} 
                size={32} 
                style={IconStyle.DUOTONE} 
                primaryColor="7b89a3"
                secondaryColor="95df9e"
              />
              <span className="mt-2 text-xs">{icon} (duotone)</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">DirectFontAwesome Component Test</h3>
        <div className="grid grid-cols-5 gap-4">
          {testIcons.map(icon => (
            <div key={`direct-${icon}`} className="flex flex-col items-center p-2 bg-gray-700 rounded">
              <DirectFontAwesome icon={icon} size={32} color="#ffffff" />
              <span className="mt-2 text-xs">{icon}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Unicode Character Test</h3>
        <div className="grid grid-cols-5 gap-4">
          {[
            { name: 'heart', unicode: '\uf004' },
            { name: 'rocket', unicode: '\uf135' },
            { name: 'comment', unicode: '\uf075' },
            { name: 'star', unicode: '\uf005' },
            { name: 'check', unicode: '\uf00c' }
          ].map(icon => (
            <div key={`unicode-${icon.name}`} className="flex flex-col items-center p-2 bg-gray-700 rounded">
              <span style={{ 
                fontFamily: '"Font Awesome 6 Pro Solid", "FontAwesome6Pro-Solid"',
                fontSize: '32px'
              }}>
                {icon.unicode}
              </span>
              <span className="mt-2 text-xs">{icon.name} (unicode)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DebugFontAwesome; 