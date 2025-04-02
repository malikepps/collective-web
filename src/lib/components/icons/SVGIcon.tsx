import React from 'react';

// Define icon styles matching the current implementation
export enum SVGIconStyle {
  SOLID = 'solid',
  REGULAR = 'regular',
  DUOTONE = 'duotone',
  BRANDS = 'brands'
}

interface SVGIconProps {
  icon: string | { toString(): string };
  size?: number;
  isActive?: boolean;
  primaryColor?: string;
  color?: string; // Added for compatibility with DirectFontAwesome
  secondaryColor?: string;
  style?: SVGIconStyle;
  className?: string;
}

// Helper function to convert hex string to CSS color
const hexToColor = (hex: string): string => {
  return hex.startsWith('#') ? hex : `#${hex}`;
};

const SVGIcon: React.FC<SVGIconProps> = ({
  icon,
  size = 24,
  isActive = true,
  primaryColor,
  color, // Support color prop for compatibility
  secondaryColor,
  style = SVGIconStyle.SOLID,
  className = '',
}) => {
  // Convert icon to string if it's an enum
  const iconName = typeof icon === 'string' ? icon : icon.toString();
  
  // Convert style to FontAwesome class prefix
  const stylePrefix = {
    [SVGIconStyle.SOLID]: 'fa-solid',
    [SVGIconStyle.REGULAR]: 'fa-regular',
    [SVGIconStyle.DUOTONE]: 'fa-duotone',
    [SVGIconStyle.BRANDS]: 'fa-brands',
  }[style] || 'fa-solid';
  
  // Format colors - support both primaryColor and color props
  // If color is provided, use it over primaryColor (for backward compatibility)
  const finalPrimaryColor = color || primaryColor || '7b89a3';
  const primary = isActive ? hexToColor(finalPrimaryColor) : '#808080';
  const secondary = isActive && secondaryColor ? hexToColor(secondaryColor) : undefined;
  
  // Set inline styles for color and size
  const iconStyle: React.CSSProperties = {
    fontSize: `${size}px`,
    '--fa-primary-color': primary,
  } as React.CSSProperties;
  
  if (secondary) {
    // Add secondary color for duotone icons
    iconStyle['--fa-secondary-color'] = secondary;
  }
  
  return (
    <i 
      className={`${stylePrefix} fa-${iconName} ${className}`}
      style={iconStyle}
      data-icon={iconName}
      aria-hidden="true"
    ></i>
  );
};

export default SVGIcon; 