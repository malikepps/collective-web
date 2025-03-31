import React, { useEffect } from 'react';

interface DirectFontAwesomeProps {
  icon: string;
  size?: number;
  color?: string;
}

/**
 * A direct implementation of FontAwesome that only uses the SVG fallback
 * This is a reliable solution when font loading issues occur
 */
const DirectFontAwesome: React.FC<DirectFontAwesomeProps> = ({
  icon,
  size = 24,
  color = '#ffffff'
}) => {
  // Log what we're trying to render
  useEffect(() => {
    console.log(`DirectFontAwesome: Rendering icon ${icon}`);
  }, [icon]);
  
  // Map icon names to SVG paths
  const getSvgPath = (iconName: string): { path: string; viewBox?: string } => {
    // Common icons
    const icons: Record<string, { path: string; viewBox?: string }> = {
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
    >
      <path d={path} />
    </svg>
  );
};

export default DirectFontAwesome; 