import React, { useEffect } from 'react';
import { Organization } from '@/lib/models/Organization';
import { useTheme } from '@/lib/context/ThemeContext';
import { isColorLight } from '@/lib/models/Theme';
import { DirectFontAwesome } from '@/lib/components/icons';

interface InfoBoxProps {
  organization: Organization;
  onShowLinks: () => void;
  onShowMission: () => void;
  onShowMembershipOptions: () => void;
  isUserMember?: boolean;
  isUserInCommunity?: boolean;
  onToggleCommunity?: () => Promise<boolean>;
}

const InfoBox: React.FC<InfoBoxProps> = ({
  organization,
  onShowLinks,
  onShowMission,
  onShowMembershipOptions,
  isUserMember = false,
  isUserInCommunity = false,
  onToggleCommunity
}) => {
  console.log("[DEBUG] InfoBox rendering with state:", {
    organizationId: organization.id,
    isUserMember,
    isUserInCommunity
  });
  
  const { getTheme } = useTheme();
  const theme = getTheme(organization.themeId);
  
  // Debug logs when membership status changes
  useEffect(() => {
    console.log("[DEBUG] InfoBox membership status changed:", {
      organizationId: organization.id,
      isUserMember,
      isUserInCommunity
    });
  }, [organization.id, isUserMember, isUserInCommunity]);
  
  // Determine the text color based on the theme's primary color brightness
  const buttonTextColor = (): string => {
    if (theme?.primaryColor) {
      // Use the isColorLight utility to determine if text should be black or white
      return isColorLight(theme.primaryColor) ? '#000000' : '#FFFFFF';
    }
    // Default text color if theme doesn't exist
    return '#000000';
  };
  
  const handleToggleCommunity = async () => {
    console.log("[DEBUG] Toggle community button clicked for org:", organization.id);
    if (onToggleCommunity) {
      const result = await onToggleCommunity();
      console.log("[DEBUG] Toggle community result:", result);
    }
  };
  
  return (
    <div className="bg-card p-6 text-white continuous-corner">
      {/* Top buttons row */}
      <div className="flex items-center justify-start mb-4">
        <button className="h-8 flex items-center">
          <span className="mr-1">📍</span>
          <span className="text-gray-400 text-sm font-marfa font-light">
            {organization.location || "No location"}
          </span>
        </button>
        
        {organization.linkInBio && (
          <>
            <span className="text-gray-500 mx-2">•</span>
            <button 
              onClick={onShowLinks}
              className="h-8 flex items-center"
            >
              <span className="mr-1">🔗</span>
              <span className="text-gray-400 text-sm font-marfa font-light">links</span>
            </button>
          </>
        )}
        
        <span className="text-gray-500 mx-2">•</span>
        <button 
          onClick={onShowMission}
          className="h-8 flex items-center"
        >
          <span className="text-gray-400 text-sm font-marfa font-light">mission</span>
          <DirectFontAwesome 
            icon="chevron-right"
            size={16}
            color="#9ca3af"
          />
        </button>
      </div>
      
      {/* Description */}
      <p className="text-white/90 text-center text-base font-marfa font-light mb-6 leading-relaxed">
        {organization.description}
      </p>
      
      {/* Action buttons - with extra debug info */}
      <div 
        className="space-y-2"
        data-member={isUserMember ? "true" : "false"}
        data-community={isUserInCommunity ? "true" : "false"}
      >
        {isUserMember ? (
          // Member badge for members
          <div 
            className="w-full h-11 ios-rounded-sm font-marfa font-semibold text-base flex items-center justify-center"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <span className="text-[#FFD966] flex items-center">
              <span className="mr-1">✨</span>
              <span>Member</span>
            </span>
          </div>
        ) : (
          // Membership options button for non-members
          <button 
            onClick={() => {
              console.log("[DEBUG] See membership options clicked");
              onShowMembershipOptions();
            }}
            className="w-full h-11 ios-rounded-sm font-marfa font-semibold text-base transition-all duration-200 hover:opacity-90 relative overflow-hidden"
            style={{ 
              backgroundColor: theme?.primaryColor || '#ADD3FF',
              color: buttonTextColor()
            }}
          >
            {/* Add subtle glow animation similar to iOS app */}
            <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-700"></div>
            <span className="relative z-10">See membership options</span>
          </button>
        )}
        
        {/* Only show Join Community button if user is not already in community */}
        {!isUserInCommunity && (
          <button 
            onClick={handleToggleCommunity}
            className="bg-white/20 w-full h-11 ios-rounded-sm font-marfa font-semibold text-base"
            style={{ 
              color: theme?.secondaryColor ? `#${theme.secondaryColor}` : '#ADD3FF' 
            }}
          >
            Join community
          </button>
        )}
        
        {/* For users who are already in community but not members, show a subtle indicator */}
        {isUserInCommunity && !isUserMember && (
          <div 
            className="w-full h-11 ios-rounded-sm font-marfa font-semibold text-base flex items-center justify-center"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)'
            }}
          >
            <div className="mr-2">
              <DirectFontAwesome
                icon="check"
                size={16}
                color={theme?.secondaryColor ? `#${theme.secondaryColor}` : '#ADD3FF'}
              />
            </div>
            <span 
              style={{ 
                color: theme?.secondaryColor ? `#${theme.secondaryColor}` : '#ADD3FF' 
              }}
            >
              You're in the community
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoBox; 