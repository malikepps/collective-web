import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  getAuth,
  onAuthStateChanged, 
  signOut,
  User
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// Define the extended user type
interface ExtendedUser extends User {
  isOnboarded?: boolean;
}

// Define the auth context type
interface AuthContextType {
  user: ExtendedUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Effect to listen for auth state changes
  useEffect(() => {
    const auth = getAuth();
    
    console.log('Setting up auth state listener');
    
    const unsubscribe = onAuthStateChanged(auth, async (userAuth) => {
      if (userAuth) {
        console.log('Auth state changed: user logged in', userAuth.uid);
        
        // Check if user has a document in Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', userAuth.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Create extended user with onboarded status
            const extendedUser: ExtendedUser = {
              ...userAuth,
              isOnboarded: userData.is_onboarded || false
            };
            
            setUser(extendedUser);
            
            // Save to localStorage for development persistence
            if (typeof window !== 'undefined') {
              localStorage.setItem('auth_user', JSON.stringify({
                uid: userAuth.uid,
                displayName: userData.display_name || '',
                phoneNumber: userAuth.phoneNumber || '',
                isOnboarded: userData.is_onboarded || false,
                photoURL: userData.profile_image_url || null,
                firstName: userData.first_name || '',
                lastName: userData.last_name || '',
              }));
            }
          } else {
            // User is authenticated but has no document yet
            setUser(userAuth);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Set the base user anyway
          setUser(userAuth);
        }
      } else {
        console.log('Auth state changed: user logged out');
        setUser(null);
        
        // Clean up localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_user');
        }
      }
      
      setLoading(false);
    });
    
    // Clean up the subscription
    return () => unsubscribe();
  }, []);
  
  // Sign out
  const logout = async () => {
    const auth = getAuth();
    await signOut(auth);
  };
  
  // Auth context value
  const value = {
    user,
    loading,
    logout,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 