import React, { useState, useRef, useEffect } from 'react';
import { Post, MediaType } from '@/lib/models/Post';
import { Organization } from '@/lib/models/Organization';
import MediaCarousel from './MediaCarousel';
import { DirectFontAwesome } from '@/lib/components/icons';
import { format } from 'date-fns';
import { useTheme } from '@/lib/context/ThemeContext';

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
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const captionRef = useRef<HTMLParagraphElement>(null);
  const { getTheme } = useTheme();
  
  // Format post date - changed to match the screenshot format
  const formattedDate = format(post.createdDate, 'MMMM d, yyyy');
  
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
  
  // Check if caption needs "Show More" button when component mounts or window resizes
  useEffect(() => {
    const checkHeight = () => {
      if (captionRef.current && post.caption) {
        // If the scroll height is greater than the client height, we need to show the expansion button
        const needsToExpand = captionRef.current.scrollHeight > captionRef.current.clientHeight;
        setNeedsExpansion(needsToExpand);
      }
    };

    checkHeight();
    
    // Add resize listener
    window.addEventListener('resize', checkHeight);
    
    return () => {
      window.removeEventListener('resize', checkHeight);
    };
  }, [post.caption]);
  
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
    
    // For Firebase JSON data format
    if (post.image_url) {
      return [
        {
          id: '0',
          url: post.image_url,
          type: MediaType.IMAGE,
          order: 0,
          thumbnailUrl: null,
          thumbnailColor: null
        }
      ];
    }
    
    if (post.image_url_original) {
      return [
        {
          id: '0',
          url: post.image_url_original,
          type: MediaType.IMAGE,
          order: 0,
          thumbnailUrl: null,
          thumbnailColor: null
        }
      ];
    }
    
    return [];
  };
  
  // Function to darken a hex color by a percentage
  const darkenColor = (hexColor: string, amount: number = 0.5): string => {
    // Ensure the hex color is in the correct format
    const hex = hexColor.startsWith('#') ? hexColor.slice(1) : hexColor;
    
    // Convert to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Darken each RGB component
    const darkR = Math.floor(r * (1 - amount));
    const darkG = Math.floor(g * (1 - amount));
    const darkB = Math.floor(b * (1 - amount));
    
    // Convert back to hex
    return `#${darkR.toString(16).padStart(2, '0')}${darkG.toString(16).padStart(2, '0')}${darkB.toString(16).padStart(2, '0')}`;
  };
  
  // Generate solid background color from theme
  const generateBackgroundColor = () => {
    // Consider post's background_color_hex first
    if (post.background_color_hex) {
      const color = post.background_color_hex.startsWith('#') ? 
        post.background_color_hex : `#${post.background_color_hex}`;
      return darkenColor(color, 0.5);
    }
    
    // Next try post.backgroundColorHex
    if (post.backgroundColorHex) {
      const color = post.backgroundColorHex.startsWith('#') ? 
        post.backgroundColorHex : `#${post.backgroundColorHex}`;
      return darkenColor(color, 0.5);
    }
    
    // Finally fall back to organization's theme
    const theme = organization.themeId ? getTheme(organization.themeId) : undefined;
    
    // Get primary color from theme or fallback
    const themeColor = theme?.primaryColor ? 
      (theme.primaryColor.startsWith('#') ? theme.primaryColor : `#${theme.primaryColor}`) : 
      '#525252';
    
    // Darken the color by 50%
    return darkenColor(themeColor, 0.5);
  };

  return (
    <div 
      className="bg-card rounded-xl overflow-hidden shadow-lg mb-4"
      style={{ backgroundColor: generateBackgroundColor() }}
    >
      {/* Media Content - No rounded corners at bottom */}
      <div className="relative rounded-t-xl overflow-hidden">
        {/* Staff Menu Button - now positioned on top of media */}
        {isUserStaff && (
          <div className="absolute top-2 right-2 z-20">
            <button 
              className="bg-black bg-opacity-50 text-white p-2 rounded-full" 
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
      
      {/* Date moved above caption */}
      <div className="px-4 pt-3 text-gray-300 text-sm">
        {formattedDate}
      </div>
      
      {/* Caption with fade effect - similar to MembershipTierCard */}
      {post.caption && (
        <div className="px-4 py-2 relative">
          <p 
            ref={captionRef}
            className="text-white text-base overflow-hidden max-h-24"
            style={{
              maskImage: needsExpansion ? 'linear-gradient(to bottom, black 70%, transparent 100%)' : 'none',
              WebkitMaskImage: needsExpansion ? 'linear-gradient(to bottom, black 70%, transparent 100%)' : 'none'
            }}
          >
            {post.caption}
          </p>
          
          {/* Show more button */}
          {needsExpansion && (
            <div className="w-full text-center mt-1">
              <button 
                onClick={onShowDetail}
                className="text-white bg-black bg-opacity-40 rounded-full px-4 py-1 text-sm font-medium"
              >
                Show more
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Actions - removed border-t */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center text-gray-300 text-sm">
          <span className="mr-2">
            <DirectFontAwesome
              icon="comment"
              size={14}
              color="#9ca3af"
            />
          </span>
          <span className="mr-3">{post.numComments}</span>
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