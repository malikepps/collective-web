import React, { useEffect } from 'react';
import { Organization } from '@/lib/models/Organization';
import { useTheme } from '@/lib/context/ThemeContext';
import { isColorLight } from '@/lib/models/Theme';
import { DirectFontAwesome, DirectSVG, SVGIconStyle } from '@/lib/components/icons';

interface InfoBoxProps {
  organization: Organization;
  onShowLinks: () => void;
  onShowMission: () => void;
  onShowMembershipOptions: () => void;
  isUserMember?: boolean;
  isUserInCommunity?: boolean;
  onToggleCommunity?: () => Promise<boolean>;
  hasRelationship?: boolean;
  isUserStaff?: boolean;
}

const InfoBox: React.FC<InfoBoxProps> = ({
  organization,
  onShowLinks,
  onShowMission,
  onShowMembershipOptions,
  isUserMember = false,
  isUserInCommunity = false,
  onToggleCommunity,
  hasRelationship = false,
  isUserStaff = false
}) => {
  console.log("[DEBUG] InfoBox rendering with state:", {
    organizationId: organization.id,
    isUserMember,
    isUserInCommunity,
    hasRelationship,
    isUserStaff
  });
  
  const { getTheme } = useTheme();
  const theme = getTheme(organization.themeId);
  
  // Debug logs when membership status changes
  useEffect(() => {
    console.log("[DEBUG] InfoBox membership status changed:", {
      organizationId: organization.id,
      isUserMember,
      isUserInCommunity,
      hasRelationship,
      isUserStaff
    });
  }, [organization.id, isUserMember, isUserInCommunity, hasRelationship, isUserStaff]);
  
  // Determine the text color based on the theme's primary color brightness
  const buttonTextColor = (): string => {
    if (theme?.primaryColor) {
      // Use the isColorLight utility to determine if text should be black or white
      return isColorLight(theme.primaryColor) ? '#000000' : '#FFFFFF';
    }
    // Default text color if theme doesn't exist
    return '#000000';
  };
  
  // Helper to determine text color for secondary button
  const secondaryButtonTextColor = (): string => {
    // Ensure theme and secondaryColor exist
    if (theme?.secondaryColor) {
      return isColorLight(theme.secondaryColor) ? '#000000' : '#FFFFFF';
    }
    // Default based on common secondary color (#ADD3FF)
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
        {isUserStaff ? (
          // --- Staff Management Buttons --- 
          <div className="flex flex-col space-y-2"> 
            {/* Create Post Button Placeholder */}
            <button
              onClick={() => console.log('TODO: Implement Create Post')}
              className="flex items-center justify-center w-full h-10 rounded-lg font-marfa font-medium text-sm transition-all duration-200 hover:opacity-90 relative overflow-hidden"
              style={{ 
                backgroundColor: theme?.primaryColor ? `#${theme.primaryColor}` : '#ADD3FF',
                color: buttonTextColor()
              }}
            >
              <div className="relative z-10 flex items-center">
                <DirectSVG
                  icon="square-plus"
                  size={18}
                  style={SVGIconStyle.SOLID}
                  primaryColor={buttonTextColor().replace('#', '')} // Match text color
                />
                <span className="ml-2">Create a post</span>
              </div>
            </button>

            {/* Row for Edit, Share, Theme */}
            <div className="flex space-x-2"> 
              {/* Edit Details Button Placeholder */}
              <button
                onClick={() => console.log('TODO: Implement Edit Details')}
                style={{ color: theme?.secondaryColor ? `#${theme.secondaryColor}` : '#8BBEF9' }}
                className="flex items-center justify-center flex-grow h-10 bg-white/20 rounded-lg font-marfa text-sm"
              >
                <DirectSVG
                  icon="pencil"
                  size={15}
                  style={SVGIconStyle.SOLID}
                  primaryColor={theme?.secondaryColor || '8BBEF9'}
                />
                <span className="ml-2">Edit Details</span>
              </button>

              {/* Share Profile Button Placeholder */}
              <button
                onClick={() => console.log('TODO: Implement Share Profile')}
                style={{ color: theme?.secondaryColor ? `#${theme.secondaryColor}` : '#8BBEF9' }}
                className="flex items-center justify-center flex-grow h-10 bg-white/20 rounded-lg font-marfa text-sm"
              >
                <DirectSVG
                  icon="share"
                  size={15}
                  style={SVGIconStyle.SOLID}
                  primaryColor={theme?.secondaryColor || '8BBEF9'}
                />
                <span className="ml-2">Share profile</span>
              </button>

              {/* Theme Picker Button Placeholder */}
              <button
                onClick={() => console.log('TODO: Implement Theme Picker')}
                style={{ color: theme?.secondaryColor ? `#${theme.secondaryColor}` : '#8BBEF9' }}
                className="flex items-center justify-center h-10 px-3 bg-white/20 rounded-lg"
              >
                <DirectSVG
                  icon="palette"
                  size={15}
                  style={SVGIconStyle.SOLID}
                  primaryColor={theme?.secondaryColor || '8BBEF9'}
                />
              </button>
            </div>
          </div>
        ) : (
          // --- Public/Non-Staff Buttons --- 
          <>
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
                {/* Re-adding subtle glow animation */}
                <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-700"></div> 
                <div className="relative z-10">See membership options</div>
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
          </>
        )}
      </div>
    </div>
  );
};

export default InfoBox; 