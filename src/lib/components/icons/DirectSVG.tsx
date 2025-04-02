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
}) => {
  // Prioritize color over primaryColor for backward compatibility
  const finalPrimaryColor = color || primaryColor;
  
  return (
    <SVGIcon
      icon={icon}
      size={size}
      style={style}
      primaryColor={finalPrimaryColor}
      secondaryColor={secondaryColor}
      className={className}
    />
  );
};

export default DirectSVG; 