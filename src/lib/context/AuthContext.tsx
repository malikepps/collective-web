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
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
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
        // No Firebase user, check localStorage for development mode
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser && process.env.NODE_ENV === 'development') {
          try {
            console.log('Found stored user in localStorage');
            const userData = JSON.parse(storedUser);
            
            // Create a simulated ExtendedUser from localStorage data
            const simulatedUser: ExtendedUser = {
              uid: userData.uid,
              displayName: userData.displayName || '',
              phoneNumber: userData.phoneNumber || '',
              isOnboarded: userData.isOnboarded || false,
              email: '',
              emailVerified: false,
              isAnonymous: false,
              providerData: [],
              metadata: {
                creationTime: '',
                lastSignInTime: new Date().toString(),
              },
              refreshToken: '',
              tenantId: null,
              photoURL: userData.photoURL || null,
              providerId: 'phone',
              getIdToken: async () => '',
              getIdTokenResult: async () => ({
                claims: {},
                token: '',
                authTime: '',
                issuedAtTime: '',
                expirationTime: '',
                signInProvider: null,
                signInSecondFactor: null,
              }),
              reload: async () => {},
              delete: async () => {},
              toJSON: () => ({})
            };
            
            console.log('Setting simulated user from localStorage:', simulatedUser);
            setUser(simulatedUser);
          } catch (error) {
            console.error('Error parsing stored user data:', error);
            setUser(null);
          }
        } else {
          setUser(null);
        }
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
        // Check if we've recently attempted verification to implement rate limiting
        const lastAttemptTime = localStorage.getItem('last_phone_verification_attempt');
        if (lastAttemptTime) {
          const cooldownPeriod = 60000; // 1 minute cooldown in milliseconds
          const timeElapsed = Date.now() - Number(lastAttemptTime);
          
          if (timeElapsed < cooldownPeriod) {
            const secondsToWait = Math.ceil((cooldownPeriod - timeElapsed) / 1000);
            throw new Error(`Please wait ${secondsToWait} seconds before requesting another code.`);
          }
        }
        
        // Store current attempt time
        localStorage.setItem('last_phone_verification_attempt', Date.now().toString());
        
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
          } else if (error.message.includes('too-many-requests')) {
            // Add exponential backoff for too many requests
            const attemptCount = Number(localStorage.getItem('phone_verification_attempts') || '0') + 1;
            localStorage.setItem('phone_verification_attempts', attemptCount.toString());
            
            // Backoff time increases with each attempt (2^n minutes, capped at 30 minutes)
            const backoffMinutes = Math.min(Math.pow(2, attemptCount), 30);
            throw new Error(`Too many verification attempts. Please try again in ${backoffMinutes} minutes.`);
          }
        }
        
        throw error;
      }
    }
    throw new Error('Cannot verify phone number on server side');
  };

  const confirmCode = async (verificationId: string, code: string) => {
    try {
      console.log('Confirming code:', code);
      
      // Check if we've recently attempted verification to implement rate limiting
      const lastAttemptTime = localStorage.getItem('last_code_verification_attempt');
      if (lastAttemptTime) {
        const cooldownPeriod = 30000; // 30 seconds cooldown in milliseconds
        const timeElapsed = Date.now() - Number(lastAttemptTime);
        
        if (timeElapsed < cooldownPeriod) {
          const secondsToWait = Math.ceil((cooldownPeriod - timeElapsed) / 1000);
          throw new Error(`Please wait ${secondsToWait} seconds before trying again.`);
        }
      }
      
      // Store current attempt time
      localStorage.setItem('last_code_verification_attempt', Date.now().toString());
      
      // Get credential from verification ID and code
      const credential = PhoneAuthProvider.credential(verificationId, code);
      
      // Sign in with credential
      const userCredential = await signInWithCredential(auth, credential);
      
      // After successful authentication, clear the attempt counters
      localStorage.removeItem('phone_verification_attempts');
      localStorage.removeItem('code_verification_attempts');
      
      // After successful authentication, check if the user already exists in Firestore
      if (userCredential.user) {
        console.log('Firebase auth successful, user:', userCredential.user.uid);
        
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('Found user document:', userData);
          
          // Check if user is already onboarded
          const isOnboarded = userData.is_onboarded || false;
          console.log('User onboarded status:', isOnboarded);
          
          // Update the user state with onboarded status
          const extendedUser: ExtendedUser = {
            ...userCredential.user,
            isOnboarded
          };
          setUser(extendedUser);
          
          // Store user info in localStorage for persistence (not just in development)
          const storageData = {
            uid: userCredential.user.uid,
            displayName: userData.display_name || '',
            phoneNumber: userData.phone_number || '',
            isOnboarded,
            photoURL: userData.profile_image_url || null,
            firstName: userData.first_name || '',
            lastName: userData.last_name || '',
          };
          
          localStorage.setItem('auth_user', JSON.stringify(storageData));
          
          // Also update existing_user_data if this is an existing user
          // This ensures all parts of the app have consistent data
          localStorage.setItem('existing_user_data', JSON.stringify({
            firstName: userData.first_name || '',
            displayName: userData.display_name || '',
            isOnboarded,
            uid: userCredential.user.uid
          }));
          
          console.log('Updated localStorage with user data and onboarded status:', isOnboarded);
          
          // Return early so the caller knows authentication was successful
          return;
        } else {
          console.log('No user document found, will create during onboarding');
          // Set basic user data
          setUser(userCredential.user);
          
          // Clear existing user data to ensure onboarding happens
          localStorage.removeItem('existing_user_data');
        }
      }
    } catch (error) {
      console.error('Error confirming code:', error);
      
      // Handle too many attempts error specifically
      if (error instanceof Error && error.message.includes('too-many-requests')) {
        // Add exponential backoff for too many attempts
        const attemptCount = Number(localStorage.getItem('code_verification_attempts') || '0') + 1;
        localStorage.setItem('code_verification_attempts', attemptCount.toString());
        
        // Backoff time increases with each attempt (2^n minutes, capped at 30 minutes)
        const backoffMinutes = Math.min(Math.pow(2, attemptCount), 30);
        throw new Error(`Too many verification attempts. Please try again in ${backoffMinutes} minutes.`);
      }
      
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