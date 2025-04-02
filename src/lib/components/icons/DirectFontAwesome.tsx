import React, { useEffect, useState } from 'react';
import { IconStyle } from './FontAwesomeIcon';
import FontAwesomeIcon from './FontAwesomeIcon';

interface DirectFontAwesomeProps {
  icon: string;
  size?: number;
  color?: string;
  style?: IconStyle;
}

/**
 * DirectFontAwesome - Compatibility component for existing code
 * This exists for backward compatibility with components that use DirectFontAwesome
 */
const DirectFontAwesome: React.FC<DirectFontAwesomeProps> = ({
  icon,
  size = 24,
  color = '#ffffff',
  style = IconStyle.CLASSIC,
}) => {
  console.log(`[DEBUG-ICON] DirectFontAwesome: Rendering icon "${icon}" with size=${size}, color=${color}`);
  
  // Convert color format if needed
  const primaryColor = color.startsWith('#') ? color.substring(1) : color;
  
  // Use FontAwesomeIcon directly with props converted to the expected format
  return (
    <FontAwesomeIcon
      icon={icon}
      size={size}
      style={style}
      primaryColor={primaryColor}
      isActive={true}
    />
  );
};

export default DirectFontAwesome; 