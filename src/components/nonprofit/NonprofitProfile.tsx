import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { Organization } from '@/lib/models/Organization';
import MediaSection from './MediaSection';
import InfoBox from './InfoBox';
import LinksSheet from './LinksSheet';
import OrganizationDetailsView from './OrganizationDetailsView';
import MembershipOptionsView from './MembershipOptionsView';
import CollectiveSection from './CollectiveSection';
import FilterBottomSheet from './FilterBottomSheet';
import PostsSection from './PostsSection';
import NavigationDrawer from '../NavigationDrawer';
import TextPostCreateScreen from '../post/TextPostCreateScreen';
import { DirectSVG } from '@/lib/components/icons';
import { SVGIconStyle } from '@/lib/components/icons/SVGIcon';
import { useTheme } from '@/lib/context/ThemeContext';
import Head from 'next/head';
import { useUserOrganizationRelationship } from '@/lib/hooks/useUserOrganizationRelationship';

interface NonprofitProfileProps {
  organization: Organization;
}

// Helper function for dynamic text color (add this within the component or move to utils)
const isLight = (hexColor: string): boolean => {
  if (!hexColor) return false; // Handle undefined case
  // Basic brightness check (can be refined)
  // Remove potential '#' prefix
  const hex = hexColor.startsWith('#') ? hexColor.slice(1) : hexColor;
  // Ensure hex is valid length
  if (hex.length !== 6) return false; 
  try {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 150; // Threshold might need adjustment
  } catch (e) {
    console.error("Error parsing hex color for brightness:", hexColor, e);
    return false; // Default to dark background assumption on error
  }
};

