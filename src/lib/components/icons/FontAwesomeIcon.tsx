import React from 'react';

// Define icon styles matching the Swift implementation
export enum IconStyle {
  DUOTONE = 'duotone',
  CLASSIC = 'classic', // solid
  REGULAR = 'regular'
}

// Map of common icons to their Unicode values - same as Swift implementation
const ICON_UNICODE_MAP: Record<string, string> = {
  // Navigation
  'house': '\uf015',
  'magnifying-glass': '\uf002',
  'search': '\uf002', // Alias for magnifying-glass
  'envelope': '\uf0e0',
  'bell': '\uf0f3',
  'user': '\uf007',
  'bars': '\uf0c9',
  'gear': '\uf013',
  'xmark': '\uf00d',
  'chevron-left': '\uf053',
  'chevron-right': '\uf054',
  
  // Actions
  'plus': '\uf067',
  'pen': '\uf304',
  'trash': '\uf2ed',
  'floppy-disk': '\uf0c7',
  'upload': '\uf093',
  'download': '\uf019',
  'share': '\uf064',
  'heart': '\uf004',
  'comment': '\uf075',
  'comments': '\uf086',
  'bookmark': '\uf02e',
  'camera': '\uf030',
  'image': '\uf03e',
  'calendar': '\uf133',
  'location-dot': '\uf3c5',
  'link': '\uf0c1',
  'paper-plane': '\uf1d8',
  'sliders': '\uf1de',
  
  // Status
  'check-circle': '\uf058',
  'triangle-exclamation': '\uf071',
  'circle-exclamation': '\uf06a',
  'circle-info': '\uf05a',
  'lock': '\uf023',
  'unlock': '\uf09c',
  'check': '\uf00c',
  
  // Media
  'play': '\uf04b',
  'pause': '\uf04c',
  'stop': '\uf04d',
  'circle-play': '\uf144',
  'volume-high': '\uf028',
  'volume-xmark': '\uf6a9',
  
  // Misc
  'star': '\uf005',
  'solar-system': '\ue02f',
};

// For duotone icons - mapping to secondary layer unicode
const DUOTONE_SECONDARY_CODE_MAP: Record<string, string> = {
  'solar-system': '\u{10e02f}',
  'bell': '\u{10f0f3}',
  'comments': '\u{10f086}',
  'heart': '\u{10f004}',
  'circle-info': '\u{10f05a}',
  'check-circle': '\u{10f058}',
};

interface FontAwesomeIconProps {
  icon: string;
  size?: number;
  isActive?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
  style?: IconStyle;
}

// Helper function to convert hex string to CSS color
const hexToColor = (hex: string): string => {
  return hex.startsWith('#') ? hex : `#${hex}`;
};

const FontAwesomeIcon: React.FC<FontAwesomeIconProps> = ({
  icon,
  size = 24,
  isActive = true,
  primaryColor = '7b89a3',
  secondaryColor,
  style = IconStyle.CLASSIC,
}) => {
  // Format colors
  const primary = isActive ? hexToColor(primaryColor) : '#808080';
  const secondary = isActive && secondaryColor ? hexToColor(secondaryColor) : '#808080';
  
  // Get the Unicode character for the icon
  const unicode = ICON_UNICODE_MAP[icon];
  if (!unicode) {
    console.warn(`Icon not found: ${icon}`);
    return <span style={{ color: primary, fontSize: `${size}px` }}>?</span>;
  }
  
  // Font family based on style
  const getFontFamily = () => {
    switch (style) {
      case IconStyle.REGULAR:
        return '"Font Awesome 6 Pro Regular", "FontAwesome6Pro-Regular"';
      case IconStyle.DUOTONE:
        return '"Font Awesome 6 Duotone Solid", "FontAwesome6Duotone-Solid"';
      case IconStyle.CLASSIC:
      default:
        return '"Font Awesome 6 Pro Solid", "FontAwesome6Pro-Solid"';
    }
  };

  // Basic styling for the icon
  const iconStyle: React.CSSProperties = {
    fontFamily: getFontFamily(),
    fontSize: `${size}px`,
    color: primary,
    display: 'inline-block',
    width: `${size * 1.5}px`,
    height: `${size}px`,
    textAlign: 'center',
  };
  
  // If it's a duotone icon and we have a secondary color
  if (style === IconStyle.DUOTONE && secondaryColor) {
    const secondaryUnicode = DUOTONE_SECONDARY_CODE_MAP[icon];
    
    // If we have a specific secondary unicode for duotone
    if (secondaryUnicode) {
      return (
        <div style={{ position: 'relative', width: `${size * 1.5}px`, height: `${size}px` }}>
          {/* Secondary layer */}
          <span style={{
            ...iconStyle,
            color: secondary,
            position: 'absolute',
            top: 0,
            left: 0,
            opacity: 0.8
          }}>
            {secondaryUnicode}
          </span>
          
          {/* Primary layer */}
          <span style={{
            ...iconStyle,
            position: 'absolute',
            top: 0,
            left: 0
          }}>
            {unicode}
          </span>
        </div>
      );
    }
    
    // Fallback for duotone without specific secondary code
    return (
      <div style={{ position: 'relative', width: `${size * 1.5}px`, height: `${size}px` }}>
        {/* Fallback secondary layer using opacity */}
        <span style={{
          ...iconStyle,
          color: secondary,
          position: 'absolute',
          top: 0,
          left: 0,
          opacity: 0.5,
          transform: 'scale(1.05)', // Slightly larger
        }}>
          {unicode}
        </span>
        
        {/* Primary layer */}
        <span style={{
          ...iconStyle,
          position: 'absolute',
          top: 0,
          left: 0
        }}>
          {unicode}
        </span>
      </div>
    );
  }
  
  // Standard single-layer icon
  return (
    <span style={iconStyle}>
      {unicode}
    </span>
  );
};

export default FontAwesomeIcon; 