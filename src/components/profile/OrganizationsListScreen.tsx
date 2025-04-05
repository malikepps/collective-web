import React from 'react';
import { DirectSVG } from '@/lib/components/icons';
import { SVGIconStyle } from '@/lib/components/icons/SVGIcon';

interface OrganizationsListScreenProps {
  isOpen: boolean;
  onClose: () => void;
  // TODO: Add organizations data prop later
}

const OrganizationsListScreen: React.FC<OrganizationsListScreenProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

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
        <p className="text-gray-400">Organization list placeholder...</p>
        {/* TODO: Map over organizations and display list items */}
      </div>
    </div>
  );
};

export default OrganizationsListScreen; 