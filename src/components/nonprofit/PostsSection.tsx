import React, { useState, useEffect } from 'react';
import { Organization } from '@/lib/models/Organization';
import { usePosts } from '@/lib/hooks/usePosts';
import { usePostReactions } from '@/lib/hooks/usePostReactions';
import { usePostBoosts } from '@/lib/hooks/usePostBoosts';
import { Post } from '@/lib/models/Post';
import PostCard from '../post/PostCard';
import PostDetail from '../post/PostDetail';
import { DirectFontAwesome } from '@/lib/components/icons';
import { useTheme } from '@/lib/context/ThemeContext';

interface PostsSectionProps {
  organization: Organization;
  displayFilter: string;
  isUserMember: boolean;
  isUserStaff: boolean;
  onShowMembershipOptions?: () => void;
}

export default function PostsSection({ 
  organization, 
  displayFilter,
  isUserMember,
  isUserStaff,
  onShowMembershipOptions
}: PostsSectionProps) {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedTab, setSelectedTab] = useState<'regular' | 'membersOnly'>('regular');
  const { getTheme } = useTheme();
  const theme = organization.themeId ? getTheme(organization.themeId) : undefined;
  
  const secondaryColor = theme?.secondaryColor ? 
    (theme.secondaryColor.startsWith('#') ? theme.secondaryColor : `#${theme.secondaryColor}`) : 
    '#ADD3FF';
  
  // Get posts with the current filter
  const { posts: regularPosts, loading: regularLoading, error: regularError, deletePost } = usePosts(organization.id, {
    filterOption: displayFilter as 'all' | 'members' | 'media'
  });
  
  // Get members-only posts specifically
  const { posts: memberPosts, loading: memberLoading, error: memberError } = usePosts(organization.id, {
    filterOption: 'members'
  });
  
  // Determine which posts to display based on selected tab
  const posts = selectedTab === 'regular' ? regularPosts : memberPosts;
  const loading = selectedTab === 'regular' ? regularLoading : memberLoading;
  const error = selectedTab === 'regular' ? regularError : memberError;
  
  // Debug logs for posts
  useEffect(() => {
    console.log(`[DEBUG] PostsSection - Organization: ${organization.name} (${organization.id})`);
    console.log(`[DEBUG] Regular posts count: ${regularPosts.length}`);
    if (regularPosts.length > 0) {
      console.log('[DEBUG] Regular posts IDs:', regularPosts.map(p => p.id));
      console.log('[DEBUG] First regular post:', regularPosts[0]);
    }
    console.log(`[DEBUG] Member posts count: ${memberPosts.length}`);
    console.log(`[DEBUG] Current tab: ${selectedTab}, Display filter: ${displayFilter}`);
    console.log(`[DEBUG] User is member: ${isUserMember}, User is staff: ${isUserStaff}`);
  }, [regularPosts, memberPosts, selectedTab, organization, displayFilter, isUserMember, isUserStaff]);
  
  // Add effect to log when tab changes
  useEffect(() => {
    console.log(`[DEBUG] Tab changed to: ${selectedTab}`);
    const currentPosts = selectedTab === 'regular' ? regularPosts : memberPosts;
    console.log(`[DEBUG] Current posts for tab (${selectedTab}):`, currentPosts.length);
  }, [selectedTab, regularPosts, memberPosts]);
  
  // Get reactions (likes)
  const { isPostLiked, toggleLike } = usePostReactions();
  
  // Get boosts
  const { isPostBoosted, toggleBoost } = usePostBoosts();
  
  // Handle post deletion
  const handleDeletePost = async (post: Post) => {
    try {
      await deletePost(post);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };
  
  // Handle if user can view member posts
  const canViewMemberPosts = isUserMember || isUserStaff;
  
  // Render blurred member post placeholder for non-members
  const renderBlurredMemberPost = () => (
    <div className="bg-[#2C2C2E] rounded-xl overflow-hidden">
      <div className="relative">
        <div className="aspect-video bg-[#3A3A3C] blur-sm flex items-center justify-center">
          <DirectFontAwesome
            icon="lock"
            size={40}
            color="#ffffff99"
          />
        </div>
        
        {/* Overlay with lock icon and message */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 p-4 text-center">
          <h3 className="font-semibold text-lg text-white mb-2">Member-Only Content</h3>
          <p className="text-sm text-white/80 mb-4">Become a member to unlock</p>
          <button 
            className="bg-white text-black px-6 py-2 rounded-lg font-medium"
            onClick={onShowMembershipOptions}
          >
            Join
          </button>
        </div>
      </div>
      
      {/* Blurred text */}
      <div className="p-4">
        <div className="h-3 bg-white/20 rounded w-3/4 blur-sm mb-2"></div>
        <div className="h-3 bg-white/15 rounded w-1/2 blur-sm"></div>
      </div>
    </div>
  );
  
  // No posts yet state
  if (!loading && posts.length === 0) {
    return (
      <div className="bg-card p-4 text-white mt-1 continuous-corner">
        {/* Tabs */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-2xl">Posts</h2>
          
          {/* Tab switcher with updated design */}
          <div className="flex items-center space-x-1">
            <button 
              className={`py-1.5 px-4 ios-rounded-sm transition-all duration-200 ${
                selectedTab === 'regular' 
                  ? 'bg-white/20 text-white'
                  : 'hover:bg-white/10'
              }`}
              style={selectedTab !== 'regular' ? { color: secondaryColor } : {}}
              onClick={() => setSelectedTab('regular')}
            >
              Feed
            </button>
            <button 
              className={`py-1.5 px-4 ios-rounded-sm transition-all duration-200 ${
                selectedTab === 'membersOnly' 
                  ? 'bg-white/20 text-white'
                  : 'hover:bg-white/10'
              }`}
              style={selectedTab !== 'membersOnly' ? { color: secondaryColor } : {}}
              onClick={() => setSelectedTab('membersOnly')}
            >
              ✨ Members
            </button>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center h-32 text-center">
          <div className="mb-3">
            <DirectFontAwesome
              icon="photo-film"
              size={32}
              color="#ffffff50"
            />
          </div>
          <p className="text-white/50">
            {selectedTab === 'regular' 
              ? 'No posts yet' 
              : 'No member posts yet'}
          </p>
          {isUserStaff && (
            <p className="text-blue-400 text-sm mt-2">
              Create a post to share with your community
            </p>
          )}
        </div>
      </div>
    );
  }
  
  // Loading state
  if (loading) {
    return (
      <div className="bg-card p-4 text-white mt-1 continuous-corner">
        {/* Tabs */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-2xl">Posts</h2>
          
          {/* Tab switcher with updated design */}
          <div className="flex items-center space-x-1">
            <button 
              className={`py-1.5 px-4 ios-rounded-sm transition-all duration-200 ${
                selectedTab === 'regular' 
                  ? 'bg-white/20 text-white'
                  : 'hover:bg-white/10'
              }`}
              style={selectedTab !== 'regular' ? { color: secondaryColor } : {}}
              onClick={() => setSelectedTab('regular')}
            >
              Feed
            </button>
            <button 
              className={`py-1.5 px-4 ios-rounded-sm transition-all duration-200 ${
                selectedTab === 'membersOnly' 
                  ? 'bg-white/20 text-white'
                  : 'hover:bg-white/10'
              }`}
              style={selectedTab !== 'membersOnly' ? { color: secondaryColor } : {}}
              onClick={() => setSelectedTab('membersOnly')}
            >
              ✨ Members
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="bg-card p-4 text-white mt-1 continuous-corner">
        {/* Tabs */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-2xl">Posts</h2>
          
          {/* Tab switcher with updated design */}
          <div className="flex items-center space-x-1">
            <button 
              className={`py-1.5 px-4 ios-rounded-sm transition-all duration-200 ${
                selectedTab === 'regular' 
                  ? 'bg-white/20 text-white'
                  : 'hover:bg-white/10'
              }`}
              style={selectedTab !== 'regular' ? { color: secondaryColor } : {}}
              onClick={() => setSelectedTab('regular')}
            >
              Feed
            </button>
            <button 
              className={`py-1.5 px-4 ios-rounded-sm transition-all duration-200 ${
                selectedTab === 'membersOnly' 
                  ? 'bg-white/20 text-white'
                  : 'hover:bg-white/10'
              }`}
              style={selectedTab !== 'membersOnly' ? { color: secondaryColor } : {}}
              onClick={() => setSelectedTab('membersOnly')}
            >
              ✨ Members
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-center h-32 text-center">
          <p className="text-red-400">Error loading posts. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card p-4 text-white mt-1 continuous-corner">
      {/* Tabs */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold text-2xl">Posts</h2>
        
        {/* Tab switcher with updated design */}
        <div className="flex items-center space-x-1">
          <button 
            className={`py-1.5 px-4 ios-rounded-sm transition-all duration-200 ${
              selectedTab === 'regular' 
                ? 'bg-white/20 text-white'
                : 'hover:bg-white/10'
            }`}
            style={selectedTab !== 'regular' ? { color: secondaryColor } : {}}
            onClick={() => setSelectedTab('regular')}
          >
            Feed
          </button>
          <button 
            className={`py-1.5 px-4 ios-rounded-sm transition-all duration-200 ${
              selectedTab === 'membersOnly' 
                ? 'bg-white/20 text-white'
                : 'hover:bg-white/10'
            }`}
            style={selectedTab !== 'membersOnly' ? { color: secondaryColor } : {}}
            onClick={() => setSelectedTab('membersOnly')}
          >
            ✨ Members
          </button>
        </div>
      </div>
      
      {/* Posts List */}
      <div className="space-y-4">
        {selectedTab === 'membersOnly' && !canViewMemberPosts ? (
          // Show blurred content for non-members when viewing members tab
          <>
            {Array(Math.min(3, memberPosts.length || 3)).fill(0).map((_, i) => (
              <div key={`blurred-${i}`} className="mb-4">
                {renderBlurredMemberPost()}
              </div>
            ))}
            
            {(memberPosts.length > 3 || true) && (
              <p className="text-center text-gray-400 text-sm">
                + more posts
              </p>
            )}
          </>
        ) : (
          // Show actual posts
          posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              organization={organization}
              isUserMember={isUserMember}
              isUserStaff={isUserStaff}
              isLiked={isPostLiked(post.id)}
              isBoosted={isPostBoosted(post.id)}
              onToggleLike={() => toggleLike(post.id)}
              onToggleBoost={() => toggleBoost(post)}
              onShowDetail={() => setSelectedPost(post)}
              onDeletePost={() => handleDeletePost(post)}
            />
          ))
        )}
      </div>
      
      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetail
          post={selectedPost}
          organization={organization}
          isUserMember={isUserMember}
          isUserStaff={isUserStaff}
          isLiked={isPostLiked(selectedPost.id)}
          isBoosted={isPostBoosted(selectedPost.id)}
          onToggleLike={() => toggleLike(selectedPost.id)}
          onToggleBoost={() => toggleBoost(selectedPost)}
          onClose={() => setSelectedPost(null)}
          onDeletePost={() => handleDeletePost(selectedPost)}
        />
      )}
    </div>
  );
} 