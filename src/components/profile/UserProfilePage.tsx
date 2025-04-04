import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useUserOrganizations } from '@/lib/hooks/useUserOrganizations';
import { usePostBoosts } from '@/lib/hooks/usePostBoosts';
// import useUserProfileData from '@/lib/hooks/useUserProfileData'; // TODO: Create this hook
import ProfileHeader from './ProfileHeader'; // TODO: Create this component
import ProfileBio from './ProfileBio'; // TODO: Create this component
import OrganizationsSection from './OrganizationsSection'; // TODO: Create this component
import BoostedPostsSection from './BoostedPostsSection'; // TODO: Create this component
import { useRouter } from 'next/router';
import { DirectSVG } from '@/lib/components/icons'; // Assuming DirectSVG is available
import { SVGIconStyle } from '@/lib/components/icons/SVGIcon'; // Assuming SVGIconStyle is available
import { CollectiveUser, UserType } from '@/lib/models/User'; // Import UserType from User.ts
import NavigationDrawer from '../NavigationDrawer'; // Add NavigationDrawer import
import OrganizationsListScreen from './OrganizationsListScreen';

// TODO: Replace with actual hook/service later
const useUserProfileData = (uid: string | undefined): { userData: CollectiveUser | null, loading: boolean, error: Error | null } => {
  // Placeholder implementation
  const [userData, setUserData] = useState<CollectiveUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      setUserData(null);
      return;
    }
    // Simulate fetching data
    console.log(`[UserProfilePage] Faking fetch for UID: ${uid}`);
    setTimeout(() => {
      setUserData({
        id: uid,
        displayName: `${'Malik'} ${'Epps'}`, // Construct from first/last
        email: 'placeholder@example.com', // Placeholder
        phoneNumber: '+16785754730', // Placeholder
        type: UserType.INDIVIDUAL, // Default enum value
        createdAt: new Date(), // Placeholder
        isOnboarded: true, // Placeholder
        hasSetUpOrganization: false, // Placeholder
        isSuperUser: false, // Placeholder
        firstName: 'Malik',
        lastName: 'Epps',
        username: 'malikepps',
        // Use a placeholder format similar to configured domains, though this specific URL might not exist
        photoURL: 'https://firebasestorage.googleapis.com/v0/b/collective-rp8rwq.appspot.com/o/users%2Fplaceholder.jpg?alt=media', 
        bio: 'This is a sample bio. It can be multiple lines long and supports basic text formatting.',
        city: 'Durham',
        state: 'NC',
        zipCode: '27705', // Updated zip from image
        communityDisplayName: null, // Or 'Community Name'
      });
      setLoading(false);
    }, 1000);
  }, [uid]);

  return { userData, loading, error };
};


