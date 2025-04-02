import React, { useState, useRef, useEffect } from 'react';
import { Post, MediaType } from '@/lib/models/Post';
import { Organization } from '@/lib/models/Organization';
import { DirectSVG } from '@/lib/components/icons';
import { SVGIconStyle } from '@/lib/components/icons/SVGIcon';
import { format } from 'date-fns';
import ReactPlayer from 'react-player/lazy';

interface PostDetailProps {
  post: Post;
  organization: Organization;
  isUserMember: boolean;
  isUserStaff: boolean;
  isLiked: boolean;
  isBoosted: boolean;
  onToggleLike: () => void;
  onToggleBoost: () => void;
  onClose: () => void;
  onDeletePost?: () => void;
}

export default function PostDetail({
  post,
  organization,
  isUserMember,
  isUserStaff,
  isLiked,
  isBoosted,
  onToggleLike,
  onToggleBoost,
  onClose,
  onDeletePost
}: PostDetailProps) {
  const [currentMedia, setCurrentMedia] = useState(0);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const playerRef = useRef<ReactPlayer>(null);
  
  // Prevent scrolling on the page behind
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    // Add class to body to prevent scrolling
    document.body.style.overflow = 'hidden';
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Set loading to false after a timeout to prevent indefinite loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  // Format post date
  const formattedDate = format(post.createdDate, 'MMM dd, yyyy');
  
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
  
  // Image handlers
  const handleImageLoad = () => {
    setIsLoading(false);
  };
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.warn('[PostDetail] Image loading failed');
    e.currentTarget.src = '/placeholder-image.jpg';
    setIsLoading(false);
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
          id: post.id + '_video',
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
          id: post.id + '_image',
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
  
  const mediaItems = getMediaItems().sort((a, b) => a.order - b.order);
  const currentItem = mediaItems[currentMedia];
  
  // Calculate background gradient
  const generateGradient = () => {
    const color = post.backgroundColorHex || '525252';
    return `linear-gradient(to bottom, #${color}, #111)`;
  };
  
  // Confirm delete handler
  const handleConfirmDelete = () => {
    setShowConfirmDelete(false);
    onDeletePost && onDeletePost();
    onClose();
  };
  
  // Share handler
  const handleShare = async () => {
    try {
      // If Web Share API is available
      if (navigator.share) {
        await navigator.share({
          title: `Post from ${organization.name}`,
          text: post.caption,
          url: window.location.href
        });
      } else {
        // Fallback to copying link to clipboard
        await navigator.clipboard.writeText(window.location.href);
        // Show success message (would be implemented with a toast)
        alert('Link copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-800">
        <button 
          className="text-white p-2" 
          onClick={onClose}
          aria-label="Close"
        >
          <DirectSVG
            icon="xmark"
            size={24}
            color="#ffffff"
          />
        </button>
        
        <div className="flex items-center">
          <div className="h-8 w-8 relative rounded-full overflow-hidden mr-3 flex items-center justify-center bg-gray-900">
            <img
              src={organization.photoURL || '/placeholder-avatar.jpg'}
              alt={organization.name}
              className="w-full h-full object-cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="eager"
            />
          </div>
          <div>
            <h3 className="text-white font-medium text-sm">{organization.name}</h3>
          </div>
        </div>
        
        {isUserStaff && (
          <button 
            className="text-red-500 p-2" 
            onClick={() => setShowConfirmDelete(true)}
            aria-label="Delete post"
          >
            <DirectSVG
              icon="trash-can"
              size={20}
              color="#ef4444"
            />
          </button>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-grow overflow-y-auto" style={{ background: generateGradient() }}>
        {/* Media */}
        {currentItem && (
          <div className="relative w-full" style={{ aspectRatio: '1', maxHeight: '70vh' }}>
            {/* Loading state */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-10">
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            {/* Members Only Badge */}
            {post.isForMembersOnly && (
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-black bg-opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center">
                  <span className="mr-1">✨</span> For members
                </span>
              </div>
            )}
            
            {/* Media Content */}
            <div className="h-full w-full relative" onDoubleClick={handleDoubleTap}>
              {currentItem?.type === MediaType.VIDEO ? (
                // Video Player
                <div className="h-full w-full flex items-center justify-center bg-black">
                  <ReactPlayer
                    ref={playerRef}
                    url={currentItem.url}
                    width="100%"
                    height="100%"
                    controls
                    playing
                    playsinline
                    onReady={() => setIsLoading(false)}
                    onError={() => setIsLoading(false)}
                    config={{
                      file: {
                        attributes: {
                          controlsList: 'nodownload',
                          disablePictureInPicture: true,
                          playsInline: true,
                          webkitPlaysInline: true,
                        },
                        forceVideo: true,
                      },
                    }}
                  />
                </div>
              ) : (
                // Image
                <div className="h-full w-full flex items-center justify-center bg-black">
                  <img
                    src={currentItem.url}
                    alt="Post image"
                    className="max-w-full max-h-full object-contain"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    loading="eager"
                  />
                </div>
              )}
              
              {/* Like Animation */}
              {showLikeAnimation && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-black bg-opacity-30 rounded-full p-6 animate-pulse">
                    <div className="text-5xl animate-bounce">❤️</div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Media Navigation */}
            {mediaItems.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-20">
                {mediaItems.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentMedia 
                        ? 'bg-white' 
                        : 'bg-white bg-opacity-50'
                    }`}
                    onClick={() => setCurrentMedia(index)}
                    aria-label={`Go to media ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Caption and Actions */}
        <div className="p-4">
          {/* Caption */}
          {post.caption && (
            <p className="text-white text-base mb-4">{post.caption}</p>
          )}
          
          {/* Date */}
          <p className="text-gray-400 text-sm mb-6">{formattedDate}</p>
          
          {/* Actions */}
          <div className="flex items-center justify-between border-t border-gray-800 pt-4">
            <div className="flex items-center">
              {/* Like Button */}
              <button 
                className={`flex items-center justify-center mr-6 ${isLiked ? 'text-red-500' : 'text-white'}`}
                onClick={onToggleLike}
                aria-label={isLiked ? "Unlike post" : "Like post"}
              >
                {isLiked ? (
                  <span className="text-xl mr-2">❤️</span>
                ) : (
                  <div className="mr-2">
                    <DirectSVG
                      icon="heart"
                      size={20}
                      color="rgba(255, 255, 255, 0.8)"
                    />
                  </div>
                )}
                <span className="text-sm">
                  {post.numLikes} {post.numLikes === 1 ? 'like' : 'likes'}
                </span>
              </button>
              
              {/* Comment Button */}
              <button 
                className="flex items-center justify-center mr-6 text-white"
                aria-label="Comments"
              >
                <div className="mr-2">
                  <DirectSVG
                    icon="comment"
                    size={20}
                    color="#ffffff"
                  />
                </div>
                <span className="text-sm">
                  {post.numComments} {post.numComments === 1 ? 'comment' : 'comments'}
                </span>
              </button>
            </div>
            
            <div className="flex items-center">
              {/* Boost Button */}
              <button 
                className="flex items-center justify-center mr-4"
                onClick={onToggleBoost}
                aria-label={isBoosted ? "Remove boost" : "Boost post"}
              >
                <DirectSVG
                  icon={isBoosted ? "rocket-launch" : "rocket"}
                  size={20}
                  color={isBoosted ? "#ff9500" : "rgba(255, 255, 255, 0.8)"}
                  style={SVGIconStyle.REGULAR}
                />
              </button>
              
              {/* Share Button */}
              <button 
                className="flex items-center justify-center"
                onClick={handleShare}
                aria-label="Share post"
              >
                <DirectSVG
                  icon="share"
                  size={20}
                  color="#ffffff"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-white text-lg font-semibold mb-3">Delete Post</h3>
            <p className="text-gray-300 mb-5">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 bg-gray-700 rounded-lg text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 rounded-lg text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 