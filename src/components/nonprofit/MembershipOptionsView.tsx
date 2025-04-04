import React, { useState, useEffect, useRef } from 'react';
import { Organization } from '@/lib/models/Organization';
import { useTheme } from '@/lib/context/ThemeContext';
import { DirectFontAwesome } from '@/lib/components/icons';
import { useMembershipTiers } from '@/lib/hooks/useMembershipTiers';
import MembershipTierCard from './MembershipTierCard';
import CustomMembershipSheet from './CustomMembershipSheet';

interface MembershipOptionsViewProps {
  organization: Organization;
  isOpen: boolean;
  onClose: () => void;
}

const MembershipOptionsView: React.FC<MembershipOptionsViewProps> = ({
  organization,
  isOpen,
  onClose
}) => {
  const { getTheme } = useTheme();
  // Get the theme from the organization's themeId
  const theme = organization.themeId ? getTheme(organization.themeId) : undefined;
  
  const [showCustomSheet, setShowCustomSheet] = useState(false);
  const hasInitialized = useRef(false);
  
  // Fetch membership tiers
  const { 
    tiers, 
    loading, 
    error, 
    recommendedTier,
    refreshTiers 
  } = useMembershipTiers(organization.id);
  
  // Refresh tiers only once when component opens
  useEffect(() => {
    if (isOpen && !hasInitialized.current) {
      console.log('[DEBUG] Initializing membership tiers for first time');
      hasInitialized.current = true;
      refreshTiers();
    }
  }, [isOpen, refreshTiers]);
  
  if (!isOpen) {
    // Reset initialization flag when closed
    hasInitialized.current = false;
    return null;
  }
  
  return (
    <div className="fixed inset-0 z-50 bg-[#111214] overflow-hidden">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-[#111214]">
        <button 
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-black/50"
        >
          <DirectFontAwesome 
            icon="chevron-left"
            size={16}
            color="#ffffff"
          />
        </button>
        
        <div className="flex items-center">
          <div className="w-5 h-5 rounded-full overflow-hidden mr-2">
            <img 
              src={organization.photoURL || '/placeholder-avatar.jpg'}
              alt={organization.name}
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-white font-marfa font-medium text-lg">
            {organization.name}
          </h1>
        </div>
        
        <div className="w-10" /> {/* Empty div for flexbox centering */}
      </div>
      
      {/* Content */}
      <div className="pt-20 pb-24 px-6 overflow-auto h-full">
        <div className="max-w-md mx-auto">
          <h2 className="text-white font-marfa font-semibold text-xl text-center mb-4">
            Membership Options
          </h2>
          
          {/* Custom payment option button - changed to just "Custom" */}
          <button
            onClick={() => setShowCustomSheet(true)}
            className="w-full py-3 mb-6 bg-[#2A2A2A] rounded-lg font-marfa font-medium text-base text-white border-2 border-dashed border-white/50"
          >
            Custom
          </button>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center">
              {error}
            </div>
          ) : tiers.length === 0 ? (
            <div className="text-white/60 text-center">
              No membership options available
            </div>
          ) : (
            <div className="space-y-6">
              {/* Display membership tiers in a vertical stack */}
              {tiers.map(tier => (
                <MembershipTierCard
                  key={tier.id}
                  tier={tier}
                  organizationName={organization.name}
                  theme={theme}
                  isRecommended={tier.id === recommendedTier?.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Custom membership sheet */}
      <CustomMembershipSheet
        organization={organization}
        theme={theme}
        isOpen={showCustomSheet}
        onClose={() => setShowCustomSheet(false)}
      />
    </div>
  );
};

export default MembershipOptionsView; 