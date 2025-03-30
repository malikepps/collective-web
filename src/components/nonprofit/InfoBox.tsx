import React from 'react';
import { Organization } from '@/lib/models/Organization';
import { useTheme } from '@/lib/context/ThemeContext';

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
  
  return (
    <div className="bg-card rounded-[15px] p-6 mt-1 text-white">
      {/* Top buttons row */}
      <div className="flex items-center space-x-2 mb-4">
        <button className="bg-white/20 rounded-lg px-3 py-1.5 flex items-center">
          <span className="mr-1">📍</span>
          <span className="text-white/70 text-xs font-marfa">
            {organization.location || "No location"}
          </span>
        </button>
        
        {organization.linkInBio && (
          <button 
            onClick={onShowLinks}
            className="bg-white/20 rounded-lg px-3 py-1.5 flex items-center"
          >
            <span className="mr-1">🔗</span>
            <span className="text-white/70 text-xs font-marfa">links</span>
          </button>
        )}
        
        <button 
          onClick={onShowMission}
          className="bg-white/20 rounded-lg px-3 py-1.5 flex items-center"
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
          className="w-full py-3 rounded-lg font-marfa font-semibold text-base"
          style={{ 
            backgroundColor: theme?.primaryColor ? `#${theme.primaryColor}` : '#ADD3FF',
            color: theme?.primaryColor && theme.textOnPrimaryColor ? `#${theme.textOnPrimaryColor}` : '#000000'
          }}
        >
          See membership options
        </button>
        
        <button 
          className="bg-white/20 w-full py-3 rounded-lg font-marfa font-semibold text-base"
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