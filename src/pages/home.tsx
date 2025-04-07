import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useHomeFeed, FeedItem } from '@/hooks/useHomeFeed';
import PostCard from '@/components/post/PostCard';
import NavigationDrawer from '@/components/NavigationDrawer';
import DirectSVG from '@/lib/components/icons/DirectSVG';
import { SVGIconStyle } from '@/lib/components/icons/SVGIcon';
import PostDetail from '@/components/post/PostDetail';
import { Post } from '@/lib/models/Post';
import { usePostReactions } from '@/lib/hooks/usePostReactions';
import { usePostBoosts } from '@/lib/hooks/usePostBoosts';

export default function HomePage() {
  const { feedItems, loading, error, fetchFeed } = useHomeFeed();
  const [showNavigationDrawer, setShowNavigationDrawer] = useState(false);
  const [showProximityDropdown, setShowProximityDropdown] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const mainScrollRef = useRef<HTMLElement>(null);
  const [selectedPostItem, setSelectedPostItem] = useState<FeedItem | null>(null);
  
  const { isPostLiked, toggleLike } = usePostReactions();
  const { isPostBoosted, toggleBoost } = usePostBoosts();

  useEffect(() => {
    const mainEl = mainScrollRef.current;
    if (!mainEl) return;

    const handleScroll = () => {
      setScrollOffset(mainEl.scrollTop);
    };

    mainEl.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      mainEl.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleOpenNavigationDrawer = () => {
    setShowNavigationDrawer(true);
  };

  const handleCloseNavigationDrawer = () => {
    setShowNavigationDrawer(false);
  };

  const handleShowDetail = (item: FeedItem) => {
    console.log(`Opening detail for post ${item.post.id}`);
    setSelectedPostItem(item);
  };

  const handleCloseDetail = () => {
    setSelectedPostItem(null);
  };

  const headerBgOpacity = Math.min(0.8, scrollOffset / 50);
  const headerBlur = Math.min(8, scrollOffset / 10);

  return (
    <>
      <Head>
        <title>Collective | Community</title>
        <meta name="description" content="Collective - Your community updates feed" />
        <style jsx global>{`
          ::-webkit-scrollbar {
            display: none;
          }
          * {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          body {
            background-color: #111214;
            overscroll-behavior: none;
          }
          .video-player-wrapper video {
            object-fit: cover !important;
            width: 100% !important;
            height: 100% !important;
          }
        `}</style>
      </Head>

      <div className="min-h-screen bg-[#111214] flex flex-col h-screen overflow-hidden">

        <header
          className="pt-safe-top sticky top-0 z-20 px-4 h-[56px] flex items-center justify-between transition-colors duration-200"
          style={{
            backgroundColor: `rgba(17, 18, 20, ${headerBgOpacity})`,
            backdropFilter: `blur(${headerBlur}px)`,
            WebkitBackdropFilter: `blur(${headerBlur}px)`,
          }}
        >
          <button
            onClick={handleOpenNavigationDrawer}
            className="flex items-center justify-center p-2 -ml-2"
            aria-label="Open navigation menu"
          >
            <DirectSVG
              icon="bars"
              size={22}
              style={SVGIconStyle.SOLID}
              primaryColor="ffffff"
            />
          </button>

          <h1 className="text-white text-xl font-marfa font-medium absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            Community
          </h1>

          <button
            onClick={() => setShowProximityDropdown(!showProximityDropdown)}
            className="flex items-center space-x-1 bg-white bg-opacity-10 rounded-full px-3 py-1 text-sm"
            aria-label="Select proximity filter"
          >
            <span className="text-white opacity-80 font-marfa">10 mi.</span>
            <DirectSVG
              icon="chevron-down"
              size={12}
              style={SVGIconStyle.SOLID}
              primaryColor="ffffffcc"
            />
            {showProximityDropdown && (
              <div className="absolute top-full right-0 mt-2 w-32 bg-gray-800 rounded-md shadow-lg z-30 p-2 text-white text-xs">
                Dropdown Placeholder
              </div>
            )}
          </button>
        </header>

        <main ref={mainScrollRef} className="flex-1 overflow-y-auto px-4 pt-2 pb-safe-bottom scroll-smooth">
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
              {feedItems.map((item) => {
                const liked = isPostLiked(item.post.id);
                const boosted = isPostBoosted(item.post.id);
                
                return (
                  <PostCard
                    key={item.post.id}
                    post={item.post}
                    organization={item.organization}
                    isUserMember={false}
                    isUserStaff={false}
                    isLiked={liked}
                    isBoosted={boosted}
                    onToggleLike={() => toggleLike(item.post.id)}
                    onToggleBoost={() => toggleBoost(item.post)}
                    onShowDetail={() => handleShowDetail(item)}
                    showOrganizationHeader={true}
                  />
                );
              })}
            </div>
          )}
        </main>

        <NavigationDrawer
          isOpen={showNavigationDrawer}
          onClose={handleCloseNavigationDrawer}
        />

        {selectedPostItem && (
          <PostDetail 
            post={selectedPostItem.post} 
            organization={selectedPostItem.organization} 
            isUserMember={false}
            isUserStaff={false}
            isLiked={isPostLiked(selectedPostItem.post.id)} 
            isBoosted={isPostBoosted(selectedPostItem.post.id)} 
            onToggleLike={() => toggleLike(selectedPostItem.post.id)} 
            onToggleBoost={() => toggleBoost(selectedPostItem.post)} 
            onClose={handleCloseDetail}
          /> 
        )}
      </div>
    </>
  );
} 