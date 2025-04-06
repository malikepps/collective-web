import React, { useState } from 'react';
import Head from 'next/head';
import { useHomeFeed, FeedItem } from '@/hooks/useHomeFeed';
import PostCard from '@/components/post/PostCard';
import NavigationDrawer from '@/components/NavigationDrawer';
import DirectSVG from '@/lib/components/icons/DirectSVG';
import { SVGIconStyle } from '@/lib/components/icons/SVGIcon';

export default function HomePage() {
  const { feedItems, loading, error, fetchFeed } = useHomeFeed();
  const [showNavigationDrawer, setShowNavigationDrawer] = useState(false);
  const [showProximityDropdown, setShowProximityDropdown] = useState(false); // Placeholder state

  const handleOpenNavigationDrawer = () => {
    setShowNavigationDrawer(true);
  };

  const handleCloseNavigationDrawer = () => {
    setShowNavigationDrawer(false);
  };

  // Placeholder function for toggling like state
  const handleToggleLike = (postId: string) => {
    console.log(`TODO: Toggle like for post ${postId}`);
    // Add actual like logic here, possibly updating state in useHomeFeed or a separate context
  };

  // Placeholder function for toggling boost state
  const handleToggleBoost = (postId: string) => {
    console.log(`TODO: Toggle boost for post ${postId}`);
    // Add actual boost logic here
  };

  // Placeholder function for showing post detail
  const handleShowDetail = (postId: string) => {
    console.log(`TODO: Show detail for post ${postId}`);
    // Navigate to post detail page or show modal
  };

  return (
    <>
      <Head>
        <title>Collective | Community</title>
        <meta name="description" content="Collective - Your community updates feed" />
        {/* Add global styles if needed, e.g., for hiding scrollbars */}
        <style jsx global>{`
          /* Example: Hide scrollbar */
          ::-webkit-scrollbar {
            display: none;
          }
          * {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;     /* Firefox */
          }
          body {
            background-color: #111214; /* Match iOS dark background */
            overscroll-behavior: none; /* Prevent pull-to-refresh/overscroll effects */
          }
        `}</style>
      </Head>

      {/* Main container matching iOS dark background */}
      <div className="min-h-screen bg-[#111214] flex flex-col">

        {/* Header matching iOS */}
        <header className="bg-transparent pt-safe-top sticky top-0 z-20 px-4 h-[56px] flex items-center justify-between">
          {/* Left: Menu Button */}
          <button
            onClick={handleOpenNavigationDrawer}
            className="flex items-center justify-center p-2 -ml-2" // Adjust padding/margin for hit area
            aria-label="Open navigation menu"
          >
            <DirectSVG
              icon="bars"
              size={22} // Slightly smaller to match design
              style={SVGIconStyle.SOLID}
              primaryColor="ffffff"
            />
          </button>

          {/* Center: Title */}
          <h1 className="text-white text-lg font-marfa font-medium absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            Community
          </h1>

          {/* Right: Proximity Filter (Placeholder) */}
          <button
            onClick={() => setShowProximityDropdown(!showProximityDropdown)} // Toggle placeholder dropdown state
            className="flex items-center space-x-1 bg-white bg-opacity-10 rounded-full px-3 py-1 text-sm"
            aria-label="Select proximity filter"
          >
            <span className="text-white opacity-80 font-marfa">10 mi.</span>
            <DirectSVG
              icon="chevron-down" // Use a chevron icon
              size={12}
              style={SVGIconStyle.SOLID}
              primaryColor="ffffffcc" // White with opacity
            />
            {/* Basic Dropdown Placeholder - Replace with actual implementation */}
            {showProximityDropdown && (
              <div className="absolute top-full right-0 mt-2 w-32 bg-gray-800 rounded-md shadow-lg z-30 p-2 text-white text-xs">
                Dropdown Placeholder
              </div>
            )}
          </button>
        </header>

        {/* Feed Content Area */}
        <main className="flex-1 overflow-y-auto px-4 pt-2 pb-safe-bottom">
          {loading && (
            <div className="flex justify-center items-center h-40">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-10 text-red-500">
              <p>Error loading feed: {error.message}</p>
              <button onClick={fetchFeed} className="mt-2 px-4 py-1 bg-blue-600 text-white rounded">Try Again</button>
            </div>
          )}

          {!loading && !error && feedItems.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              <p className="font-marfa text-lg mb-2">No posts yet</p>
              <p className="text-sm">Follow communities to see their updates here.</p>
            </div>
          )}

          {!loading && !error && feedItems.length > 0 && (
            <div className="space-y-4">
              {feedItems.map((item) => (
                <PostCard
                  key={item.post.id}
                  post={item.post}
                  organization={item.organization}
                  // Pass actual relationship status if available, otherwise defaults
                  isUserMember={false} // Placeholder - Get from useUserOrganizationRelationship if needed
                  isUserStaff={false}  // Placeholder - Get from useUserOrganizationRelationship if needed
                  isLiked={item.isLiked} // Placeholder
                  isBoosted={item.isBoosted} // Placeholder
                  onToggleLike={() => handleToggleLike(item.post.id)}
                  onToggleBoost={() => handleToggleBoost(item.post.id)}
                  onShowDetail={() => handleShowDetail(item.post.id)}
                  // onDeletePost prop - only needed if staff can delete from home feed
                  showOrganizationHeader={true} // Explicitly show header on home feed
                />
              ))}
              {/* Add "Caught Up" message or loading indicator for pagination later */}
            </div>
          )}
        </main>

        {/* Navigation Drawer */}
        <NavigationDrawer
          isOpen={showNavigationDrawer}
          onClose={handleCloseNavigationDrawer}
        />

        {/* Bottom Nav Placeholder - Assuming this is handled globally or removed for web */}
        {/* <div className="bg-[#1D1D1D] border-t border-gray-800 py-3 px-4 sticky bottom-0">
          ... bottom nav buttons ...
        </div> */}
      </div>
    </>
  );
} 