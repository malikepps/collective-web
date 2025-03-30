import React from 'react';
import Image from 'next/image';
import { Organization } from '@/lib/models/Organization';

interface OrganizationDetailsProps {
  organization: Organization;
  isOpen: boolean;
  onClose: () => void;
}

const OrganizationDetailsView: React.FC<OrganizationDetailsProps> = ({
  organization,
  isOpen,
  onClose
}) => {
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
        
        <h1 className="text-white font-marfa font-medium text-lg">
          Mission
        </h1>
        
        <div className="w-10" /> {/* Empty div for flexbox centering */}
      </div>
      
      {/* Content */}
      <div className="pt-20 pb-10 px-6 overflow-auto h-full">
        <div className="max-w-md mx-auto">
          {/* Organization logo and name in same line */}
          <div className="flex items-center mb-8 mt-4">
            <div className="relative w-[60px] h-[60px] rounded-full overflow-hidden mr-4">
              <Image
                src={organization.photoURL || '/placeholder-avatar.jpg'}
                alt={organization.name}
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
            
            <h2 className="text-white font-marfa font-semibold text-2xl">
              {organization.name}
            </h2>
          </div>
          
          {/* Mission/Pitch content */}
          <div className="space-y-6">
            <p className="text-white font-marfa font-light leading-relaxed text-base">
              {organization.pitch || organization.description}
            </p>
            
            {organization.location && (
              <div className="mt-6">
                <h3 className="text-white/80 font-marfa font-medium text-lg mb-2">
                  Location
                </h3>
                <p className="text-white font-marfa">
                  {organization.location}
                  {organization.city && `, ${organization.city}`}
                  {organization.state && `, ${organization.state}`}
                </p>
              </div>
            )}
            
            {organization.linkInBio && (
              <div className="mt-4">
                <h3 className="text-white/80 font-marfa font-medium text-lg mb-2">
                  Website
                </h3>
                <a 
                  href={organization.linkInBio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 font-marfa underline"
                >
                  {organization.linkInBio}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationDetailsView; 