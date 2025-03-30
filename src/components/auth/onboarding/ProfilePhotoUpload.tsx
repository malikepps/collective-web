import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Cropper from 'react-easy-crop';

// Define types for cropping
interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ProfilePhotoUploadProps {
  onSuccess: (imageFile: File | null) => void;
  onBack: () => void;
}

export default function ProfilePhotoUpload({ onSuccess, onBack }: ProfilePhotoUploadProps) {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [rawImage, setRawImage] = useState<string | null>(null);
  
  // Get the first name from localStorage (not the full display name)
  const firstName = localStorage.getItem('temp_first_name') || '';
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check if file is an image
      if (!file.type.match('image.*')) {
        return;
      }
      
      // Create a URL for the image
      const imageUrl = URL.createObjectURL(file);
      setRawImage(imageUrl);
      setShowCropper(true);
    }
  };
  
  const handleSkip = () => {
    // Clear any stored profile image
    localStorage.removeItem('temp_profile_image');
    onSuccess(null);
  };
  
  const handleContinue = () => {
    onSuccess(imageFile);
  };
  
  // Clear stored image on mount to ensure fresh start each time
  useEffect(() => {
    // Clear any previously stored image
    localStorage.removeItem('temp_profile_image');
    setProfileImage(null);
    setImageFile(null);
  }, []);
  
  // This function is called when the user is done cropping
  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);
  
  // Generate the cropped image
  const createCroppedImage = async () => {
    console.log("Starting cropping process");
    
    if (!rawImage || !croppedAreaPixels) {
      console.error("Missing rawImage or croppedAreaPixels");
      return;
    }
    
    try {
      setIsLoading(true);
      console.log("Loading started, creating image");
      
      // Create an image element
      const image = document.createElement('img');
      image.src = rawImage;
      
      // Wait for image to load
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('Failed to load image'));
        
        // If image is already loaded, resolve immediately
        if (image.complete) resolve();
      });
      
      console.log("Image loaded, creating canvas");
      
      // Create a canvas with the desired dimensions
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.error("Failed to get canvas context");
        setIsLoading(false);
        return;
      }
      
      // Set canvas dimensions to the cropped area
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      
      console.log("Drawing image on canvas", {
        cropX: croppedAreaPixels.x,
        cropY: croppedAreaPixels.y,
        cropWidth: croppedAreaPixels.width,
        cropHeight: croppedAreaPixels.height
      });
      
      // Draw the image on the canvas
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );
      
      console.log("Converting canvas to blob");
      
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((file) => {
          if (file) {
            resolve(file);
          } else {
            reject(new Error('Canvas toBlob failed'));
          }
        }, 'image/jpeg', 0.95);
      });
      
      console.log("Creating file from blob");
      
      // Create a File from the blob
      const croppedFile = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
      
      // Update state with the cropped image
      const croppedImageUrl = URL.createObjectURL(croppedFile);
      setProfileImage(croppedImageUrl);
      setImageFile(croppedFile);
      
      console.log("Storing image in localStorage");
      
      // Store image data in localStorage
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          localStorage.setItem('temp_profile_image', reader.result as string);
          console.log("Image stored successfully");
        }
      };
      reader.readAsDataURL(croppedFile);
      
      // Hide the cropper
      setShowCropper(false);
      console.log("Process completed successfully");
    } catch (error) {
      console.error('Error creating cropped image:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const cancelCrop = () => {
    setShowCropper(false);
    setRawImage(null);
  };
  
  return (
    <div className="bg-[#1D1D1D] h-screen flex flex-col max-w-md mx-auto overflow-hidden">
      {/* Back button */}
      <div className="pt-12 px-5">
        <button
          onClick={onBack}
          className="text-gray-400 opacity-70 font-marfa font-medium text-base"
        >
          Back
        </button>
      </div>
      
      {/* Title - Reduced space between header and content */}
      <h1 className="text-white font-marfa font-medium text-3xl text-center mt-4">
        Add a profile photo
      </h1>
      
      <p className="text-white opacity-70 font-marfa text-base text-center mt-1">
        You can update this later in your profile
      </p>
      
      {/* Profile photo section - centered in available space */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {showCropper ? (
          // Cropper overlay
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center">
            <div className="w-full text-center mb-4">
              <h2 className="text-white text-xl font-marfa font-medium">Adjust your photo</h2>
              <p className="text-white opacity-70 text-sm font-marfa">Move and zoom to position your photo</p>
            </div>
            
            <div className="relative w-full h-[300px] mb-6">
              {rawImage && (
                <Cropper
                  image={rawImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              )}
            </div>
            
            {/* Zoom slider */}
            <div className="w-4/5 mb-8">
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
            
            {/* Action buttons */}
            <div className="flex space-x-4">
              <button
                onClick={cancelCrop}
                className="px-6 py-3 rounded-full bg-white bg-opacity-10 text-white font-marfa"
              >
                Cancel
              </button>
              <button
                onClick={createCroppedImage}
                className="px-6 py-3 rounded-full bg-blue-500 text-white font-marfa flex items-center space-x-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>Done</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          // Normal profile photo display
          <div className="relative">
            {/* Photo circle */}
            <div className="w-[150px] h-[150px] rounded-full bg-gray-500 bg-opacity-30 flex items-center justify-center overflow-hidden">
              {/* Always show placeholder unless profile image exists */}
              {profileImage ? (
                <Image 
                  src={profileImage} 
                  alt="Profile" 
                  width={150} 
                  height={150} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-400 opacity-50" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            
            {/* Edit button - positioned to overlap with the photo */}
            <label className="absolute bottom-2 right-2 w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <input 
                type="file" 
                accept="image/*"
                className="hidden" 
                onChange={handleFileChange}
              />
            </label>
          </div>
        )}
        
        {/* First name display */}
        {!showCropper && (
          <>
            <p className="text-white font-marfa font-medium text-2xl mt-3">
              {firstName}
            </p>
            
            {/* Skip button with updated text - smaller font */}
            <button
              onClick={handleSkip}
              className="mt-3 px-10 py-3 bg-white bg-opacity-15 rounded-full"
            >
              <span className="text-white opacity-70 font-marfa font-medium text-base">
                I'll do this later
              </span>
            </button>
          </>
        )}
      </div>
      
      {/* Continue button - positioned higher */}
      {!showCropper && (
        <div className="flex justify-end px-5 mb-24">
          <motion.button
            onClick={handleContinue}
            className="w-[70px] h-[70px] rounded-full flex items-center justify-center relative overflow-hidden"
            whileTap={{ scale: 0.95 }}
          >
            <div className="absolute inset-0 rounded-full bg-green-500"></div>
            {isLoading ? (
              <svg className="animate-spin h-8 w-8 text-white absolute z-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white relative z-10" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </motion.button>
        </div>
      )}
    </div>
  );
} 