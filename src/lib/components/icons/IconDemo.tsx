import React from 'react';
import { FAIcon, Icon, IconStyle } from './index';

/**
 * A demo component to showcase FontAwesome icons
 * This can be imported and used in any page for testing
 */
const IconDemo: React.FC = () => {
  return (
    <div className="p-6 bg-black">
      <h2 className="text-white text-2xl font-marfa font-semibold mb-6">FontAwesome Icon Demo</h2>
      
      <div className="mb-8">
        <h3 className="text-white text-xl font-marfa mb-4">Solid Icons</h3>
        <div className="grid grid-cols-6 gap-4">
          <IconItem icon={Icon.HOME} title="Home" />
          <IconItem icon={Icon.SEARCH} title="Search" />
          <IconItem icon={Icon.NOTIFICATIONS} title="Bell" />
          <IconItem icon={Icon.USER} title="User" />
          <IconItem icon={Icon.SETTINGS} title="Settings" />
          <IconItem icon={Icon.CLOSE} title="Close" />
          <IconItem icon={Icon.LIKE} title="Like" />
          <IconItem icon={Icon.COMMENT} title="Comment" />
          <IconItem icon={Icon.SHARE} title="Share" />
          <IconItem icon={Icon.CALENDAR} title="Calendar" />
          <IconItem icon={Icon.LOCATION} title="Location" />
          <IconItem icon={Icon.INFO} title="Info" />
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-white text-xl font-marfa mb-4">Regular Icons</h3>
        <div className="grid grid-cols-6 gap-4">
          <IconItem icon={Icon.HOME} title="Home" style={IconStyle.REGULAR} />
          <IconItem icon={Icon.SEARCH} title="Search" style={IconStyle.REGULAR} />
          <IconItem icon={Icon.NOTIFICATIONS} title="Bell" style={IconStyle.REGULAR} />
          <IconItem icon={Icon.USER} title="User" style={IconStyle.REGULAR} />
          <IconItem icon={Icon.SETTINGS} title="Settings" style={IconStyle.REGULAR} />
          <IconItem icon={Icon.CLOSE} title="Close" style={IconStyle.REGULAR} />
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-white text-xl font-marfa mb-4">Duotone Icons</h3>
        <div className="grid grid-cols-6 gap-4">
          <IconItem 
            icon={Icon.SOLAR_SYSTEM} 
            title="Solar System" 
            style={IconStyle.DUOTONE} 
            primaryColor="7b89a3"
            secondaryColor="95df9e"
          />
          <IconItem 
            icon={Icon.NOTIFICATIONS} 
            title="Bell" 
            style={IconStyle.DUOTONE} 
            primaryColor="ff9500"
            secondaryColor="ffe7cc"
          />
          <IconItem 
            icon={Icon.COMMENTS} 
            title="Comments" 
            style={IconStyle.DUOTONE} 
            primaryColor="007aff"
            secondaryColor="cce4ff"
          />
          <IconItem 
            icon={Icon.LIKE} 
            title="Heart" 
            style={IconStyle.DUOTONE} 
            primaryColor="ff3b30"
            secondaryColor="ffcccc"
          />
          <IconItem 
            icon={Icon.INFO_CIRCLE} 
            title="Info" 
            style={IconStyle.DUOTONE} 
            primaryColor="5ac8fa"
            secondaryColor="d4f5ff"
          />
          <IconItem 
            icon={Icon.SUCCESS} 
            title="Success" 
            style={IconStyle.DUOTONE} 
            primaryColor="4cd964"
            secondaryColor="d4f9d9"
          />
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-white text-xl font-marfa mb-4">More Duotone Icons</h3>
        <div className="grid grid-cols-6 gap-4">
          <IconItem 
            icon={Icon.ROCKET} 
            title="Rocket" 
            style={IconStyle.DUOTONE} 
            primaryColor="ff9500"
            secondaryColor="ffe7cc"
          />
          <IconItem 
            icon={Icon.FIRE} 
            title="Fire" 
            style={IconStyle.DUOTONE} 
            primaryColor="ff3b30"
            secondaryColor="ffcccc"
          />
          <IconItem 
            icon={Icon.EARTH_AMERICAS} 
            title="Earth" 
            style={IconStyle.DUOTONE} 
            primaryColor="5ac8fa"
            secondaryColor="d4f5ff"
          />
          <IconItem 
            icon={Icon.CLOCK} 
            title="Clock" 
            style={IconStyle.DUOTONE} 
            primaryColor="4cd964"
            secondaryColor="d4f9d9"
          />
          <IconItem 
            icon={Icon.GIFT} 
            title="Gift" 
            style={IconStyle.DUOTONE} 
            primaryColor="ff3b30"
            secondaryColor="ffcccc"
          />
          <IconItem 
            icon={Icon.CIRCLE_DOLLAR} 
            title="Pricing" 
            style={IconStyle.DUOTONE} 
            primaryColor="4cd964"
            secondaryColor="d4f9d9"
          />
        </div>
      </div>
    </div>
  );
};

// Helper component for individual icon display
interface IconItemProps {
  icon: Icon | string;
  title: string;
  primaryColor?: string;
  secondaryColor?: string;
  style?: IconStyle;
}

const IconItem: React.FC<IconItemProps> = ({ 
  icon, 
  title, 
  primaryColor = 'ffffff', 
  secondaryColor,
  style = IconStyle.CLASSIC 
}) => {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white/10 rounded-lg p-4 mb-2 w-16 h-16 flex items-center justify-center">
        <FAIcon 
          icon={icon} 
          size={28} 
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          style={style}
        />
      </div>
      <span className="text-white/80 text-xs font-marfa">{title}</span>
    </div>
  );
};

export default IconDemo; 