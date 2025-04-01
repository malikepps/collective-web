/**
 * FontAwesome Font Loader
 * This utility focuses on loading FontAwesome as actual font files,
 * not SVG, to enable traditional font-based icon display
 */

/**
 * Preload FontAwesome fonts and ensure they're ready for use
 */
export const preloadFontAwesomeFonts = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }
  
  // Check if fonts have already been preloaded
  if (document.querySelector('[data-fa-font-loader="true"]')) {
    console.log('[FONT] FontAwesome fonts already preloaded');
    return true;
  }
  
  try {
    console.log('[FONT] Preloading FontAwesome fonts...');
    
    // Font files to preload
    const fontFiles = [
      { url: '/fonts/fa-solid-900.woff2', family: 'Font Awesome 6 Pro Solid' },
      { url: '/fonts/fa-regular-400.woff2', family: 'Font Awesome 6 Pro Regular' },
      { url: '/fonts/fa-brands-400.woff2', family: 'Font Awesome 6 Brands Regular' },
      { url: '/fonts/fa-duotone-900.woff2', family: 'Font Awesome 6 Duotone Solid' }
    ];
    
    // Create preload link elements
    const preloadPromises = fontFiles.map(font => 
      new Promise<boolean>(resolve => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = font.url;
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
        
        link.onload = () => {
          console.log(`[FONT] Preloaded font: ${font.url}`);
          resolve(true);
        };
        
        link.onerror = () => {
          console.error(`[FONT] Failed to preload font: ${font.url}`);
          resolve(false);
        };
        
        document.head.appendChild(link);
      })
    );
    
    // Add a marker to indicate fonts are loaded
    const marker = document.createElement('meta');
    marker.setAttribute('data-fa-font-loader', 'true');
    document.head.appendChild(marker);
    
    // Wait for all fonts to load
    const results = await Promise.all(preloadPromises);
    
    // Check font availability
    await verifyFontAvailability();
    
    return results.every(Boolean);
  } catch (error) {
    console.error('[FONT] Error preloading FontAwesome fonts:', error);
    return false;
  }
};

/**
 * Verify that FontAwesome fonts are available and apply any fixes if needed
 */
export const verifyFontAvailability = async (): Promise<boolean> => {
  if (typeof document === 'undefined' || !document.fonts) {
    return false;
  }
  
  try {
    // Wait for the browser's font loading system to be ready
    await document.fonts.ready;
    
    // Check if critical FontAwesome fonts are loaded
    const fontFamilies = [
      '"Font Awesome 6 Pro Solid"',
      'FontAwesome6Pro-Solid', 
      '"Font Awesome 6 Pro Regular"',
      'FontAwesome6Pro-Regular'
    ];
    
    const results = fontFamilies.map(family => {
      const isLoaded = document.fonts.check(`1em ${family}`);
      console.log(`[FONT] Font "${family}" is ${isLoaded ? 'loaded' : 'not loaded'}`);
      return isLoaded;
    });
    
    // If no fonts are loaded, apply font-face fix
    if (!results.some(Boolean)) {
      console.warn('[FONT] No FontAwesome fonts detected, applying font-face fix');
      applyFontFaceFix();
    }
    
    return results.some(Boolean);
  } catch (error) {
    console.error('[FONT] Error verifying font availability:', error);
    return false;
  }
};

/**
 * Apply emergency CSS fix for FontAwesome font-face declarations
 */
const applyFontFaceFix = (): void => {
  const style = document.createElement('style');
  style.id = 'fa-font-fix';
  style.innerHTML = `
    @font-face {
      font-family: 'Font Awesome 6 Pro Solid';
      font-style: normal;
      font-weight: 900;
      font-display: block;
      src: url('/fonts/fa-solid-900.woff2') format('woff2');
    }
    
    @font-face {
      font-family: 'FontAwesome6Pro-Solid';
      font-style: normal;
      font-weight: 900;
      font-display: block;
      src: url('/fonts/fa-solid-900.woff2') format('woff2');
    }
    
    @font-face {
      font-family: 'Font Awesome 6 Pro Regular';
      font-style: normal;
      font-weight: 400;
      font-display: block;
      src: url('/fonts/fa-regular-400.woff2') format('woff2');
    }
    
    @font-face {
      font-family: 'FontAwesome6Pro-Regular';
      font-style: normal;
      font-weight: 400;
      font-display: block;
      src: url('/fonts/fa-regular-400.woff2') format('woff2');
    }
  `;
  
  document.head.appendChild(style);
  console.log('[FONT] Applied emergency font-face fix');
};

export default preloadFontAwesomeFonts; 