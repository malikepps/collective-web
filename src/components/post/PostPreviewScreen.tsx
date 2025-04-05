import React, { useState, useEffect, useRef } from 'react';
import { usePostCreation } from '@/lib/context/PostCreationContext';
import { DirectSVG, SVGIconStyle } from '@/lib/components/icons';
// Firebase Imports
import { db, storage, auth } from '@/lib/firebase';
import { collection, addDoc, Timestamp, doc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, getMetadata } from 'firebase/storage';
import { useAuth } from '@/lib/context/AuthContext'; // Import useAuth
import { v4 as uuidv4 } from 'uuid'; // For unique IDs
import { MediaItem } from '@/lib/models/MediaItem';
import { MediaType } from '@/lib/models/Post';
// We might need a carousel library later, for now basic implementation

// Helper function to create direct GCS URL (similar to Swift logic)
const getDirectGcsUrl = (fullPath: string): string => {
  const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET; // Ensure this env var is set
  if (!bucket) {
    console.warn('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET env var not set. Cannot create direct GCS URL.');
    return '';
  }
  // Remove leading slash if present
  const cleanPath = fullPath.startsWith('/') ? fullPath.substring(1) : fullPath;
  return `https://storage.googleapis.com/${bucket}/${cleanPath}`;
};

