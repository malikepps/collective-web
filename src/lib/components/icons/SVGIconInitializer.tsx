import React, { useEffect, useState } from 'react';

/**
 * SVGIconInitializer - A component that ensures the FontAwesome SVG+JS system is initialized
 * This component should be included once in your application (ideally in _app.tsx)
 */
const SVGIconInitializer: React.FC = () => {
  const [initialized, setInitialized] = useState(false);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Function to initialize FontAwesome
    const initFontAwesome = () => {
      const fa = (window as any).FontAwesome;
      if (!fa) {
        console.error('[SVG-INIT] FontAwesome not available');
        loadFontAwesomeScripts();
        return false;
      }
      
      if (fa && typeof fa.dom && typeof fa.dom.i2svg === 'function') {
        console.log('[SVG-INIT] Initializing FontAwesome DOM');
        try {
          fa.dom.i2svg();
          console.log('[SVG-INIT] FontAwesome DOM initialized');
          return true;
        } catch (error) {
          console.error('[SVG-INIT] Error initializing FontAwesome DOM:', error);
          return false;
        }
      }
      
      return false;
    };
    
    // Function to load FontAwesome scripts
    const loadFontAwesomeScripts = () => {
      console.log('[SVG-INIT] Loading FontAwesome scripts dynamically');
      
      const scriptSrcs = [
        '/fonts/js/fontawesome.js',
        '/fonts/js/solid.js',
        '/fonts/js/regular.js',
        '/fonts/js/duotone.js',
        '/fonts/js/brands.js'
      ];
      
      const loadScript = (src: string): Promise<void> => {
        return new Promise((resolve, reject) => {
          // Check if script is already loaded
          const existingScript = Array.from(document.querySelectorAll('script')).find(
            s => s.src.includes(src.split('/').pop() || '')
          );
          
          if (existingScript) {
            console.log(`[SVG-INIT] Script already exists: ${src}`);
            resolve();
            return;
          }
          
          const script = document.createElement('script');
          script.src = src;
          script.async = false;
          script.defer = false; // Load synchronously to ensure order
          script.onload = () => {
            console.log(`[SVG-INIT] Script loaded: ${src}`);
            resolve();
          };
          script.onerror = (err) => {
            console.error(`[SVG-INIT] Error loading script ${src}:`, err);
            reject(err);
          };
          document.head.appendChild(script);
        });
      };
      
      // Load main fontawesome.js first, then others
      return loadScript(scriptSrcs[0])
        .then(() => Promise.all(scriptSrcs.slice(1).map(loadScript)))
        .then(() => {
          console.log('[SVG-INIT] All FontAwesome scripts loaded');
          // After loading all scripts, try to initialize
          setTimeout(() => {
            const success = initFontAwesome();
            setInitialized(success);
          }, 100);
        })
        .catch(err => {
          console.error('[SVG-INIT] Failed to load FontAwesome scripts:', err);
        });
    };
    
    // Try to initialize FontAwesome immediately if it's already available
    const success = initFontAwesome();
    setInitialized(success);
    
    // If not successful, try again when the document is fully loaded
    if (!success) {
      const handleLoad = () => {
        console.log('[SVG-INIT] Document loaded, trying to initialize FontAwesome again');
        const retrySuccess = initFontAwesome();
        setInitialized(retrySuccess);
        
        if (!retrySuccess) {
          console.log('[SVG-INIT] FontAwesome still not available, loading scripts');
          loadFontAwesomeScripts();
        }
      };
      
      if (document.readyState === 'complete') {
        handleLoad();
      } else {
        window.addEventListener('load', handleLoad);
        return () => window.removeEventListener('load', handleLoad);
      }
    }
    
    // Set up a MutationObserver to detect dynamically added icons
    const observer = new MutationObserver((mutations) => {
      const fa = (window as any).FontAwesome;
      if (!fa || !fa.dom || typeof fa.dom.i2svg !== 'function') return;
      
      let hasNewIcons = false;
      
      // Check for newly added FontAwesome elements
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) { // Element node
              const element = node as Element;
              // Check if element or its children have FontAwesome classes
              if (
                element.classList?.contains('fa-solid') || 
                element.classList?.contains('fa-regular') || 
                element.classList?.contains('fa-duotone') || 
                element.classList?.contains('fa-brands') ||
                element.querySelectorAll('[class*="fa-"]').length > 0
              ) {
                hasNewIcons = true;
              }
            }
          });
        }
      });
      
      // If new FontAwesome icons were added, process them
      if (hasNewIcons) {
        console.log('[SVG-INIT] New FontAwesome icons detected, processing...');
        fa.dom.i2svg();
      }
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, []);
  
  return null; // This component doesn't render anything
};

export default SVGIconInitializer; 