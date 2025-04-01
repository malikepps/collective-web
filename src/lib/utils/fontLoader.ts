/**
 * Font loader utility for FontAwesome
 * This utility provides reliable font loading for FontAwesome icons
 */

/**
 * Load FontAwesome fonts and verify they are loaded successfully
 */
export const loadFontAwesomeFonts = async (): Promise<boolean> => {
  console.log('[FONT-LOADER] Starting FontAwesome font loading process');
  
  // Skip if we're not in a browser
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    console.warn('[FONT-LOADER] Not in browser environment, skipping font loading');
    return false;
  }
  
  // Check if our style is already loaded
  const existingStyle = document.getElementById('fontawesome-dynamic-css');
  if (existingStyle) {
    console.log('[FONT-LOADER] FontAwesome styles already loaded, skipping');
    return true;
  }
  
  // Create a new stylesheet for our fonts
  const style = document.createElement('style');
  style.id = 'fontawesome-dynamic-css';
  style.textContent = getFontAwesomeFontFaces();
  
  // Append style to head
  document.head.appendChild(style);
  console.log('[FONT-LOADER] FontAwesome CSS injected into document head');
  
  // Preload important font files
  await preloadFontFiles();
  
  // Verify fonts loaded
  const fontsLoaded = await verifyFontsLoaded();
  
  if (!fontsLoaded) {
    console.error('[FONT-LOADER] ⚠️ FontAwesome fonts failed to load properly');
    
    // Inject font debugging information
    injectFontDebugInfo();
    
    return false;
  }
  
  console.log('[FONT-LOADER] ✅ FontAwesome fonts loaded successfully');
  return true;
};

/**
 * Font faces CSS for FontAwesome
 */
function getFontAwesomeFontFaces(): string {
  return `
    /* FontAwesome */
    @font-face {
      font-family: 'FontAwesome6Pro-Solid';
      src: url('/fonts/fa-solid-900.woff2') format('woff2');
      font-weight: 900;
      font-style: normal;
      font-display: block;
    }
    
    @font-face {
      font-family: 'Font Awesome 6 Pro Solid';
      src: url('/fonts/fa-solid-900.woff2') format('woff2');
      font-weight: 900;
      font-style: normal;
      font-display: block;
    }
    
    @font-face {
      font-family: 'FontAwesome6Pro-Regular';
      src: url('/fonts/fa-regular-400.woff2') format('woff2');
      font-weight: 400;
      font-style: normal;
      font-display: block;
    }
    
    @font-face {
      font-family: 'Font Awesome 6 Pro Regular';
      src: url('/fonts/fa-regular-400.woff2') format('woff2');
      font-weight: 400;
      font-style: normal;
      font-display: block;
    }
    
    @font-face {
      font-family: 'FontAwesome6Brands-Regular';
      src: url('/fonts/fa-brands-400.woff2') format('woff2');
      font-weight: 400;
      font-style: normal;
      font-display: block;
    }
    
    @font-face {
      font-family: 'Font Awesome 6 Brands Regular';
      src: url('/fonts/fa-brands-400.woff2') format('woff2');
      font-weight: 400;
      font-style: normal;
      font-display: block;
    }
    
    @font-face {
      font-family: 'FontAwesome6Duotone-Solid';
      src: url('/fonts/fa-duotone-900.woff2') format('woff2');
      font-weight: 900;
      font-style: normal;
      font-display: block;
    }
    
    @font-face {
      font-family: 'Font Awesome 6 Duotone Solid';
      src: url('/fonts/fa-duotone-900.woff2') format('woff2');
      font-weight: 900;
      font-style: normal;
      font-display: block;
    }
    
    @font-face {
      font-family: 'FontAwesome6Duotone-Regular';
      src: url('/fonts/fa-duotone-regular-400.woff2') format('woff2');
      font-weight: 400;
      font-style: normal;
      font-display: block;
    }
    
    @font-face {
      font-family: 'Font Awesome 6 Duotone Regular';
      src: url('/fonts/fa-duotone-regular-400.woff2') format('woff2');
      font-weight: 400;
      font-style: normal;
      font-display: block;
    }
  `;
}

