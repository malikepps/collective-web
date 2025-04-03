import React from 'react';
import SVGIcon, { SVGIconStyle } from './SVGIcon';

// Define the props interface
interface DirectSVGProps {
  icon: string;
  size?: number;
  style?: SVGIconStyle;
  primaryColor?: string;
  color?: string; // Added for compatibility with old components
  secondaryColor?: string;
  className?: string;
  isActive?: boolean; // Add isActive prop to pass through to SVGIcon
}

// Type for CSS variables in style
interface CustomCSSProperties extends React.CSSProperties {
  '--fa-primary-color': string;
  '--fa-secondary-color'?: string;
}

/**
 * DirectSVG - A wrapper component for SVGIcon to maintain compatibility
 * with components that use the DirectSVG naming convention
 */
const DirectSVG: React.FC<DirectSVGProps> = ({
  icon,
  size = 24,
  style = SVGIconStyle.SOLID,
  primaryColor,
  color, // Support color prop for compatibility
  secondaryColor,
  className,
  isActive = true, // Default to true for backwards compatibility
}) => {
  // Prioritize color over primaryColor for backward compatibility
  const finalPrimaryColor = color || primaryColor;
  
  // Force specific colors for problematic icons
  let forcedColor = finalPrimaryColor;
  
  // Force orange for rocket-launch
  if (icon === 'rocket-launch' && forcedColor === 'ff9500') {
    console.log('[DirectSVG-FIX] Applying special orange color for rocket-launch icon');
    // Use RGB format instead of hex
    forcedColor = 'rgb(255, 149, 0)';
  }
  
  // Force specific color for bars-filter
  if (icon === 'bars-filter') {
    console.log('[DirectSVG-FIX] Applying special color for bars-filter icon:', forcedColor);
  }
  
  // Add debug logging
  console.log(`[DirectSVG-DEBUG] Props for "${icon}":`, {
    icon,
    size,
    style,
    primaryColor,
    color,
    finalPrimaryColor,
    forcedColor,
    secondaryColor,
    className,
    isActive
  });
  
  return (
    <SVGIcon
      icon={icon}
      size={size}
      style={style}
      primaryColor={forcedColor}
      secondaryColor={secondaryColor}
      className={className ? `${className} icon-${icon}` : `icon-${icon}`}
      isActive={isActive}
    />
  );
};

export default DirectSVG; 