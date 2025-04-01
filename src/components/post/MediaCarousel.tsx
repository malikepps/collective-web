import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { MediaItem } from '@/lib/models/MediaItem';
import { MediaType } from '@/lib/models/Post';
import { DirectFontAwesome } from '@/lib/components/icons';

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
  const carouselRef = useRef<HTMLDivElement>(null);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [lastTapTime, setLastTapTime] = useState(0);

  // Sort media items by order
  const sortedMediaItems = [...mediaItems].sort((a, b) => a.order - b.order);

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

  return (
    <div 
      className="relative overflow-hidden rounded-lg bg-gray-900"
      style={{ aspectRatio: String(aspectRatio) }}
      ref={carouselRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleTap}
    >
      {/* Media Slider */}
      <div 
        className="flex transition-transform duration-300 ease-out h-full w-full"
        style={{ 
          transform: `translateX(-${currentPage * 100}%)`,
        }}
      >
        {sortedMediaItems.map((item, index) => (
          <div 
            key={item.id} 
            className="min-w-full h-full flex-shrink-0 relative"
          >
            {item.type === MediaType.VIDEO ? (
              // Video Thumbnail with Play Button
              <div className="relative w-full h-full">
                {item.thumbnailUrl ? (
                  <Image
                    src={item.thumbnailUrl}
                    alt="Video thumbnail"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                ) : (
                  <Image
                    src={item.url}
                    alt="Video"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
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
              <Image
                src={item.url}
                alt={`Media item ${index + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority={index === 0}
              />
            )}
          </div>
        ))}
      </div>
      
      {/* Pagination Dots */}
      {sortedMediaItems.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
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