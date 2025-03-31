import React, { useState } from 'react';
import { Theme } from '@/lib/models/Theme';
import { DirectFontAwesome } from '@/lib/components/icons';

interface FilterBottomSheetProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  isOpen: boolean;
  onClose: () => void;
  theme?: Theme;
}

const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  selectedFilter,
  onFilterChange,
  isOpen,
  onClose,
  theme
}) => {
  const [tempSelection, setTempSelection] = useState(selectedFilter);
  
  if (!isOpen) return null;
  
  const applyFilter = () => {
    onFilterChange(tempSelection);
    onClose();
  };
  
  const clearFilter = () => {
    setTempSelection('all');
    onFilterChange('all');
    onClose();
  };

  // Get the primary color from theme
  const primaryColor = theme?.primaryColor ? 
    (theme.primaryColor.startsWith('#') ? theme.primaryColor : `#${theme.primaryColor}`) : '#3B82F6';
  
  // Get secondary color
  const secondaryColor = theme?.secondaryColor ? 
    (theme.secondaryColor.startsWith('#') ? theme.secondaryColor : `#${theme.secondaryColor}`) : primaryColor;
  
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div 
        className="relative w-full max-w-md bg-[#1E1E24] ios-sheet-top p-4 pb-10"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white p-2"
          aria-label="Close filter sheet"
        >
          <DirectFontAwesome 
            icon="xmark" 
            size={20} 
            color="#FFFFFF" 
          />
        </button>
        
        {/* Drag indicator */}
        <div className="flex justify-center mb-6">
          <div className="w-10 h-1 bg-gray-500 rounded-full" />
        </div>
        
        {/* Header */}
        <h3 className="text-xl font-marfa font-semibold text-white text-center mb-8">
          Filter Collective
        </h3>
        
        {/* Filter options */}
        <div className="space-y-6 mb-8 px-4">
          <FilterOption 
            title="Staff" 
            description="Leaders and administrators"
            isSelected={tempSelection === 'manager'}
            onSelect={() => setTempSelection('manager')}
            accentColor={primaryColor}
          />
          
          <FilterOption 
            title="Members" 
            description="Active financial contributors"
            isSelected={tempSelection === 'member'}
            onSelect={() => setTempSelection('member')}
            accentColor={primaryColor}
          />
          
          <FilterOption 
            title="Community" 
            description="Supporters and followers"
            isSelected={tempSelection === 'community'}
            onSelect={() => setTempSelection('community')}
            accentColor={primaryColor}
          />

          <FilterOption 
            title="All" 
            description="Everyone"
            isSelected={tempSelection === 'all'}
            onSelect={() => setTempSelection('all')}
            accentColor={primaryColor}
          />
        </div>
        
        {/* Action buttons */}
        <div className="flex space-x-4 px-4">
          <button
            onClick={clearFilter}
            className="flex-1 py-3 ios-rounded-sm font-marfa font-medium text-white"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: secondaryColor
            }}
          >
            Clear All
          </button>
          
          <button
            onClick={applyFilter}
            className="flex-1 py-3 ios-rounded-sm font-marfa font-medium text-white"
            style={{ backgroundColor: primaryColor }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

// Filter Option component
const FilterOption: React.FC<{
  title: string;
  description?: string;
  isSelected: boolean;
  onSelect: () => void;
  accentColor?: string;
}> = ({ title, description, isSelected, onSelect, accentColor = '#3B82F6' }) => {
  return (
    <button 
      onClick={onSelect}
      className="w-full flex items-center justify-between py-3"
    >
      <div className="flex flex-col items-start">
        <span className="text-white font-marfa">{title}</span>
        {description && (
          <span className="text-gray-400 text-sm font-marfa">{description}</span>
        )}
      </div>
      
      <div 
        className={`w-6 h-6 rounded-full flex items-center justify-center
          ${isSelected ? 'border-0' : 'border border-gray-600'}
        `}
        style={{ backgroundColor: isSelected ? accentColor : 'transparent' }}
      >
        {isSelected && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    </button>
  );
};

export default FilterBottomSheet; 