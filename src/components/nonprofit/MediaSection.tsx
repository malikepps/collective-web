import React, { useState } from 'react';
import { Organization } from '@/lib/models/Organization';
import LoopingVideoPlayer from './LoopingVideoPlayer';

interface MediaSectionProps {
  organization: Organization;
  navbarHeight?: number;
}

const MediaSection: React.FC<MediaSectionProps> = ({ 
  organization,
  navbarHeight = 40 // Default height if not provided
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Image handlers
  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    console.warn('[MediaSection] Failed to load organization image');
    setImageError(true);
    setIsLoading(false);
  };

  return (
    <div className="w-full relative">
      {/* Video content with rounded bottom corners - no explicit padding top */}
      <div 
        className="w-full h-[39vh] bg-black overflow-hidden continuous-corner"
      >
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-black" style={{ borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}></div>
        
        {/* Loading state */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {organization.hero_video_url ? (
          <LoopingVideoPlayer
            videoURL={organization.hero_video_url}
            isMuted={true}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="relative w-full h-full">
            <img
              src={organization.photoURL || '/placeholder-image.jpg'}
              alt={organization.name}
              className="w-full h-full object-cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </div>
        )}
      </div>
      
      {/* Gradient overlay - matches iOS app's fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/70 to-transparent ios-sheet-top" />
      
      {/* Organization info - positioning matches iOS app */}
      <div className="absolute bottom-4 left-6 flex flex-col">
        <div className="relative w-[90px] h-[90px] rounded-full overflow-hidden mb-2 border border-gray-700">
          <img
            src={organization.photoURL || '/placeholder-avatar.jpg'}
            alt={organization.name}
            className="w-full h-full object-cover"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </div>
        <h1 className="font-marfa font-semibold text-4xl text-white">
          {organization.name}
        </h1>
      </div>
    </div>
  );
};

export default MediaSection; 