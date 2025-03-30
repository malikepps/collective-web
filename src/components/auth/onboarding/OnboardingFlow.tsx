import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/context/AuthContext';
import PhoneNumberEntry from './PhoneNumberEntry';
import VerificationCodeEntry from './VerificationCodeEntry';
import DisplayNameEntry from './DisplayNameEntry';
import ProfilePhotoUpload from './ProfilePhotoUpload';
import ZipCodeEntry from './ZipCodeEntry';

// Define the onboarding states
enum OnboardingState {
  PHONE_ENTRY = 'phone_entry',
  CODE_VERIFICATION = 'code_verification',
  DISPLAY_NAME = 'display_name',
  PROFILE_PHOTO = 'profile_photo',
  ZIP_CODE = 'zip_code',
  COMPLETED = 'completed'
}

interface ZipCodeData {
  zipCode: string;
  city: string;
  state: string;
  location: string;
  latitude?: number;
  longitude?: number;
}

export default function OnboardingFlow() {
  const [currentState, setCurrentState] = useState<OnboardingState>(OnboardingState.PHONE_ENTRY);
  const [verificationId, setVerificationId] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const router = useRouter();
  const { createUserProfile } = useAuth();
  
  // Handle phone entry success
  const handlePhoneSuccess = (verificationId: string) => {
    setVerificationId(verificationId);
    setCurrentState(OnboardingState.CODE_VERIFICATION);
  };
  
  // Handle verification code success
  const handleVerificationSuccess = () => {
    setCurrentState(OnboardingState.DISPLAY_NAME);
  };
  
  // Handle display name success
  const handleDisplayNameSuccess = (name: string) => {
    setDisplayName(name);
    setCurrentState(OnboardingState.PROFILE_PHOTO);
  };
  
  // Handle profile photo success
  const handleProfilePhotoSuccess = (imageFile: File | null) => {
    setProfileImageFile(imageFile);
    setCurrentState(OnboardingState.ZIP_CODE);
  };
  
  // Handle zip code success
  const handleZipCodeSuccess = async (zipData: ZipCodeData) => {
    // Create the user profile in Firestore
    try {
      await createUserProfile({
        firstName: localStorage.getItem('temp_first_name') || '',
        lastName: localStorage.getItem('temp_last_name') || '',
        displayName,
        phoneNumber,
        zipCode: zipData.zipCode,
        city: zipData.city,
        state: zipData.state,
        profileImageFile
      });
      
      // Mark onboarding as completed
      setCurrentState(OnboardingState.COMPLETED);
      
      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  };
  
  // Handle going back a step
  const handleBack = () => {
    switch (currentState) {
      case OnboardingState.CODE_VERIFICATION:
        setCurrentState(OnboardingState.PHONE_ENTRY);
        break;
      case OnboardingState.DISPLAY_NAME:
        setCurrentState(OnboardingState.CODE_VERIFICATION);
        break;
      case OnboardingState.PROFILE_PHOTO:
        setCurrentState(OnboardingState.DISPLAY_NAME);
        break;
      case OnboardingState.ZIP_CODE:
        setCurrentState(OnboardingState.PROFILE_PHOTO);
        break;
      default:
        break;
    }
  };
  
  // Redirect to home if onboarding is completed
  useEffect(() => {
    if (currentState === OnboardingState.COMPLETED) {
      router.push('/');
    }
  }, [currentState, router]);
  
  // Render the appropriate component based on the current state
  return (
    <div className="min-h-screen bg-[#1D1D1D]">
      {currentState === OnboardingState.PHONE_ENTRY && (
        <PhoneNumberEntry onSuccess={handlePhoneSuccess} />
      )}
      
      {currentState === OnboardingState.CODE_VERIFICATION && (
        <VerificationCodeEntry
          verificationId={verificationId}
          phoneNumber={phoneNumber}
          onSuccess={handleVerificationSuccess}
          onBack={handleBack}
        />
      )}
      
      {currentState === OnboardingState.DISPLAY_NAME && (
        <DisplayNameEntry
          onSuccess={handleDisplayNameSuccess}
          onBack={handleBack}
        />
      )}
      
      {currentState === OnboardingState.PROFILE_PHOTO && (
        <ProfilePhotoUpload
          onSuccess={handleProfilePhotoSuccess}
          onBack={handleBack}
        />
      )}
      
      {currentState === OnboardingState.ZIP_CODE && (
        <ZipCodeEntry
          onSuccess={handleZipCodeSuccess}
          onBack={handleBack}
        />
      )}
    </div>
  );
} 