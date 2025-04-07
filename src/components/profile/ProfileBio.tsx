import React from 'react';
import { DirectSVG } from '@/lib/components/icons';
import { SVGIconStyle } from '@/lib/components/icons/SVGIcon';

interface ProfileBioProps {
  bio: string | null | undefined;
  onEdit?: () => void; // Make onEdit optional
}

const ProfileBio: React.FC<ProfileBioProps> = ({ bio, onEdit }) => {
  return (
    <div className="px-5 pb-4"> {/* Match horizontal padding if needed, add bottom padding */}
      {bio && bio.trim().length > 0 ? (
        <p className="text-white text-sm font-marfa font-light text-center leading-relaxed"> {/* Use font-light and adjust leading if needed */}
          {bio}
        </p>
      ) : (
        <button 
          onClick={onEdit}
          className="w-full border border-dashed border-gray-600 rounded-xl h-16 flex items-center justify-center mt-2 hover:bg-gray-800 transition-colors"
        >
          <span className="text-gray-400 font-marfa text-sm">
            Add your bio here...
          </span>
        </button>
      )}

      {/* Edit Button - Conditionally render only if onEdit is provided */}
      {onEdit && (
        <button 
          onClick={onEdit} 
          className="absolute top-3 right-3 flex items-center text-xs bg-white/10 hover:bg-white/20 text-white font-medium py-1 px-2.5 rounded-full transition-colors"
          aria-label="Edit bio"
        >
          <DirectSVG 
            icon="pencil" 
            size={12} 
            style={SVGIconStyle.SOLID} 
            primaryColor="ffffff" 
          />
          <span className="ml-1">Edit</span>
        </button>
      )}
    </div>
  );
};

export default ProfileBio; 