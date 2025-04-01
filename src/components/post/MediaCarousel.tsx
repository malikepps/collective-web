import React, { useState, useRef, useEffect } from 'react';
import { MediaItem } from '@/lib/models/MediaItem';
import { MediaType } from '@/lib/models/Post';
import { DirectFontAwesome } from '@/lib/components/icons';
import MediaService from '@/lib/services/MediaService';

interface MediaCarouselProps {
  mediaItems: MediaItem[];
  onDoubleTap?: () => void;
  aspectRatio?: number;
  showPlayButton?: boolean;
  onPlayVideo?: () => void;
}

export default function MediaCarousel({
  mediaItems,
  onDoubleTap,
  aspectRatio = 1.33, // Default 4:3 aspect ratio
  showPlayButton = true,
  onPlayVideo
}: MediaCarouselProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [lastTapTime, setLastTapTime] = useState(0);

  // Sort media items by order
  const sortedMediaItems = [...mediaItems].sort((a, b) => a.order - b.order);

  // Set loading to false after a timeout even if images haven't loaded
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // 3 second timeout to prevent indefinite loading
    
    return () => clearTimeout(timer);
  }, []);

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe && currentPage < sortedMediaItems.length - 1) {
      setCurrentPage(prev => prev + 1);
    }
    
    if (isRightSwipe && currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Handle tap and double-tap
  const handleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300; // milliseconds
    
    if (now - lastTapTime < DOUBLE_TAP_DELAY) {
      // Double tap detected
      if (onDoubleTap) {
        onDoubleTap();
      }
      // Clear the single tap timeout
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;
      }
    } else {
      // Single tap detected - wait to see if it becomes a double tap
      tapTimeoutRef.current = setTimeout(() => {
        // Handle single tap actions here if needed
        tapTimeoutRef.current = null;
      }, DOUBLE_TAP_DELAY);
    }
    
    setLastTapTime(now);
  };

  // Clean up tap timeout on unmount
  useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
    };
  }, []);

  // Handle image load event
  const handleImageLoad = () => {
    setIsLoading(false);
  };

  // Handle image error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.warn(`[MediaCarousel] Image loading failed`);
    e.currentTarget.src = '/placeholder-image.jpg';
    setIsLoading(false);
  };

  return (
    <div 
      className="relative overflow-hidden bg-gray-900"
      style={{ 
        aspectRatio: String(aspectRatio), 
        width: '100%' 
      }}
      ref={carouselRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleTap}
    >
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-10">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Media Slider */}
      <div 
        className="flex transition-transform duration-300 ease-out h-full w-full"
        style={{ 
          transform: `translateX(-${currentPage * 100}%)`,
        }}
      >
        {sortedMediaItems.map((item, index) => (
          <div 
            key={item.id || `item-${index}`} 
            className="min-w-full h-full flex-shrink-0 relative"
          >
            {item.type === MediaType.VIDEO ? (
              // Video Thumbnail with Play Button
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                {(item.thumbnailUrl || item.url) && (
                  <img
                    src={item.thumbnailUrl || item.url}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                    style={{ objectPosition: 'center', maxHeight: '100%', maxWidth: '100%' }}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    loading="eager"
                  />
                )}
                
                {showPlayButton && (
                  <button 
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayVideo && onPlayVideo();
                    }}
                  >
                    <div className="bg-white rounded-full p-2 shadow-lg">
                      <DirectFontAwesome
                        icon="circle-play"
                        size={50}
                        color="#000000"
                      />
                    </div>
                  </button>
                )}
              </div>
            ) : (
              // Image
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                <img
                  src={item.url}
                  alt={`Media item ${index + 1}`}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: 'center', maxHeight: '100%', maxWidth: '100%' }}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  loading="eager"
                />
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Pagination Dots */}
      {sortedMediaItems.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
          {sortedMediaItems.map((_, index) => (
            <button
              key={index}
              className={`w-1.5 h-1.5 rounded-full ${
                index === currentPage 
                  ? 'bg-white' 
                  : 'bg-white bg-opacity-50'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentPage(index);
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
      
      {/* Members Only Badge */}
      {/* This will be added in the PostCard component */}
    </div>
  );
} 