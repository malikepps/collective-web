import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/context/AuthContext';
import { useUserOrganizations } from '@/lib/hooks/useUserOrganizations';
import { DirectSVG } from '@/lib/components/icons';
import { SVGIconStyle } from '@/lib/components/icons/SVGIcon';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const NavigationDrawer: React.FC<NavigationDrawerProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { organizations, loading: orgsLoading } = useUserOrganizations();
  
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
  const navigateTo = (path: string, title?: string) => {
    // Close the drawer first
    onClose();
    
    // For placeholder pages, use the coming-soon page with a title
    if (title) {
      router.push({
        pathname: '/coming-soon',
        query: { title }
      });
      return;
    }
    
    // For implemented pages, navigate directly
    router.push(path);
  };
  
  // Navigate to a specific organization profile
  const navigateToOrg = (orgId: string) => {
    onClose();
    router.push(`/nonprofit/${orgId}`);
  };
  
  // If user is not authenticated, redirect to sign in
  useEffect(() => {
    if (!authLoading && !user && isOpen) {
      onClose();
      router.push('/onboarding');
    }
  }, [authLoading, user, isOpen, onClose, router]);
  
  // If drawer is not open, don't render
  if (!isOpen) return null;
  
  // Filter out organizations with null IDs
  const validOrganizations = organizations.filter(
    item => typeof item.organization.id === 'string' && item.organization.id !== null
  );
  
  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop - semi-transparent overlay */}
      <div 
        className="absolute inset-0 bg-black/70 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Drawer panel */}
      <div className="relative h-full w-4/5 max-w-sm bg-[#1D1D1D] overflow-y-auto">
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
        
        {/* User profile */}
        {user && (
          <div className="py-8 px-4 border-b border-gray-800">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 mr-4">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'User profile'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-xl font-marfa">
                    {user.displayName?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-white text-lg font-marfa">{user.displayName || 'User'}</h2>
                <p className="text-gray-400 text-sm">Member</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Main navigation */}
        <nav className="py-4">
          <ul>
            {/* Home */}
            <li>
              <button 
                onClick={() => navigateTo('/home')}
                className="w-full flex items-center py-4 px-6 text-white"
              >
                <span className="mr-6">
                  <DirectSVG 
                    icon="house-blank"
                    size={24}
                    style={SVGIconStyle.SOLID}
                    primaryColor="ffffff"
                  />
                </span>
                <span className="text-xl font-marfa">Home</span>
              </button>
            </li>
            
            {/* Explore */}
            <li>
              <button 
                onClick={() => navigateTo('/explore', 'Explore')}
                className="w-full flex items-center py-4 px-6 text-white"
              >
                <span className="mr-6">
                  <DirectSVG 
                    icon="magnifying-glass"
                    size={24}
                    style={SVGIconStyle.SOLID}
                    primaryColor="ffffff"
                  />
                </span>
                <span className="text-xl font-marfa">Explore</span>
              </button>
            </li>
            
            {/* Community */}
            <li>
              <button 
                onClick={() => navigateTo('/community', 'Community')}
                className="w-full flex items-center py-4 px-6 text-white"
              >
                <span className="mr-6">
                  <DirectSVG 
                    icon="comments"
                    size={24}
                    style={SVGIconStyle.SOLID}
                    primaryColor="ffffff"
                  />
                </span>
                <span className="text-xl font-marfa">Community</span>
              </button>
            </li>
            
            {/* Notifications */}
            <li>
              <button 
                onClick={() => navigateTo('/notifications', 'Notifications')}
                className="w-full flex items-center py-4 px-6 text-white"
              >
                <span className="mr-6">
                  <DirectSVG 
                    icon="bells"
                    size={24}
                    style={SVGIconStyle.SOLID}
                    primaryColor="ffffff"
                  />
                </span>
                <span className="text-xl font-marfa">Notifications</span>
              </button>
            </li>
            
            {/* Settings */}
            <li>
              <button 
                onClick={() => navigateTo('/settings', 'Settings')}
                className="w-full flex items-center py-4 px-6 text-white"
              >
                <span className="mr-6">
                  <DirectSVG 
                    icon="gear"
                    size={24}
                    style={SVGIconStyle.SOLID}
                    primaryColor="ffffff"
                  />
                </span>
                <span className="text-xl font-marfa">Settings</span>
              </button>
            </li>
          </ul>
        </nav>
        
        {/* Organizations Section */}
        <div className="pt-4 pb-20 border-t border-gray-800">
          <h3 className="px-6 mb-4 text-gray-400 text-lg font-marfa">Your organizations</h3>
          
          {orgsLoading ? (
            <div className="px-6 py-4 flex justify-center">
              <div className="w-6 h-6 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : validOrganizations.length > 0 ? (
            <ul>
              {validOrganizations.map(({ organization, relationship }) => (
                <li key={organization.id}>
                  <button 
                    onClick={() => navigateToOrg(organization.id as string)}
                    className="w-full flex items-center py-3 px-6 text-white"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 mr-4 flex-shrink-0">
                      {organization.imageUrl ? (
                        <img 
                          src={organization.imageUrl} 
                          alt={organization.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white">
                          {organization.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="text-lg font-marfa truncate">{organization.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-6 text-gray-500">You don't have any organizations yet.</p>
          )}
        </div>
        
        {/* User profile link (sticky at bottom) */}
        {user && (
          <div className="absolute bottom-0 left-0 right-0 border-t border-gray-800 bg-[#1D1D1D]">
            <button 
              onClick={() => navigateTo('/profile', 'Profile')}
              className="w-full flex items-center py-4 px-6 text-white"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 mr-4">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'User profile'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    {user.displayName?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <span className="text-lg font-marfa">{user.displayName || 'Profile'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavigationDrawer; 