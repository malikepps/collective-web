import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Organization } from '@/lib/models/Organization';
import MediaSection from './MediaSection';
import InfoBox from './InfoBox';
import LinksSheet from './LinksSheet';
import OrganizationDetailsView from './OrganizationDetailsView';
import MembershipOptionsView from './MembershipOptionsView';
import CollectiveSection from './CollectiveSection';
import FilterBottomSheet from './FilterBottomSheet';
import { FAIcon, Icon, IconStyle, DebugIcon, DirectFontAwesome } from '@/lib/components/icons';
import { useTheme } from '@/lib/context/ThemeContext';
import Head from 'next/head';
import { useUserOrganizationRelationship } from '@/lib/hooks/useUserOrganizationRelationship';

interface NonprofitProfileProps {
  organization: Organization;
}

const NonprofitProfile: React.FC<NonprofitProfileProps> = ({
  organization
}) => {
  console.log("[DEBUG] NonprofitProfile rendering for org:", organization.id, organization.name);
  
  const router = useRouter();
  const { getTheme } = useTheme();
  const theme = organization.themeId ? getTheme(organization.themeId) : undefined;
  const [scrollOffset, setScrollOffset] = useState(0);
  const [showLinksSheet, setShowLinksSheet] = useState(false);
  const [showMissionSheet, setShowMissionSheet] = useState(false);
  const [showMembershipOptions, setShowMembershipOptions] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [displayFilter, setDisplayFilter] = useState('all');
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  
  // Get user relationship with organization
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
  
  // Handle scroll events to adjust header opacity
  useEffect(() => {
    const handleScroll = () => {
      setScrollOffset(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Apply overflow hidden to body when modals are open
  useEffect(() => {
    const isAnyModalOpen = showLinksSheet || showMissionSheet || showMembershipOptions || 
                          showFilterSheet || showLeaveConfirmation;
    
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
      htmlElement.style.scrollbarWidth = 'none';
      bodyElement.style.scrollbarWidth = 'none';
    }
    
    return () => {
      // Cleanup: reset overflow when component unmounts
      htmlElement.style.overflow = '';
      bodyElement.style.overflow = '';
      htmlElement.style.scrollbarWidth = '';
      bodyElement.style.scrollbarWidth = '';
    };
  }, [showLinksSheet, showMissionSheet, showMembershipOptions, showFilterSheet, showLeaveConfirmation]);
  
  // Modal handlers
  const handleShowLinks = () => {
    setShowLinksSheet(true);
  };
  
  const handleShowMission = () => {
    setShowMissionSheet(true);
  };
  
  const handleShowMembershipOptions = () => {
    setShowMembershipOptions(true);
  };
  
  const handleShowFilterSheet = () => {
    setShowFilterSheet(true);
  };
  
  const handleFilterChange = (filter: string) => {
    setDisplayFilter(filter);
  };
  
  const handleLeaveCommunity = async () => {
    console.log("[DEBUG] Leaving community for org:", organization.id);
    await toggleCommunity();
    setShowLeaveConfirmation(false);
  };
  
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
        `}</style>
      </Head>
      
      <div className="min-h-screen bg-black overflow-hidden">
        {/* Back button - fixed position */}
        <div className="fixed top-12 left-4 z-10">
          <button 
            onClick={() => router.back()}
            className="flex items-center justify-center overflow-hidden"
          >
            <DirectFontAwesome 
              icon="bars"
              size={25}
              color="#ffffff"
              style={{ filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.25))' }}
            />
          </button>
        </div>
        
        {/* Username in Navigation - fixed position */}
        <div 
          className="fixed top-12 left-0 right-0 z-10 text-center"
          style={{ 
            opacity: scrollOffset > 50 ? Math.min(1, (scrollOffset - 50) / 100) : 0 
          }}
        >
          <p className="text-white font-marfa font-medium">
            @{organization.username || organization.name.toLowerCase().replace(/\s/g, '')}
          </p>
        </div>
        
        {/* Ellipsis menu - fixed position */}
        <div className="fixed top-12 right-4 z-10">
          <div className="relative inline-block text-left">
            <button
              onClick={() => setShowLeaveConfirmation(true)}
              className="flex items-center justify-center p-2"
            >
              <DirectFontAwesome
                icon="ellipsis-vertical"
                size={50}
                color="#ffffff"
                style={{ filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.25))' }}
              />
            </button>
          </div>
        </div>
        
        {/* Media Section */}
        <div className="mt-2 bg-black">
          <MediaSection organization={organization} />
        </div>
        
        {/* Content Sections */}
        <div className="pb-20 pt-1">
          {/* Info Box */}
          <InfoBox 
            organization={organization}
            onShowLinks={handleShowLinks}
            onShowMission={handleShowMission}
            onShowMembershipOptions={handleShowMembershipOptions}
            isUserMember={isUserMember}
            isUserInCommunity={isUserInCommunity}
            onToggleCommunity={toggleCommunity}
          />
          
          {/* Collective Section */}
          <div className="mt-1">
            <CollectiveSection
              organization={organization}
              onShowFilterSheet={handleShowFilterSheet}
              displayFilter={displayFilter}
            />
          </div>
          
          {/* Posts Section - placeholder */}
          <div className="bg-card p-4 text-white mt-1 continuous-corner">
            <h2 className="text-white font-semibold text-2xl mb-4">Posts</h2>
            <div className="flex items-center justify-center h-32">
              <p className="text-white/50">Posts will appear here</p>
            </div>
          </div>
        </div>
        
        {/* Modal components */}
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
          theme={theme}
        />
        
        {/* Leave confirmation dialog */}
        {showLeaveConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 px-4">
            <div className="bg-gray-800 rounded-xl p-6 max-w-sm w-full">
              <h3 className="text-white text-lg font-semibold mb-4">
                {isUserInCommunity ? "Leave Community" : "Options"}
              </h3>
              
              <div className="space-y-4">
                {isUserInCommunity && (
                  <button
                    onClick={handleLeaveCommunity}
                    className="w-full py-3 px-4 text-red-500 font-medium text-left flex items-center"
                  >
                    <div className="mr-3">
                      <DirectFontAwesome
                        icon="right-from-bracket"
                        size={16}
                        color="#ef4444"
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
                      <DirectFontAwesome
                        icon="id-badge"
                        size={16}
                        color="#ffffff"
                      />
                    </div>
                    Your membership
                  </button>
                )}
                
                {!isUserInCommunity && !isUserMember && (
                  <p className="text-gray-400 text-center py-2">No options available</p>
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