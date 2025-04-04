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
  hasRelationship?: boolean;
}

const InfoBox: React.FC<InfoBoxProps> = ({
  organization,
  onShowLinks,
  onShowMission,
  onShowMembershipOptions,
  isUserMember = false,
  isUserInCommunity = false,
  onToggleCommunity,
  hasRelationship = false
}) => {
  console.log("[DEBUG] InfoBox rendering with state:", {
    organizationId: organization.id,
    isUserMember,
    isUserInCommunity,
    hasRelationship
  });
  
  const { getTheme } = useTheme();
  const theme = getTheme(organization.themeId);
  
  // Debug logs when membership status changes
  useEffect(() => {
    console.log("[DEBUG] InfoBox membership status changed:", {
      organizationId: organization.id,
      isUserMember,
      isUserInCommunity,
      hasRelationship
    });
  }, [organization.id, isUserMember, isUserInCommunity, hasRelationship]);
  
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
    <div className="bg-card p-5 text-white continuous-corner">
      {/* Top buttons row */}
      <div className="flex items-center justify-start mb-3">
        <button className="h-7 flex items-center">
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
              className="h-7 flex items-center"
            >
              <span className="mr-1">🔗</span>
              <span className="text-gray-400 text-sm font-marfa font-light">links</span>
            </button>
          </>
        )}
        
        <span className="text-gray-500 mx-2">•</span>
        <button 
          onClick={onShowMission}
          className="h-7 flex items-center"
        >
          <span className="text-gray-400 text-sm font-marfa font-light">mission</span>
        </button>
      </div>
      
      {/* Description */}
      <p className="text-white/90 text-center text-base font-marfa font-light mb-4 leading-relaxed">
        {organization.description}
      </p>
      
      {/* Action buttons - with extra debug info */}
      <div 
        className="space-y-1.5"
        data-member={isUserMember ? "true" : "false"}
        data-community={isUserInCommunity ? "true" : "false"}
        data-relationship={hasRelationship ? "true" : "false"}
      >
        {isUserMember ? (
          // Member badge for members - more compact with internal padding
          <div className="flex justify-center">
            <div 
              className="ios-rounded-sm font-marfa font-semibold text-base flex items-center justify-center px-6 py-1.5"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <span className="text-[#FFD966] flex items-center">
                <span className="mr-1">✨</span>
                <span>Member</span>
              </span>
            </div>
          </div>
        ) : (
          // Membership options button for non-members
          <button 
            onClick={() => {
              console.log("[DEBUG] See membership options clicked");
              onShowMembershipOptions();
            }}
            className="w-full h-10 ios-rounded-sm font-marfa font-semibold text-base transition-all duration-200 hover:opacity-90 relative overflow-hidden"
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
        
        {/* Only show Join Community button if user has NO relationship with the nonprofit */}
        {!hasRelationship && (
          <button 
            onClick={handleToggleCommunity}
            className="bg-white/20 w-full h-10 ios-rounded-sm font-marfa font-semibold text-base"
            style={{ 
              color: theme?.secondaryColor ? `#${theme.secondaryColor}` : '#ADD3FF' 
            }}
          >
            Join community
          </button>
        )}
      </div>
    </div>
  );
};

export default InfoBox; 