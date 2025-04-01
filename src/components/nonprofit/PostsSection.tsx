import React, { useState } from 'react';
import { Organization } from '@/lib/models/Organization';
import { usePosts } from '@/lib/hooks/usePosts';
import { usePostReactions } from '@/lib/hooks/usePostReactions';
import { usePostBoosts } from '@/lib/hooks/usePostBoosts';
import { Post } from '@/lib/models/Post';
import PostCard from '../post/PostCard';
import PostDetail from '../post/PostDetail';
import { DirectFontAwesome } from '@/lib/components/icons';

interface PostsSectionProps {
  organization: Organization;
  displayFilter: string;
  isUserMember: boolean;
  isUserStaff: boolean;
}

export default function PostsSection({ 
  organization, 
  displayFilter,
  isUserMember,
  isUserStaff
}: PostsSectionProps) {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  
  // Get posts
  const { posts, loading, error, deletePost } = usePosts(organization.id, {
    filterOption: displayFilter as 'all' | 'members' | 'media'
  });
  
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
  
  // No posts yet state
  if (!loading && posts.length === 0) {
    return (
      <div className="bg-card p-4 text-white mt-1 continuous-corner">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-2xl">Posts</h2>
          
          <div className="flex items-center">
            <span className="mr-2 text-sm text-gray-400">
              {displayFilter === 'all' 
                ? 'All Posts' 
                : displayFilter === 'members' 
                  ? 'Members Only' 
                  : 'Media'}
            </span>
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
            {displayFilter === 'all' 
              ? 'No posts yet' 
              : displayFilter === 'members' 
                ? 'No members-only posts yet'
                : 'No media posts yet'}
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
        <h2 className="text-white font-semibold text-2xl mb-4">Posts</h2>
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
        <h2 className="text-white font-semibold text-2xl mb-4">Posts</h2>
        <div className="flex items-center justify-center h-32 text-center">
          <p className="text-red-400">Error loading posts. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card p-4 text-white mt-1 continuous-corner">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold text-2xl">Posts</h2>
        
        <div className="flex items-center">
          <span className="mr-2 text-sm text-gray-400">
            {displayFilter === 'all' 
              ? 'All Posts' 
              : displayFilter === 'members' 
                ? 'Members Only' 
                : 'Media'}
          </span>
        </div>
      </div>
      
      {/* Posts List */}
      <div className="space-y-4">
        {posts.map(post => (
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
        ))}
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