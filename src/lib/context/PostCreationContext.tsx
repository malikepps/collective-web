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
  caption: string;
  isForMembersOnly: boolean;
  isForBroaderEcosystem: boolean;
  isProcessing: boolean;
  uploadProgress: number; // 0 to 1
  error: string | null;
}

// Define the actions available on the context
interface PostCreationActions {
  openOptionsModal: (orgId: string) => void; // Accept organization ID
  closeOptionsModal: () => void;
  openPreviewScreen: (files: File[]) => void;
  closePreviewScreen: () => void;
  openCaptionSheet: () => void;
  closeCaptionSheet: () => void;
  setCaption: (caption: string) => void;
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
  organizationId: null, // Initialize organization ID
  isOptionsModalOpen: false,
  isPreviewScreenOpen: false,
  isCaptionSheetOpen: false,
  selectedFiles: [],
  mediaItems: [],
  caption: '',
  isForMembersOnly: false,
  isForBroaderEcosystem: false,
  isProcessing: false,
  uploadProgress: 0,
  error: null,
};

// Create the provider component
interface PostCreationProviderProps {
  children: ReactNode;
}

export const PostCreationProvider: React.FC<PostCreationProviderProps> = ({ children }) => {
  const [state, setState] = useState<PostCreationState>(initialState);

  const actions: PostCreationActions = {
    openOptionsModal: (orgId) => setState(s => ({ ...s, isOptionsModalOpen: true, organizationId: orgId })), // Store the orgId
    closeOptionsModal: () => setState(s => ({ ...s, isOptionsModalOpen: false })),
    openPreviewScreen: (files) => setState(s => ({ 
      ...s, 
      isPreviewScreenOpen: true, 
      selectedFiles: files, 
      isOptionsModalOpen: false, // Close options modal when preview opens
    })),
    closePreviewScreen: () => setState(s => ({ ...s, isPreviewScreenOpen: false, selectedFiles: [] })), // Clear files on close
    openCaptionSheet: () => setState(s => ({ ...s, isCaptionSheetOpen: true })),
    closeCaptionSheet: () => setState(s => ({ ...s, isCaptionSheetOpen: false })),
    setCaption: (caption) => setState(s => ({ ...s, caption })),
    toggleMembersOnly: () => setState(s => ({ ...s, isForMembersOnly: !s.isForMembersOnly, isForBroaderEcosystem: s.isForMembersOnly ? false : s.isForBroaderEcosystem })),
    toggleBroaderEcosystem: () => setState(s => ({ ...s, isForBroaderEcosystem: !s.isForBroaderEcosystem, isForMembersOnly: s.isForBroaderEcosystem ? false : s.isForMembersOnly })),
    startProcessing: () => setState(s => ({ ...s, isProcessing: true, error: null, uploadProgress: 0 })),
    stopProcessing: () => setState(s => ({ ...s, isProcessing: false })),
    setUploadProgress: (progress) => setState(s => ({ ...s, uploadProgress: progress })),
    setMediaItems: (items) => setState(s => ({ ...s, mediaItems: items })),
    setError: (error) => setState(s => ({ ...s, error, isProcessing: false })),
    resetState: () => setState({ ...initialState }), 
  };

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