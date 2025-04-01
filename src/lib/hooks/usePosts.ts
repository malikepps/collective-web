import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy, limit, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Post, postFromFirestore } from '@/lib/models/Post';
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
  const { filterOption = 'all', limitCount = 20 } = options;

  useEffect(() => {
    if (!organizationId) {
      setPosts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Create constraints for query
    const constraints = [
      where('nonprofit', '==', doc(db, 'nonprofits', organizationId)),
      orderBy('created_date', 'desc'),
      limit(limitCount)
    ];

    // Add filter for members-only content if needed
    if (filterOption === 'members') {
      constraints.push(where('is_for_members_only', '==', true));
    }

    const postsQuery = query(collection(db, 'posts'), ...constraints);

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      postsQuery,
      (snapshot) => {
        // Convert to Post objects
        let fetchedPosts = snapshot.docs
          .map(doc => postFromFirestore(doc))
          .filter(post => post !== null) as Post[];

        // Additional client-side filtering for media
        if (filterOption === 'media') {
          fetchedPosts = fetchedPosts.filter(post => 
            (post.mediaItems && post.mediaItems.length > 0) || 
            post.postImage || 
            post.videoUrl
          );
        }

        setPosts(fetchedPosts);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching posts:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => unsubscribe();
  }, [organizationId, filterOption, limitCount]);

  // Function to delete a post
  const deletePost = async (post: Post) => {
    try {
      await postService.deletePost(post);
      // The real-time listener will update the posts state
    } catch (err) {
      console.error('Error deleting post:', err);
      setError(err as Error);
    }
  };

  return { posts, loading, error, deletePost };
} 