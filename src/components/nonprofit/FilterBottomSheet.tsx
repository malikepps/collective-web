import React, { useState } from 'react';

interface FilterBottomSheetProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  selectedFilter,
  onFilterChange,
  isOpen,
  onClose
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
  
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div 
        className="relative w-full max-w-md bg-[#111214] rounded-t-2xl p-4 pb-10"
        onClick={e => e.stopPropagation()}
      >
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
            isSelected={tempSelection === 'manager'}
            onSelect={() => setTempSelection('manager')}
          />
          
          <FilterOption 
            title="Members" 
            isSelected={tempSelection === 'member'}
            onSelect={() => setTempSelection('member')}
          />
          
          <FilterOption 
            title="Community" 
            isSelected={tempSelection === 'community'}
            onSelect={() => setTempSelection('community')}
          />
        </div>
        
        {/* Action buttons */}
        <div className="flex space-x-4 px-4">
          <button
            onClick={clearFilter}
            className="flex-1 py-3 bg-white/20 rounded-lg font-marfa font-medium text-white"
          >
            Clear All
          </button>
          
          <button
            onClick={applyFilter}
            className="flex-1 py-3 bg-blue-500 rounded-lg font-marfa font-medium text-white"
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
  isSelected: boolean;
  onSelect: () => void;
}> = ({ title, isSelected, onSelect }) => {
  return (
    <button 
      onClick={onSelect}
      className="w-full flex items-center justify-between py-3"
    >
      <span className="text-white font-marfa">{title}</span>
      
      <div 
        className={`w-6 h-6 rounded-full flex items-center justify-center
          ${isSelected ? 'border-0 bg-blue-500' : 'border border-gray-600'}
        `}
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