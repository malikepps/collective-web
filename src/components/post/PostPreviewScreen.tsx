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
import { useRouter } from 'next/router'; // Import useRouter
// We might need a carousel library later, for now basic implementation

const PostPreviewScreen: React.FC = () => {
  const {
    isPreviewScreenOpen,
    closePreviewScreen,
    selectedFiles,
    caption, // For text posts, this is the plain text content
    isForMembersOnly,
    toggleMembersOnly,
    isForBroaderEcosystem,
    toggleBroaderEcosystem,
    startProcessing,
    stopProcessing,
    setUploadProgress,
    setError,
    resetState,
    isProcessing,
    openCaptionSheet,
    organizationId,
    // --- Text Post Context Fields ---
    isTextPost,
    generatedImageUrl,
    text_post_title,
    text_content_html,
    backgroundColorHex,
    // -------------------------------
  } = usePostCreation();
  const { user } = useAuth();
  const router = useRouter();

  const [previews, setPreviews] = useState<string[]>([]);
  const [mediaTypes, setMediaTypes] = useState<('image' | 'video')[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Generate previews only if it's NOT a text post
  useEffect(() => {
    if (!isTextPost && selectedFiles.length > 0) {
      const newPreviews: string[] = [];
      const newMediaTypes: ('image' | 'video')[] = [];
      selectedFiles.forEach(file => {
        newPreviews.push(URL.createObjectURL(file));
        newMediaTypes.push(file.type.startsWith('video') ? 'video' : 'image');
      });
      setPreviews(newPreviews);
      setMediaTypes(newMediaTypes);
      setCurrentSlide(0);

      return () => {
        newPreviews.forEach(url => URL.revokeObjectURL(url));
      };
    } else {
      // Clear previews if it becomes a text post or files are cleared
      setPreviews([]);
      setMediaTypes([]);
    }
  }, [selectedFiles, isTextPost]); // Add isTextPost dependency

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
            // Get the standard Firebase download URL which includes the token
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log(`DEBUG: Using standard Firebase download URL: ${downloadURL}`);
            resolve({ url: downloadURL, fullPath: path, type: mediaType });
          } catch (error) {
            console.error(`Error getting download URL for ${path}:`, error);
            reject(error);
          }
        }
      );
    });
  };

  // Placeholder for thumbnail generation
  const generateThumbnail = async (file: File): Promise<{ thumbnailUrl: string | null, thumbnailColor: string | null }> => {
    console.log("Skipping thumbnail generation for now.");
    return { thumbnailUrl: null, thumbnailColor: null };
  };

  // --- handlePublish Updated for Text Posts ---
  const handlePublish = async () => {
    if (!user || !organizationId) {
      setError("User not authenticated or organization not selected.");
      return;
    }

    startProcessing();

    try {
      let postData: any; // Use 'any' temporarily, define a proper Post type later

      // --- Text Post Logic ---
      if (isTextPost) {
        if (!generatedImageUrl || !text_post_title || !text_content_html) {
          setError("Missing text post details (image URL, title, or content).");
          stopProcessing();
          return;
        }

        const mediaItemForTextPost: MediaItem = {
          id: uuidv4(), // Generate a new ID for the media item
          url: generatedImageUrl,
          type: MediaType.IMAGE, // Text post's visual representation is an image
          order: 0,
          thumbnailUrl: null, // No separate thumbnail for generated image
          thumbnailColor: backgroundColorHex || null,
        };

        postData = {
          caption: caption, // Plain text content
          created_time: Timestamp.now(),
          media: [{
            id: mediaItemForTextPost.id,
            order: mediaItemForTextPost.order,
            thumbnail_color: mediaItemForTextPost.thumbnailColor,
            media_type: 'image',
            image_url: mediaItemForTextPost.url,
          }],
          media_type: MediaType.IMAGE.toLowerCase(), // Overall post type is image
          nonprofit: doc(db, 'nonprofits', organizationId),
          num_comments: 0,
          num_likes: 0,
          user_id: user.uid,
          username: user.displayName || "Anonymous",
          background_color_hex: backgroundColorHex || null,
          is_for_members_only: isForMembersOnly,
          is_for_broader_ecosystem: isForBroaderEcosystem,
          video: false, // Text posts are not videos
          // --- Text Post Specific Fields ---
          is_text_post: true,
          text_post_title: text_post_title,
          text_content: text_content_html, // Store the rich HTML content
        };

      } else { 
        // --- Existing Media Post Logic ---
        if (selectedFiles.length === 0) {
          setError("No media selected.");
          stopProcessing(); // Stop processing if no files
          return;
        }

        let overallProgress = 0;
        setUploadProgress(0);

        const uploadPromises = selectedFiles.map(file => uploadMediaFile(file, user.uid));
        const uploadedMediaResults = await Promise.all(uploadPromises.map(async (p, index) => {
            const result = await p;
            overallProgress = (index + 1) / selectedFiles.length;
            setUploadProgress(overallProgress);
            return result;
        }));

        const thumbnailPromises = selectedFiles.map((file, index) =>
            uploadedMediaResults[index].type === MediaType.VIDEO ? generateThumbnail(file) : Promise.resolve({ thumbnailUrl: null, thumbnailColor: null })
        );
        const thumbnailResults = await Promise.all(thumbnailPromises);

        const mediaItemsForFirestore: MediaItem[] = uploadedMediaResults.map((uploadResult, index) => ({
          id: uploadResult.fullPath.split('/').pop()?.split('.')[0] || uuidv4(),
          url: uploadResult.url,
          type: uploadResult.type,
          order: index,
          thumbnailUrl: thumbnailResults[index].thumbnailUrl,
          thumbnailColor: thumbnailResults[index].thumbnailColor,
        }));

        let postMediaType: MediaType | undefined;
        const hasVideo = mediaItemsForFirestore.some(item => item.type === MediaType.VIDEO);
        if (mediaItemsForFirestore.length > 1) {
          postMediaType = MediaType.CAROUSEL_ALBUM;
        } else if (hasVideo) {
          postMediaType = MediaType.VIDEO;
        } else if (mediaItemsForFirestore.length === 1) {
          postMediaType = MediaType.IMAGE;
        }

        const calculatedBackgroundColorHex = thumbnailResults[0]?.thumbnailColor || null;

        postData = {
          caption: caption, // User-provided caption for media
          created_time: Timestamp.now(),
          media: mediaItemsForFirestore.map(item => ({
            id: item.id,
            order: item.order,
            thumbnail_color: item.thumbnailColor,
            ...(item.type === MediaType.VIDEO
              ? { media_type: 'video', video_url: item.url, image_url: item.thumbnailUrl }
              : { media_type: 'image', image_url: item.url })
          })),
          media_type: postMediaType?.toLowerCase(),
          nonprofit: doc(db, 'nonprofits', organizationId),
          num_comments: 0,
          num_likes: 0,
          user_id: user.uid,
          username: user.displayName || "Anonymous",
          background_color_hex: calculatedBackgroundColorHex,
          is_for_members_only: isForMembersOnly,
          is_for_broader_ecosystem: isForBroaderEcosystem,
          video: hasVideo,
          // --- Ensure text post fields are false/null for media posts ---
          is_text_post: false,
          text_post_title: null,
          text_content: null,
        };
      }

      // --- Common Firestore Save Logic ---
      console.log("Creating post with data:", postData);
      await addDoc(collection(db, 'posts'), postData);

      console.log("Post created successfully!");
      resetState();
      closePreviewScreen();
      router.replace(router.asPath);

    } catch (error: any) {
      console.error("Error publishing post:", error);
      setError(`Failed to publish post: ${error.message || 'Unknown error'}`);
    } finally {
      stopProcessing();
    }
  };

  if (!isPreviewScreenOpen) {
    return null;
  }
  
  // Determine if publish button should be disabled
  const isPublishDisabled = isProcessing || 
                            (isTextPost && !generatedImageUrl) || 
                            (!isTextPost && selectedFiles.length === 0);

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
          disabled={isPublishDisabled} // Use calculated disabled state
        >
          {isProcessing ? 'Publishing...' : 'Publish'}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow overflow-y-auto">
        {/* Media Preview Section (Conditional Rendering) */}
        <div className="relative w-full aspect-[4/5] bg-black mb-4">
          <div className="w-full h-full flex items-center justify-center overflow-hidden">
            {isTextPost ? (
              // --- Text Post Image Display ---
              generatedImageUrl ? (
                <img
                  src={generatedImageUrl}
                  alt={text_post_title || "Generated Text Post Image"}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                // Optional: Placeholder while image loads or if error
                <div className="text-gray-500">Generating image...</div>
              )
            ) : (
              // --- Existing Media Carousel Display ---
              previews.length > 0 ? (
                mediaTypes[currentSlide] === 'video' ? (
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
                )
              ) : (
                 // Optional: Placeholder if no media selected (for non-text posts)
                 <div className="text-gray-500">No media selected</div>
              )
            )}
          </div>

          {/* Carousel Controls (Only show for non-text posts with multiple items) */}
          {!isTextPost && previews.length > 1 && (
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

        {/* Caption Section (remains the same, displays context.caption) */}
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

        {/* Audience Settings (remains the same) */}
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