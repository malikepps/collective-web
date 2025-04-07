import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/context/AuthContext';
import { useUserOrganizations } from '@/lib/hooks/useUserOrganizations';
import { DirectSVG } from '@/lib/components/icons';
import { SVGIconStyle } from '@/lib/components/icons/SVGIcon';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StoredUserData {
  uid?: string;
  displayName?: string;
  photoURL?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

const NavigationDrawer: React.FC<NavigationDrawerProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { organizations, loading: orgsLoading } = useUserOrganizations();
  const [storedUserData, setStoredUserData] = useState<StoredUserData | null>(null);
  
  // Get localStorage user data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedData = localStorage.getItem('auth_user');
        if (storedData) {
          setStoredUserData(JSON.parse(storedData));
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
      }
    }
  }, []);
  
  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
  
  // Handle body scroll prevention
  useEffect(() => {
    if (isOpen) {
      // Prevent background scrolling
      document.body.style.overflow = 'hidden';
    } else {
      // Restore scrolling
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Navigation functions
  const navigateTo = (path: string) => {
    // Check if user is authenticated before navigating
    if (!user) {
      onClose();
      router.push('/onboarding');
      return;
    }
    // Close the drawer first
    onClose();
    
    // Navigate directly to the page
    router.push(path);
  };
  
  // Navigate to a specific organization profile using username instead of ID
  const navigateToOrg = (org: { id: string | null, username?: string | null, name: string }) => {
    // Check if user is authenticated before navigating
    if (!user) {
      onClose();
      router.push('/onboarding');
      return;
    }
    
    onClose();
    
    // Use username if available, otherwise fallback to ID
    if (org.username) {
      router.push(`/${org.username}`);
    } else if (org.id) {
      router.push(`/${org.id}`);
    }
  };
  
  // If drawer is not open, don't render
  if (!isOpen) return null;
  
  // Filter out organizations with null IDs and deduplicate by ID
  const validOrganizations = organizations.filter(
    item => typeof item.organization.id === 'string' && item.organization.id !== null
  );
  
  // Get user display info from either auth user or localStorage
  const userName = user?.displayName || storedUserData?.displayName || 
                  (storedUserData?.firstName && `${storedUserData.firstName} ${storedUserData.lastName || ''}`) || 
                  user?.email || 'Profile';
  
  const userPhotoURL = user?.photoURL || storedUserData?.photoURL;
  const userInitial = (userName !== 'Profile' ? userName.charAt(0) : 'U');
  
  // For debugging
  console.log('User info:', { userName, userPhotoURL, user, storedUserData });
  console.log('Orgs count:', validOrganizations.length);
  
  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop - semi-transparent overlay */}
      <div 
        className="absolute inset-0 bg-black/70 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Drawer panel */}
      <div className="relative h-full w-4/5 max-w-sm bg-[#1D1D1D] overflow-y-auto pb-16">
        {/* Close button */}
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={onClose}
            className="text-white p-2"
            aria-label="Close navigation"
          >
            <DirectSVG 
              icon="xmark"
              size={24}
              style={SVGIconStyle.SOLID}
              primaryColor="ffffff"
            />
          </button>
        </div>
        
        {/* Main navigation */}
        <nav className="py-4 mt-4">
          <ul>
            {/* Home */}
            <li>
              <button 
                onClick={() => navigateTo('/home')}
                className="w-full flex items-center py-3 px-6 text-white"
              >
                <span className="mr-5">
                  <DirectSVG 
                    icon="house-blank"
                    size={20}
                    style={SVGIconStyle.SOLID}
                    primaryColor="ffffff"
                  />
                </span>
                <span className="text-base font-marfa">Home</span>
              </button>
            </li>
            
            {/* Explore */}
            <li>
              <button 
                onClick={() => navigateTo('/explore')}
                className="w-full flex items-center py-3 px-6 text-white"
              >
                <span className="mr-5">
                  <DirectSVG 
                    icon="magnifying-glass"
                    size={20}
                    style={SVGIconStyle.SOLID}
                    primaryColor="ffffff"
                  />
                </span>
                <span className="text-base font-marfa">Explore</span>
              </button>
            </li>
            
            {/* Community */}
            <li>
              <button 
                onClick={() => navigateTo('/community')}
                className="w-full flex items-center py-3 px-6 text-white"
              >
                <span className="mr-5">
                  <DirectSVG 
                    icon="comments"
                    size={20}
                    style={SVGIconStyle.SOLID}
                    primaryColor="ffffff"
                  />
                </span>
                <span className="text-base font-marfa">Community</span>
              </button>
            </li>
            
            {/* Notifications */}
            <li>
              <button 
                onClick={() => navigateTo('/notifications')}
                className="w-full flex items-center py-3 px-6 text-white"
              >
                <span className="mr-5">
                  <DirectSVG 
                    icon="bells"
                    size={20}
                    style={SVGIconStyle.SOLID}
                    primaryColor="ffffff"
                  />
                </span>
                <span className="text-base font-marfa">Notifications</span>
              </button>
            </li>
            
            {/* Settings */}
            <li>
              <button 
                onClick={() => navigateTo('/settings')}
                className="w-full flex items-center py-3 px-6 text-white"
              >
                <span className="mr-5">
                  <DirectSVG 
                    icon="gear"
                    size={20}
                    style={SVGIconStyle.SOLID}
                    primaryColor="ffffff"
                  />
                </span>
                <span className="text-base font-marfa">Settings</span>
              </button>
            </li>
          </ul>
        </nav>
        
        {/* Organizations Section */}
        <div className="pt-4 pb-20">
          <h3 className="px-6 mb-3 text-gray-400 text-sm font-marfa">Your organizations</h3>
          
          {orgsLoading ? (
            <div className="px-6 py-4 flex justify-center">
              <div className="w-6 h-6 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : validOrganizations.length > 0 ? (
            <ul>
              {validOrganizations.map(({ organization, relationship }) => (
                <li key={`${organization.id}-${relationship.id}`}>
                  <button 
                    onClick={() => navigateToOrg(organization)}
                    className="w-full flex items-center py-2 px-6 text-white"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 mr-3 flex-shrink-0">
                      {organization.photoURL ? (
                        <img 
                          src={organization.photoURL} 
                          alt={organization.name || 'Organization'} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-sm">
                          {(organization.name || 'U').charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="text-base font-marfa truncate text-gray-300">{organization.name || 'Unknown Organization'}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-6 text-gray-500 text-sm">You don't have any organizations yet.</p>
          )}
        </div>
        
        {/* User profile link (sticky at bottom) */}
        {(user || storedUserData) && (
          <>
            {/* Divider line - Adjust color if needed */}
            <div className="border-t border-gray-700 fixed bottom-[calc(3.5rem)] left-0 w-4/5 max-w-sm z-10"></div> 
            
            {/* Sticky container with new background and text color */}
            <div className="fixed bottom-0 left-0 bg-gray-200 z-10 w-4/5 max-w-sm h-16"> 
              <button 
                onClick={() => {
                  // Check authentication before navigating to profile
                  if (!user) {
                    onClose();
                    router.push('/onboarding');
                  } else {
                    navigateTo('/profile');
                  }
                }}
                className="w-full h-full flex items-center py-4 px-6"
              >
                {/* Profile Picture */}
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 mr-3 flex-shrink-0">
                  {userPhotoURL ? (
                    <img 
                      src={userPhotoURL}
                      alt={userName} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.warn('Error loading profile image in drawer:', userPhotoURL);
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                      {userInitial}
                    </div>
                  )}
                </div>
                {/* User Name */}
                <span className="text-base font-marfa text-black">{userName}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NavigationDrawer; 