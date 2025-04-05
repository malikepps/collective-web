import React, { useRef } from 'react';
import { usePostCreation } from '@/lib/context/PostCreationContext';
import { DirectSVG, SVGIconStyle } from '@/lib/components/icons'; // Assuming icon components are available

const PostCreateOptionsModal: React.FC = () => {
  const { 
    isOptionsModalOpen, 
    closeOptionsModal, 
    openPreviewScreen 
  } = usePostCreation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Styles (Mimicking iOS PostCreateOptionsView) ---
  const buttonBaseStyle = "flex items-center w-full h-14 px-4 bg-black rounded-lg text-left transition-colors duration-150 hover:bg-gray-800";
  const iconStyle = "w-6 h-6 mr-4 text-gray-400";
  const textStyle = "font-marfa font-light text-base text-gray-300";

  // --- Handlers ---
  const handleInstagramImport = () => {
    // Placeholder for Instagram import logic
    console.log("TODO: Implement Instagram Import");
    // closeOptionsModal(); // Optionally close modal after selection
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click(); // Trigger hidden file input
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Convert FileList to Array and pass to context
      // Limit to 10 files as discussed
      const selectedFiles = Array.from(files).slice(0, 10);
      console.log(`[PostCreateOptionsModal] Selected ${selectedFiles.length} files`);
      openPreviewScreen(selectedFiles);
      // No need to close modal here, openPreviewScreen handles it
    }
  };

  const handleStartWriting = () => {
    // Placeholder for Start Writing logic
    console.log("TODO: Implement Start Writing");
    // closeOptionsModal(); // Optionally close modal after selection
  };

  // --- Render ---
  if (!isOptionsModalOpen) {
    return null; // Don't render if not open
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
      onClick={closeOptionsModal} // Close modal when clicking background
    >
      {/* Modal Content - Prevent background click from closing */}
      <div 
        className="bg-[#242426] rounded-xl shadow-xl w-full max-w-sm p-6 space-y-3"
        onClick={(e) => e.stopPropagation()} // Stop propagation to prevent closing
      >
        {/* Title (Optional, mimicking iOS NavBar) */}
        <div className="flex justify-center items-center mb-4 relative">
            <h2 className="text-white font-marfa font-medium text-lg">Create a new post</h2>
            {/* Close button */}
            <button 
                onClick={closeOptionsModal}
                className="absolute right-0 top-0 p-1 text-gray-500 hover:text-white transition-colors"
                aria-label="Close create options"
            >
                <DirectSVG icon="xmark" size={20} style={SVGIconStyle.SOLID} primaryColor="currentColor" />
            </button>
        </div>

        {/* Instagram Button */}
        <button 
          onClick={handleInstagramImport}
          className={buttonBaseStyle}
        >
          {/* Placeholder for Instagram Icon - using square-plus for now */}
          <DirectSVG icon="square-plus" style={SVGIconStyle.SOLID} className={iconStyle} primaryColor="currentColor" /> 
          <span className={textStyle}>Import from Instagram</span>
        </button>

        {/* Upload Button */}
        <button 
          onClick={handleUploadClick}
          className={buttonBaseStyle}
        >
          <DirectSVG icon="photo-film" style={SVGIconStyle.SOLID} className={iconStyle} primaryColor="currentColor" />
          <span className={textStyle}>Upload content</span>
        </button>

        {/* Hidden File Input */}
        <input 
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*" // Accept images and videos
          onChange={handleFileChange}
          className="hidden"
          // Reset input value so selecting the same file again triggers onChange
          onClick={(event) => { (event.target as HTMLInputElement).value = '' }}
        />

        {/* Start Writing Button */}
        <button 
          onClick={handleStartWriting}
          className={buttonBaseStyle}
        >
          <DirectSVG icon="pen" style={SVGIconStyle.SOLID} className={iconStyle} primaryColor="currentColor" />
          <span className={textStyle}>Start writing</span>
        </button>
      </div>
    </div>
  );
};

export default PostCreateOptionsModal; 