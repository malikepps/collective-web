import React, { useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';

interface LoopingVideoPlayerProps {
  videoURL?: string; // Remote video URL
  isMuted?: boolean;
  className?: string;
}

const LoopingVideoPlayer: React.FC<LoopingVideoPlayerProps> = ({
  videoURL,
  isMuted = true,
  className
}) => {
  const playerRef = useRef<ReactPlayer>(null);
  
  // Handle video end to create looping effect
  const handleEnded = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(0);
    }
  };
  
  // If no valid video URL is provided, return empty div with background
  if (!videoURL) {
    return (
      <div 
        className={`bg-black ${className || ''}`}
        style={{ aspectRatio: '16/9' }}
      />
    );
  }
  
  return (
    <div className={`relative overflow-hidden bg-black ${className || ''}`}>
      <ReactPlayer
        ref={playerRef}
        url={videoURL}
        playing={true}
        loop={true}
        muted={isMuted}
        width="100%"
        height="100%"
        onEnded={handleEnded}
        playsinline={true}
        config={{
          file: {
            attributes: {
              style: {
                objectFit: 'cover',
                width: '100%',
                height: '100%',
              },
              playsInline: true,
            },
          },
        }}
      />
    </div>
  );
};

export default LoopingVideoPlayer; 