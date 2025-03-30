import React from 'react';
import { Organization } from '@/lib/models/Organization';
import { useTheme } from '@/lib/context/ThemeContext';

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
  const theme = getTheme(organization.themeId);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-[#111214]">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
        <button 
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-black/50"
        >
          <span className="text-white text-lg">←</span>
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
      <div className="pt-20 pb-10 px-6 overflow-auto h-full">
        <div className="max-w-md mx-auto">
          <h2 className="text-white font-marfa font-semibold text-xl text-center mb-8">
            Membership Options
          </h2>
          
          {/* Placeholder for membership tiers */}
          <div 
            className="bg-[#2A2A2A] rounded-xl p-6 text-center"
            style={{ 
              border: theme?.primaryColor ? `2px solid #${theme.primaryColor}` : '2px solid #ADD3FF'
            }}
          >
            <h3 className="text-white font-marfa font-semibold text-2xl mb-2">
              ✨ Basic Membership
            </h3>
            
            <div className="flex items-baseline justify-center mb-6">
              <span className="text-white font-marfa font-bold text-4xl">$5</span>
              <span className="text-white/70 font-marfa ml-1">/ mo</span>
            </div>
            
            <p className="text-white/90 font-marfa text-sm mb-8">
              Support {organization.name} and get exclusive access to member-only content.
            </p>
            
            <button 
              className="w-full py-3 rounded-lg font-marfa font-semibold text-base"
              style={{ 
                backgroundColor: theme?.primaryColor ? `#${theme.primaryColor}` : '#ADD3FF',
                color: theme?.primaryColor && theme.textOnPrimaryColor ? `#${theme.textOnPrimaryColor}` : '#000000'
              }}
            >
              Join
            </button>
          </div>
          
          <p className="text-center text-white/60 font-marfa text-sm mt-6">
            More membership tiers will be available soon
          </p>
        </div>
      </div>
    </div>
  );
};

export default MembershipOptionsView; 