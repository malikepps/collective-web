import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface VerificationCodeEntryProps {
  verificationId: string;
  phoneNumber: string;
  onSuccess: () => void;
  onBack: () => void;
}

export default function VerificationCodeEntry({ 
  verificationId, 
  phoneNumber, 
  onSuccess, 
  onBack 
}: VerificationCodeEntryProps) {
  const [codeDigits, setCodeDigits] = useState<string[]>(Array(6).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [resendCount, setResendCount] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  
  const { confirmCode, verifyPhoneNumber } = useAuth();
  
  // Format the phone number for display
  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    
    // Remove any non-numeric characters except the + sign
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // Check if it's a US number (starting with +1)
    if (cleaned.startsWith('+1') && cleaned.length >= 12) {
      const countryCode = cleaned.substring(0, 2);
      const areaCode = cleaned.substring(2, 5);
      const firstPart = cleaned.substring(5, 8);
      const secondPart = cleaned.substring(8, 12);
      
      return `${countryCode} (${areaCode}) ${firstPart}-${secondPart}`;
    }
    
    return phone;
  };
  
  // Handle digit change in code input
  const handleDigitChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 0) {
      const digit = value[value.length - 1];
      
      // Check if it's a number
      if (/^\d$/.test(digit)) {
        const newCodeDigits = [...codeDigits];
        newCodeDigits[index] = digit;
        setCodeDigits(newCodeDigits);
        
        // Auto-focus next input field
        if (index < 5) {
          inputRefs.current[index + 1]?.focus();
          setFocusedIndex(index + 1);
        } else {
          // Last digit entered, auto-verify
          if (newCodeDigits.every(d => d !== '')) {
            // Verify after a short delay to give visual feedback
            setTimeout(() => verifyCode(newCodeDigits.join('')), 300);
          }
        }
      }
    } else {
      // Handle backspace
      const newCodeDigits = [...codeDigits];
      newCodeDigits[index] = '';
      setCodeDigits(newCodeDigits);
    }
  };
  
  // Handle backspace key
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && index > 0 && codeDigits[index] === '') {
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    }
  };
  
  // Handle pasting verification code
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').substring(0, 6).split('');
    
    if (digits.length > 0) {
      const newCodeDigits = [...codeDigits];
      
      digits.forEach((digit, index) => {
        if (index < 6) {
          newCodeDigits[index] = digit;
        }
      });
      
      setCodeDigits(newCodeDigits);
      
      // Focus the next empty field or the last field
      const nextEmptyIndex = newCodeDigits.findIndex(d => d === '');
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus();
        setFocusedIndex(nextEmptyIndex);
      } else {
        inputRefs.current[5]?.focus();
        setFocusedIndex(5);
        
        // If all digits filled, auto-verify
        if (newCodeDigits.every(d => d !== '')) {
          setTimeout(() => verifyCode(newCodeDigits.join('')), 300);
        }
      }
    }
  };
  
  // Verify the entered code
  const verifyCode = async (code?: string) => {
    const verificationCode = code || codeDigits.join('');
    
    if (verificationCode.length !== 6 || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // For development mode, always succeed with any 6-digit code
      if (process.env.NODE_ENV === 'development') {
        showSuccessMessage('Development mode: Code accepted');
        
        // In development, we can bypass Firebase errors
        try {
          await confirmCode(verificationId, verificationCode);
        } catch (err: any) { // Type assertion to avoid TS error
          console.log('Ignoring Firebase error in development mode:', err.message);
          // Continue despite the error in development
        }
        
        // Short delay to show the loading state
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Proceed to the next step
        onSuccess();
        return;
      }
      
      // Production flow
      await confirmCode(verificationId, verificationCode);
      showSuccessMessage('Verification successful');
      onSuccess();
    } catch (err) {
      console.error('Verification error:', err);
      
      let errorMessage = 'Invalid verification code. Please try again.';
      if (err instanceof Error) {
        // Show the actual error message from Firebase
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      // Reset the code
      setCodeDigits(Array(6).fill(''));
      // Focus the first input
      inputRefs.current[0]?.focus();
      setFocusedIndex(0);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Resend verification code
  const resendCode = async () => {
    if (isResendDisabled || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await verifyPhoneNumber(phoneNumber);
      showSuccessMessage('Code sent!');
      startResendTimer();
    } catch (err) {
      console.error('Resend error:', err);
      setError('Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
  
  // Start resend timer
  const startResendTimer = () => {
    setResendCount(30);
    setIsResendDisabled(true);
  };
  
  // Initialize the resend timer
  useEffect(() => {
    startResendTimer();
    
    // Auto-focus the first input
    setTimeout(() => {
      inputRefs.current[0]?.focus();
      setFocusedIndex(0);
    }, 500);
  }, []);
  
  // Manage resend timer
  useEffect(() => {
    if (isResendDisabled) {
      const interval = setInterval(() => {
        setResendCount(prev => {
          if (prev <= 1) {
            setIsResendDisabled(false);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isResendDisabled]);
  
  // Set focus on field click
  const handleBoxClick = (index: number) => {
    inputRefs.current[index]?.focus();
    setFocusedIndex(index);
  };
  
  return (
    <div className="flex flex-col h-screen bg-[#121212] overflow-hidden max-w-md mx-auto">
      {/* Back button */}
      <div className="pt-12 px-5">
        <button 
          onClick={onBack}
          className="text-white font-marfa font-medium text-base"
        >
          Back
        </button>
      </div>
      
      <div className="flex flex-col px-5 pt-6 flex-1">
        {/* Header */}
        <motion.h1 
          className="text-white font-marfa font-medium text-4xl mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Enter code
        </motion.h1>
        
        {/* Verification info */}
        <motion.p
          className="text-white/70 font-marfa font-light mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Enter the 6-digit code sent to {formatPhoneNumber(phoneNumber)}
        </motion.p>
        
        {/* Verification code input */}
        <motion.div
          className="flex justify-between mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {codeDigits.map((digit, index) => (
            <div 
              key={index} 
              className={`relative w-12 h-14 flex items-center justify-center cursor-text rounded-lg
                ${focusedIndex === index ? 'border-2 border-white' : 'border border-white/30'}
                ${digit ? 'bg-[#2A2A2A]' : 'bg-[#1F1F1F]'}`}
              onClick={() => handleBoxClick(index)}
            >
              <input
                ref={(el) => { inputRefs.current[index] = el; }}
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                className="absolute inset-0 w-full h-full bg-transparent text-center outline-none text-white text-2xl font-marfa caret-transparent"
                value={digit}
                onChange={e => handleDigitChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(null)}
              />
              <div className="text-white text-2xl font-marfa">{digit}</div>
            </div>
          ))}
        </motion.div>
        
        {/* Resend code button */}
        <motion.div
          className="flex justify-center mt-auto mb-16"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <button
            onClick={resendCode}
            disabled={isResendDisabled || isLoading}
            className={`text-white font-marfa text-base ${isResendDisabled ? 'opacity-50' : 'opacity-100'}`}
          >
            {isResendDisabled 
              ? `Resend code in ${resendCount}s` 
              : 'Resend code'}
          </button>
        </motion.div>
      </div>
      
      {/* Success message */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="fixed top-4 left-0 right-0 mx-auto w-4/5 bg-green-500 text-white py-3 px-5 rounded-lg shadow-lg text-center"
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
            className="fixed top-4 left-0 right-0 mx-auto w-4/5 bg-red-500 text-white py-3 px-5 rounded-lg shadow-lg text-center"
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