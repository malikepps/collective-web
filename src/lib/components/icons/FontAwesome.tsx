import React from 'react';

// Font families for FontAwesome
export const FontFamilies = {
  solid: '"Font Awesome 6 Pro Solid", "FontAwesome6Pro-Solid"',
  regular: '"Font Awesome 6 Pro Regular", "FontAwesome6Pro-Regular"',
  brands: '"Font Awesome 6 Brands Regular", "FontAwesome6Brands-Regular"',
  duotoneSolid: '"Font Awesome 6 Duotone Solid", "FontAwesome6Duotone-Solid"',
};

// Common icons used in the app - matches Swift implementation
export enum Icon {
  // Navigation
  HOME = 'house',
  SEARCH = 'magnifying-glass',
  MESSAGES = 'envelope',
  NOTIFICATIONS = 'bell',
  USER = 'user',
  MENU = 'bars',
  SETTINGS = 'gear',
  CLOSE = 'xmark',
  BACK = 'chevron-left',
  FORWARD = 'chevron-right',
  
  // Actions
  ADD = 'plus',
  EDIT = 'pen',
  DELETE = 'trash',
  SAVE = 'floppy-disk',
  UPLOAD = 'upload',
  DOWNLOAD = 'download',
  SHARE = 'share',
  LIKE = 'heart',
  COMMENT = 'comment',
  COMMENTS = 'comments',
  BOOKMARK = 'bookmark',
  CAMERA = 'camera',
  GALLERY = 'image',
  CALENDAR = 'calendar',
  LOCATION = 'location-dot',
  LINK = 'link',
  SEND = 'paper-plane',
  FILTER = 'sliders',
  
  // Status
  SUCCESS = 'check-circle',
  WARNING = 'triangle-exclamation',
  ERROR = 'circle-exclamation',
  INFO = 'circle-info',
  LOCK = 'lock',
  UNLOCK = 'unlock',
  VERIFY = 'check',
  
  // Media
  PLAY = 'play',
  PAUSE = 'pause',
  STOP = 'stop',
  CIRCLE_PLAY = 'circle-play',
  VOLUME = 'volume-high',
  MUTE = 'volume-xmark',
  
  // Misc
  STAR = 'star',
  SOLAR_SYSTEM = 'solar-system',
  
  // Additional icons
  CIRCLE_UP = 'circle-up',
  ARROW_UP_RIGHT = 'arrow-up-right',
  ROCKET = 'rocket',
  FIRE = 'fire',
  COMMENT_DOTS = 'comment-dots',
  HEART_CIRCLE = 'heart-circle',
  INFO_CIRCLE = 'info-circle',
  CHECK_DOUBLE = 'check-double',
  CERTIFICATE = 'certificate',
  FLAG = 'flag',
  CLOCK = 'clock',
  TICKET = 'ticket',
  GIFT = 'gift',
  PERCENT = 'percent',
  MONEY_CHECK_DOLLAR = 'money-check-dollar',
  CREDIT_CARD = 'credit-card',
  CIRCLE_DOLLAR = 'circle-dollar',
  BADGE_CHECK = 'badge-check',
  CIRCLE_EXCLAMATION = 'circle-exclamation',
  CIRCLE_CHECK = 'circle-check',
  CIRCLE_XMARK = 'circle-xmark',
  EARTH_AMERICAS = 'earth-americas',
}

// Helper function to create color from hex string
export const colorFromHex = (hex: string): string => {
  const cleanHex = hex.trim().startsWith('#') ? hex.trim().substring(1) : hex.trim();
  return `#${cleanHex}`;
};

// Set up color pairs for duotone icons - matches Swift implementation
export interface DuotoneColors {
  primary: string;
  secondary: string;
}

export const DuotoneColorPresets = {
  inactive: { primary: '#808080', secondary: '#808080' },
  solarSystemActive: {
    primary: colorFromHex('7b89a3'),
    secondary: colorFromHex('95df9e')
  },
  playIcon: {
    primary: '#000000',
    secondary: '#FFFFFF'
  },
};

