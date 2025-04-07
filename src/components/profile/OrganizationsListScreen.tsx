import React from 'react';
import { useRouter } from 'next/router';
import { useUserOrganizations } from '@/lib/hooks/useUserOrganizations';
import { DirectSVG } from '@/lib/components/icons';
import { SVGIconStyle } from '@/lib/components/icons/SVGIcon';
import { Organization } from '@/lib/models/Organization';
import { UserNonprofitRelationship, relationshipFromFirestore } from '@/lib/models/UserNonprofitRelationship';

interface OrganizationsListScreenProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper function to get display role
const getDisplayRole = (relationship: UserNonprofitRelationship): string => {
  if (relationship.isManager) return 'Staff';
  if (relationship.isMember) return 'Member';
  if (relationship.isCommunity) return 'Community';
  return 'Unknown';
};

const OrganizationsListScreen: React.FC<OrganizationsListScreenProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { organizations: orgsWithRelationships, loading: orgsLoading } = useUserOrganizations();

  if (!isOpen) return null;
  
  const handleOrgTap = (org: Organization) => {
    onClose(); // Close the screen before navigating
    const targetPath = org.username ? `/${org.username}` : `/organization/${org.id}`;
    router.push(targetPath);
  };

  // Filter out invalid orgs and ensure relationships exist
  const validOrgs = orgsWithRelationships.filter(
    item => item.organization && item.organization.id && item.relationship
  );

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 h-16 flex items-center justify-between px-4 border-b border-gray-700">
        <button onClick={onClose} className="p-2">
          <DirectSVG 
            icon="xmark" 
            size={24} 
            style={SVGIconStyle.SOLID} 
            primaryColor="ffffff" 
          />
        </button>
        <h1 className="text-white font-marfa font-semibold text-lg">Your Organizations</h1>
        <div className="w-10"></div> {/* Spacer */} 
      </div>

      {/* Content Area */}
      <div className="flex-grow overflow-y-auto p-4">
        {orgsLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : validOrgs.length === 0 ? (
          <p className="text-gray-400 text-center mt-10">You haven't joined any organizations yet.</p>
        ) : (
          <ul className="space-y-4">
            {validOrgs.map(({ organization, relationship }) => (
              <li key={organization.id}>
                <button 
                  onClick={() => handleOrgTap(organization)}
                  className="w-full flex items-center py-2 px-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {/* Logo */}
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 mr-4 flex-shrink-0">
                    {organization.photoURL ? (
                      <img 
                        src={organization.photoURL} 
                        alt={organization.name || 'Organization'} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-lg">
                        {(organization.name || 'O').charAt(0)}
                      </div>
                    )}
                  </div>
                  {/* Text */}
                  <div className="text-left">
                    <p className="text-white font-marfa text-base truncate">{organization.name || 'Unknown Organization'}</p>
                    <p className="text-gray-400 text-sm">{getDisplayRole(relationship)}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default OrganizationsListScreen; 