const UserProfilePage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // Fetch detailed user profile data
  const { userData, loading: profileLoading, error: profileError } = useUserProfileData(user?.uid);
  
  // Fetch user's organizations
  const { organizations, loading: orgsLoading, error: orgsError } = useUserOrganizations();
  
  // Fetch user's boosted posts
  // Using boosts here, assuming it fetches Post objects or similar structure needed for PostCard
  const { boosts, loading: boostsLoading, error: boostsError } = usePostBoosts(); 
  
  const [scrollOffset, setScrollOffset] = useState(0);
  
  // State and handler for Edit Bio Sheet (placeholder)
  const [showEditBioSheet, setShowEditBioSheet] = useState(false);
  const handleEditBio = () => {
    console.log('Opening Edit Bio Sheet...');
    setShowEditBioSheet(true);
    // Later, this will actually open the modal/sheet
  };

  // State and handler for Organizations Full Screen Cover (placeholder)
  const [showOrganizationsCover, setShowOrganizationsCover] = useState(false);
  const handleViewAllOrgs = () => {
    console.log('Opening Organizations Full Screen Cover...');
    setShowOrganizationsCover(true);
    // Later, this will actually open the cover
  };
  const handleCloseOrganizationsCover = () => {
    console.log('Opening Organizations Full Screen Cover...');
    setShowOrganizationsCover(true);
    // Later, this will actually open the cover
  };

  // State and handlers for Navigation Drawer
  const [showNavigationDrawer, setShowNavigationDrawer] = useState(false);
  const handleOpenNavigationDrawer = () => {
    setShowNavigationDrawer(true);
  };
  const handleCloseNavigationDrawer = () => {
    setShowOrganizationsCover(true);
    // Later, this will actually open the cover
  };

  // --- Scroll Handling for Nav Bar Opacity ---
  useEffect(() => {
    const handleScroll = () => {
      setScrollOffset(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Make sure opacity calculation is safe even if scrollOffset is negative (unlikely but possible)
  const navBarOpacity = Math.max(0, scrollOffset) < 50 ? Math.min(0.8, Math.max(0, scrollOffset) / 100) : 0.8;
  // --- End Scroll Handling ---

  const isLoading = authLoading || profileLoading || orgsLoading || boostsLoading;
  const hasError = profileError || orgsError || boostsError;

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white">
        Loading profile...
      </div>
    );
  }
  
  // Handle error state
  if (hasError || !user || !userData) {
     console.error('Profile Errors:', { profileError, orgsError, boostsError });
     return (
       <div className="flex flex-col justify-center items-center min-h-screen bg-black text-white">
         <p>Error loading profile.</p>
         <button onClick={() => router.reload()} className="mt-4 px-4 py-2 bg-blue-600 rounded">Retry</button>
       </div>
     );
  }

  const handleBack = () => {
    // Check if there's history to go back to, otherwise go home
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/home'); // Fallback route
    }
  };

  const handleSettings = () => {
    router.push('/settings'); // Or '/settings/profile' - adjust as needed
  };

  return (
    <div className="min-h-screen bg-black text-white pb-16"> {/* Add padding-bottom for potential bottom nav */}
      
      {/* --- Navigation Bar --- */}
      <div 
        className="fixed top-0 left-0 right-0 z-40 h-16 flex items-center justify-between px-4 transition-colors duration-200"
        style={{ backgroundColor: `rgba(0, 0, 0, ${navBarOpacity})` }}
      >
        {/* Back Button -> Menu Button */}
        <button onClick={handleOpenNavigationDrawer} className="p-2">
          <DirectSVG 
            icon="bars" 
            size={24} 
            style={SVGIconStyle.SOLID} 
            primaryColor="ffffff" 
          />
        </button>
        
        {/* Title */}
        <h1 className="text-lg font-marfa font-semibold">
          @{userData.username || 'Profile'}
        </h1>
        
        {/* Settings Button */}
        <button onClick={handleSettings} className="p-2">
           <DirectSVG 
             icon="gear" 
             size={22} 
             style={SVGIconStyle.SOLID} 
             primaryColor="ffffff" 
           />
        </button>
      </div>
      {/* --- End Navigation Bar --- */}

      {/* --- Main Content Area --- */}
      <div className="pt-16"> {/* Add padding-top to avoid content starting under the fixed nav bar */}
        <div className="container mx-auto px-0 flex flex-col space-y-2"> {/* Reduced spacing */}
          
          {/* Profile Header Component */}
          <ProfileHeader userData={userData} />

          {/* Profile Bio Component */}
          <ProfileBio bio={userData.bio} onEdit={handleEditBio} />

          {/* Organizations Section Component */}
          <OrganizationsSection 
            organizations={organizations} 
            onViewAll={handleViewAllOrgs} 
          />

          {/* Boosted Posts Section Component */}
          <div className="mx-4"> {/* Add margin to match other sections */}
            <BoostedPostsSection boosts={boosts} />
          </div>

        </div>
      </div>
      {/* --- End Main Content Area --- */}

      {/* TODO: Add FullScreenCover for Organizations */}
      {/* TODO: Add Sheet/Modal for Edit Bio */}
      
      {/* Navigation drawer */}
      <NavigationDrawer 
        isOpen={showNavigationDrawer}
        onClose={handleCloseNavigationDrawer}
      />

      {/* Organizations Full Screen Cover */}
      <OrganizationsListScreen 
        isOpen={showOrganizationsCover}
        onClose={handleCloseOrganizationsCover}
        // Pass organizations data here when list is implemented
      />
    </div>
  );
};

export default UserProfilePage; 