const NonprofitProfile: React.FC<NonprofitProfileProps> = ({
  organization: initialOrganization
}) => {
  console.log("[DEBUG] NonprofitProfile initial render for org:", initialOrganization.id, initialOrganization.name);
  
  // State to manage organization data locally for updates (like theme)
  const [organization, setOrganization] = useState<Organization>(initialOrganization);
  
  // Update local state if the initial prop changes (e.g., navigating between profiles)
  useEffect(() => {
    setOrganization(initialOrganization);
    console.log("[DEBUG] NonprofitProfile updated with new initialOrganization:", initialOrganization.id);
  }, [initialOrganization]);

  const router = useRouter();
  const { getTheme } = useTheme();
  // Use the themeId from the local organization state
  const theme = organization.themeId ? getTheme(organization.themeId) : undefined;
  const [scrollOffset, setScrollOffset] = useState(0);
  const [showLinksSheet, setShowLinksSheet] = useState(false);
  const [showMissionSheet, setShowMissionSheet] = useState(false);
  const [showMembershipOptions, setShowMembershipOptions] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [displayFilter, setDisplayFilter] = useState('all');
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [isNavbarFixed, setIsNavbarFixed] = useState(false);
  const [showNavigationDrawer, setShowNavigationDrawer] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const navbarRef = useRef<HTMLDivElement>(null);
  const navbarHeight = 40; // Height of the navbar in pixels
  
  // Get user relationship with organization (using ID from local state)
  const { 
    relationship,
    isUserMember, 
    isUserInCommunity, 
    isUserStaff,
    loading: relationshipLoading,
    error: relationshipError,
    toggleCommunity
  } = useUserOrganizationRelationship(organization.id);
  
  // Debug logs for relationship state
  useEffect(() => {
    console.log("[DEBUG] Relationship state:", {
      organizationId: organization.id,
      relationship,
      isUserMember,
      isUserInCommunity,
      isUserStaff,
      loading: relationshipLoading,
      error: relationshipError
    });
  }, [organization.id, relationship, isUserMember, isUserInCommunity, isUserStaff, relationshipLoading, relationshipError]);
  
  // Handle scroll events to adjust header opacity and position
  useEffect(() => {
    const handleScroll = () => {
      setScrollOffset(window.scrollY);
      
      // Check if we should fix the navbar
      const threshold = 10; // Scroll threshold to trigger fixed position
      const shouldBeFixed = window.scrollY > threshold;
      
      if (shouldBeFixed !== isNavbarFixed) {
        setIsNavbarFixed(shouldBeFixed);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isNavbarFixed]);
  
  // Apply overflow hidden to body when modals are open
  useEffect(() => {
    const isAnyModalOpen = showLinksSheet || showMissionSheet || showMembershipOptions || 
                          showFilterSheet || showLeaveConfirmation || showNavigationDrawer;
    
    // Get the html and body elements
    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    
    if (isAnyModalOpen) {
      // Prevent scrolling when modals are open
      htmlElement.style.overflow = 'hidden';
      bodyElement.style.overflow = 'hidden';
    } else {
      // Allow scrolling when no modals are open, but hide scrollbars
      htmlElement.style.overflow = 'auto';
      bodyElement.style.overflow = 'auto';
      
      // Hide scrollbars but keep scrolling functionality
      htmlElement.style.scrollbarWidth = 'none'; // Firefox
      bodyElement.style.scrollbarWidth = 'none'; // Firefox
      
      // For Webkit browsers (Chrome, Safari)
      // Inject style to hide scrollbar globally when no modal is open
      const styleId = 'hide-scrollbar-style';
      let styleElement = document.getElementById(styleId);
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }
      styleElement.textContent = `
        ::-webkit-scrollbar { display: none; }
        html, body { -ms-overflow-style: none; } 
      `;
      
    }
    
    return () => {
      // Cleanup: reset overflow and remove injected style
      htmlElement.style.overflow = '';
      bodyElement.style.overflow = '';
      htmlElement.style.scrollbarWidth = '';
      bodyElement.style.scrollbarWidth = '';
      
      const styleElement = document.getElementById('hide-scrollbar-style');
      if (styleElement) {
        styleElement.textContent = ''; // Clear the rule instead of removing element frequently
      }
    };
  }, [showLinksSheet, showMissionSheet, showMembershipOptions, showFilterSheet, showLeaveConfirmation, showNavigationDrawer]);
  
  // Modal handlers
  const handleShowLinks = () => setShowLinksSheet(true);
  const handleShowMission = () => setShowMissionSheet(true);
  const handleShowMembershipOptions = () => setShowMembershipOptions(true);
  const handleShowFilterSheet = () => setShowFilterSheet(true);
  const handleFilterChange = (filter: string) => setDisplayFilter(filter);
  const handleOpenNavigationDrawer = () => setShowNavigationDrawer(true);
  const handleCloseNavigationDrawer = () => setShowNavigationDrawer(false);
  
  const handleLeaveCommunity = async () => {
    console.log("[DEBUG] Leaving community for org:", organization.id);
    await toggleCommunity();
    setShowLeaveConfirmation(false);
  };

  // Handler to update local organization state (passed to InfoBox)
  const handleOrganizationUpdate = (updatedData: Partial<Organization>) => {
    console.log("[NonprofitProfile] Updating local organization state:", updatedData);
    setOrganization(prevOrg => ({
      ...prevOrg,
      ...updatedData
    }));
    // Re-fetching theme via useTheme hook happens automatically due to state change
  };

  // Calculate navbar background opacity based on scroll
  const navbarBgOpacity = Math.min(0.8, scrollOffset / 150);
  // Calculate blur intensity based on scroll
  const blurIntensity = Math.min(8, scrollOffset / 40);
  
  // Navbar styling based on fixed or initial position
  const navbarStyles = isNavbarFixed
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: `${navbarHeight}px`,
        backgroundColor: `rgba(0, 0, 0, ${navbarBgOpacity})`,
        backdropFilter: `blur(${blurIntensity}px)`,
        WebkitBackdropFilter: `blur(${blurIntensity}px)`,
        zIndex: 50,
        transition: 'background-color 0.3s ease, backdrop-filter 0.3s ease, -webkit-backdrop-filter 0.3s ease'
      } as React.CSSProperties
    : {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: `${navbarHeight}px`,
        backgroundColor: 'transparent',
        zIndex: 20
      } as React.CSSProperties;
  
  return (
    <>
      <Head>
        <style jsx global>{`
          /* Hide scrollbar for all elements */
          ::-webkit-scrollbar {
            display: none;
          }
          
          /* Hide scrollbar for IE, Edge and Firefox */
          * {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;     /* Firefox */
          }
          
          html, body {
            overflow-y: auto;
            overflow-x: hidden;
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          
          .icon-shadow {
            filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.25));
          }
        `}</style>
      </Head>
      
      <div className="min-h-screen bg-black overflow-x-hidden" ref={contentRef}> {/* Prevent horizontal overflow */}
        {/* Navbar - either fixed or absolute */}
        <div 
          ref={navbarRef}
          className="flex items-center justify-between px-4"
          style={navbarStyles}
        >
          {/* Menu button */}
          <button 
            onClick={handleOpenNavigationDrawer}
            className="flex items-center justify-center overflow-hidden icon-shadow"
          >
            <DirectSVG 
              icon="bars"
              size={25}
              style={SVGIconStyle.SOLID}
              primaryColor="ffffff"
            />
          </button>
          
          {/* Username in center - truly centered */}
          <p
            className="absolute left-1/2 transform -translate-x-1/2 font-marfa font-medium text-white"
            style={{ 
              opacity: scrollOffset > 50 ? Math.min(1, (scrollOffset - 50) / 100) : 0,
              transition: 'opacity 0.3s ease'
            }}
          >
            @{organization.username || organization.name?.toLowerCase().replace(/\s/g, '')}
          </p>
          
          {/* Right side buttons */}
          <div className="flex items-center space-x-3"> {/* Container for right-side items */}
            {/* Staff-only buttons */}
            {isUserStaff && (
              <>
                {/* Money Button Placeholder */}
                <button
                  onClick={() => console.log('TODO: Implement Money/Membership View')}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-black bg-opacity-50 icon-shadow"
                  aria-label="Manage Membership"
                >
                  <DirectSVG
                    icon="dollar-sign"
                    size={18}
                    style={SVGIconStyle.SOLID}
                    primaryColor="22c55e" // Green
                  />
                </button>

                {/* Manage Media Button Placeholder */}
                <button
                  onClick={() => console.log('TODO: Implement Manage Media Sheet')}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-black bg-opacity-50 icon-shadow"
                  aria-label="Manage Media"
                >
                  <DirectSVG
                    icon="photo-film"
                    size={16}
                    style={SVGIconStyle.SOLID}
                     // Use secondary theme color from local state's theme
                    primaryColor={theme?.secondaryColor || '8BBEF9'}
                  />
                </button>
              </>
            )}

            {/* Existing Ellipsis menu button */}
            <button
              onClick={() => setShowLeaveConfirmation(true)}
              className="flex items-center justify-center overflow-hidden icon-shadow"
              aria-label="More options"
            >
              <DirectSVG
                icon="ellipsis"
                size={25}
                style={SVGIconStyle.SOLID}
                primaryColor="ffffff"
              />
            </button>
          </div>
        </div>
        
        {/* Media Section - Pass local organization state */}
        <div className="w-full">
          <MediaSection organization={organization} navbarHeight={navbarHeight} />
        </div>
        
        {/* Content Sections */}
        <div className="pb-20 pt-1">
          {/* Info Box - Pass local organization state and update handler */}
          <InfoBox 
            organization={organization}
            onShowLinks={handleShowLinks}
            onShowMission={handleShowMission}
            onShowMembershipOptions={handleShowMembershipOptions}
            isUserMember={isUserMember}
            isUserInCommunity={isUserInCommunity}
            onToggleCommunity={toggleCommunity}
            hasRelationship={relationship !== null}
            isUserStaff={isUserStaff}
            onOrganizationUpdate={handleOrganizationUpdate} // Pass the update handler
          />
          
          {/* Collective Section - Pass local organization state */}
          <div className="mt-1">
            <CollectiveSection
              organization={organization}
              onShowFilterSheet={handleShowFilterSheet}
              displayFilter={displayFilter}
              isUserStaff={isUserStaff}
            />
          </div>
          
          {/* Posts Section - Pass local organization state */}
          <div className="mt-1">
            <PostsSection
              organization={organization}
              displayFilter={displayFilter}
              isUserMember={isUserMember}
              isUserStaff={isUserStaff}
              onShowMembershipOptions={handleShowMembershipOptions}
            />
          </div>
        </div>
        
        {/* Modal components - Pass local organization state */}
        <LinksSheet 
          organization={organization}
          isOpen={showLinksSheet}
          onClose={() => setShowLinksSheet(false)}
        />
        
        <OrganizationDetailsView
          organization={organization}
          isOpen={showMissionSheet}
          onClose={() => setShowMissionSheet(false)}
        />
        
        <MembershipOptionsView
          organization={organization}
          isOpen={showMembershipOptions}
          onClose={() => setShowMembershipOptions(false)}
        />
        
        <FilterBottomSheet
          selectedFilter={displayFilter}
          onFilterChange={handleFilterChange}
          isOpen={showFilterSheet}
          onClose={() => setShowFilterSheet(false)}
          theme={theme} // Pass theme derived from local state
        />
        
        {/* Text Post Creation Screen */}
        <TextPostCreateScreen />
        
        {/* Navigation drawer */}
        <NavigationDrawer 
          isOpen={showNavigationDrawer}
          onClose={handleCloseNavigationDrawer}
        />
        
        {/* Leave confirmation dialog */}
        {showLeaveConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] px-4"> {/* Ensure z-index is high but below sheet */}
            <div className="bg-gray-800 rounded-xl p-6 max-w-sm w-full">
              <h3 className="text-white text-lg font-semibold mb-4">
                {isUserInCommunity ? "Leave Community" : "Options"}
              </h3>
              
              <div className="space-y-4">
                {isUserInCommunity && !isUserStaff && (
                  <button
                    onClick={handleLeaveCommunity}
                    className="w-full py-3 px-4 text-red-500 font-medium text-left flex items-center"
                  >
                    <div className="mr-3">
                      <DirectSVG
                        icon="right-from-bracket"
                        size={16}
                        style={SVGIconStyle.SOLID}
                        primaryColor="ef4444"
                      />
                    </div>
                    Leave community
                  </button>
                )}
                
                {isUserMember && (
                  <button
                    onClick={() => {
                      setShowLeaveConfirmation(false);
                      handleShowMembershipOptions();
                    }}
                    className="w-full py-3 px-4 text-white font-medium text-left flex items-center"
                  >
                    <div className="mr-3">
                      <DirectSVG
                        icon="id-badge"
                        size={16}
                        style={SVGIconStyle.SOLID}
                        primaryColor="ffffff"
                      />
                    </div>
                    Your membership
                  </button>
                )}
                
                {/* Simplified "No options" message - adjust logic as needed */}
                {!isUserInCommunity && !isUserMember && !isUserStaff && (
                  <p className="text-gray-400 text-center py-2">No options available</p>
                )}
                 {/* Add staff-specific options here if needed */}
                 {isUserStaff && (
                   <p className="text-gray-400 text-center py-2">Staff options placeholder</p>
                 )}
              </div>
              
              <button
                onClick={() => setShowLeaveConfirmation(false)}
                className="w-full mt-4 py-3 bg-gray-700 rounded-lg text-white font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NonprofitProfile;