import React, { useEffect } from 'react';

// Icon name to Unicode mapping
const ICON_UNICODE_MAP: Record<string, string> = {
  // Navigation
  'house': '\uf015',
  'magnifying-glass': '\uf002',
  'search': '\uf002',
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
  'trash-can': '\uf2ed',
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
  
  // Additional icons
  'circle-up': '\uf35b',
  'arrow-up-right': '\uf14c',
  'rocket': '\uf135',
  'rocket-launch': '\uf135', // Custom variant
  'fire': '\uf06d',
  'comment-dots': '\uf4ad',
  'heart-circle': '\uf4c7',
  'info-circle': '\uf05a',
  'check-double': '\uf560',
  'certificate': '\uf0a3',
  'flag': '\uf024',
  'clock': '\uf017',
  'ticket': '\uf145',
  'gift': '\uf06b',
  'percent': '\uf295',
  'money-check-dollar': '\uf53d',
  'credit-card': '\uf09d',
  'circle-dollar': '\uf2e8',
  'badge-check': '\uf336',
  'circle-check': '\uf058',
  'circle-xmark': '\uf057',
  'earth-americas': '\uf57d',
  'ellipsis': '\uf141',
  'ellipsis-vertical': '\uf142',
};

// Font styles
export enum IconStyle {
  SOLID = 'solid',
  REGULAR = 'regular',
  LIGHT = 'light',
  DUOTONE = 'duotone',
  BRANDS = 'brands'
}

// Font family mapping
const FONT_FAMILY_MAP: Record<IconStyle, string> = {
  [IconStyle.SOLID]: '"Font Awesome 6 Pro Solid", "FontAwesome6Pro-Solid"',
  [IconStyle.REGULAR]: '"Font Awesome 6 Pro Regular", "FontAwesome6Pro-Regular"',
  [IconStyle.LIGHT]: '"Font Awesome 6 Pro Light", "FontAwesome6Pro-Light"',
  [IconStyle.DUOTONE]: '"Font Awesome 6 Duotone Solid", "FontAwesome6Duotone-Solid"',
  [IconStyle.BRANDS]: '"Font Awesome 6 Brands Regular", "FontAwesome6Brands-Regular"',
};

// Interface for component props
interface ProperFontAwesomeProps {
  icon: string;
  size?: number;
  color?: string;
  style?: IconStyle;
  className?: string;
  onClick?: () => void;
}

/**
 * FontAwesome icon component that uses the actual font files
 * instead of SVG paths
 */
const ProperFontAwesome: React.FC<ProperFontAwesomeProps> = ({
  icon,
  size = 24,
  color = '#ffffff',
  style = IconStyle.SOLID,
  className = '',
  onClick
}) => {
  useEffect(() => {
    // Ensure the font files are loaded
    if (typeof document !== 'undefined') {
      console.log(`[FA-DEBUG] Loading icon ${icon} with style ${style}`);
    }
  }, [icon, style]);

  // Get the Unicode character for the icon
  const getIconUnicode = (iconName: string): string => {
    // Remove any fa- prefix
    const cleanName = iconName.replace(/^fa-/, '');
    const unicode = ICON_UNICODE_MAP[cleanName];
    
    if (!unicode) {
      console.warn(`[FA-DEBUG] No unicode found for icon: ${iconName}`);
      return '?';
    }
    
    console.log(`[FA-DEBUG] Found unicode for ${iconName}: ${unicode}`);
    return unicode;
  };

  // Get fontFamily for the selected style
  const getFontFamily = (): string => {
    return FONT_FAMILY_MAP[style] || FONT_FAMILY_MAP[IconStyle.SOLID];
  };

  // Icon styling
  const iconStyling: React.CSSProperties = {
    fontFamily: getFontFamily(),
    fontSize: `${size}px`,
    color: color,
    width: size,
    height: size,
    lineHeight: `${size}px`,
    textAlign: 'center',
    display: 'inline-block',
    fontStyle: 'normal',
    fontVariant: 'normal',
    textRendering: 'auto',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    cursor: onClick ? 'pointer' : 'default'
  };

  return (
    <span
      className={`fa ${className}`}
      style={iconStyling}
      onClick={onClick}
      data-icon={icon}
      data-icon-style={style}
      aria-hidden="true"
    >
      {getIconUnicode(icon)}
    </span>
  );
};

export default ProperFontAwesome; 