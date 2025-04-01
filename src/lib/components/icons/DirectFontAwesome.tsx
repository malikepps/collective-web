import React, { useEffect, useState } from 'react';

interface DirectFontAwesomeProps {
  icon: string;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

/**
 * A direct implementation of FontAwesome that only uses the SVG fallback
 * This is a reliable solution when font loading issues occur
 */
const DirectFontAwesome: React.FC<DirectFontAwesomeProps> = ({
  icon,
  size = 24,
  color = '#ffffff',
  style
}) => {
  const [fontStatus, setFontStatus] = useState<string>('checking');
  
  // Log what we're trying to render and check font status
  useEffect(() => {
    console.log(`[DEBUG-ICON] DirectFontAwesome: Rendering icon "${icon}" with size=${size}, color=${color}`);
    
    // Check if we're using client-side rendering
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      // Check font loading status
      const fonts = document.fonts;
      if (fonts) {
        console.log(`[DEBUG-ICON] Checking font availability...`);
        fonts.ready.then(() => {
          const fontFamilies = [
            '"Font Awesome 6 Pro Solid"',
            '"FontAwesome6Pro-Solid"',
            '"Font Awesome 6 Pro Regular"',
            '"FontAwesome6Pro-Regular"',
            '"Font Awesome 6 Duotone Solid"',
            '"FontAwesome6Duotone-Solid"'
          ];
          
          const results = fontFamilies.map(fontFamily => ({
            fontFamily,
            loaded: fonts.check(`1em ${fontFamily}`)
          }));
          
          console.table(results);
          
          const anyLoaded = results.some(r => r.loaded);
          setFontStatus(anyLoaded ? 'loaded' : 'failed');
          
          console.log(`[DEBUG-ICON] Font loading status: ${anyLoaded ? 'SUCCESS' : 'FAILED'}`);
          
          if (!anyLoaded) {
            console.warn(`[DEBUG-ICON] No FontAwesome fonts loaded, using SVG fallback for "${icon}"`);
          }
        });
      }
    }
  }, [icon, size, color]);
  
  // Map icon names to SVG paths
  const getSvgPath = (iconName: string): { path: string; viewBox?: string } => {
    // Log the icon name we're trying to get
    console.log(`[DEBUG-ICON] Getting SVG path for icon: "${iconName}"`);
    
    // Common icons
    const icons: Record<string, { path: string; viewBox?: string }> = {
      'bars': { 
        path: 'M3 6h18M3 12h18M3 18h18',
        viewBox: '0 0 24 24'
      },
      'bars-filter': {
        path: 'M4 6h16M4 12h10M4 18h6',
        viewBox: '0 0 24 24'
      },
      'chevron-left': { 
        path: 'M15 18l-6-6 6-6',
        viewBox: '0 0 24 24'
      },
      'chevron-right': { 
        path: 'M9 18l6-6-6-6',
        viewBox: '0 0 24 24'
      },
      'chevron-down': {
        path: 'M6 9l6 6 6-6',
        viewBox: '0 0 24 24'
      },
      'chevron-up': {
        path: 'M18 15l-6-6-6 6',
        viewBox: '0 0 24 24'
      },
      'arrow-left': { 
        path: 'M19 12H5M12 19l-7-7 7-7',
        viewBox: '0 0 24 24'
      },
      'arrow-right': { 
        path: 'M5 12h14M12 5l7 7-7 7',
        viewBox: '0 0 24 24'
      },
      'angle-left': { 
        path: 'M13 18l-6-6 6-6',
        viewBox: '0 0 24 24'
      },
      'angle-right': { 
        path: 'M11 18l6-6-6-6',
        viewBox: '0 0 24 24'
      },
      'xmark': {
        path: 'M6 18L18 6M6 6l12 12',
        viewBox: '0 0 24 24'
      },
      'ellipsis-vertical': {
        path: 'M12 7L12 7M12 12L12 12M12 17L17 17',
        viewBox: '0 0 24 24'
      },
      'ellipsis': {
        path: 'M7 12L7 12M12 12L12 12M17 12L17 12',
        viewBox: '0 0 24 24'
      },
      'check': {
        path: 'M5 13l4 4L19 7',
        viewBox: '0 0 24 24'
      },
      'right-from-bracket': {
        path: 'M16 8L21 12L16 16M21 12H9M9 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H9',
        viewBox: '0 0 24 24'
      },
      'id-badge': {
        path: 'M10 9h4m-4 3h2m-2 3h4m5 4H7c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2zm-6-5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
        viewBox: '0 0 24 24'
      },
      'star': {
        path: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
        viewBox: '0 0 24 24'
      },
      'crown': {
        path: 'M5 16V9l3 3 4-4 4 4 3-3v7H5z',
        viewBox: '0 0 24 24'
      },
      // New icons for posts functionality
      'heart': {
        path: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
        viewBox: '0 0 24 24'
      },
      'comment': {
        path: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z',
        viewBox: '0 0 24 24'
      },
      'rocket': {
        path: 'M22 2L15 22l-3-6-6-3L22 2z',
        viewBox: '0 0 24 24'
      },
      'rocket-launch': {
        path: 'M22 2L15 22l-3-6-6-3L22 2z M22 2L12 12',
        viewBox: '0 0 24 24'
      },
      'share': {
        path: 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8 M16 6l-4-4-4 4 M12 2v13',
        viewBox: '0 0 24 24'
      },
      'trash-can': {
        path: 'M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M10 11v6 M14 11v6',
        viewBox: '0 0 24 24'
      },
      'circle-play': {
        path: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M10 8l6 4-6 4V8z',
        viewBox: '0 0 24 24'
      },
      'photo-film': {
        path: 'M15 8h.01M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6z M3 16l5-5 4 4 M14 14l3-3',
        viewBox: '0 0 24 24'
      }
    };
    
    // Handle fa- prefix
    const cleanName = iconName.replace(/^fa-/, '');
    const result = icons[cleanName];
    
    if (!result) {
      console.error(`[DEBUG-ICON] No SVG path found for icon "${iconName}" (cleaned: "${cleanName}")`);
    } else {
      console.log(`[DEBUG-ICON] Found SVG path for icon "${iconName}"`);
    }
    
    return result || { path: '' };
  };
  
  const { path, viewBox = '0 0 24 24' } = getSvgPath(icon);
  
  if (!path) {
    console.warn(`[DEBUG-ICON] DirectFontAwesome: No SVG path found for icon "${icon}", returning fallback`);
    return <span style={{ color }}>[{icon}]</span>;
  }
  
  return (
    <>
      <svg 
        width={size} 
        height={size} 
        viewBox={viewBox}
        fill="none" 
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={style}
        data-icon-name={icon}
        data-font-status={fontStatus}
      >
        <path d={path} />
      </svg>
    </>
  );
};

export default DirectFontAwesome; 