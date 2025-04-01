import { useState, useEffect } from 'react';
import { Post } from '@/lib/models/Post';
import { postService } from '@/lib/services/postService';

interface UsePostsOptions {
  filterOption?: 'all' | 'members' | 'media';
  limitCount?: number;
}

/**
 * Custom hook for fetching and managing posts for an organization
 */
export function usePosts(organizationId: string | null, options: UsePostsOptions = {}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { filterOption = 'all', limitCount = 50 } = options;

  useEffect(() => {
    if (!organizationId) {
      setPosts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Fetch posts using the service
    const fetchPosts = async () => {
      try {
        const fetchedPosts = await postService.getPosts(
          organizationId, 
          filterOption, 
          limitCount
        );
        setPosts(fetchedPosts);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
    
    // Set up polling to refresh posts every minute
    const intervalId = setInterval(fetchPosts, 60000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [organizationId, filterOption, limitCount]);

  // Function to delete a post
  const deletePost = async (post: Post) => {
    try {
      await postService.deletePost(post);
      // Remove the post from the local state
      setPosts(currentPosts => currentPosts.filter(p => p.id !== post.id));
    } catch (err) {
      console.error('Error deleting post:', err);
      setError(err as Error);
    }
  };

  return { posts, loading, error, deletePost };
} 