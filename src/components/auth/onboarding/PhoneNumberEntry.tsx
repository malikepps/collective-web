import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useRouter } from 'next/router';
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';

interface PhoneNumberEntryProps {
  onSuccess: (verificationId: string, phoneNumber: string) => void;
}

// Country code data
interface CountryCode {
  code: string;
  flag: string;
  name: string;
}

const countryCodes: CountryCode[] = [
  { code: '+1', flag: '🇺🇸', name: 'United States' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+1', flag: '🇨🇦', name: 'Canada' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+81', flag: '🇯🇵', name: 'Japan' },
];

export default function PhoneNumberEntry({ onSuccess }: PhoneNumberEntryProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [glowOpacity, setGlowOpacity] = useState(0.5);
  const [checkboxChecked, setCheckboxChecked] = useState(true);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const [cooldownSeconds, setCooldownSeconds] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [keyboardFocused, setKeyboardFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const { verifyPhoneNumber } = useAuth();
  
  // Format phone number for display as (xxx) xxx-xxxx
  const formatPhoneNumberForDisplay = (text: string) => {
    const digits = text.replace(/\D/g, '');
    
    if (digits.length === 0) {
      return '';
    }
    
    let formatted = '(';
    
    // Area code
    if (digits.length > 0) {
      const areaCodeEndIndex = Math.min(digits.length, 3);
      formatted += digits.substring(0, areaCodeEndIndex);
    }
    
    // Close parenthesis after area code
    if (digits.length > 3) {
      formatted += ') ';
      
      // First three digits after area code
      const endIndex = Math.min(digits.length, 6);
      if (endIndex > 3) {
        formatted += digits.substring(3, endIndex);
      }
    }
    
    // Add hyphen and last four digits
    if (digits.length > 6) {
      formatted += '-';
      formatted += digits.substring(6);
    }
    
    return formatted;
  };
  
  // Handle phone number input changes
  const handlePhoneNumberChange = (value: string) => {
    // Filter to only allow numbers
    const filtered = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    if (filtered.length > 10) {
      setPhoneNumber(filtered.substring(0, 10));
    } else {
      setPhoneNumber(filtered);
    }
    
    // Format for display
    setFormattedPhoneNumber(formatPhoneNumberForDisplay(filtered));
  };
  
  // Check if phone number is valid (10 digits)
  const isPhoneNumberValid = phoneNumber.length === 10;
  
  // Calculate progress width based on phone number length
  const getProgressWidth = () => {
    const progress = Math.min(phoneNumber.length / 10, 1);
    return `${progress * 100}%`;
  };
  
  // Ensure recaptcha container is visible
  useEffect(() => {
    // Make sure recaptcha container is visible but not disturbing the layout
    const recaptchaContainer = document.getElementById('recaptcha-container');
    if (recaptchaContainer) {
      recaptchaContainer.style.position = 'fixed';
      recaptchaContainer.style.bottom = '0';
      recaptchaContainer.style.right = '0';
      recaptchaContainer.style.zIndex = '1000';
      recaptchaContainer.style.opacity = '0.01'; // Nearly invisible but functional
    }
  }, []);
  
  // Check for existing cooldown
  useEffect(() => {
    const lastAttemptTime = localStorage.getItem('last_phone_verification_attempt');
    if (lastAttemptTime) {
      const cooldownPeriod = 60000; // 1 minute
      const updateTimer = () => {
        const timeElapsed = Date.now() - Number(lastAttemptTime);
        const remainingTime = cooldownPeriod - timeElapsed;
        
        if (remainingTime > 0) {
          setCooldownSeconds(Math.ceil(remainingTime / 1000));
        } else {
          setCooldownSeconds(null);
          clearInterval(interval);
        }
      };
      
      // Check immediately
      updateTimer();
      
      // Then set up interval
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, []);
  
  // Handle verification error properly
  const sendVerificationCode = async () => {
    if (!isPhoneNumberValid || isLoading || cooldownSeconds !== null) return;
    
    // Clear previous error
    setError(null);
    setIsLoading(true);
    
    try {
      // Format phone number for API use
      const formattedNumber = `${selectedCountry.code}${phoneNumber}`;
      
      console.log('Sending verification to:', formattedNumber);
      
      // DIRECT FIREBASE AUTHENTICATION - Skip all middleware and context layers
      try {
        // Check if user already exists in Firestore
        const usersCollectionRef = collection(db, 'users');
        const q = query(usersCollectionRef, where('phone_number', '==', formattedNumber));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          // User exists, get their information
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          console.log('Found existing user:', userData);
          
          // Save user data to localStorage for persistence
          localStorage.setItem('existing_user_data', JSON.stringify({
            firstName: userData.first_name || '',
            displayName: userData.display_name || '',
            isOnboarded: true, // Always treat existing users as onboarded
            uid: userDoc.id
          }));
          
          localStorage.setItem('auth_user', JSON.stringify({
            uid: userDoc.id,
            displayName: userData.display_name || '',
            phoneNumber: formattedNumber,
            isOnboarded: true,
            photoURL: userData.profile_image_url || null,
            firstName: userData.first_name || '',
            lastName: userData.last_name || '',
          }));
          
          // DIRECT AUTHENTICATION WITH FIREBASE
          const auth = getAuth();
          
          // Clean up any existing reCAPTCHA verifiers
          try {
            const recaptchaElements = document.querySelectorAll('.grecaptcha-badge, iframe[title*="recaptcha"]');
            recaptchaElements.forEach(element => {
              element.remove();
            });
          } catch (e) {
            console.error('Error cleaning up reCAPTCHA:', e);
          }
          
          // Setup reCAPTCHA verifier
          const recaptchaContainer = document.getElementById('recaptcha-container');
          if (!recaptchaContainer) {
            throw new Error('Recaptcha container not found');
          }
          
          const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
          });
          
          // Send verification code directly with Firebase
          const confirmationResult = await signInWithPhoneNumber(auth, formattedNumber, verifier);
          
          // Show success for existing users
          showSuccessMessage('Verification code sent');
          
          // Pass verification ID directly to parent
          onSuccess(confirmationResult.verificationId, formattedNumber);
          return;
        } else {
          // New user flow
          const auth = getAuth();
          
          // Clean up any existing reCAPTCHA verifiers
          try {
            const recaptchaElements = document.querySelectorAll('.grecaptcha-badge, iframe[title*="recaptcha"]');
            recaptchaElements.forEach(element => {
              element.remove();
            });
          } catch (e) {
            console.error('Error cleaning up reCAPTCHA:', e);
          }
          
          // Setup reCAPTCHA verifier
          const recaptchaContainer = document.getElementById('recaptcha-container');
          if (!recaptchaContainer) {
            throw new Error('Recaptcha container not found');
          }
          
          const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
          });
          
          // Send verification code directly with Firebase
          const confirmationResult = await signInWithPhoneNumber(auth, formattedNumber, verifier);
          
          // Pass verification ID to parent
          showSuccessMessage('Verification code sent');
          onSuccess(confirmationResult.verificationId, formattedNumber);
        }
      } catch (err) {
        console.error('Firebase authentication error:', err);
        throw err;
      }
    } catch (err) {
      console.error('Verification error:', err);
      
      // Display appropriate error message
      if (err instanceof Error) {
        let errorMessage = err.message;
        
        // Handle specific Firebase errors with more user-friendly messages
        if (errorMessage.includes('operation-not-allowed') || 
            errorMessage.includes('region enabled')) {
          errorMessage = 'SMS verification is not available in your region. Please try again later.';
        } else if (errorMessage.includes('too-many-requests')) {
          errorMessage = 'Too many verification attempts. For security reasons, please try again in a few minutes.';
          
          // Store the last attempt time to implement backoff
          localStorage.setItem('last_phone_verification_attempt', Date.now().toString());
          
          // Start countdown
          setCooldownSeconds(60);
          
          // Set up interval to update countdown
          const interval = setInterval(() => {
            setCooldownSeconds(prev => {
              if (prev === null || prev <= 1) {
                clearInterval(interval);
                return null;
              }
              return prev - 1;
            });
          }, 1000);
        } else if (errorMessage.includes('invalid-phone-number')) {
          errorMessage = 'Please enter a valid phone number with country code.';
        } else if (errorMessage.includes('quota-exceeded')) {
          errorMessage = 'Our verification service is temporarily unavailable. Please try again later.';
        } else if (errorMessage.includes('wait')) {
          // Extract wait time from error message for display
          const waitMatch = errorMessage.match(/wait (\d+) seconds/);
          if (waitMatch && waitMatch[1]) {
            const seconds = parseInt(waitMatch[1], 10);
            setCooldownSeconds(seconds);
            
            // Set up interval to update countdown
            const interval = setInterval(() => {
              setCooldownSeconds(prev => {
                if (prev === null || prev <= 1) {
                  clearInterval(interval);
                  return null;
                }
                return prev - 1;
              });
            }, 1000);
          }
        }
        
        setError(errorMessage);
      } else {
        setError('Failed to send verification code. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    
    // Hide after 2 seconds
    setTimeout(() => {
      setShowSuccess(false);
      setSuccessMessage(null);
    }, 2000);
  };
  
  // Start the pulsating animation
  useEffect(() => {
    const interval = setInterval(() => {
      setGlowOpacity((prev) => (prev === 0.5 ? 0.95 : 0.5));
    }, 1500);
    
    return () => clearInterval(interval);
  }, []);

  // Auto-focus on the input field - simplified approach
  useEffect(() => {
    // Initial focus
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Try again after component is fully mounted
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.click();
        inputRef.current.focus();
      }
    }, 100);

    // Try one more time after a bit longer
    const secondTimer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.click();
        inputRef.current.focus();
      }
    }, 500);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(secondTimer);
    };
  }, []);
  
  // Get progress bar color based on completion
  const getProgressBarColor = () => {
    if (isPhoneNumberValid) {
      return 'bg-green-500';
    }
    return 'bg-yellow-400';
  };

  // Toggle country dropdown
  const toggleCountryDropdown = () => {
    setShowCountryDropdown(!showCountryDropdown);
  };

  // Select a country
  const selectCountry = (country: CountryCode) => {
    setSelectedCountry(country);
    setShowCountryDropdown(false);
    // Focus back on the input field after selection
    inputRef.current?.focus();
  };
  
  // Continue button should show timer if in cooldown
  const renderContinueButtonContent = () => {
    if (isLoading) {
      return (
        <svg className="animate-spin h-10 w-10 text-white absolute z-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      );
    }
    
    if (cooldownSeconds !== null) {
      return (
        <div className="text-white text-lg absolute z-10">{cooldownSeconds}s</div>
      );
    }
    
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white absolute z-10" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    );
  };
  
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <div className="flex flex-col h-screen bg-[#121212] overflow-hidden max-w-md mx-auto" ref={containerRef}>
        {/* Main content container - centered vertically */}
        <div className="flex-1 flex flex-col items-center justify-center overflow-hidden">
          <div className="w-full flex flex-col items-center space-y-8">
            {/* Title - centered */}
            <motion.h1 
              className="text-white font-marfa font-medium text-4xl text-center px-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Log in or Sign up
            </motion.h1>
            
            {/* Phone input area */}
            <motion.div 
              className="w-full px-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              onClick={() => inputRef.current?.focus()}
            >
              <div className="relative bg-[#1F1F1F] rounded-xl h-14 flex items-center overflow-hidden">
                {/* Country code selector */}
                <div 
                  className="flex items-center h-full pl-4 pr-3" 
                  onClick={toggleCountryDropdown}
                >
                  <div className="flex items-center space-x-1">
                    <span className="text-xl">{selectedCountry.flag}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white opacity-60" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                {/* Divider */}
                <div className="h-[28px] w-px bg-white opacity-20"></div>
                
                {/* Phone number field */}
                <div className="flex-1 h-full relative">
                  {phoneNumber.length === 0 && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white opacity-40 text-lg font-marfa">
                      Phone number
                    </div>
                  )}
                  
                  <input
                    ref={inputRef}
                    type="tel"
                    inputMode="tel"
                    autoFocus={true}
                    autoComplete="tel"
                    autoCorrect="off"
                    spellCheck="false"
                    className="w-full h-full bg-transparent text-white text-lg font-marfa pl-3 pr-4 focus:outline-none"
                    value={formattedPhoneNumber}
                    onChange={(e) => handlePhoneNumberChange(e.target.value)}
                    onFocus={() => setKeyboardFocused(true)}
                    onClick={(e) => e.currentTarget.focus()}
                  />
                </div>
                
                {/* Progress bar */}
                {phoneNumber.length > 0 && (
                  <motion.div 
                    className={`absolute bottom-0 left-0 h-[3px] ${getProgressBarColor()}`}
                    style={{ width: getProgressWidth() }}
                    initial={{ width: '0%' }}
                    animate={{ width: getProgressWidth() }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </div>
            </motion.div>

            {/* Continue button - right aligned and larger */}
            <div className="w-full px-5 flex justify-end">
              <motion.button
                onClick={sendVerificationCode}
                disabled={!isPhoneNumberValid || isLoading || cooldownSeconds !== null}
                className={`w-21 h-21 rounded-full flex items-center justify-center relative overflow-hidden ${!isPhoneNumberValid || cooldownSeconds !== null ? 'opacity-70' : 'opacity-100'}`}
                style={{ width: '5.25rem', height: '5.25rem' }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {/* Button glow effect */}
                <motion.div 
                  className={`absolute inset-0 rounded-full ${isPhoneNumberValid && cooldownSeconds === null ? 'bg-green-500' : 'bg-[#1F1F1F]'}`}
                  animate={{ opacity: isPhoneNumberValid && cooldownSeconds === null ? glowOpacity : 1 }}
                  transition={{ duration: 0.5 }}
                />
                
                {/* Button content */}
                {renderContinueButtonContent()}
              </motion.button>
            </div>
            
            {/* Terms of service text - centered */}
            <motion.div 
              className="w-full px-5 text-center mt-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <p className="text-white/70 text-sm font-marfa font-light">
                By signing up to Collective you agree to our
              </p>
              <p>
                <span className="text-white text-sm font-marfa">Terms of Service</span>
                <span className="text-white/70 text-sm font-marfa"> & </span>
                <span className="text-white text-sm font-marfa">Privacy policy</span>
              </p>
            </motion.div>
          </div>
        </div>
      
        {/* Country dropdown menu */}
        <AnimatePresence>
          {showCountryDropdown && (
            <motion.div 
              className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCountryDropdown(false)}
            >
              <motion.div 
                className="bg-[#222] rounded-xl w-[80%] max-h-[70%] overflow-y-auto"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 border-b border-white/10">
                  <h3 className="text-white text-center text-lg font-medium">Select Country</h3>
                </div>
                <div className="py-2">
                  {countryCodes.map((country) => (
                    <div 
                      key={`${country.code}-${country.name}`}
                      className="px-4 py-3 flex items-center space-x-3 hover:bg-white/5 active:bg-white/10"
                      onClick={() => selectCountry(country)}
                    >
                      <span className="text-xl">{country.flag}</span>
                      <span className="text-white">{country.name}</span>
                      <span className="text-white/60 ml-auto">{country.code}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
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

        {/* Hidden input to help trigger mobile keyboard */}
        <input 
          type="text" 
          className="opacity-0 h-0 w-0 absolute pointer-events-none" 
          tabIndex={-1}
          autoFocus={true}
        />

        {/* Recaptcha container - styled for maximum compatibility */}
        <div 
          id="recaptcha-container" 
          className="fixed bottom-0 right-0 w-20 h-20 overflow-hidden z-50"
          style={{ opacity: 0.1 }}
        ></div>
      </div>
    </>
  );
} 