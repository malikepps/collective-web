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
  const { createUserProfile, user, loading } = useAuth();
  
  // Handle phone entry success
  const handlePhoneSuccess = (verificationId: string, phoneNumber: string) => {
    setVerificationId(verificationId);
    setPhoneNumber(phoneNumber);
    setCurrentState(OnboardingState.CODE_VERIFICATION);
  };
  
  // Handle verification code success
  const handleVerificationSuccess = () => {
    console.log('Verification successful');
    
    // Check if the user is already authenticated and onboarded
    if (user) {
      console.log('User authenticated:', user);
      console.log('User is onboarded:', user.isOnboarded);
      
      if (user.isOnboarded) {
        // If user is already fully onboarded, redirect to home
        console.log('User is already onboarded, redirecting to home page');
        router.push('/home');
        return;
      } else {
        console.log('User is authenticated but not onboarded, continuing with onboarding');
      }
    } 
    
    // Check localStorage for existing user data (this is set in PhoneNumberEntry)
    const existingUserData = localStorage.getItem('existing_user_data');
    if (existingUserData) {
      try {
        const userData = JSON.parse(existingUserData);
        console.log('Found existing user data in localStorage:', userData);
        
        if (userData.isOnboarded) {
          console.log('Existing user is already onboarded, redirecting to home');
          router.push('/home');
          return;
        }
        
        // If user exists but still needs to complete onboarding, 
        // consider starting from where they left off
        if (userData.displayName) {
          console.log('User has a display name, skipping to profile photo step');
          setDisplayName(userData.displayName);
          setCurrentState(OnboardingState.PROFILE_PHOTO);
          return;
        }
      } catch (error) {
        console.error('Error parsing existing user data:', error);
      }
    }
    
    // Check localStorage for authenticated user (fallback)
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        console.log('Found stored auth user in localStorage:', userData);
        
        if (userData.isOnboarded) {
          console.log('Stored user is already onboarded, redirecting to home');
          router.push('/home');
          return;
        } else {
          console.log('Stored user is not onboarded, continuing with onboarding');
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
      }
    } else {
      console.log('No user detected after verification, continuing with new user onboarding');
    }
    
    // If we reach here, the user is either new or not fully onboarded
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
      router.push('/home');
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
  
  // Redirect to home if user is already authenticated and onboarded
  useEffect(() => {
    if (!loading) {
      console.log('Auth loading complete, checking user state');
      
      if (user) {
        console.log('Detected user on page load:', user);
        console.log('User onboarded status:', user.isOnboarded);
        
        if (user.isOnboarded) {
          console.log('User is already onboarded, redirecting to home');
          router.push('/home');
        } else {
          console.log('User exists but not onboarded, staying on onboarding flow');
        }
      } else {
        // Handle development mode persistence via localStorage
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            console.log('Found stored user in localStorage on page load:', userData);
            
            if (userData.isOnboarded) {
              console.log('Stored user is onboarded, redirecting to home');
              router.push('/home');
            } else {
              console.log('Stored user exists but not onboarded, staying on flow');
            }
          } catch (e) {
            console.error('Error parsing stored user data:', e);
          }
        } else {
          console.log('No authenticated user found, starting with phone entry');
        }
      }
    }
  }, [user, loading, router]);
  
  // Redirect to home if onboarding is completed
  useEffect(() => {
    if (currentState === OnboardingState.COMPLETED) {
      router.push('/home');
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