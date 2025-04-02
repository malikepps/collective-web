import React, { useEffect, useState } from 'react';

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
  'ellipsis': '\uf141',
  'ellipsis-vertical': '\uf142',
  'bars-filter': '\ue0ad',
  
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
  'photo-film': '\uf87c',
  
  // Misc
  'star': '\uf005',
  'solar-system': '\ue02f',
  
  // Additional icons
  'circle-up': '\uf35b',
  'arrow-up-right': '\uf14c',
  'rocket': '\uf135',
  'rocket-launch': '\ue027',
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
  'right-from-bracket': '\uf2f5',
  'id-badge': '\uf2c1',
};

// For duotone icons - mapping to secondary layer unicode
const DUOTONE_SECONDARY_CODE_MAP: Record<string, string> = {
  'solar-system': '\u{10e02f}',
  'bell': '\u{10f0f3}',
  'comments': '\u{10f086}',
  'heart': '\u{10f004}',
  'circle-info': '\u{10f05a}',
  'check-circle': '\u{10f058}',
  'rocket': '\u{10f135}',
  'rocket-launch': '\u{10e027}',
  'fire': '\u{10f06d}',
  'comment-dots': '\u{10f4ad}',
  'heart-circle': '\u{10f4c7}',
  'info-circle': '\u{10f05a}',
  'check-double': '\u{10f560}',
  'certificate': '\u{10f0a3}',
  'flag': '\u{10f024}',
  'clock': '\u{10f017}',
  'ticket': '\u{10f145}',
  'gift': '\u{10f06b}',
  'percent': '\u{10f295}',
  'money-check-dollar': '\u{10f53d}',
  'credit-card': '\u{10f09d}',
  'circle-dollar': '\u{10f2e8}',
  'badge-check': '\u{10f336}',
  'circle-check': '\u{10f058}',
  'circle-xmark': '\u{10f057}',
  'earth-americas': '\u{10f57d}',
  'circle-exclamation': '\u{10f06a}',
  'circle-up': '\u{10f35b}',
  'arrow-up-right': '\u{10f14c}',
  'circle-play': '\u{10f144}',
  'photo-film': '\u{10f87c}',
  'ellipsis': '\u{10f141}',
  'ellipsis-vertical': '\u{10f142}',
  'bars-filter': '\u{10e0ad}',
};

interface FontAwesomeIconProps {
  icon: string | { toString(): string };
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
  const [fontStatus, setFontStatus] = useState<string>('checking');
  
  // Check font loading status on component mount
  useEffect(() => {
    // Check if we're using client-side rendering
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      // Convert icon to string if it's an enum
      const iconName = typeof icon === 'string' ? icon : icon.toString();
      console.log(`[DEBUG-FONT] FontAwesomeIcon: Rendering icon "${iconName}" with style=${style}`);
      
      // Check font loading status
      const fonts = document.fonts;
      if (fonts) {
        console.log(`[DEBUG-FONT] Checking font availability for FontAwesomeIcon...`);
        fonts.ready.then(() => {
          const fontFamilies = [
            '"Font Awesome 6 Pro Solid"',
            '"FontAwesome6Pro-Solid"',
            '"Font Awesome 6 Pro Regular"',
            '"FontAwesome6Pro-Regular"',
            '"Font Awesome 6 Duotone Solid"',
            '"FontAwesome6Duotone-Solid"',
            '"Font Awesome 6 Duotone Regular"',
            '"FontAwesome6Duotone-Regular"',
          ];
          
          const results = fontFamilies.map(fontFamily => ({
            fontFamily,
            loaded: fonts.check(`1em ${fontFamily}`)
          }));
          
          console.table(results);
          
          const anyLoaded = results.some(r => r.loaded);
          setFontStatus(anyLoaded ? 'loaded' : 'failed');
          
          console.log(`[DEBUG-FONT] Font loading status for FontAwesomeIcon: ${anyLoaded ? 'SUCCESS' : 'FAILED'}`);
          
          if (!anyLoaded) {
            console.warn(`[DEBUG-FONT] No FontAwesome fonts loaded for FontAwesomeIcon. Icons may not display correctly.`);
            console.warn(`[DEBUG-FONT] Make sure CSS in globals.css or FontAwesome.tsx is loading fonts properly.`);
          }
        });
      }
    }
  }, [icon, style]);
  
  // Format colors
  const primary = isActive ? hexToColor(primaryColor) : '#808080';
  const secondary = isActive && secondaryColor ? hexToColor(secondaryColor) : '#808080';
  
  // Convert icon to string if it's an enum
  const iconName = typeof icon === 'string' ? icon : icon.toString();
  
  // Get the Unicode character for the icon
  const unicode = ICON_UNICODE_MAP[iconName];
  if (!unicode) {
    console.warn(`[DEBUG-FONT] Icon not found in unicode map: "${iconName}"`);
    return <span style={{ color: primary, fontSize: `${size}px` }}>?</span>;
  } else {
    console.log(`[DEBUG-FONT] Found unicode for icon "${iconName}": ${unicode} (hex: ${unicode.codePointAt(0)?.toString(16)})`);
  }
  
  // Font family based on style
  const getFontFamily = () => {
    switch (style) {
      case IconStyle.REGULAR:
        console.log(`[DEBUG-FONT] Using REGULAR font family for "${iconName}"`);
        return '"Font Awesome 6 Pro Regular", "FontAwesome6Pro-Regular"';
      case IconStyle.DUOTONE:
        console.log(`[DEBUG-FONT] Using DUOTONE font family for "${iconName}"`);
        return '"Font Awesome 6 Duotone Solid", "FontAwesome6Duotone-Solid"';
      case IconStyle.CLASSIC:
      default:
        console.log(`[DEBUG-FONT] Using CLASSIC (solid) font family for "${iconName}"`);
        return '"Font Awesome 6 Pro Solid", "FontAwesome6Pro-Solid"';
    }
  };

  // Get duotone secondary font family
  const getDuotoneSecondaryFontFamily = () => {
    console.log(`[DEBUG-FONT] Using duotone secondary font family for "${iconName}"`);
    return '"Font Awesome 6 Duotone Regular", "FontAwesome6Duotone-Regular"';
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
    const secondaryUnicode = DUOTONE_SECONDARY_CODE_MAP[iconName];
    
    // If we have a specific secondary unicode for duotone
    if (secondaryUnicode) {
      console.log(`[DEBUG-FONT] Found secondary unicode for duotone icon "${iconName}": ${secondaryUnicode}`);
      return (
        <div style={{ position: 'relative', width: `${size * 1.5}px`, height: `${size}px` }} data-icon={iconName} data-font-status={fontStatus}>
          {/* Secondary layer */}
          <span style={{
            ...iconStyle,
            fontFamily: getDuotoneSecondaryFontFamily(),
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
    console.log(`[DEBUG-FONT] No secondary unicode found for duotone icon "${iconName}", using opacity fallback`);
    return (
      <div style={{ position: 'relative', width: `${size * 1.5}px`, height: `${size}px` }} data-icon={iconName} data-font-status={fontStatus}>
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
  console.log(`[DEBUG-FONT] Rendering standard single-layer icon "${iconName}"`);
  return (
    <span style={iconStyle} data-icon={iconName} data-font-status={fontStatus}>
      {unicode}
    </span>
  );
};

export default FontAwesomeIcon; 