import React, { useEffect, useRef } from 'react';
import { getAuth, RecaptchaVerifier } from 'firebase/auth';

interface RecaptchaContainerProps {
  onVerifierCreated?: (verifier: RecaptchaVerifier) => void;
  containerId?: string;
}

export default function RecaptchaContainer({
  onVerifierCreated,
  containerId = 'recaptcha-container'
}: RecaptchaContainerProps) {
  const verifierRef = useRef<RecaptchaVerifier | null>(null);
  
  useEffect(() => {
    // Clean up any existing reCAPTCHA elements on mount
    const cleanupExistingRecaptcha = () => {
      try {
        const existingElements = document.querySelectorAll('.grecaptcha-badge, iframe[title*="recaptcha"]');
        existingElements.forEach(element => {
          element.remove();
        });
        console.log('Cleaned up existing reCAPTCHA elements');
      } catch (e) {
        console.error('Error cleaning up reCAPTCHA elements:', e);
      }
    };
    
    // Initialize the reCAPTCHA verifier
    const initializeRecaptcha = async () => {
      cleanupExistingRecaptcha();
      
      const auth = getAuth();
      
      try {
        // Clear existing verifier if it exists
        if (verifierRef.current) {
          verifierRef.current.clear();
          verifierRef.current = null;
        }
        
        // Create new verifier
        const verifier = new RecaptchaVerifier(auth, containerId, {
          size: 'invisible',
          callback: () => {
            console.log('reCAPTCHA verified successfully');
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expired, refreshing...');
            // Re-initialize on expiry
            initializeRecaptcha();
          }
        });
        
        // Store reference
        verifierRef.current = verifier;
        
        // Render to ensure it's ready
        await verifier.render();
        console.log('reCAPTCHA rendered successfully');
        
        // Notify parent component
        if (onVerifierCreated) {
          onVerifierCreated(verifier);
        }
      } catch (error) {
        console.error('Error initializing reCAPTCHA:', error);
      }
    };
    
    // Initialize on mount
    initializeRecaptcha();
    
    // Clean up on unmount
    return () => {
      if (verifierRef.current) {
        try {
          verifierRef.current.clear();
          console.log('reCAPTCHA cleared on unmount');
        } catch (e) {
          console.error('Error clearing reCAPTCHA:', e);
        }
      }
    };
  }, [containerId, onVerifierCreated]);
  
  return (
    <div 
      id={containerId}
      className="fixed bottom-5 right-5 z-10"
      style={{ opacity: 0.01 }}
      data-testid="recaptcha-container"
    ></div>
  );
} 