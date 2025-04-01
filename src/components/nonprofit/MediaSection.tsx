import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Organization } from '@/lib/models/Organization';
import LoopingVideoPlayer from './LoopingVideoPlayer';
import MediaService from '@/lib/services/MediaService';

interface MediaSectionProps {
  organization: Organization;
  navbarHeight?: number;
}

const MediaSection: React.FC<MediaSectionProps> = ({ 
  organization,
  navbarHeight = 40 // Default height if not provided
}) => {
  const [resolvedPhotoUrl, setResolvedPhotoUrl] = useState<string | null>(null);
  const [resolvedVideoUrl, setResolvedVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mediaService = MediaService.getInstance();

  useEffect(() => {
    const resolveUrls = async () => {
      setIsLoading(true);
      
      try {
        // Resolve photo URL
        if (organization.photoURL) {
          const photoUrl = await mediaService.resolveFirebaseStorageUrl(organization.photoURL);
          setResolvedPhotoUrl(photoUrl);
        }
        
        // Resolve video URL if it exists
        if (organization.hero_video_url) {
          const videoUrl = await mediaService.resolveFirebaseStorageUrl(organization.hero_video_url);
          setResolvedVideoUrl(videoUrl);
        }
      } catch (error) {
        console.error('[MediaSection] Error resolving URLs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    resolveUrls();
  }, [organization]);

  // Image error handler
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.warn('[MediaSection] Failed to load organization image');
    e.currentTarget.src = '/placeholder-image.jpg';
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
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {resolvedVideoUrl ? (
          <LoopingVideoPlayer
            videoURL={resolvedVideoUrl}
            isMuted={true}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="relative w-full h-full">
            <img
              src={resolvedPhotoUrl || organization.photoURL || '/placeholder-image.jpg'}
              alt={organization.name}
              className="w-full h-full object-cover"
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
            src={resolvedPhotoUrl || organization.photoURL || '/placeholder-avatar.jpg'}
            alt={organization.name}
            className="w-full h-full object-cover"
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