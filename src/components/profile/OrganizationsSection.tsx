import React from 'react';
import { Organization } from '@/lib/models/Organization';
import { UserNonprofitRelationship } from '@/lib/models/UserNonprofitRelationship';
import OrganizationLogo from './OrganizationLogo';
import { DirectSVG } from '@/lib/components/icons';
import { SVGIconStyle } from '@/lib/components/icons/SVGIcon';
import { useRouter } from 'next/router';

interface OrganizationWithRelationship {
  organization: Organization;
  relationship: UserNonprofitRelationship;
}

interface OrganizationsSectionProps {
  organizations: OrganizationWithRelationship[];
  onViewAll: () => void; // Function to trigger the full screen cover
}

const OrganizationsSection: React.FC<OrganizationsSectionProps> = ({ organizations, onViewAll }) => {
  const router = useRouter();
  const itemSize = 80; // Corresponds to itemSize in Swift
  const itemSpacing = 'space-x-3.5'; // Tailwind equivalent for 14px spacing
  const rowSpacing = 'gap-3.5'; // Tailwind equivalent for 14px row gap

  const handleOrgTap = (org: Organization, relationship: UserNonprofitRelationship | null) => {
    const targetPath = org.username ? `/${org.username}` : `/organization/${org.id}`; 
    // TODO: Add logic for private vs public profile based on relationship later
    console.log(`Navigating to ${targetPath}`);
    router.push(targetPath);
  };

  // Replicate Swift sorting logic (Staff/Manager > Member > Community > Alphabetical)
  // The hook `useUserOrganizations` already does this sorting.
  const sortedOrgs = organizations;

  // Determine layout based on count
  const useTwoRows = sortedOrgs.length > 5;

  // Placeholder for empty state
  const EmptyPlaceholder = () => (
    <div className={`flex ${itemSpacing} px-4 py-2`}>
      {[1, 2, 3, 4, 5].map((num) => (
        <div 
          key={num}
          className="flex-shrink-0 rounded-full border border-dashed border-gray-600 flex items-center justify-center text-gray-500 font-marfa font-medium"
          style={{ width: itemSize, height: itemSize }}
        >
          {num}
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-card-secondary rounded-xl overflow-hidden mx-4"> {/* Added mx-4 to match placeholders */}
      {/* Header */}
      <button 
        onClick={onViewAll}
        className="w-full flex justify-between items-center p-4 hover:bg-gray-700/50 transition-colors"
      >
        <h3 className="text-white font-marfa font-semibold text-xl"> {/* Adjusted size */}
          Organizations
        </h3>
        <DirectSVG 
          icon="chevron-right" 
          size={18} 
          style={SVGIconStyle.SOLID} 
          primaryColor="gray" 
        />
      </button>

      {/* Organizations Grid/Row */}
      <div className="overflow-x-auto pb-4"> {/* Add horizontal scroll and bottom padding */}
        {sortedOrgs.length === 0 ? (
          <EmptyPlaceholder />
        ) : useTwoRows ? (
          // Two-row grid
          <div className={`grid grid-flow-col auto-cols-max ${rowSpacing} px-4`}>
            {/* Create two rows manually for horizontal scroll */}
            <div className={`flex ${itemSpacing}`}>
              {sortedOrgs.filter((_, i) => i % 2 === 0).map(({ organization, relationship }) => (
                <OrganizationLogo 
                  key={organization.id}
                  organization={organization}
                  relationship={relationship}
                  size={itemSize}
                  onTap={() => handleOrgTap(organization, relationship)}
                />
              ))}
            </div>
            <div className={`flex ${itemSpacing}`}>
               {sortedOrgs.filter((_, i) => i % 2 !== 0).map(({ organization, relationship }) => (
                <OrganizationLogo 
                  key={organization.id}
                  organization={organization}
                  relationship={relationship}
                  size={itemSize}
                  onTap={() => handleOrgTap(organization, relationship)}
                />
              ))}
            </div>
          </div>
        ) : (
          // Single row
          <div className={`flex ${itemSpacing} px-4`}>
            {sortedOrgs.map(({ organization, relationship }) => (
              <OrganizationLogo 
                key={organization.id}
                organization={organization}
                relationship={relationship}
                size={itemSize}
                onTap={() => handleOrgTap(organization, relationship)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationsSection; 