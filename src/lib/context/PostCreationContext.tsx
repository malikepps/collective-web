import React, { createContext, useState, useContext, ReactNode } from 'react';
import { MediaItem } from '../models/MediaItem'; // Assuming MediaItem is defined
import { Organization } from '../models/Organization'; // Import Organization type

// Define the shape of the context state
interface PostCreationState {
  organizationId: string | null; // Add organization ID
  isOptionsModalOpen: boolean;
  isPreviewScreenOpen: boolean;
  isCaptionSheetOpen: boolean;
  selectedFiles: File[];
  mediaItems: MediaItem[]; // Store final MediaItems after upload
  caption: string; // For media posts: user caption. For text posts: plain text content.
  isForMembersOnly: boolean;
  isForBroaderEcosystem: boolean;
  isProcessing: boolean;
  uploadProgress: number; // 0 to 1
  error: string | null;
  
  // Text Post Specific State
  isTextPost: boolean; // Flag to indicate text post flow
  text_post_title: string; // Title entered by user for text post image
  text_content_html: string; // Raw HTML content from rich text editor
  generatedImageUrl: string | null; // URL of the generated title image
  isTextCreateScreenOpen: boolean; // Add state for text create screen
  backgroundColorHex: string | null; // Add state for background color
}

// Define the actions available on the context
interface PostCreationActions {
  openOptionsModal: (orgId: string) => void; // Accept organization ID
  closeOptionsModal: () => void;
  openPreviewScreen: (files: File[]) => void; // For media uploads
  openTextPreviewScreen: (imageUrl: string, bgColorHex: string | null) => void; // For text post preview
  closePreviewScreen: () => void;
  openCaptionSheet: () => void;
  closeCaptionSheet: () => void;
  openTextCreateScreen: () => void; // Add action to open text create screen
  closeTextCreateScreen: () => void; // Add action to close text create screen
  setCaption: (caption: string) => void; // Sets plain text caption/content
  setTextPostDetails: (title: string, htmlContent: string) => void; // Sets text post specific fields
  toggleMembersOnly: () => void;
  toggleBroaderEcosystem: () => void;
  startProcessing: () => void;
  stopProcessing: () => void;
  setUploadProgress: (progress: number) => void;
  setMediaItems: (items: MediaItem[]) => void;
  setError: (error: string | null) => void;
  resetState: () => void;
}

// Combine state and actions
interface PostCreationContextType extends PostCreationState, PostCreationActions {}

// Create the context with a default undefined value
const PostCreationContext = createContext<PostCreationContextType | undefined>(undefined);

// Define the initial state
const initialState: PostCreationState = {
  organizationId: null,
  isOptionsModalOpen: false,
  isPreviewScreenOpen: false,
  isCaptionSheetOpen: false,
  selectedFiles: [],
  mediaItems: [],
  caption: '', // Will hold plain text content for text posts
  isForMembersOnly: false,
  isForBroaderEcosystem: false,
  isProcessing: false,
  uploadProgress: 0,
  error: null,
  // Text post defaults
  isTextPost: false,
  text_post_title: '',
  text_content_html: '',
  generatedImageUrl: null,
  isTextCreateScreenOpen: false, // Initialize new state
  backgroundColorHex: null, // Initialize background color
};

// Create the provider component
interface PostCreationProviderProps {
  children: ReactNode;
}

export const PostCreationProvider: React.FC<PostCreationProviderProps> = ({ children }) => {
  const [state, setState] = useState<PostCreationState>(initialState);

  const actions: PostCreationActions = {
    openOptionsModal: (orgId) => setState(s => ({ ...initialState, isOptionsModalOpen: true, organizationId: orgId })), // Reset most state but keep orgId
    closeOptionsModal: () => setState(s => ({ ...s, isOptionsModalOpen: false })),
    // For standard media uploads
    openPreviewScreen: (files) => setState(s => ({ 
      ...s, 
      isTextPost: false, // Ensure text post flag is off
      isPreviewScreenOpen: true, 
      selectedFiles: files, 
      isOptionsModalOpen: false, // Close options modal
      generatedImageUrl: null, // Clear generated image URL
      text_post_title: '', // Clear text post title
      text_content_html: '', // Clear text content HTML
    })),
    // For text post preview (after image generation)
    openTextPreviewScreen: (imageUrl, bgColorHex) => setState(s => ({ 
      ...s, 
      isTextPost: true, // Set text post flag
      isPreviewScreenOpen: true, 
      selectedFiles: [], // Clear any selected files
      isOptionsModalOpen: false, // Close options modal
      generatedImageUrl: imageUrl, // Store the generated image URL
      backgroundColorHex: bgColorHex, // Store the background color hex
    })),
    closePreviewScreen: () => setState(s => ({ 
        ...s, 
        isPreviewScreenOpen: false, 
        // Keep other state like caption/title/content until full reset
    })),
    openCaptionSheet: () => setState(s => ({ ...s, isCaptionSheetOpen: true })),
    closeCaptionSheet: () => setState(s => ({ ...s, isCaptionSheetOpen: false })),
    // Action to open the text create screen
    openTextCreateScreen: () => setState(s => ({ 
      ...s, 
      isTextCreateScreenOpen: true, 
      isOptionsModalOpen: false // Close options modal when opening text create
    })), 
    // Action to close the text create screen
    closeTextCreateScreen: () => setState(s => ({ 
      ...s, 
      isTextCreateScreenOpen: false 
    })), 
    setCaption: (caption) => setState(s => ({ ...s, caption })), // Sets plain text
    setTextPostDetails: (title, htmlContent) => setState(s => ({ 
        ...s, 
        text_post_title: title,
        text_content_html: htmlContent
    })),
    toggleMembersOnly: () => setState(s => ({ ...s, isForMembersOnly: !s.isForMembersOnly, isForBroaderEcosystem: s.isForMembersOnly ? false : s.isForBroaderEcosystem })), 
    toggleBroaderEcosystem: () => setState(s => ({ ...s, isForBroaderEcosystem: !s.isForBroaderEcosystem, isForMembersOnly: s.isForBroaderEcosystem ? false : s.isForMembersOnly })), 
    startProcessing: () => setState(s => ({ ...s, isProcessing: true, error: null, uploadProgress: 0 })),
    stopProcessing: () => setState(s => ({ ...s, isProcessing: false })),
    setUploadProgress: (progress) => setState(s => ({ ...s, uploadProgress: progress })),
    setMediaItems: (items) => setState(s => ({ ...s, mediaItems: items })),
    setError: (error) => setState(s => ({ ...s, error, isProcessing: false })),
    // ResetState now fully resets everything including text post specific fields
    resetState: () => setState(initialState), // Keep orgId if needed? Or reset fully? Let's reset fully for now.
    // resetState: () => setState(initialState), // Alternative: Full reset including orgId
  };

  // Revised resetState logic based on comment above
  actions.resetState = () => setState(initialState);

  return (
    <PostCreationContext.Provider value={{ ...state, ...actions }}>
      {children}
    </PostCreationContext.Provider>
  );
};

// Create a custom hook for easy context usage
export const usePostCreation = (): PostCreationContextType => {
  const context = useContext(PostCreationContext);
  if (context === undefined) {
    throw new Error('usePostCreation must be used within a PostCreationProvider');
  }
  return context;
}; 