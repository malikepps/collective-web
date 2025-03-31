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

interface NonprofitProfileProps {
  organization: Organization;
}

const NonprofitProfile: React.FC<NonprofitProfileProps> = ({
  organization
}) => {
  const router = useRouter();
  const [scrollOffset, setScrollOffset] = useState(0);
  const [showLinksSheet, setShowLinksSheet] = useState(false);
  const [showMissionSheet, setShowMissionSheet] = useState(false);
  const [showMembershipOptions, setShowMembershipOptions] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [displayFilter, setDisplayFilter] = useState('all');
  
  // Handle scroll events to adjust header opacity
  useEffect(() => {
    const handleScroll = () => {
      setScrollOffset(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
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
  
  return (
    <div className="min-h-screen bg-black">
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
        />
        
        {/* Collective Section */}
        <div className="mt-1">
          <CollectiveSection
            organization={organization}
            onShowFilterSheet={handleShowFilterSheet}
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
      />
    </div>
  );
};

export default NonprofitProfile; 