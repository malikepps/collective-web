import React from 'react';
import FontAwesomeIcon, { IconStyle } from './FontAwesomeIcon';
import { Icon } from './FontAwesome';

interface FAIconProps {
  icon: Icon | string;
  size?: number;
  isActive?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
  style?: IconStyle;
  className?: string;
}

/**
 * FAIcon - A component for displaying FontAwesome icons
 * This is the primary component to use for icons in the app
 */
const FAIcon: React.FC<FAIconProps> = ({
  icon,
  size = 24,
  isActive = true,
  primaryColor = '7b89a3',
  secondaryColor,
  style = IconStyle.CLASSIC,
  className,
}) => {
  // Convert Icon enum to string if needed
  const iconName = typeof icon === 'string' ? icon : icon.toString();
  
  return (
    <span className={className}>
      <FontAwesomeIcon
        icon={iconName}
        size={size}
        isActive={isActive}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        style={style}
      />
    </span>
  );
};

export default FAIcon; 