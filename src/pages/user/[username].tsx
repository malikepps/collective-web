import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useUserOrganizations } from '@/lib/hooks/useUserOrganizations';
import { usePostBoosts } from '@/lib/hooks/usePostBoosts';
import ProfileHeader from '@/components/profile/ProfileHeader'; // Corrected path
import ProfileBio from '@/components/profile/ProfileBio';     // Corrected path
import OrganizationsSection from '@/components/profile/OrganizationsSection'; // Corrected path
import BoostedPostsSection from '@/components/profile/BoostedPostsSection'; // Corrected path
import { useRouter } from 'next/router';
import { DirectSVG } from '@/lib/components/icons'; 
import { SVGIconStyle } from '@/lib/components/icons/SVGIcon'; 
import { CollectiveUser, UserType, userFromFirestore } from '@/lib/models/User'; // Import userFromFirestore
import NavigationDrawer from '@/components/NavigationDrawer'; // Corrected path
import OrganizationsListScreen from '@/components/profile/OrganizationsListScreen'; // Corrected path
import { db } from '@/lib/firebase'; // Import db
import { collection, query, where, getDocs, limit } from 'firebase/firestore'; // Import firestore functions

// --- New Hook to fetch user data by username --- 
const useUserProfileByUsername = (username: string | undefined): { userData: CollectiveUser | null, loading: boolean, error: Error | null } => {
  const [userData, setUserData] = useState<CollectiveUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!username) {
      setLoading(false);
      setUserData(null);
      setError(new Error('Username not provided'));
      return;
    }

    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      console.log(`[User/[username]] Fetching data for username: ${username}`);
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', username), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.warn(`[User/[username]] No user found with username: ${username}`);
          setUserData(null);
          setError(new Error('User not found'));
        } else {
          const userDoc = querySnapshot.docs[0];
          const user = userFromFirestore(userDoc);
          if (user) {
            setUserData(user);
            console.log(`[User/[username]] User found:`, user);
          } else {
            console.error(`[User/[username]] Failed to parse user data for username: ${username}`);
            setUserData(null);
            setError(new Error('Failed to parse user data'));
          }
        }
      } catch (err) {
        console.error(`[User/[username]] Error fetching user data for username ${username}:`, err);
        setError(err as Error);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  return { userData, loading, error };
};
// --- End New Hook --- 

