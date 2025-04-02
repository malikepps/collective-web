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
  
  // Add debug logging
  console.log(`[DirectSVG-DEBUG] Props for "${icon}":`, {
    icon,
    size,
    style,
    primaryColor,
    color,
    finalPrimaryColor,
    secondaryColor,
    className,
    isActive
  });
  
  return (
    <SVGIcon
      icon={icon}
      size={size}
      style={style}
      primaryColor={finalPrimaryColor}
      secondaryColor={secondaryColor}
      className={className}
      isActive={isActive}
    />
  );
};

export default DirectSVG; 