import React, { useState, useEffect, useRef } from 'react';
import { usePostCreation } from '@/lib/context/PostCreationContext';
import { DirectSVG, SVGIconStyle } from '@/lib/components/icons';
// We might need a carousel library later, for now basic implementation

const PostPreviewScreen: React.FC = () => {
  const { 
    isPreviewScreenOpen, 
    closePreviewScreen, 
    selectedFiles, 
    caption,
    setCaption,
    isForMembersOnly,
    toggleMembersOnly,
    isForBroaderEcosystem,
    toggleBroaderEcosystem,
    startProcessing, // We'll call this later on publish
    isProcessing,    // To disable publish button during processing
    openCaptionSheet // To open the caption editor
  } = usePostCreation();

  const [previews, setPreviews] = useState<string[]>([]);
  const [mediaTypes, setMediaTypes] = useState<('image' | 'video')[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Generate previews when files change
  useEffect(() => {
    if (selectedFiles.length > 0) {
      const newPreviews: string[] = [];
      const newMediaTypes: ('image' | 'video')[] = [];
      selectedFiles.forEach(file => {
        newPreviews.push(URL.createObjectURL(file));
        newMediaTypes.push(file.type.startsWith('video') ? 'video' : 'image');
      });
      setPreviews(newPreviews);
      setMediaTypes(newMediaTypes);
      setCurrentSlide(0); // Reset to first slide

      // Cleanup object URLs on unmount or when files change again
      return () => {
        newPreviews.forEach(url => URL.revokeObjectURL(url));
      };
    }
  }, [selectedFiles]);

  const handleNextSlide = () => {
    setCurrentSlide(prev => Math.min(prev + 1, previews.length - 1));
  };

  const handlePrevSlide = () => {
    setCurrentSlide(prev => Math.max(0, prev - 1));
  };

  const handlePublish = () => {
    console.log("TODO: Implement Publish Logic");
    // startProcessing(); 
    // Call upload function here...
  };

  if (!isPreviewScreenOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[#242426] text-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <button 
          onClick={closePreviewScreen}
          className="font-marfa text-base text-white hover:text-gray-300"
          disabled={isProcessing}
        >
          Cancel
        </button>
        <span className="font-marfa font-semibold text-lg">Post preview</span>
        <button 
          onClick={handlePublish}
          className="font-marfa font-semibold text-sm text-white bg-blue-600 px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isProcessing || previews.length === 0}
        >
          {isProcessing ? 'Publishing...' : 'Publish'}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow overflow-y-auto">
        {/* Media Preview Carousel */}
        {previews.length > 0 && (
          <div className="relative w-full aspect-[4/5] bg-black mb-4"> {/* Approx 4:5 aspect ratio */} 
            {/* Media Display */}
            <div className="w-full h-full flex items-center justify-center overflow-hidden">
              {mediaTypes[currentSlide] === 'video' ? (
                <video 
                  src={previews[currentSlide]}
                  controls
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <img 
                  src={previews[currentSlide]} 
                  alt={`Preview ${currentSlide + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>

            {/* Carousel Controls */}
            {previews.length > 1 && (
              <>
                {currentSlide > 0 && (
                  <button 
                    onClick={handlePrevSlide} 
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 rounded-full p-2 text-white hover:bg-black/60"
                    aria-label="Previous slide"
                  >
                    <DirectSVG icon="chevron-left" size={20} style={SVGIconStyle.SOLID} primaryColor="currentColor"/>
                  </button>
                )}
                {currentSlide < previews.length - 1 && (
                  <button 
                    onClick={handleNextSlide} 
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 rounded-full p-2 text-white hover:bg-black/60"
                    aria-label="Next slide"
                  >
                    <DirectSVG icon="chevron-right" size={20} style={SVGIconStyle.SOLID} primaryColor="currentColor"/>
                  </button>
                )}
                {/* Dots Indicator */}
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                  {previews.map((_, index) => (
                    <div 
                      key={`dot-${index}`} 
                      className={`h-1.5 rounded-full ${index === currentSlide ? 'bg-white w-4' : 'bg-white/50 w-1.5'} transition-all duration-200`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Caption Section */}
        <div className="px-4 mb-4">
          <label htmlFor="caption-input" className="block font-marfa font-medium text-sm text-gray-400 mb-1">
            Caption
          </label>
          <div 
            onClick={openCaptionSheet} // Open sheet on click
            className="w-full min-h-[60px] p-3 bg-gray-800 rounded-lg cursor-pointer text-white font-marfa text-sm leading-relaxed"
          >
            {caption || <span className="text-gray-500">Write a caption...</span>}
          </div>
        </div>

        {/* Audience Settings */}
        <div className="px-4 mb-6 space-y-3">
           <label className="block font-marfa font-medium text-sm text-gray-400 mb-1">
            Post Visibility
          </label>
          {/* Members Only Toggle */}
          <label htmlFor="membersOnlyToggle" className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
            <span className="font-marfa text-sm text-white">Only visible to members</span>
            <input 
              type="checkbox" 
              id="membersOnlyToggle" 
              checked={isForMembersOnly}
              onChange={toggleMembersOnly}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>

          {/* Broader Ecosystem Toggle */}
           <label htmlFor="broaderEcosystemToggle" className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
            <span className="font-marfa text-sm text-white">Share to broader ecosystem</span>
            <input 
              type="checkbox" 
              id="broaderEcosystemToggle" 
              checked={isForBroaderEcosystem}
              onChange={toggleBroaderEcosystem}
              className="sr-only peer"
            />
             <div className="relative w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

      </div> 
    </div>
  );
};

export default PostPreviewScreen; 