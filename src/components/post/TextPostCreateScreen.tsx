import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { usePostCreation } from '@/lib/context/PostCreationContext';
import { useAuth } from '@/lib/context/AuthContext';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { DirectSVG, SVGIconStyle } from '@/lib/components/icons'; // Assuming icon components
import Placeholder from '@tiptap/extension-placeholder'

const TextPostCreateScreen: React.FC = () => {
  const { 
    isTextCreateScreenOpen,
    closeTextCreateScreen,
    organizationId,
    setTextPostDetails,
    setCaption,
    startProcessing,
    stopProcessing,
    setError,
    openTextPreviewScreen,
    isProcessing,
  } = usePostCreation();
  const { user } = useAuth();
  const [title, setTitle] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing...', 
      })
    ],
    content: '',
    // Basic styling for the editor content
    editorProps: {
      attributes: {
        class: 'prose prose-invert focus:outline-none min-h-[200px] p-4 bg-gray-800 rounded-md text-white',
      },
    },
  });

  const handleNext = async () => {
    if (!editor || !organizationId || !user) {
      setError('Missing editor, organization ID, or user information.');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a title.');
      return;
    }

    const htmlContent = editor.getHTML();
    const plainTextContent = editor.getText();

    setCaption(plainTextContent); // Use plain text for initial caption
    setTextPostDetails(title, htmlContent);
    startProcessing();

    try {
      console.log('[TextPostCreateScreen] Calling generateTextPostImage function...');
      const functions = getFunctions();
      const generateTextPostImage = httpsCallable(functions, 'generateTextPostImage');
      
      const result = await generateTextPostImage({ 
          title: title, 
          organizationId: organizationId 
        });

      const data = result.data as { imageUrl: string; backgroundColorHex: string };
      console.log('[TextPostCreateScreen] Cloud function success:', data);

      if (!data.imageUrl) {
        throw new Error('Cloud function did not return an image URL.');
      }

      // TODO: Handle backgroundColorHex - needs adding to context/preview screen
      // console.log('[TextPostCreateScreen] Background Color Hex:', data.backgroundColorHex);
      
      // Pass image URL and background color hex to the preview screen action
      stopProcessing();
      openTextPreviewScreen(data.imageUrl, data.backgroundColorHex || null);

    } catch (error: any) {
      console.error('[TextPostCreateScreen] Error calling cloud function:', error);
      setError(error.message || 'Failed to generate text post image.');
      stopProcessing(); // Stop processing on error
    } 
    // No finally block for stopProcessing, success case navigates away
  };

  if (!isTextCreateScreenOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
      {/* Modal Content */}
      <div className="bg-[#242426] rounded-xl shadow-xl w-full max-w-lg p-6 flex flex-col h-[80vh] relative">
        {/* Loading Overlay */}  
        {isProcessing && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-10 rounded-xl">
            {/* <Spinner size="large" /> */}
            {/* Use a simple CSS spinner */}
            <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-700 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Header (z-index potentially needed if overlay overlaps) */}
        <div className="flex justify-between items-center mb-4 relative z-20">
          <button 
            onClick={closeTextCreateScreen}
            className="p-1 text-gray-500 hover:text-white transition-colors disabled:opacity-50"
            aria-label="Cancel text post"
            disabled={isProcessing} // Disable close button while processing
          >
            <DirectSVG icon="xmark" size={20} style={SVGIconStyle.SOLID} primaryColor="currentColor" />
          </button>
          <h2 className="text-white font-marfa font-medium text-lg">Create Text Post</h2>
          <button 
            onClick={handleNext}
            disabled={!title.trim() || isProcessing}
            className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${!title.trim() || isProcessing ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            {isProcessing ? 'Processing...' : 'Next'}
          </button>
        </div>

        {/* Title Input (z-index potentially needed) */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter title here..."
          maxLength={160} // Add character limit consistent with plan
          className="w-full px-4 py-3 mb-4 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-marfa font-medium text-xl relative z-20" // Style similar to iOS
          disabled={isProcessing} // Disable input while processing
        />

        {/* TipTap Editor (z-index potentially needed) */}
        <div className="flex-grow overflow-y-auto mb-4 bg-gray-900 rounded-lg relative z-20">
          {/* Disable editor interaction while processing */}  
          <div className={`${isProcessing ? 'pointer-events-none opacity-50' : ''}`}>
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Optional: Add Formatting Toolbar here */}
        {/* <div className="flex items-center space-x-2 p-2 bg-gray-800 rounded-md">
          <button onClick={() => editor?.chain().focus().toggleBold().run()} className={editor?.isActive('bold') ? 'is-active' : ''}>B</button>
          </div> */}
      </div>
    </div>
  );
};

export default TextPostCreateScreen; 