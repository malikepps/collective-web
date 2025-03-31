import React, { useEffect, useState } from 'react';

interface DebugIconProps {
  iconName: string;
  fontFamily?: string;
  size?: number;
  color?: string;
}

/**
 * A component for debugging font awesome icon issues
 */
const DebugIcon: React.FC<DebugIconProps> = ({
  iconName,
  fontFamily = "FontAwesome6Pro-Solid",
  size = 24,
  color = '#ffffff'
}) => {
  const [fontLoaded, setFontLoaded] = useState<boolean | null>(null);
  const [debugMode, setDebugMode] = useState<number>(0);
  
  // Get the Unicode for common icons
  const getUnicode = (name: string): string => {
    const iconMap: Record<string, string> = {
      'chevron-left': '\uf053',
      'chevron-right': '\uf054',
      'arrow-left': '\uf060',
      'arrow-right': '\uf061',
      'caret-left': '\uf0d9',
      'caret-right': '\uf0da',
      'angle-left': '\uf104',
      'angle-right': '\uf105',
    };
    
    return iconMap[name] || '?';
  };
  
  // Try all possible font family formats
  const fontFamilies = [
    "FontAwesome6Pro-Solid",
    "FontAwesome6Pro-Regular",
    '"Font Awesome 6 Pro Solid"',
    '"Font Awesome 6 Pro"',
    '"Font Awesome 6 Free"',
    '"Font Awesome 6 Free Solid"',
    '"FontAwesome"',
    'sans-serif',
  ];
  
  // We also want to try the fa- prefix
  const iconNames = [
    iconName,
    `fa-${iconName}`,
    `fa fa-${iconName}`,
  ];
  
  // Log debug info
  useEffect(() => {
    console.log(`DebugIcon: Rendering ${iconName} with Unicode ${getUnicode(iconName)}`);
    console.log(`DebugIcon: Using font family ${fontFamily}`);
    
    // Check if font is loaded
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        // Check all possible font families
        const results = fontFamilies.map(font => {
          const isLoaded = document.fonts.check(`1em ${font}`);
          console.log(`DebugIcon: Font ${font} is ${isLoaded ? 'loaded' : 'NOT loaded'}`);
          return { font, isLoaded };
        });
        
        const anyLoaded = results.some(r => r.isLoaded);
        setFontLoaded(anyLoaded);
        
        // Log available fonts
        if (!anyLoaded) {
          console.log("DebugIcon: No FontAwesome fonts loaded. Here are all available fonts:");
          document.fonts.forEach(font => {
            console.log(`Available font: ${font.family}`);
          });
        }
      });
    }
  }, [iconName, fontFamily]);
  
  // Cycle through debug modes when clicked
  const cycleDebugMode = () => {
    setDebugMode((debugMode + 1) % 4);
  };
  
  const currentFont = fontFamilies[debugMode % fontFamilies.length];
  
  // Render based on debug mode
  const renderIcon = () => {
    switch (debugMode) {
      case 0:
        // Direct Unicode rendering with FontAwesome font
        return (
          <span
            style={{
              fontFamily: currentFont,
              fontSize: `${size}px`,
              color: color,
              display: 'inline-block',
              width: `${size * 2}px`,
              height: `${size}px`,
              textAlign: 'center',
            }}
            title={`Unicode + ${currentFont}`}
          >
            {getUnicode(iconName)}
          </span>
        );
      case 1:
        // Direct element output (&larr;)
        return (
          <span
            style={{
              fontSize: `${size}px`,
              color: color, 
              display: 'inline-block',
              width: `${size * 2}px`,
              height: `${size}px`,
              textAlign: 'center',
            }}
            title="HTML Entity"
          >
            &larr;
          </span>
        );
      case 2:
        // Actual text character (←)
        return (
          <span
            style={{
              fontSize: `${size}px`,
              color: color,
              display: 'inline-block',
              width: `${size * 2}px`,
              height: `${size}px`,
              textAlign: 'center',
            }}
            title="Unicode Character"
          >
            ←
          </span>
        );
      case 3:
        // SVG fallback
        return (
          <svg 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <title>SVG</title>
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        );
    }
  };
  
  return (
    <div 
      style={{ 
        padding: '0px',
        overflow: 'hidden', 
        borderRadius: '50%', 
        width: `${size * 1.5}px`, 
        height: `${size * 1.5}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer'
      }}
      onClick={cycleDebugMode}
    >
      {renderIcon()}
      {fontLoaded === false && (
        <div style={{ 
          position: 'absolute', 
          top: '3px', 
          right: '3px', 
          width: '6px', 
          height: '6px', 
          borderRadius: '50%', 
          background: 'red' 
        }} 
        title="Font not loaded!" />
      )}
    </div>
  );
};

export default DebugIcon; 