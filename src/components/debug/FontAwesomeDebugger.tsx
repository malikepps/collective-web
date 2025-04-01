import React, { useEffect } from 'react';
import { 
  DebugFontAwesome, 
  DirectFontAwesome, 
  FontAwesomeIcon, 
  IconStyle, 
  loadFontAwesomeCSS, 
  printAvailableFonts 
} from '@/lib/components/icons';

/**
 * A component specifically for debugging the FontAwesome issues in PostCard
 */
const FontAwesomeDebugger: React.FC = () => {
  // Run diagnostic checks on mount
  useEffect(() => {
    console.log('[FONT-DEBUGGER] Starting FontAwesome diagnostics...');
    
    // Force load FontAwesome CSS
    if (typeof window !== 'undefined') {
      console.log('[FONT-DEBUGGER] Attempting to load FontAwesome CSS manually');
      loadFontAwesomeCSS();
      
      // Check if fonts loaded
      setTimeout(() => {
        console.log('[FONT-DEBUGGER] Checking fonts after 1 second...');
        printAvailableFonts();
      }, 1000);
    }
    
    // Check which icon components are being used in PostCard
    console.log('[FONT-DEBUGGER] PostCard is using DirectFontAwesome for icons');
    console.log('[FONT-DEBUGGER] DirectFontAwesome uses SVG paths as fallback, not actual font files');
  }, []);
  
  return (
    <div className="p-4 bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-4">FontAwesome Debugger</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">PostCard Problem Icons</h2>
        <p className="mb-4">These are the problematic icons used in PostCard.tsx:</p>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded flex flex-col items-center">
            <h3 className="font-medium mb-2">DirectFontAwesome (SVG)</h3>
            <div className="flex space-x-4">
              <div className="flex flex-col items-center">
                <DirectFontAwesome icon="heart" size={30} color="#ff0000" />
                <span className="text-sm mt-1">heart</span>
              </div>
              <div className="flex flex-col items-center">
                <DirectFontAwesome icon="rocket" size={30} color="#ff9500" />
                <span className="text-sm mt-1">rocket</span>
              </div>
              <div className="flex flex-col items-center">
                <DirectFontAwesome icon="comment" size={30} color="#ffffff" />
                <span className="text-sm mt-1">comment</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 p-4 rounded flex flex-col items-center">
            <h3 className="font-medium mb-2">FontAwesomeIcon (Font)</h3>
            <div className="flex space-x-4">
              <div className="flex flex-col items-center">
                <FontAwesomeIcon icon="heart" size={30} primaryColor="ff0000" />
                <span className="text-sm mt-1">heart</span>
              </div>
              <div className="flex flex-col items-center">
                <FontAwesomeIcon icon="rocket" size={30} primaryColor="ff9500" />
                <span className="text-sm mt-1">rocket</span>
              </div>
              <div className="flex flex-col items-center">
                <FontAwesomeIcon icon="comment" size={30} primaryColor="ffffff" />
                <span className="text-sm mt-1">comment</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 p-4 rounded flex flex-col items-center">
            <h3 className="font-medium mb-2">Unicode Characters</h3>
            <div className="flex space-x-4">
              <div className="flex flex-col items-center">
                <span style={{ 
                  fontFamily: '"Font Awesome 6 Pro Solid", "FontAwesome6Pro-Solid"',
                  fontSize: '30px',
                  color: '#ff0000'
                }}>&#xf004;</span>
                <span className="text-sm mt-1">heart (f004)</span>
              </div>
              <div className="flex flex-col items-center">
                <span style={{ 
                  fontFamily: '"Font Awesome 6 Pro Solid", "FontAwesome6Pro-Solid"',
                  fontSize: '30px',
                  color: '#ff9500'
                }}>&#xf135;</span>
                <span className="text-sm mt-1">rocket (f135)</span>
              </div>
              <div className="flex flex-col items-center">
                <span style={{ 
                  fontFamily: '"Font Awesome 6 Pro Solid", "FontAwesome6Pro-Solid"',
                  fontSize: '30px',
                  color: '#ffffff'
                }}>&#xf075;</span>
                <span className="text-sm mt-1">comment (f075)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">FontAwesome Loading Diagnosis</h2>
        <div className="mb-4 bg-gray-800 p-4 rounded">
          <button 
            onClick={() => {
              console.log('[FONT-DEBUGGER] Manually triggering font load');
              loadFontAwesomeCSS();
              setTimeout(printAvailableFonts, 500);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4"
          >
            Force Load Fonts
          </button>
          
          <div className="mb-4">
            <h3 className="font-medium mb-2">Font Status Check</h3>
            <pre className="text-xs bg-black p-2 rounded h-16 overflow-auto">
              Check console for detailed font loading logs.
            </pre>
          </div>
          
          <p className="text-sm bg-yellow-800 p-2 rounded">
            <strong>Note:</strong> DirectFontAwesome uses SVG paths as a fallback and doesn't require font files to be loaded.
            If the SVG icons look correct but the font-based icons don't, that indicates the font files are not loading properly.
          </p>
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-2">Comprehensive Debug Panel</h2>
        <DebugFontAwesome />
      </div>
    </div>
  );
};

export default FontAwesomeDebugger; 