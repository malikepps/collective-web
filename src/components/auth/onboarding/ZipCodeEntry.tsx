import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ZipCodeEntryProps {
  onSuccess: (zipData: ZipCodeData) => void;
  onBack: () => void;
}

interface ZipCodeData {
  zipCode: string;
  city: string;
  state: string;
  location: string;
  latitude?: number;
  longitude?: number;
}

export default function ZipCodeEntry({ onSuccess, onBack }: ZipCodeEntryProps) {
  const [zipCode, setZipCode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [glowOpacity, setGlowOpacity] = useState(0.5);
  const [validationLoading, setValidationLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 5);
    setZipCode(value);
    setIsValid(false);
    
    // Auto-validate when 5 digits are entered
    if (value.length === 5) {
      validateZipCode(value);
    } else {
      setCity('');
      setState('');
    }
  };
  
  const validateZipCode = async (zip: string) => {
    setValidationLoading(true);
    setErrorMessage('');
    
    try {
      // In a real implementation, you would use a service to validate
      // For now, we'll mock the validation with some hardcoded values
      // This would be replaced with an actual API call or database check
      const zipCodes: Record<string, { city: string; state: string; latitude?: number; longitude?: number }> = {
        '27513': { city: 'Cary', state: 'NC', latitude: 35.828, longitude: -78.798 },
        '27560': { city: 'Morrisville', state: 'NC', latitude: 35.823, longitude: -78.825 },
        '27601': { city: 'Raleigh', state: 'NC', latitude: 35.780, longitude: -78.639 },
        '27605': { city: 'Raleigh', state: 'NC', latitude: 35.792, longitude: -78.663 },
        '27701': { city: 'Durham', state: 'NC', latitude: 35.997, longitude: -78.902 },
        '27703': { city: 'Durham', state: 'NC', latitude: 35.971, longitude: -78.838 },
        '27705': { city: 'Durham', state: 'NC', latitude: 36.009, longitude: -78.937 },
        '27707': { city: 'Durham', state: 'NC', latitude: 35.967, longitude: -78.963 },
        '10001': { city: 'New York', state: 'NY', latitude: 40.750, longitude: -73.997 },
      };
      
      setTimeout(() => {
        if (zip in zipCodes) {
          const data = zipCodes[zip];
          setCity(data.city);
          setState(data.state);
          setLatitude(data.latitude);
          setLongitude(data.longitude);
          setIsValid(true);
        } else {
          setCity('');
          setState('');
          setLatitude(undefined);
          setLongitude(undefined);
          setErrorMessage('Invalid ZIP code. Please try again.');
          setIsValid(false);
        }
        setValidationLoading(false);
      }, 300); // Simulate network delay
      
    } catch (error) {
      console.error('Error validating ZIP code:', error);
      setCity('');
      setState('');
      setErrorMessage('Invalid ZIP code. Please try again.');
      setIsValid(false);
      setValidationLoading(false);
    }
  };
  
  const handleContinue = () => {
    if (!isValidZipData() || isLoading) return;
    
    setIsLoading(true);
    
    // Create ZIP code data object
    const zipData: ZipCodeData = {
      zipCode,
      city,
      state,
      location: `${city}, ${state}`,
      latitude,
      longitude
    };
    
    // Store user location in localStorage
    localStorage.setItem('temp_zip_code', zipCode);
    localStorage.setItem('temp_city', city);
    localStorage.setItem('temp_state', state);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
      onSuccess(zipData);
    }, 500);
  };
  
  // Check if we have valid zip data to continue
  const isValidZipData = () => {
    return zipCode.length === 5 && city.length > 0 && state.length > 0;
  };
  
  // Start pulsating animation
  useEffect(() => {
    const interval = setInterval(() => {
      setGlowOpacity((prev) => (prev === 0.5 ? 0.95 : 0.5));
    }, 1500);
    
    return () => clearInterval(interval);
  }, []);
  
  // Disable scrolling
  useEffect(() => {
    // Save original styles
    const originalStyle = window.getComputedStyle(document.body).overflow;
    
    // Disable scrolling
    document.body.style.overflow = 'hidden';
    
    // Re-enable scrolling when component unmounts
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);
  
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
      
      <div className="flex-1 flex flex-col justify-center px-5">
        {/* Title */}
        <h1 className="text-white font-marfa font-medium text-4xl mb-10">
          Where is home for you?
        </h1>
        
        {/* ZIP code input */}
        <div className="mb-3">
          <div className="relative bg-white bg-opacity-15 rounded-xl h-[58px] w-full flex items-center px-4">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={5}
              value={zipCode}
              onChange={handleZipCodeChange}
              placeholder="Enter your ZIP code"
              className="w-full bg-transparent border-none text-white font-marfa text-xl focus:outline-none placeholder:text-white placeholder:opacity-40"
            />
          </div>
          
          {/* Validation indicators */}
          <div className="mt-2 min-h-[24px]">
            {validationLoading && (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                <span className="text-white opacity-60 text-sm">Validating...</span>
              </div>
            )}
            
            {errorMessage && (
              <p className="text-red-500 text-sm">{errorMessage}</p>
            )}
            
            {isValid && city && state && (
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-500 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-white text-sm font-marfa">
                  {city}, {state}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Next button */}
        <div className="mt-10 flex justify-end">
          <motion.button
            onClick={handleContinue}
            disabled={!isValidZipData() || isLoading}
            className={`w-[70px] h-[70px] rounded-full flex items-center justify-center relative overflow-hidden`}
            whileTap={{ scale: 0.95 }}
          >
            {/* Button glow effect */}
            <motion.div 
              className={`absolute inset-0 rounded-full ${isValidZipData() ? 'bg-green-500' : 'bg-[#1F1F1F]'}`}
              animate={{ opacity: isValidZipData() ? glowOpacity : 1 }}
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
      </div>
    </div>
  );
} 