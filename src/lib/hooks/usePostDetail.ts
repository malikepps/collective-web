import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Post, postFromFirestore } from '@/lib/models/Post';
import { postService } from '@/lib/services/postService';

/**
 * Custom hook for fetching and managing a single post
 */
export function usePostDetail(postId: string | null) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!postId) {
      setPost(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Subscribe to real-time updates for the post
    const unsubscribe = onSnapshot(
      doc(db, 'posts', postId),
      (snapshot) => {
        const postData = postFromFirestore(snapshot);
        setPost(postData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching post:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => unsubscribe();
  }, [postId]);

  // Function to delete the post
  const deletePost = async () => {
    if (!post) return;
    
    try {
      await postService.deletePost(post);
      // After deletion, the post will be null
      setPost(null);
    } catch (err) {
      console.error('Error deleting post:', err);
      setError(err as Error);
    }
  };

  return { post, loading, error, deletePost };
} 