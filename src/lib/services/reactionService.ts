import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Post } from '@/lib/models/Post';
import { auth } from '@/lib/firebase';

/**
 * Service for handling post reactions (likes, etc.)
 */
export const reactionService = {
  /**
   * Check if a user has liked a post
   */
  async isPostLiked(postId: string): Promise<boolean> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return false;
      
      const reactionDoc = await getDoc(
        doc(db, 'user_post_reactions', `${userId}_${postId}`)
      );
      
      return reactionDoc.exists();
    } catch (error) {
      console.error('Error checking if post is liked:', error);
      return false;
    }
  },
  
  /**
   * Toggle like status for a post
   */
  async toggleLike(postId: string): Promise<void> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');
      
      const reactionDoc = doc(db, 'user_post_reactions', `${userId}_${postId}`);
      const reactionSnapshot = await getDoc(reactionDoc);
      
      if (reactionSnapshot.exists()) {
        // Remove like
        await deleteDoc(reactionDoc);
      } else {
        // Add like
        await setDoc(reactionDoc, {
          user: doc(db, 'users', userId),
          post: `/posts/${postId}`,
          created_at: new Date(),
          type: 'like'
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  },
  
  /**
   * Get all posts liked by the current user
   */
  async getUserLikedPosts(): Promise<string[]> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return [];
      
      const q = query(
        collection(db, 'user_post_reactions'),
        where('user', '==', doc(db, 'users', userId)),
        where('type', '==', 'like')
      );
      
      const querySnapshot = await getDocs(q);
      
      // Extract the post IDs
      return querySnapshot.docs.map(doc => {
        const path = doc.data().post as string;
        return path.split('/').pop() as string;
      });
    } catch (error) {
      console.error('Error getting user liked posts:', error);
      return [];
    }
  }
}; 