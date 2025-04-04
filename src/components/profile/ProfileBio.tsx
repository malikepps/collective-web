import React from 'react';

interface ProfileBioProps {
  bio: string | null | undefined;
  onEdit: () => void; // Function to trigger the edit bio sheet
}

const ProfileBio: React.FC<ProfileBioProps> = ({ bio, onEdit }) => {
  return (
    <div className="px-5 pb-4"> {/* Match horizontal padding if needed, add bottom padding */}
      {bio && !bio.trim().isEmpty() ? (
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
    </div>
  );
};

export default ProfileBio; 