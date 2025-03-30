import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithPhoneNumber, 
  PhoneAuthProvider, 
  signInWithCredential,
  signOut, 
  User,
  RecaptchaVerifier
} from 'firebase/auth';
import { auth, db, storage } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Enhanced User interface with isOnboarded property
interface ExtendedUser extends User {
  isOnboarded?: boolean;
}

// User profile data interface
interface UserProfileData {
  firstName: string;
  lastName: string;
  displayName: string;
  phoneNumber: string;
  zipCode: string;
  city: string;
  state: string;
  profileImageFile: File | null;
}

interface AuthContextType {
  user: ExtendedUser | null;
  loading: boolean;
  verifyPhoneNumber: (phoneNumber: string) => Promise<string>;
  confirmCode: (verificationId: string, code: string) => Promise<void>;
  createUserProfile: (profileData: UserProfileData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  // Track the current reCAPTCHA verifier instance
  const [recaptchaVerifierInstance, setRecaptchaVerifierInstance] = useState<RecaptchaVerifier | null>(null);
  
  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch additional user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Extend the user object with Firestore data
            const extendedUser: ExtendedUser = {
              ...firebaseUser,
              isOnboarded: userData.is_onboarded || false
            };
            setUser(extendedUser);
          } else {
            setUser(firebaseUser);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(firebaseUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Clean up old reCAPTCHA elements
  const cleanupRecaptcha = () => {
    try {
      // Clear any existing reCAPTCHA
      const recaptchaElements = document.querySelectorAll('.grecaptcha-badge, iframe[title*="recaptcha"]');
      recaptchaElements.forEach(element => {
        element.remove();
      });
      
      if (recaptchaVerifierInstance) {
        recaptchaVerifierInstance.clear();
        setRecaptchaVerifierInstance(null);
      }
    } catch (e) {
      console.error('Error cleaning up reCAPTCHA:', e);
    }
  };

  // Verify the phone number
  const verifyPhoneNumber = async (phoneNumber: string) => {
    if (typeof window !== 'undefined') {
      try {
        // Clean up any existing reCAPTCHA instances
        cleanupRecaptcha();
        
        console.log('Verifying phone number:', phoneNumber);
        
        // Use a simplified approach with a fresh reCAPTCHA verifier
        const recaptchaContainer = document.getElementById('recaptcha-container');
        if (!recaptchaContainer) {
          throw new Error('Recaptcha container element not found');
        }
        
        // Create a new reCAPTCHA verifier
        const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
        });
        
        setRecaptchaVerifierInstance(verifier);
        
        // For testing in development, allow these verification codes to always succeed
        if (process.env.NODE_ENV === 'development') {
          console.log('Development mode: Using fake verification');
          return '123456'; // Return a fake verification ID for development
        }
        
        // Send the SMS verification
        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
        return confirmationResult.verificationId;
      } catch (error) {
        console.error('Phone verification error:', error);
        
        // Clean up after error
        cleanupRecaptcha();
        
        // Provide a more helpful error message
        if (error instanceof Error) {
          if (error.message.includes('reCAPTCHA')) {
            throw new Error('reCAPTCHA verification failed. Please try again.');
          } else if (error.message.includes('quota')) {
            throw new Error('SMS quota exceeded. Please try again later.');
          }
        }
        
        throw error;
      }
    }
    throw new Error('Cannot verify phone number on server side');
  };

  const confirmCode = async (verificationId: string, code: string) => {
    try {
      // For development mode, accept any 6-digit code
      if (process.env.NODE_ENV === 'development' && code.length === 6) {
        console.log('Development mode: Accepting any 6-digit code');
        
        // In development, we need to simulate authentication
        // First, check if a user with this phone number exists
        // This would normally happen automatically with Firebase auth
        // But since we're bypassing Firebase in dev mode, we need to handle it
        const phoneNumberToCheck = localStorage.getItem('current_phone_number');
        
        if (phoneNumberToCheck) {
          // In a real app, we would query Firestore to check if the user exists
          // For development, we'll just simulate user authentication
          // You can add logic here to check localStorage or any other method to determine
          // if this should be treated as an existing user or new user
          console.log('Development mode: Simulating authentication for', phoneNumberToCheck);
          
          // This would fetch the user data from Firestore in a real app
        }
        
        return;
      }
      
      // Normal flow for production
      const credential = PhoneAuthProvider.credential(verificationId, code);
      const userCredential = await signInWithCredential(auth, credential);
      
      // We no longer create a user document here
      // It will be created in the createUserProfile function
      // after all onboarding steps are completed
    } catch (error) {
      console.error('Error confirming code:', error);
      throw error;
    }
  };

  const createUserProfile = async (profileData: UserProfileData) => {
    if (!user) throw new Error('No authenticated user');

    // Upload profile image if provided
    let profileImageUrl = null;
    if (profileData.profileImageFile) {
      const storageRef = ref(storage, `profile_images/${user.uid}`);
      await uploadBytes(storageRef, profileData.profileImageFile);
      profileImageUrl = await getDownloadURL(storageRef);
    }

    // Check if user document exists
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    // Create or update user profile in Firestore
    if (!userDoc.exists()) {
      // Create new user document
      await setDoc(doc(db, 'users', user.uid), {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        display_name: profileData.displayName,
        phone_number: profileData.phoneNumber,
        zip_code: profileData.zipCode,
        city: profileData.city,
        state: profileData.state,
        profile_image_url: profileImageUrl,
        is_onboarded: true,
        created_time: serverTimestamp(),
        onboarded_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
    } else {
      // Update existing user document
      await updateDoc(doc(db, 'users', user.uid), {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        display_name: profileData.displayName,
        phone_number: profileData.phoneNumber,
        zip_code: profileData.zipCode,
        city: profileData.city,
        state: profileData.state,
        profile_image_url: profileImageUrl,
        is_onboarded: true,
        onboarded_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
    }

    // Update local user state
    setUser({
      ...user,
      isOnboarded: true
    });

    // Clear temporary localStorage data
    localStorage.removeItem('temp_first_name');
    localStorage.removeItem('temp_last_name');
    localStorage.removeItem('temp_display_name');
    localStorage.removeItem('temp_profile_image');
    localStorage.removeItem('temp_zip_code');
    localStorage.removeItem('temp_city');
    localStorage.removeItem('temp_state');
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    loading,
    verifyPhoneNumber,
    confirmCode,
    createUserProfile,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 