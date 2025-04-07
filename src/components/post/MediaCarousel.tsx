import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MediaItem } from '@/lib/models/MediaItem';
import { MediaType } from '@/lib/models/Post';
import { DirectSVG } from '@/lib/components/icons';
import { SVGIconStyle } from '@/lib/components/icons/SVGIcon';
import MediaService from '@/lib/services/MediaService';
import ReactPlayer from 'react-player';

interface MediaCarouselProps {
  mediaItems: MediaItem[];
  onDoubleTap?: () => void;
  aspectRatio?: number;
  onPlayVideo?: () => void;
}

export default function MediaCarousel({
  mediaItems,
  onDoubleTap,
  aspectRatio = 1.33, // Default 4:3 aspect ratio
  onPlayVideo
}: MediaCarouselProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [imageDimensions, setImageDimensions] = useState<{width: number, height: number, naturalWidth: number, naturalHeight: number}[]>([]);
  const playerRef = useRef<ReactPlayer | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);

  // Sort media items by order
  const sortedMediaItems = [...mediaItems].sort((a, b) => a.order - b.order);

  // Initialize image refs array
  useEffect(() => {
    // Create refs for each media item
    imageRefs.current = Array(sortedMediaItems.length).fill(null);
    
    // Log the media items we're working with
    console.log('[MediaCarousel] Media items:', sortedMediaItems);
    console.log('[MediaCarousel] Container aspect ratio:', aspectRatio);
  }, [sortedMediaItems.length, aspectRatio]);
  
  // Set loading to false after a timeout even if images haven't loaded
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      console.log('[MediaCarousel] Forcing loading complete after timeout');
    }, 3000); // 3 second timeout to prevent indefinite loading
    
    return () => clearTimeout(timer);
  }, []);

  // Log container dimensions on mount and resize
  useEffect(() => {
    const logContainerDimensions = () => {
      if (carouselRef.current) {
        const rect = carouselRef.current.getBoundingClientRect();
        console.log('[MediaCarousel] Container dimensions:', {
          width: rect.width,
          height: rect.height,
          aspectRatio: rect.width / rect.height
        });
      }
    };
    
    // Log on mount
    logContainerDimensions();
    
    // Log on resize
    window.addEventListener('resize', logContainerDimensions);
    
    return () => {
      window.removeEventListener('resize', logContainerDimensions);
    };
  }, []);

  // --- Intersection Observer Setup --- 
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        console.log(`[MediaCarousel] Intersection Observer update: ${entry.isIntersecting}`);
        setIsIntersecting(entry.isIntersecting);
      },
      {
        root: null, // Use the viewport as the root
        rootMargin: '0px',
        threshold: 0.5 // Trigger when 50% of the element is visible
      }
    );

    const currentVideoContainer = videoContainerRef.current;
    if (currentVideoContainer) {
      observer.observe(currentVideoContainer);
      console.log('[MediaCarousel] Intersection Observer observing video container.');
    }

    return () => {
      if (currentVideoContainer) {
        observer.unobserve(currentVideoContainer);
        console.log('[MediaCarousel] Intersection Observer stopped observing video container.');
      }
    };
  }, [currentPage]); // Re-run observer setup if the current page changes (if video is on new page)

  // --- Effect to control playback based on intersection and current page --- 
  useEffect(() => {
    // Play only if it's the current page AND it's intersecting
    const shouldPlay = currentPage === sortedMediaItems.findIndex(item => item.type === MediaType.VIDEO) && isIntersecting;
    setIsPlaying(shouldPlay);
    console.log(`[MediaCarousel] Playback state updated: shouldPlay=${shouldPlay}`);
  }, [currentPage, isIntersecting, sortedMediaItems]);

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

  // Create a ref callback function that properly handles the types
  const setImageRef = (index: number) => (element: HTMLImageElement | null) => {
    imageRefs.current[index] = element;
  };

  // Handle image load event
  const handleImageLoad = (index: number) => {
    setIsLoading(false);
    
    // Get and log the image dimensions
    const imageElement = imageRefs.current[index];
    if (imageElement) {
      const newDimensions = {
        width: imageElement.width,
        height: imageElement.height,
        naturalWidth: imageElement.naturalWidth,
        naturalHeight: imageElement.naturalHeight
      };
      
      setImageDimensions(prev => {
        const updated = [...prev];
        updated[index] = newDimensions;
        return updated;
      });
      
      console.log(`[MediaCarousel] Image ${index} loaded:`, {
        src: imageElement.src,
        displayDimensions: {
          width: imageElement.width,
          height: imageElement.height
        },
        naturalDimensions: {
          width: imageElement.naturalWidth, 
          height: imageElement.naturalHeight
        },
        aspectRatio: imageElement.naturalWidth / imageElement.naturalHeight
      });
      
      // Log how the image is being displayed relative to its container
      const containerRect = carouselRef.current?.getBoundingClientRect();
      const imageRect = imageElement.getBoundingClientRect();
      
      if (containerRect) {
        console.log(`[MediaCarousel] Image ${index} display metrics:`, {
          containerWidth: containerRect.width,
          containerHeight: containerRect.height,
          imageDisplayWidth: imageRect.width,
          imageDisplayHeight: imageRect.height,
          widthRatio: imageRect.width / containerRect.width,
          heightRatio: imageRect.height / containerRect.height,
          isImageLargerThanContainer: imageRect.width > containerRect.width || imageRect.height > containerRect.height,
          visiblePercentageHorizontal: Math.min(100, (containerRect.width / imageRect.width) * 100),
          visiblePercentageVertical: Math.min(100, (containerRect.height / imageRect.height) * 100)
        });
      }
    }
  };

  // Handle image error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, index: number) => {
    console.warn(`[MediaCarousel] Image ${index} loading failed`);
    e.currentTarget.src = '/placeholder-image.jpg';
    setIsLoading(false);
  };

  // --- Toggle Mute Function --- 
  const handleToggleMute = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); 
    setIsMuted(prev => !prev);
  }, []);
  // --- End Mute --- 

  return (
    <div 
      className="relative overflow-hidden bg-gray-900"
      style={{ 
        width: '100%',
        paddingBottom: `${(1 / aspectRatio) * 100}%`, // Create a fixed aspect ratio container using padding
        touchAction: 'pan-y' // Prevent vertical scroll interference, may help horizontal swipes
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
        className="flex transition-transform duration-300 ease-out absolute inset-0"
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
              // Video Player Wrapper
              <div 
                ref={index === currentPage ? videoContainerRef : null}
                className="absolute inset-0 bg-black video-player-wrapper" style={{ overflow: 'hidden' }}
              > 
                <ReactPlayer
                  ref={index === currentPage ? playerRef : null} 
                  url={item.url}
                  style={{}}
                  width="100%"
                  height="100%"
                  playing={isPlaying}
                  loop={true} 
                  muted={isMuted}
                  playsinline 
                  controls={false} 
                  onReady={() => index === currentPage && setIsLoading(false)} 
                  onError={() => index === currentPage && setIsLoading(false)}
                  config={{
                    file: {
                      attributes: {
                        controlsList: 'nodownload',
                        disablePictureInPicture: true,
                        playsInline: true, 
                        webkitPlaysInline: true,
                      },
                    },
                  }}
                />

                {/* Mute/Unmute Toggle Button - Updated Icon Logic */}
                <button 
                  className="absolute bottom-4 right-4 z-10 flex items-center justify-center p-1" 
                  onClick={handleToggleMute} 
                  aria-label={isMuted ? "Unmute video" : "Mute video"} 
                >
                  <DirectSVG 
                    icon={isMuted ? "volume-off" : "volume"} // Correctly toggle icon
                    size={24} 
                    style={SVGIconStyle.SOLID} 
                    primaryColor="ffffff" 
                    className="opacity-50" 
                  /> 
                </button>
              </div>
            ) : (
              // Image
              <img
                ref={setImageRef(index)}
                src={item.url}
                alt="Post media"
                className="w-full h-full object-cover bg-black"
                style={{
                  position: 'absolute', 
                  top: '0', 
                  left: '0', 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover' 
                }}
                onLoad={() => handleImageLoad(index)}
                onError={(e) => handleImageError(e, index)}
                loading="eager"
              />
            )}
          </div>
        ))}
      </div>
      
      {/* Pagination indicator - invisible if only one image */}
      {sortedMediaItems.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {sortedMediaItems.map((_, index) => (
            <div 
              key={`dot-${index}`} 
              className={`h-1.5 rounded-full ${index === currentPage ? 'bg-white w-4' : 'bg-white/50 w-1.5'}`}
            />
          ))}
        </div>
      )}
      
      {/* Navigation arrows - only visible on hover and if multiple items */}
      {sortedMediaItems.length > 1 && (
        <>
          {/* Previous arrow */}
          {currentPage > 0 && (
            <button 
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 rounded-full p-1.5 group opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentPage(prev => Math.max(0, prev - 1));
              }}
              aria-label="Previous image"
            >
              <DirectSVG
                icon="chevron-left"
                size={20}
                style={SVGIconStyle.SOLID}
                primaryColor="ffffff"
              />
            </button>
          )}
          
          {/* Next arrow */}
          {currentPage < sortedMediaItems.length - 1 && (
            <button 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 rounded-full p-1.5 group opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentPage(prev => Math.min(sortedMediaItems.length - 1, prev + 1));
              }}
              aria-label="Next image"
            >
              <DirectSVG
                icon="chevron-right"
                size={20}
                style={SVGIconStyle.SOLID}
                primaryColor="ffffff"
              />
            </button>
          )}
        </>
      )}
      
      {/* Debug information - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-0 left-0 bg-black bg-opacity-70 text-white text-xs p-1 z-30">
          {imageDimensions[currentPage] && (
            <div>
              <div>Img: {imageDimensions[currentPage].width}x{imageDimensions[currentPage].height}</div>
              <div>Natural: {imageDimensions[currentPage].naturalWidth}x{imageDimensions[currentPage].naturalHeight}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 