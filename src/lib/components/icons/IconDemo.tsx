import React from 'react';
import { FAIcon, Icon } from './index';
import { IconStyle } from './FontAwesomeIcon';

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
          <IconItem icon="house" title="Home" />
          <IconItem icon="magnifying-glass" title="Search" />
          <IconItem icon="bell" title="Bell" />
          <IconItem icon="user" title="User" />
          <IconItem icon="gear" title="Settings" />
          <IconItem icon="xmark" title="Close" />
          <IconItem icon="heart" title="Like" />
          <IconItem icon="comment" title="Comment" />
          <IconItem icon="share" title="Share" />
          <IconItem icon="calendar" title="Calendar" />
          <IconItem icon="location-dot" title="Location" />
          <IconItem icon="circle-info" title="Info" />
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-white text-xl font-marfa mb-4">Regular Icons</h3>
        <div className="grid grid-cols-6 gap-4">
          <IconItem icon="house" title="Home" style={IconStyle.REGULAR} />
          <IconItem icon="magnifying-glass" title="Search" style={IconStyle.REGULAR} />
          <IconItem icon="bell" title="Bell" style={IconStyle.REGULAR} />
          <IconItem icon="user" title="User" style={IconStyle.REGULAR} />
          <IconItem icon="gear" title="Settings" style={IconStyle.REGULAR} />
          <IconItem icon="xmark" title="Close" style={IconStyle.REGULAR} />
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-white text-xl font-marfa mb-4">Duotone Icons</h3>
        <div className="grid grid-cols-6 gap-4">
          <IconItem 
            icon="solar-system" 
            title="Solar System" 
            style={IconStyle.DUOTONE} 
            primaryColor="7b89a3"
            secondaryColor="95df9e"
          />
          <IconItem 
            icon="bell" 
            title="Bell" 
            style={IconStyle.DUOTONE} 
            primaryColor="ff9500"
            secondaryColor="ffe7cc"
          />
          <IconItem 
            icon="comments" 
            title="Comments" 
            style={IconStyle.DUOTONE} 
            primaryColor="007aff"
            secondaryColor="cce4ff"
          />
          <IconItem 
            icon="heart" 
            title="Heart" 
            style={IconStyle.DUOTONE} 
            primaryColor="ff3b30"
            secondaryColor="ffcccc"
          />
          <IconItem 
            icon="circle-info" 
            title="Info" 
            style={IconStyle.DUOTONE} 
            primaryColor="5ac8fa"
            secondaryColor="d4f5ff"
          />
          <IconItem 
            icon="circle-check" 
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
            icon="rocket" 
            title="Rocket" 
            style={IconStyle.DUOTONE} 
            primaryColor="ff9500"
            secondaryColor="ffe7cc"
          />
          <IconItem 
            icon="fire" 
            title="Fire" 
            style={IconStyle.DUOTONE} 
            primaryColor="ff3b30"
            secondaryColor="ffcccc"
          />
          <IconItem 
            icon="earth-americas" 
            title="Earth" 
            style={IconStyle.DUOTONE} 
            primaryColor="5ac8fa"
            secondaryColor="d4f5ff"
          />
          <IconItem 
            icon="clock" 
            title="Clock" 
            style={IconStyle.DUOTONE} 
            primaryColor="4cd964"
            secondaryColor="d4f9d9"
          />
          <IconItem 
            icon="gift" 
            title="Gift" 
            style={IconStyle.DUOTONE} 
            primaryColor="ff3b30"
            secondaryColor="ffcccc"
          />
          <IconItem 
            icon="circle-dollar" 
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
  icon: string;
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