// Renamed component
const PublicUserProfilePage: React.FC = () => {
  const { user: currentUser, loading: authLoading } = useAuth(); // Renamed to currentUser for clarity
  const router = useRouter();
  const { username } = router.query; // Get username from URL

  // --- Use the new hook to fetch profile data --- 
  const { userData: viewedUserData, loading: profileLoading, error: profileError } = useUserProfileByUsername(username as string | undefined);
  
  // TODO: Decide how to handle orgs/boosts for viewed user vs current user
  // For now, fetch the *CURRENT* user's orgs/boosts as before
  const { organizations, loading: orgsLoading, error: orgsError } = useUserOrganizations();
  const { boosts, loading: boostsLoading, error: boostsError } = usePostBoosts(); 
  
  const [scrollOffset, setScrollOffset] = useState(0);
  
  // --- Remove Edit Bio state/handler --- 
  // const [showEditBioSheet, setShowEditBioSheet] = useState(false);
  // const handleEditBio = () => { ... };

  // State and handler for Organizations Full Screen Cover (Keep for now)
  const [showOrganizationsCover, setShowOrganizationsCover] = useState(false);
  const handleViewAllOrgs = () => {
    setShowOrganizationsCover(true);
  };
  const handleCloseOrganizationsCover = () => {
    setShowOrganizationsCover(false);
  };

  // State and handlers for Navigation Drawer (Keep for now, triggered by back/menu)
  const [showNavigationDrawer, setShowNavigationDrawer] = useState(false);
  const handleOpenNavigationDrawer = () => {
    setShowNavigationDrawer(true);
  };
  const handleCloseNavigationDrawer = () => {
    setShowNavigationDrawer(false);
  };

  // --- Scroll Handling (Keep) --- 
  useEffect(() => {
    const handleScroll = () => {
      setScrollOffset(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const navBarOpacity = Math.max(0, scrollOffset) < 50 ? Math.min(0.8, Math.max(0, scrollOffset) / 100) : 0.8;
  // --- End Scroll Handling --- 

  // Adjust loading state to include profileLoading from the new hook
  const isLoading = authLoading || profileLoading || orgsLoading || boostsLoading;
  // Adjust error state
  const hasError = profileError || orgsError || boostsError;

  // --- Handle loading state --- 
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white">
        Loading profile...
      </div>
    );
  }
  
  // --- Handle error state (Prioritize profile fetch error) --- 
  if (profileError || !viewedUserData) {
     console.error('Error loading viewed user profile:', { profileError, username });
     return (
       <div className="flex flex-col justify-center items-center min-h-screen bg-black text-white">
         <p>{profileError?.message || 'Error loading profile.'}</p>
         {/* Maybe a back button instead of retry? */} 
         <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-blue-600 rounded">Go Back</button>
       </div>
     );
  }
  
  // --- If other data fails, show profile but maybe indicate partial load? --- 
  if (orgsError || boostsError) {
      console.warn("Error loading organizations or boosts for current user", { orgsError, boostsError });
      // Continue rendering the profile, but these sections might be empty/show errors
  }

  // --- Back button handler --- 
  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/home'); // Fallback route
    }
  };

  // Determine if the current user is viewing their own public profile
  const isOwnProfile = currentUser?.uid === viewedUserData.id;

  return (
    <div className="min-h-screen bg-black text-white pb-16"> 
      
      {/* --- Navigation Bar: Modified --- */}
      <div 
        className="fixed top-0 left-0 right-0 z-40 h-16 flex items-center justify-between px-4 transition-colors duration-200"
        style={{ backgroundColor: `rgba(0, 0, 0, ${navBarOpacity})` }}
      >
        {/* Back Button */} 
        <button onClick={handleBack} className="p-2"> 
          <DirectSVG 
            icon="chevron-left" // Changed from bars
            size={24} 
            style={SVGIconStyle.SOLID} 
            primaryColor="ffffff" 
          />
        </button>
        
        {/* Title (Viewed User's Username) */} 
        <h1 className="text-lg font-marfa font-semibold">
          @{viewedUserData.username || 'Profile'} 
        </h1>
        
        {/* Placeholder for Right Button (Maybe ellipsis for report/block later?) */} 
        <div className="w-10 h-10"></div> 
      </div>
      {/* --- End Navigation Bar --- */}

      {/* --- Main Content Area --- */}
      <div className="pt-16"> 
        <div className="container mx-auto px-0 flex flex-col space-y-1"> 
          
          {/* Profile Header (Viewed User) */}
          <ProfileHeader userData={viewedUserData} />

          {/* Profile Bio (Viewed User) - Hide edit button */}
          <ProfileBio bio={viewedUserData.bio} /> 

          {/* TODO: Organizations Section - Shows CURRENT user's orgs for now */}
          {/* Decide if this should show viewed user's orgs or be hidden */} 
          <OrganizationsSection 
            organizations={organizations} 
            onViewAll={handleViewAllOrgs} 
          />

          {/* TODO: Boosted Posts Section - Shows CURRENT user's boosts for now */} 
          {/* Decide if this should show viewed user's boosts or be hidden */} 
          <div > 
            <BoostedPostsSection boosts={boosts} />
          </div>

        </div>
      </div>
      {/* --- End Main Content Area --- */}

      {/* --- Remove Edit Bio Sheet --- */}
      
      {/* Keep Navigation drawer (if needed for back button functionality?) Maybe remove? */} 
      {/* <NavigationDrawer 
        isOpen={showNavigationDrawer}
        onClose={handleCloseNavigationDrawer}
      /> */}

      {/* Keep Organizations List Screen (for viewing current user's orgs) */} 
      <OrganizationsListScreen 
        isOpen={showOrganizationsCover}
        onClose={handleCloseOrganizationsCover}
      />
    </div>
  );
};

export default PublicUserProfilePage; // Export the renamed component
