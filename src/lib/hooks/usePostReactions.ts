import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, query, where, doc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { reactionService } from '@/lib/services/reactionService';

/**
 * Custom hook for managing post reactions (likes)
 */
export function usePostReactions() {
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Subscribe to user's liked posts
  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      setLikedPosts([]);
      setLoading(false);
      return () => {};
    }
    
    setLoading(true);
    
    // Create query for user's reactions
    const reactionsQuery = query(
      collection(db, 'user_post_reactions'),
      where('user', '==', doc(db, 'users', userId)),
      where('type', '==', 'like')
    );
    
    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      reactionsQuery,
      (snapshot) => {
        // Extract post IDs from reaction documents
        const posts = snapshot.docs.map(doc => {
          const path = doc.data().post as string;
          return path.split('/').pop() as string;
        });
        
        setLikedPosts(posts);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching liked posts:', err);
        setError(err as Error);
        setLoading(false);
      }
    );
    
    // Cleanup subscription
    return () => unsubscribe();
  }, []);
  
  // Check if a post is liked
  const isPostLiked = useCallback((postId: string): boolean => {
    return likedPosts.includes(postId);
  }, [likedPosts]);
  
  // Toggle like for a post
  const toggleLike = useCallback(async (postId: string): Promise<void> => {
    try {
      await reactionService.toggleLike(postId);
      // The real-time listener will update the likedPosts state
    } catch (err) {
      console.error('Error toggling like:', err);
      setError(err as Error);
    }
  }, []);
  
  return { likedPosts, isPostLiked, toggleLike, loading, error };
} 