const PostPreviewScreen: React.FC = () => {
  const { 
    isPreviewScreenOpen, 
    closePreviewScreen, 
    selectedFiles, 
    caption,
    isForMembersOnly,
    toggleMembersOnly,
    isForBroaderEcosystem,
    toggleBroaderEcosystem,
    startProcessing, 
    stopProcessing, // Added stopProcessing
    setUploadProgress, // Added setUploadProgress
    setError, // Added setError
    resetState, // Added resetState
    isProcessing,    
    openCaptionSheet, 
    organizationId // Get organizationId from context
  } = usePostCreation();
  const { currentUser } = useAuth(); // Get current user

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

  // --- Upload Logic ---
  const uploadMediaFile = async (file: File, userId: string): Promise<{ url: string, fullPath: string, type: MediaType }> => {
    const uniqueID = uuidv4();
    const fileExtension = file.name.split('.').pop() || 'file';
    const path = `users/${userId}/post_media/${uniqueID}.${fileExtension}`;
    const storageRef = ref(storage, path);
    const contentType = file.type;
    const mediaType = contentType.startsWith('video') ? MediaType.VIDEO : MediaType.IMAGE;

    console.log(`DEBUG: Uploading ${mediaType} to path: ${path}`);

    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file, { contentType });

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes); // Progress is 0 to 1
          console.log(`Upload progress for ${path}: ${progress * 100}%`);
          // We'll update the overall progress outside this function
        },
        (error) => {
          console.error(`Error uploading file ${path}:`, error);
          reject(error);
        },
        async () => {
          try {
             // Try to get metadata to verify upload
            await getMetadata(storageRef);
            console.log(`DEBUG: Upload successful and verified for ${path}`);

            // Attempt to get direct GCS URL
            const directUrl = getDirectGcsUrl(path);
            if (directUrl) {
                // Basic verification (HEAD request might be better but adds complexity)
                console.log(`DEBUG: Using direct GCS URL: ${directUrl}`);
                 resolve({ url: directUrl, fullPath: path, type: mediaType });
                 return;
            }

            // Fallback to standard download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log(`DEBUG: Using standard Firebase download URL: ${downloadURL}`);
            resolve({ url: downloadURL, fullPath: path, type: mediaType });
          } catch (error) {
            console.error(`Error verifying or getting URL for ${path}:`, error);
            // Fallback attempt if direct URL fails or verification has issues
             try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                console.log(`DEBUG: Using standard Firebase download URL (fallback): ${downloadURL}`);
                resolve({ url: downloadURL, fullPath: path, type: mediaType });
             } catch (finalError) {
                 console.error(`Final error getting download URL for ${path}:`, finalError);
                 reject(finalError);
             }
          }
        }
      );
    });
  };

  // Placeholder for thumbnail generation
  const generateThumbnail = async (file: File): Promise<{ thumbnailUrl: string | null, thumbnailColor: string | null }> => {
    console.log("Skipping thumbnail generation for now.");
    // TODO: Implement actual thumbnail generation (e.g., using canvas or backend)
    return { thumbnailUrl: null, thumbnailColor: null }; // Placeholder
  };

  const handlePublish = async () => {
    if (!currentUser || !organizationId) {
      setError("User not authenticated or organization not selected.");
      return;
    }
    if (selectedFiles.length === 0) {
      setError("No media selected.");
      return;
    }

    startProcessing();
    let overallProgress = 0;
    setUploadProgress(0);

    try {
      const uploadPromises = selectedFiles.map(file => uploadMediaFile(file, currentUser.uid));
      // We might need a more granular progress update based on individual file progresses
      // For now, just update based on completion count
      const uploadedMediaResults = await Promise.all(uploadPromises.map(async (p, index) => {
          const result = await p;
          overallProgress = (index + 1) / selectedFiles.length;
          setUploadProgress(overallProgress);
          return result;
      }));

      // Generate thumbnails (currently placeholders)
      const thumbnailPromises = selectedFiles.map((file, index) => 
          uploadedMediaResults[index].type === MediaType.VIDEO ? generateThumbnail(file) : Promise.resolve({ thumbnailUrl: null, thumbnailColor: null })
      );
      const thumbnailResults = await Promise.all(thumbnailPromises);

      // Construct MediaItem array for Firestore
      const mediaItemsForFirestore: MediaItem[] = uploadedMediaResults.map((uploadResult, index) => ({
        id: uploadResult.fullPath.split('/').pop()?.split('.')[0] || uuidv4(), // Extract UUID or generate new
        url: uploadResult.url,
        type: uploadResult.type,
        order: index,
        thumbnailUrl: thumbnailResults[index].thumbnailUrl,
        thumbnailColor: thumbnailResults[index].thumbnailColor,
      }));

      // Determine overall post type
      let postMediaType: MediaType | undefined;
      const hasVideo = mediaItemsForFirestore.some(item => item.type === MediaType.VIDEO);
      if (mediaItemsForFirestore.length > 1) {
        postMediaType = MediaType.CAROUSEL_ALBUM; // Use CAROUSEL_ALBUM for multiple items
      } else if (hasVideo) {
        postMediaType = MediaType.VIDEO;
      } else if (mediaItemsForFirestore.length === 1) {
        postMediaType = MediaType.IMAGE;
      }

      // Determine background color (placeholder)
      const backgroundColorHex = thumbnailResults[0]?.thumbnailColor || null; // Use first item's color or null
      
      // Prepare Firestore document data
      const postData = {
        caption: caption,
        created_time: Timestamp.now(),
        media: mediaItemsForFirestore.map(item => ({
          id: item.id,
          order: item.order,
          thumbnail_color: item.thumbnailColor,
          // Conditionally add fields based on type (Firestore structure)
          ...(item.type === MediaType.VIDEO 
            ? { media_type: 'video', video_url: item.url, image_url: item.thumbnailUrl } 
            : { media_type: 'image', image_url: item.url })
        })),
        media_type: postMediaType?.toLowerCase(), // Ensure lowercase for consistency if needed
        nonprofit: doc(db, 'nonprofits', organizationId), // Reference
        num_comments: 0,
        num_likes: 0,
        user_id: currentUser.uid,
        username: currentUser.displayName || "Anonymous",
        // community: doc(db, 'communities', organization.communityRef), // Omit for now
        background_color_hex: backgroundColorHex,
        is_for_members_only: isForMembersOnly,
        is_for_broader_ecosystem: isForBroaderEcosystem,
        video: hasVideo, // Set video flag based on content
      };

      console.log("Creating post with data:", postData);
      await addDoc(collection(db, 'posts'), postData);

      console.log("Post created successfully!");
      resetState(); // Reset context state
      closePreviewScreen(); // Close the preview screen

    } catch (error: any) {
      console.error("Error publishing post:", error);
      setError(`Failed to publish post: ${error.message || 'Unknown error'}`);
    } finally {
      stopProcessing(); // Ensure processing stops even if there's an error
    }
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