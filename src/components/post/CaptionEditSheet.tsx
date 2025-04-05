import React, { useState, useEffect } from 'react';
import { usePostCreation } from '@/lib/context/PostCreationContext';
import { DirectSVG, SVGIconStyle } from '@/lib/components/icons';

const CaptionEditSheet: React.FC = () => {
  const { 
    isCaptionSheetOpen,
    closeCaptionSheet,
    caption: initialCaption, // Get initial caption from context
    setCaption // Action to update caption in context
  } = usePostCreation();

  // Local state for the text editor value
  const [localCaption, setLocalCaption] = useState(initialCaption);
  const [isFocused, setIsFocused] = useState(false);

  // Sync local state if the context caption changes (e.g., on sheet open)
  useEffect(() => {
    if (isCaptionSheetOpen) {
      setLocalCaption(initialCaption);
      // Auto-focus the textarea when the sheet opens
      // Needs a slight delay for the element to be rendered
      setTimeout(() => {
        document.getElementById('caption-textarea')?.focus();
      }, 100);
    }
  }, [isCaptionSheetOpen, initialCaption]);

  const handleConfirm = () => {
    setCaption(localCaption); // Update context state
    closeCaptionSheet(); // Close the sheet
  };

  const handleClose = () => {
    // Reset local state to context state before closing if needed, or just close
    // setLocalCaption(initialCaption);
    closeCaptionSheet();
  }

  if (!isCaptionSheetOpen) {
    return null;
  }

  // Mimicking iOS CaptionEditSheet styles
  return (
    <div 
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black bg-opacity-70 backdrop-blur-sm"
      onClick={handleClose} // Close on background click
    >
      {/* Sheet Content */}
      <div 
        className="bg-[#1D1D1D] w-full rounded-t-xl shadow-xl flex flex-col h-[40%] max-h-[350px]" // Max height like presentation detent
        onClick={(e) => e.stopPropagation()} // Prevent background click propagation
      >
        {/* Top bar */}
        <div className="flex items-center justify-between p-3 border-b border-gray-700 flex-shrink-0">
          <button 
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white"
            aria-label="Close caption editor"
          >
            <DirectSVG icon="xmark" size={20} style={SVGIconStyle.SOLID} primaryColor="currentColor" />
          </button>
          <span className="text-white font-marfa font-medium text-sm">Write your caption</span>
          {/* Invisible placeholder for centering title */}
          <div className="w-8 h-8"></div> 
        </div>

        {/* Text Editor Area */}
        <div className="flex-grow p-4 overflow-y-auto relative">
          <textarea
            id="caption-textarea"
            value={localCaption}
            onChange={(e) => setLocalCaption(e.target.value)}
            placeholder="Write a caption..."
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full h-full bg-transparent text-white font-marfa text-base resize-none focus:outline-none placeholder-gray-500"
            // No explicit maxLength needed based on Swift note
          />
        </div>

        {/* Bottom Bar */}
        <div className="bg-black p-4 flex-shrink-0 relative h-[70px]">
          <p className="text-gray-400 font-marfa text-sm pr-[80px]"> {/* Padding to avoid overlap */} 
            Tell your story in as many words as you would like. Your work is worth it 🫶🏽
          </p>
          {/* Confirm Button (Overlapping) */}
          <button 
            onClick={handleConfirm}
            className="absolute right-5 -top-8 w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white shadow-lg hover:from-blue-500 hover:to-blue-600 transition-all duration-200"
            aria-label="Confirm caption"
          >
             <DirectSVG icon="check" size={28} style={SVGIconStyle.SOLID} primaryColor="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaptionEditSheet; 