/**
 * Preload essential font files to ensure they're available
 */
async function preloadFontFiles(): Promise<void> {
  console.log('[FONT-LOADER] Preloading font files');
  
  const fontFiles = [
    '/fonts/fa-solid-900.woff2',
    '/fonts/fa-regular-400.woff2',
    '/fonts/fa-duotone-900.woff2',
    '/fonts/fa-brands-400.woff2'
  ];
  
  try {
    // Create an array of promises for loading each font
    const preloadPromises = fontFiles.map(fontUrl => {
      // Log which font we're trying to preload
      console.log(`[FONT-LOADER] Preloading font: ${fontUrl}`);
      
      return new Promise<boolean>((resolve) => {
        // Create link element
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = fontUrl;
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
        
        // Set up event handlers
        link.onload = () => {
          console.log(`[FONT-LOADER] Successfully preloaded: ${fontUrl}`);
          resolve(true);
        };
        
        link.onerror = () => {
          console.error(`[FONT-LOADER] Failed to preload: ${fontUrl}`);
          resolve(false);
        };
        
        // Add to document
        document.head.appendChild(link);
      });
    });
    
    // Wait for all preloads to complete (don't need the results)
    await Promise.all(preloadPromises);
    console.log('[FONT-LOADER] Finished preloading font files');
  } catch (error) {
    console.error('[FONT-LOADER] Error preloading fonts:', error);
  }
}

/**
 * Verify that fonts are properly loaded
 */
async function verifyFontsLoaded(): Promise<boolean> {
  console.log('[FONT-LOADER] Verifying fonts are loaded...');
  
  // Wait for fonts to be ready
  if (!document.fonts) {
    console.warn('[FONT-LOADER] document.fonts API not available');
    return false;
  }
  
  try {
    // Wait for fonts to be ready
    await document.fonts.ready;
    
    // Check essential font families
    const fontFamilies = [
      '"Font Awesome 6 Pro Solid"',
      '"FontAwesome6Pro-Solid"',
      '"Font Awesome 6 Pro Regular"',
      '"FontAwesome6Pro-Regular"'
    ];
    
    const results = fontFamilies.map(family => ({
      family,
      loaded: document.fonts.check(`1em ${family}`)
    }));
    
    console.table(results);
    
    // Consider it a success if any of the essential fonts are loaded
    return results.some(r => r.loaded);
  } catch (error) {
    console.error('[FONT-LOADER] Error verifying fonts:', error);
    return false;
  }
}

/**
 * Add debug info to the page for font loading issues
 */
function injectFontDebugInfo(): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  
  console.log('[FONT-LOADER] Injecting font debug info into the page');
  
  // Create a simple debug element
  const debugEl = document.createElement('div');
  debugEl.style.position = 'fixed';
  debugEl.style.bottom = '10px';
  debugEl.style.right = '10px';
  debugEl.style.backgroundColor = 'rgba(0,0,0,0.8)';
  debugEl.style.color = 'white';
  debugEl.style.padding = '10px';
  debugEl.style.borderRadius = '5px';
  debugEl.style.zIndex = '9999';
  debugEl.style.fontSize = '12px';
  debugEl.style.maxWidth = '300px';
  
  debugEl.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 5px;">⚠️ FontAwesome Loading Issue</div>
    <div style="margin-bottom: 5px;">Font files may not be loading correctly.</div>
    <div style="margin-bottom: 5px;">Check that files exist in /public/fonts:</div>
    <ul style="margin-left: 15px; margin-bottom: 5px;">
      <li>fa-solid-900.woff2</li>
      <li>fa-regular-400.woff2</li>
      <li>fa-duotone-900.woff2</li>
    </ul>
    <button id="font-debug-close" style="background: #555; border: none; padding: 3px 8px; border-radius: 3px; margin-top: 5px; cursor: pointer;">
      Close
    </button>
  `;
  
  // Add to document
  document.body.appendChild(debugEl);
  
  // Add close button event
  const closeBtn = document.getElementById('font-debug-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      debugEl.remove();
    });
  }
}

export default loadFontAwesomeFonts; 