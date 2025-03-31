import React, { useEffect } from 'react';

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
  // Log what we're trying to render
  useEffect(() => {
    console.log(`DirectFontAwesome: Rendering icon ${icon}`);
  }, [icon]);
  
  // Map icon names to SVG paths
  const getSvgPath = (iconName: string): { path: string; viewBox?: string } => {
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
        path: 'M12 7L12 7M12 12L12 12M12 17L12 17',
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
      }
    };
    
    // Handle fa- prefix
    const cleanName = iconName.replace(/^fa-/, '');
    
    return icons[cleanName] || { path: '' };
  };
  
  const { path, viewBox = '0 0 24 24' } = getSvgPath(icon);
  
  if (!path) {
    console.warn(`DirectFontAwesome: No SVG path found for icon ${icon}`);
    return <span style={{ color }}>&larr;</span>;
  }
  
  return (
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
    >
      <path d={path} />
    </svg>
  );
};

export default DirectFontAwesome; 