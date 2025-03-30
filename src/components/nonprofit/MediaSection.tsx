import React from 'react';
import Image from 'next/image';
import { Organization } from '@/lib/models/Organization';
import LoopingVideoPlayer from './LoopingVideoPlayer';

interface MediaSectionProps {
  organization: Organization;
}

const MediaSection: React.FC<MediaSectionProps> = ({ organization }) => {
  return (
    <div className="relative">
      {/* Video content with rounded bottom corners */}
      <div className="w-full h-[52vh] bg-black rounded-b-[15px] overflow-hidden">
        {organization.hero_video_url ? (
          <LoopingVideoPlayer
            videoURL={organization.hero_video_url}
            isMuted={true}
            className="w-full h-full"
          />
        ) : (
          <div className="relative w-full h-full">
            <Image
              src={organization.photoURL || '/placeholder-image.jpg'}
              alt={organization.name}
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
        )}
      </div>
      
      {/* Gradient overlay - matches iOS app's fade */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/70 to-transparent"
        style={{ borderBottomLeftRadius: '15px', borderBottomRightRadius: '15px' }}
      />
      
      {/* Organization info - positioning matches iOS app */}
      <div className="absolute bottom-4 left-6 flex flex-col">
        <div className="relative w-[90px] h-[90px] rounded-full overflow-hidden mb-2 border border-gray-700">
          <Image
            src={organization.photoURL || '/placeholder-avatar.jpg'}
            alt={organization.name}
            fill
            style={{ objectFit: 'cover' }}
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