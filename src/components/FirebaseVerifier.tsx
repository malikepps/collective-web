import React, { useEffect } from 'react';
import { auth } from '@/lib/firebase/config';
import { RecaptchaVerifier } from 'firebase/auth';

export default function FirebaseVerifier() {
  useEffect(() => {
    const verifyFirebaseSetup = async () => {
      console.log('Verifying Firebase setup...');
      
      // Check if Firebase Auth is initialized correctly
      if (!auth) {
        console.error('Firebase Auth is not initialized properly');
      } else {
        console.log('Firebase Auth is initialized correctly', auth);
        
        // Test RecaptchaVerifier initialization
        try {
          const testRecaptchaContainer = document.createElement('div');
          testRecaptchaContainer.id = 'test-recaptcha-container';
          document.body.appendChild(testRecaptchaContainer);
          
          const testRecaptcha = new RecaptchaVerifier(auth, 'test-recaptcha-container', {
            size: 'invisible',
            callback: () => {
              console.log('Test reCAPTCHA solved successfully');
            }
          });
          
          // Try to render the recaptcha
          await testRecaptcha.render();
          console.log('RecaptchaVerifier initialized and rendered successfully');
          
          // Clean up after testing
          setTimeout(() => {
            testRecaptchaContainer.remove();
            testRecaptcha.clear();
          }, 5000);
        } catch (error) {
          console.error('Error testing RecaptchaVerifier:', error);
        }
      }
      
      // Log environment variables (without exposing values)
      console.log('Firebase config environment variables present:', {
        apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      });
    };
    
    verifyFirebaseSetup();
  }, []);
  
  return null; // This component doesn't render anything
} 