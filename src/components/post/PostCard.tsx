import React, { useState } from 'react';
import Image from 'next/image';
import { Post, MediaType } from '@/lib/models/Post';
import { Organization } from '@/lib/models/Organization';
import MediaCarousel from './MediaCarousel';
import { DirectFontAwesome } from '@/lib/components/icons';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: Post;
  organization: Organization;
  isUserMember: boolean;
  isUserStaff: boolean;
  isLiked: boolean;
  isBoosted: boolean;
  onToggleLike: () => void;
  onToggleBoost: () => void;
  onShowDetail: () => void;
  onDeletePost?: () => void;
}

export default function PostCard({
  post,
  organization,
  isUserMember,
  isUserStaff,
  isLiked,
  isBoosted,
  onToggleLike,
  onToggleBoost,
  onShowDetail,
  onDeletePost
}: PostCardProps) {
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  // Format post date
  const formattedDate = formatDistanceToNow(post.createdDate, { addSuffix: true });
  
  // Handle double tap to like
  const handleDoubleTap = () => {
    if (!isLiked) {
      onToggleLike();
      
      // Show like animation
      setShowLikeAnimation(true);
      setTimeout(() => {
        setShowLikeAnimation(false);
      }, 800);
    }
  };
  
  // Get media items from post
  const getMediaItems = () => {
    if (post.mediaItems && post.mediaItems.length > 0) {
      return post.mediaItems;
    }
    
    // Create media items from legacy format
    if (post.video && post.videoUrl) {
      return [
        {
          id: '0',
          url: post.videoUrl,
          type: MediaType.VIDEO,
          order: 0,
          thumbnailUrl: post.postImage,
          thumbnailColor: null
        }
      ];
    }
    
    if (post.postImage) {
      return [
        {
          id: '0',
          url: post.postImage,
          type: MediaType.IMAGE,
          order: 0,
          thumbnailUrl: null,
          thumbnailColor: null
        }
      ];
    }
    
    return [];
  };
  
  // Calculate background gradient
  const generateGradient = () => {
    const color = post.backgroundColorHex || '525252';
    
    return `linear-gradient(to bottom, #${color}, #111)`;
  };

  return (
    <div 
      className="bg-card rounded-xl overflow-hidden shadow-lg mb-4"
      style={{ background: generateGradient() }}
    >
      {/* Organization Header */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-10 w-10 relative rounded-full overflow-hidden mr-3">
            <Image
              src={organization.photoURL}
              alt={organization.name}
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="text-white font-medium text-base">{organization.name}</h3>
            <p className="text-gray-300 text-xs">
              {isUserStaff ? 'Staff' : isUserMember ? 'Member' : 'Community'}
            </p>
          </div>
        </div>
        
        {/* Menu Button (for staff) */}
        {isUserStaff && (
          <div className="relative">
            <button 
              className="text-white p-2" 
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Post options"
            >
              <DirectFontAwesome
                icon="ellipsis"
                size={25}
                color="#ffffff"
              />
            </button>
            
            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-gray-800 rounded-md shadow-lg z-10">
                <button 
                  className="flex items-center px-4 py-2 text-sm text-red-500 hover:bg-gray-700 w-full text-left rounded-md"
                  onClick={() => {
                    setShowMenu(false);
                    onDeletePost && onDeletePost();
                  }}
                >
                  <div className="mr-2">
                    <DirectFontAwesome
                      icon="trash-can"
                      size={14}
                      color="#ef4444"
                    />
                  </div>
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Media Content */}
      <div className="relative">
        {/* Members Only Badge */}
        {post.isForMembersOnly && (
          <div className="absolute top-2 left-2 z-10">
            <span className="bg-black bg-opacity-50 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center">
              <span className="mr-1">✨</span> For members
            </span>
          </div>
        )}
        
        {/* Media */}
        <div onClick={onShowDetail}>
          <MediaCarousel 
            mediaItems={getMediaItems()}
            onDoubleTap={handleDoubleTap}
            aspectRatio={1.2}
            onPlayVideo={onShowDetail}
          />
          
          {/* Like Animation */}
          {showLikeAnimation && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-black bg-opacity-30 rounded-full p-5 animate-pulse">
                <div className="text-4xl animate-bounce">❤️</div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Caption */}
      {post.caption && (
        <div className="px-4 py-3">
          <p className="text-white text-sm line-clamp-3">{post.caption}</p>
        </div>
      )}
      
      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-700 flex items-center justify-between">
        <div className="flex items-center text-gray-300 text-sm">
          <span className="mr-2">
            <DirectFontAwesome
              icon="comment"
              size={14}
              color="#9ca3af"
            />
          </span>
          <span className="mr-3">{post.numComments}</span>
          <span className="mr-1">{formattedDate}</span>
        </div>
        
        <div className="flex items-center">
          {/* Like Button */}
          <button 
            className={`flex items-center justify-center w-8 h-8 mr-3 ${isLiked ? 'text-red-500' : 'text-white'}`}
            onClick={onToggleLike}
            aria-label={isLiked ? "Unlike post" : "Like post"}
          >
            {isLiked ? (
              <span className="text-xl">❤️</span>
            ) : (
              <DirectFontAwesome
                icon="heart"
                size={20}
                color="#ffffff"
              />
            )}
          </button>
          
          {/* Boost Button */}
          <button 
            className="flex items-center justify-center w-8 h-8"
            onClick={onToggleBoost}
            aria-label={isBoosted ? "Remove boost" : "Boost post"}
          >
            <DirectFontAwesome
              icon={isBoosted ? "rocket-launch" : "rocket"}
              size={20}
              color={isBoosted ? "#ff9500" : "#ffffff"}
            />
          </button>
        </div>
      </div>
    </div>
  );
} 