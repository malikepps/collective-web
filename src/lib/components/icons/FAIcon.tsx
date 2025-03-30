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
  // We can directly pass the icon since both string and enum values are strings
  return (
    <span className={className}>
      <FontAwesomeIcon
        icon={icon}
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