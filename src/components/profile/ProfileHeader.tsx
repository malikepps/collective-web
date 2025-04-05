import React from 'react';
import Image from 'next/image';
import { CollectiveUser } from '@/lib/models/User';

interface ProfileHeaderProps {
  // Using Partial because the placeholder hook currently returns Partial<CollectiveUser>
  // When the real hook is implemented, this can be changed back to CollectiveUser if needed.
  userData: CollectiveUser; // Use CollectiveUser now that the model includes lastName
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ userData }) => {

  const getInitials = (firstName?: string | null, lastName?: string | null): string => {
    const firstInitial = firstName?.charAt(0)?.toUpperCase() || '?';
    // Optionally add last initial if needed, matching iOS style
    // const lastInitial = lastName?.charAt(0)?.toUpperCase() || ''; 
    return firstInitial; 
  };

  return (
    <div className="flex flex-col items-center pt-6 pb-8"> {/* Added top/bottom padding */}
      {/* Profile Image / Placeholder */}
      <div className="w-32 h-32 rounded-full overflow-hidden mb-4 relative bg-gradient-to-b from-gray-600 to-gray-700 flex items-center justify-center"> 
        {userData.photoURL ? (
          <Image 
            src={userData.photoURL} 
            alt={userData.firstName || userData.username || 'Profile Photo'} 
            layout="fill" 
            objectFit="cover"
            priority // Prioritize loading the profile picture
          />
        ) : (
          <span className="font-marfa font-bold text-4xl text-white opacity-70">
            {getInitials(userData.firstName, userData.lastName)}
          </span>
        )}
      </div>

      {/* User Name */}
      {userData.firstName && (
        <h2 className="font-marfa font-semibold text-4xl text-white mb-3"> 
          {userData.firstName}
        </h2>
      )}

      {/* Info Row: Username, Location, Share */}
      <div className="flex flex-wrap justify-center items-center space-x-2"> 
        {userData.username && (
          <span className="bg-gray-700 text-gray-300 text-sm font-marfa px-3 py-1.5 rounded-lg">
            @{userData.username}
          </span>
        )}
        
        {(userData.city && userData.state) || userData.communityDisplayName ? (
          <div className="bg-gray-700 text-gray-300 text-sm font-marfa px-3 py-1.5 rounded-lg flex items-center space-x-1.5">
            <span>📍</span>
            <span>
              {userData.communityDisplayName || `${userData.city}, ${userData.state}`}
            </span>
          </div>
        ) : null}

        {/* Share Button Placeholder */}
        <button 
          className="bg-blue-600 text-white text-sm font-marfa px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => console.log('Share button clicked')} // Placeholder action
        >
          Share
        </button>
      </div>
    </div>
  );
};

export default ProfileHeader; 