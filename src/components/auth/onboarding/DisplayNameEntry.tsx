import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DisplayNameEntryProps {
  onSuccess: (displayName: string) => void;
  onBack: () => void;
}

export default function DisplayNameEntry({ onSuccess, onBack }: DisplayNameEntryProps) {
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [glowOpacity, setGlowOpacity] = useState(0.5);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Check if display name is valid (not empty)
  const isValid = displayName.trim().length > 0;
  
  const handleNextStep = () => {
    if (!isValid || isLoading) return;
    
    setIsLoading(true);
    
    // Split the display name into first and last name
    const nameComponents = displayName.trim().split(' ');
    const firstName = nameComponents[0];
    const lastName = nameComponents.length > 1 ? nameComponents.slice(1).join(' ') : '';
    
    // Store names in localStorage (similar to UserDefaults in iOS)
    localStorage.setItem('temp_first_name', firstName);
    localStorage.setItem('temp_last_name', lastName);
    localStorage.setItem('temp_display_name', displayName);
    
    // Note: We're only storing locally - Firebase document creation will happen
    // after all onboarding steps are completed
    
    // Simulate delay for UI transition
    setTimeout(() => {
      setIsLoading(false);
      onSuccess(displayName);
    }, 500);
  };
  
  // Show success message
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    
    // Hide after 2 seconds
    setTimeout(() => {
      setShowSuccess(false);
      setSuccessMessage(null);
    }, 2000);
  };
  
  // Start pulsating animation
  useEffect(() => {
    const interval = setInterval(() => {
      setGlowOpacity((prev) => (prev === 0.5 ? 0.95 : 0.5));
    }, 1500);
    
    return () => clearInterval(interval);
  }, []);
  
  // Focus the input field on component mount
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
      
      // Try to click to ensure mobile keyboard opens
      inputRef.current?.click();
    }, 500);
  }, []);
  
  return (
    <div className="flex flex-col h-screen bg-[#1D1D1D] overflow-hidden max-w-md mx-auto">
      {/* Back button */}
      <div className="pt-12 px-5">
        <button
          onClick={onBack}
          className="text-gray-400 opacity-70 font-marfa font-medium text-base"
        >
          Back
        </button>
      </div>
      
      <div className="flex-1 flex flex-col justify-center pt-0">
        <div className="px-5">
          {/* Title */}
          <motion.h1 
            className="text-white font-marfa font-medium text-3xl text-center mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Looks like you&apos;re new here 👋
          </motion.h1>
          
          {/* Name input area */}
          <motion.div 
            className="relative bg-white bg-opacity-15 rounded-xl h-[58px] mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onClick={() => inputRef.current?.focus()}
          >
            <div className="absolute inset-0 flex items-center">
              {displayName.length === 0 && (
                <div className="absolute left-4 text-white opacity-40 font-marfa text-xl">
                  What&apos;s your full name?
                </div>
              )}
              
              <input
                ref={inputRef}
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full h-full bg-transparent text-white font-marfa text-xl px-4 focus:outline-none"
                autoCapitalize="words"
                autoCorrect="off"
                spellCheck="false"
              />
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Bottom area with explanation and continue button */}
      <motion.div 
        className="bg-black bg-opacity-40 w-full pb-6 relative mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Bottom info text */}
        <div className="p-5 pb-8">
          <div className="w-[70%]">
            <p className="text-white opacity-70 text-sm font-marfa font-light">
              Use whatever name you go by, or would like to 😎
            </p>
          </div>
        </div>
        
        {/* Next button - right aligned and positioned to overlap */}
        <div className="absolute right-5 -top-8">
          <motion.button
            onClick={handleNextStep}
            disabled={!isValid || isLoading}
            className={`w-[70px] h-[70px] rounded-full flex items-center justify-center relative overflow-hidden`}
            whileTap={{ scale: 0.95 }}
          >
            {/* Button glow effect */}
            <motion.div 
              className={`absolute inset-0 rounded-full ${isValid ? 'bg-green-500' : 'bg-[#1F1F1F]'}`}
              animate={{ opacity: isValid ? glowOpacity : 1 }}
              transition={{ duration: 0.5 }}
            />
            
            {/* Arrow icon */}
            {!isLoading ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white absolute z-10" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="animate-spin h-8 w-8 text-white absolute z-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
          </motion.button>
        </div>
      </motion.div>
      
      {/* Success message */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="fixed top-4 left-0 right-0 mx-auto w-4/5 bg-green-500 text-white py-3 px-5 rounded-lg shadow-lg text-center z-50"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
          >
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="fixed top-4 left-0 right-0 mx-auto w-4/5 bg-red-500 text-white py-3 px-5 rounded-lg shadow-lg text-center z-50"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 