// Helper function to load FontAwesome CSS
export const loadFontAwesomeCSS = (): void => {
  console.log('[DEBUG-FONTS] Attempting to load FontAwesome CSS...');
  
  // Check if the style element already exists
  const existingStyle = document.getElementById('fontawesome-css');
  if (existingStyle) {
    console.log('[DEBUG-FONTS] FontAwesome CSS already loaded, skipping');
    return;
  }

  // Create style element
  const style = document.createElement('style');
  style.id = 'fontawesome-css';
  style.textContent = `
    @font-face {
      font-family: 'FontAwesome6Pro-Solid';
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
      font-family: 'FontAwesome6Brands-Regular';
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
      font-family: 'FontAwesome6Duotone-Regular';
      src: url('/fonts/fa-duotone-regular-400.woff2') format('woff2');
      font-weight: 400;
      font-style: normal;
      font-display: block;
    }
    
    /* Marfa fonts */
    @font-face {
      font-family: 'Marfa';
      src: url('/fonts/ABCMarfa-Regular-Trial.woff2') format('woff2');
      font-weight: 400;
      font-style: normal;
      font-display: swap;
    }
    
    @font-face {
      font-family: 'Marfa';
      src: url('/fonts/ABCMarfa-Medium-Trial.woff2') format('woff2');
      font-weight: 500;
      font-style: normal;
      font-display: swap;
    }
    
    @font-face {
      font-family: 'Marfa';
      src: url('/fonts/ABCMarfa-Semibold-Trial.woff2') format('woff2');
      font-weight: 600;
      font-style: normal;
      font-display: swap;
    }
    
    @font-face {
      font-family: 'Marfa';
      src: url('/fonts/ABCMarfa-Bold-Trial.woff2') format('woff2');
      font-weight: 700;
      font-style: normal;
      font-display: swap;
    }
    
    @font-face {
      font-family: 'Marfa';
      src: url('/fonts/ABCMarfa-Black-Trial.woff2') format('woff2');
      font-weight: 900;
      font-style: normal;
      font-display: swap;
    }
    
    @font-face {
      font-family: 'Marfa';
      src: url('/fonts/ABCMarfa-Light-Trial.woff2') format('woff2');
      font-weight: 300;
      font-style: normal;
      font-display: swap;
    }
    
    @font-face {
      font-family: 'Marfa';
      src: url('/fonts/ABCMarfa-Thin-Trial.woff2') format('woff2');
      font-weight: 100;
      font-style: normal;
      font-display: swap;
    }
    
    @font-face {
      font-family: 'Marfa';
      src: url('/fonts/ABCMarfa-RegularItalic-Trial.woff2') format('woff2');
      font-weight: 400;
      font-style: italic;
      font-display: swap;
    }
    
    @font-face {
      font-family: 'Marfa';
      src: url('/fonts/ABCMarfa-MediumItalic-Trial.woff2') format('woff2');
      font-weight: 500;
      font-style: italic;
      font-display: swap;
    }
    
    @font-face {
      font-family: 'Marfa';
      src: url('/fonts/ABCMarfa-SemiboldItalic-Trial.woff2') format('woff2');
      font-weight: 600;
      font-style: italic;
      font-display: swap;
    }
    
    @font-face {
      font-family: 'Marfa';
      src: url('/fonts/ABCMarfa-LightItalic-Trial.woff2') format('woff2');
      font-weight: 300;
      font-style: italic;
      font-display: swap;
    }
    
    @font-face {
      font-family: 'Marfa';
      src: url('/fonts/ABCMarfa-ThinItalic-Trial.woff2') format('woff2');
      font-weight: 100;
      font-style: italic;
      font-display: swap;
    }
  `;
  
  // Append to head
  document.head.appendChild(style);
  
  console.log('[DEBUG-FONTS] FontAwesome and Marfa fonts CSS injected into document head');
  
  // Try to check if the fonts are being loaded
  setTimeout(() => {
    printAvailableFonts();
  }, 1000);
};

// Debug function to print available fonts (for development purposes)
export const printAvailableFonts = (): void => {
  console.log('[DEBUG-FONTS] 🔍 Checking for FontAwesome fonts...');
  
  // For browser environment
  if (typeof document !== 'undefined') {
    const fonts = document.fonts;
    if (fonts) {
      fonts.ready.then(() => {
        // Check standard format
        const standardFamilies = [
          '"Font Awesome 6 Pro Solid"',
          '"Font Awesome 6 Pro Regular"',
          '"Font Awesome 6 Brands Regular"',
          '"Font Awesome 6 Duotone Solid"'
        ];
        
        // Check alternate format
        const alternateFamilies = [
          'FontAwesome6Pro-Solid',
          'FontAwesome6Pro-Regular',
          'FontAwesome6Brands-Regular',
          'FontAwesome6Duotone-Solid'
        ];
        
        console.log('[DEBUG-FONTS] Standard font family format availability:');
        standardFamilies.forEach(family => {
          console.log(`[DEBUG-FONTS] ${family}: ${fonts.check(`1em ${family}`) ? 'LOADED ✅' : 'NOT LOADED ❌'}`);
        });
        
        console.log('[DEBUG-FONTS] Alternate font family format availability:');
        alternateFamilies.forEach(family => {
          console.log(`[DEBUG-FONTS] ${family}: ${fonts.check(`1em ${family}`) ? 'LOADED ✅' : 'NOT LOADED ❌'}`);
        });
        
        // Check if fonts are missing
        const anyStandardLoaded = standardFamilies.some(family => fonts.check(`1em ${family}`));
        const anyAlternateLoaded = alternateFamilies.some(family => fonts.check(`1em ${family}`));
        
        if (!anyStandardLoaded && !anyAlternateLoaded) {
          console.error('[DEBUG-FONTS] ⚠️ NO FontAwesome fonts detected. Icons will not display correctly!');
          console.error('[DEBUG-FONTS] Please check that font files exist in the /public/fonts directory.');
          console.error('[DEBUG-FONTS] Font files needed: fa-solid-900.woff2, fa-regular-400.woff2, etc.');
        } else {
          console.log('[DEBUG-FONTS] ✅ FontAwesome fonts detected and loaded successfully.');
        }
        
        // Log all loaded fonts for debugging
        console.log('[DEBUG-FONTS] All loaded fonts in document.fonts:');
        try {
          const loadedFonts = Array.from(fonts).map(font => `${font.family} (${font.style}, ${font.weight})`);
          console.table(loadedFonts);
        } catch (e) {
          console.error('[DEBUG-FONTS] Error listing loaded fonts:', e);
        }
      });
    } else {
      console.error('[DEBUG-FONTS] document.fonts not available - font loading cannot be verified');
    }
  } else {
    console.warn('[DEBUG-FONTS] document not available - running in a non-browser environment');
  }
};

// Load fonts when imported
if (typeof window !== 'undefined') {
  loadFontAwesomeCSS();
} 