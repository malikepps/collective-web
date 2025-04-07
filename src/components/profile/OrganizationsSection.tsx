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
  // rowSpacing is not used in the same way as CollectiveSection, we need space-y-1 between rows

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

  // Split members into rows (copied from CollectiveSection)
  const getRows = () => {
    if (!useTwoRows) {
      return [sortedOrgs];
    }
    // Calculate number of items per row to balance both rows
    const totalOrgs = sortedOrgs.length;
    const itemsFirstRow = Math.ceil(totalOrgs / 2);
    
    return [
      sortedOrgs.slice(0, itemsFirstRow),
      sortedOrgs.slice(itemsFirstRow)
    ];
  };

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
    <div className="bg-card p-4 continuous-corner"> {/* Changed background, added padding and continuous-corner, removed overflow-hidden */}
      {/* Header - Adding mb-4 */}
      <button 
        onClick={onViewAll}
        className="w-full flex justify-between items-center mb-4 hover:bg-gray-700/50 transition-colors"
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

      {/* Organizations Grid/Row - updated logic */} 
      <div className="overflow-x-auto hide-scrollbar"> {/* Hide scrollbar */} 
        {sortedOrgs.length === 0 ? (
          <EmptyPlaceholder />
        ) : (
          <div className="flex flex-col space-y-1 min-w-min"> {/* Mimic CollectiveSection structure */}
            {getRows().map((row, rowIndex) => (
              <div 
                key={`row-${rowIndex}`} 
                className="flex space-x-2 px-2" // space-x-2 matches CollectiveSection
              >
                {row.map(({ organization, relationship }) => (
                   <div key={organization.id} className="flex-shrink-0"> {/* Removed min-w */} 
                    <OrganizationLogo 
                      organization={organization}
                      relationship={relationship}
                      size={itemSize}
                      onTap={() => handleOrgTap(organization, relationship)}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationsSection; 