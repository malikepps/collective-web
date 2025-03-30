import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import PhoneNumberEntry from '@/components/auth/onboarding/PhoneNumberEntry';
import VerificationCodeEntry from '@/components/auth/onboarding/VerificationCodeEntry';
import DisplayNameEntry from '@/components/auth/onboarding/DisplayNameEntry';
import ProfilePhotoUpload from '@/components/auth/onboarding/ProfilePhotoUpload';
import ZipCodeEntry from '@/components/auth/onboarding/ZipCodeEntry';
import FirebaseVerifier from '@/components/FirebaseVerifier';
import Head from 'next/head';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/config';
import { getAuth } from 'firebase/auth';

enum OnboardingStep {
  PHONE_NUMBER = 'phone_number',
  VERIFICATION_CODE = 'verification_code',
  DISPLAY_NAME = 'display_name',
  PROFILE_PHOTO = 'profile_photo',
  ZIP_CODE = 'zip_code',
  // TODO: Add remaining steps to match iOS app flow
  // PROFILE_SETUP = 'profile_setup',
  // COMMUNITY_SELECTION = 'community_selection',
}

interface ZipCodeData {
  zipCode: string;
  city: string;
  state: string;
  location: string;
  latitude?: number;
  longitude?: number;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(OnboardingStep.PHONE_NUMBER);
  const [verificationId, setVerificationId] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [zipCodeData, setZipCodeData] = useState<ZipCodeData | null>(null);
  const auth = getAuth();
  
  // Handle completion of phone number entry
  const handlePhoneNumberSuccess = (vId: string, phone: string) => {
    setVerificationId(vId);
    setPhoneNumber(phone);
    setCurrentStep(OnboardingStep.VERIFICATION_CODE);
  };
  
  // Handle completion of verification code entry
  const handleVerificationSuccess = () => {
    setCurrentStep(OnboardingStep.DISPLAY_NAME);
  };
  
  // Handle completion of display name entry
  const handleDisplayNameSuccess = (name: string) => {
    setDisplayName(name);
    setCurrentStep(OnboardingStep.PROFILE_PHOTO);
  };

  // Handle completion of profile photo upload
  const handleProfilePhotoSuccess = (imageFile: File | null) => {
    setProfileImageFile(imageFile);
    // Navigate to the ZIP code entry step
    setCurrentStep(OnboardingStep.ZIP_CODE);
  };
  
  // Handle completion of ZIP code entry
  const handleZipCodeSuccess = async (zipData: ZipCodeData) => {
    setZipCodeData(zipData);
    setIsCreatingUser(true);
    
    try {
      const user = auth.currentUser;
      
      if (!user) {
        console.error('No authenticated user found');
        // Sign in anonymously if no user is authenticated
        try {
          const { getAuth, signInAnonymously } = await import('firebase/auth');
          const authInstance = getAuth();
          await signInAnonymously(authInstance);
          console.log('Anonymous sign-in successful');
          // Try again with the new user
          handleZipCodeSuccess(zipData);
          return;
        } catch (authError) {
          console.error('Error signing in anonymously:', authError);
          setIsCreatingUser(false);
          return;
        }
      }
      
      // Get first and last names from display name
      const nameParts = displayName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Upload profile photo if exists
      let photoURL = null;
      if (profileImageFile) {
        // Use correct path structure: users/[USER_ID]/uploads/[FILENAME]
        const fileName = `profile_${Date.now()}.jpg`;
        const storageRef = ref(storage, `users/${user.uid}/uploads/${fileName}`);
        await uploadBytes(storageRef, profileImageFile);
        photoURL = await getDownloadURL(storageRef);
        console.log('Profile image uploaded successfully:', photoURL);
      }
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        display_name: displayName,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        email: '',
        photo_url: photoURL,
        zip_code: zipData.zipCode,
        city: zipData.city,
        state: zipData.state,
        bio: '',
        username: firstName.toLowerCase() + '.' + lastName.toLowerCase(),
        created_time: serverTimestamp(),
        last_login: serverTimestamp(),
        user_type: 'regular',
        num_organizations: 0,
        private_profile: false
      });
      
      // Clear temporary data from localStorage
      localStorage.removeItem('temp_first_name');
      localStorage.removeItem('temp_last_name');
      localStorage.removeItem('temp_zip_code');
      localStorage.removeItem('temp_city');
      localStorage.removeItem('temp_state');
      
      console.log('User document created successfully');
      
      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Error creating user:', error);
      setIsCreatingUser(false);
    }
  };
  
  // Handle back button press from verification
  const handleBackFromVerification = () => {
    setCurrentStep(OnboardingStep.PHONE_NUMBER);
  };
  
  // Handle back button press from display name
  const handleBackFromDisplayName = () => {
    setCurrentStep(OnboardingStep.VERIFICATION_CODE);
  };
  
  // Handle back button press from profile photo
  const handleBackFromProfilePhoto = () => {
    setCurrentStep(OnboardingStep.DISPLAY_NAME);
  };
  
  // Handle back button press from ZIP code
  const handleBackFromZipCode = () => {
    setCurrentStep(OnboardingStep.PROFILE_PHOTO);
  };
  
  return (
    <>
      <Head>
        <title>Collective | Onboarding</title>
        <meta name="description" content="Join Collective - Connect with communities" />
      </Head>
      
      {/* Add FirebaseVerifier for debugging */}
      <FirebaseVerifier />
      
      <div className="min-h-screen bg-[#1D1D1D] overflow-hidden relative">
        {/* Global recaptcha container */}
        <div id="recaptcha-container" className="fixed bottom-4 right-4 z-50 opacity-10" style={{ width: '20px', height: '20px' }}></div>
        
        <AnimatePresence mode="wait">
          {currentStep === OnboardingStep.PHONE_NUMBER && (
            <motion.div
              key="phone-entry"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <PhoneNumberEntry onSuccess={handlePhoneNumberSuccess} />
            </motion.div>
          )}

          {currentStep === OnboardingStep.VERIFICATION_CODE && (
            <motion.div
              key="verification-code"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <VerificationCodeEntry
                verificationId={verificationId}
                phoneNumber={phoneNumber}
                onSuccess={handleVerificationSuccess}
                onBack={handleBackFromVerification}
              />
            </motion.div>
          )}
          
          {currentStep === OnboardingStep.DISPLAY_NAME && (
            <motion.div
              key="display-name"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <DisplayNameEntry
                onSuccess={handleDisplayNameSuccess}
                onBack={handleBackFromDisplayName}
              />
            </motion.div>
          )}
          
          {currentStep === OnboardingStep.PROFILE_PHOTO && (
            <motion.div
              key="profile-photo"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <ProfilePhotoUpload
                onSuccess={handleProfilePhotoSuccess}
                onBack={handleBackFromProfilePhoto}
              />
            </motion.div>
          )}
          
          {currentStep === OnboardingStep.ZIP_CODE && (
            <motion.div
              key="zip-code"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <ZipCodeEntry
                onSuccess={handleZipCodeSuccess}
                onBack={handleBackFromZipCode}
              />
            </motion.div>
          )}
          
          {/* Loading overlay when creating user */}
          {isCreatingUser && (
            <motion.div 
              className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white text-lg font-marfa">Creating your profile...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
} 