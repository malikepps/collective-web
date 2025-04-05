import React from 'react';
import Image from 'next/image';
import { Organization } from '@/lib/models/Organization';
import { UserNonprofitRelationship } from '@/lib/models/UserNonprofitRelationship';

interface OrganizationLogoProps {
  organization: Organization;
  relationship: UserNonprofitRelationship | null;
  size: number;
  onTap: () => void;
}

const OrganizationLogo: React.FC<OrganizationLogoProps> = ({ 
  organization,
  relationship,
  size,
  onTap
}) => {
  const getInitials = (name?: string | null): string => {
    return name?.charAt(0)?.toUpperCase() || '?';
  };

  // Determine border style based on relationship
  let borderClass = '';
  if (relationship?.isStaff || relationship?.isManager) {
    // TODO: Define gradient border for staff/manager - maybe using Tailwind arbitrary values or custom CSS
    borderClass = 'border-2 border-blue-400'; // Placeholder border
  } else if (relationship?.isMember) {
    // TODO: Define gradient border for member
    borderClass = 'border-2 border-yellow-400'; // Placeholder border
  }

  return (
    <button 
      onClick={onTap}
      className={`relative rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-b from-gray-600 to-gray-700 ${borderClass}`}
      style={{ width: size, height: size }}
      aria-label={`Navigate to ${organization.name}`}
    >
      {organization.photoURL ? (
        <Image 
          src={organization.photoURL} 
          alt={organization.name || 'Organization Logo'} 
          layout="fill" 
          objectFit="cover"
        />
      ) : (
        <span 
          className="font-marfa font-bold text-white opacity-70"
          style={{ fontSize: size * 0.4 }} // Adjust font size relative to container size
        >
          {getInitials(organization.name)}
        </span>
      )}
    </button>
  );
};

export default OrganizationLogo; 