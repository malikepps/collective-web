import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Post } from '@/lib/models/Post';
import { boostService, BoostData } from '@/lib/services/boostService';

/**
 * Custom hook for managing post boosts
 */
export function usePostBoosts() {
  const [boostedPosts, setBoostedPosts] = useState<string[]>([]);
  const [boosts, setBoosts] = useState<BoostData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Subscribe to user's boosted posts
  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      setBoostedPosts([]);
      setBoosts([]);
      setLoading(false);
      return () => {};
    }
    
    setLoading(true);
    
    // Create query for user's boosted posts
    const boostsQuery = query(
      collection(db, 'users', userId, 'boosted_posts'),
      orderBy('boosted_at', 'desc'),
      limit(50)
    );
    
    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      boostsQuery,
      (snapshot) => {
        const postIds = snapshot.docs.map(doc => doc.id);
        console.log(`[usePostBoosts] Snapshot received. Boosted post IDs: [${postIds.join(', ')}]`);
        setBoostedPosts(postIds);
        
        // Load full boost data
        console.log('[usePostBoosts] Attempting to load full boost data...');
        boostService.getBoostedPosts(50)
          .then(boostData => {
            console.log(`[usePostBoosts] Successfully loaded ${boostData.length} full boost data items.`);
            setBoosts(boostData);
            setError(null); // Clear previous errors on success
          })
          .catch(err => {
            console.error('[usePostBoosts] Error loading full boost data via boostService:', err);
            setError(err as Error); // Set error state
            setBoosts([]); // Clear boosts on error
          })
          .finally(() => {
            setLoading(false); // Ensure loading is set to false after attempt
          });
          
      },
      (err) => {
        console.error('[usePostBoosts] Error in onSnapshot listener:', err);
        setError(err as Error);
        setLoading(false);
        setBoosts([]); // Clear boosts on listener error
        setBoostedPosts([]);
      }
    );
    
    // Cleanup subscription
    return () => unsubscribe();
  }, []);
  
  // Check if a post is boosted
  const isPostBoosted = useCallback((postId: string): boolean => {
    return boostedPosts.includes(postId);
  }, [boostedPosts]);
  
  // Toggle boost for a post
  const toggleBoost = useCallback(async (post: Post): Promise<void> => {
    try {
      await boostService.toggleBoost(post);
      // The real-time listener will update the boostedPosts state
    } catch (err) {
      console.error('Error toggling boost:', err);
      setError(err as Error);
    }
  }, []);
  
  return { 
    boostedPosts, 
    boosts, 
    isPostBoosted, 
    toggleBoost, 
    loading, 
    error 
  };
} 