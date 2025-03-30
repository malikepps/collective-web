import React from 'react';
import { Organization } from '@/lib/models/Organization';
import { useTheme } from '@/lib/context/ThemeContext';
import { isColorLight } from '@/lib/models/Theme';

interface InfoBoxProps {
  organization: Organization;
  onShowLinks: () => void;
  onShowMission: () => void;
  onShowMembershipOptions: () => void;
}

const InfoBox: React.FC<InfoBoxProps> = ({
  organization,
  onShowLinks,
  onShowMission,
  onShowMembershipOptions
}) => {
  const { getTheme } = useTheme();
  const theme = getTheme(organization.themeId);
  
  // Determine the text color based on the theme's primary color brightness
  const buttonTextColor = (): string => {
    if (theme?.primaryColor) {
      // Use the isColorLight utility to determine if text should be black or white
      return isColorLight(theme.primaryColor) ? '#000000' : '#FFFFFF';
    }
    // Default text color if theme doesn't exist
    return '#000000';
  };
  
  return (
    <div className="bg-card p-6 text-white continuous-corner">
      {/* Top buttons row */}
      <div className="flex items-center space-x-2 mb-4">
        <button className="bg-white/20 ios-rounded-sm px-2 h-8 flex items-center">
          <span className="mr-1">📍</span>
          <span className="text-white/70 text-xs font-marfa">
            {organization.location || "No location"}
          </span>
        </button>
        
        {organization.linkInBio && (
          <button 
            onClick={onShowLinks}
            className="bg-white/20 ios-rounded-sm px-2 h-8 flex items-center"
          >
            <span className="mr-1">🔗</span>
            <span className="text-white/70 text-xs font-marfa">links</span>
          </button>
        )}
        
        <button 
          onClick={onShowMission}
          className="bg-white/20 ios-rounded-sm px-2 h-8 flex items-center"
        >
          <span className="text-white/70 text-xs font-marfa">mission</span>
          <span className="text-white/70 text-xs ml-1">→</span>
        </button>
      </div>
      
      {/* Description */}
      <p className="text-white/90 text-center text-sm font-marfa font-light mb-6 leading-relaxed">
        {organization.description}
      </p>
      
      {/* Action buttons */}
      <div className="space-y-2">
        <button 
          onClick={onShowMembershipOptions}
          className="w-full h-11 ios-rounded-sm font-marfa font-semibold text-base transition-all duration-200 hover:opacity-90 relative overflow-hidden"
          style={{ 
            backgroundColor: theme?.primaryColor ? `#${theme.primaryColor}` : '#ADD3FF',
            color: buttonTextColor()
          }}
        >
          {/* Add subtle glow animation similar to iOS app */}
          <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-700"></div>
          <span className="relative z-10">See membership options</span>
        </button>
        
        <button 
          className="bg-white/20 w-full h-11 ios-rounded-sm font-marfa font-semibold text-base"
          style={{ 
            color: theme?.secondaryColor ? `#${theme.secondaryColor}` : '#ADD3FF' 
          }}
        >
          Join community
        </button>
      </div>
    </div>
  );
};

export default InfoBox; 