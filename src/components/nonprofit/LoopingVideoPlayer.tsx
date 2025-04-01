import React, { useRef, useEffect, useState } from 'react';

interface LoopingVideoPlayerProps {
  videoURL: string;
  isMuted?: boolean;
  className?: string;
}

const LoopingVideoPlayer: React.FC<LoopingVideoPlayerProps> = ({
  videoURL,
  isMuted = true,
  className = ""
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // Reset states when videoURL changes
    setIsLoading(true);
    setHasError(false);

    // Setup event listeners
    const handleCanPlay = () => {
      setIsLoading(false);
      videoElement.play().catch(error => {
        console.error('Failed to auto-play video:', error);
        setHasError(true);
      });
    };

    const handleError = (error: Event) => {
      console.error('Video error:', error);
      setIsLoading(false);
      setHasError(true);
    };

    // Use the abort controller to clean up listeners
    const controller = new AbortController();
    const signal = controller.signal;

    videoElement.addEventListener('canplay', handleCanPlay, { signal });
    videoElement.addEventListener('error', handleError, { signal });

    // Reset video if URL changes
    videoElement.load();

    // Clean up
    return () => {
      controller.abort();
    };
  }, [videoURL]);

  return (
    <div className="relative w-full h-full">
      {/* Video element */}
      <video
        ref={videoRef}
        className={`w-full h-full object-cover ${className}`}
        playsInline
        loop
        muted={isMuted}
        autoPlay
        preload="auto"
        poster="/video-placeholder.jpg"
      >
        <source src={videoURL} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
          <div className="text-center p-4">
            <p>Unable to play video</p>
            <button 
              className="mt-2 px-4 py-2 bg-gray-700 rounded-lg text-sm"
              onClick={() => {
                setIsLoading(true);
                setHasError(false);
                if (videoRef.current) {
                  videoRef.current.load();
                  videoRef.current.play().catch(() => {
                    setHasError(true);
                    setIsLoading(false);
                  });
                }
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoopingVideoPlayer; 