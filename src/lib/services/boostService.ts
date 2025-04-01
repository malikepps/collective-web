import { collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, setDoc, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Post } from '@/lib/models/Post';
import { auth } from '@/lib/firebase';
import { MediaItem } from '../models/MediaItem';

export interface BoostData {
  id: string;
  postId: string;
  caption: string;
  boostedAt: Date;
  organization: {
    id: string;
    name: string;
    photoURL: string;
  } | null;
  mediaItems: MediaItem[];
  backgroundColorHex: string | null;
}

/**
 * Service for handling post boosts
 */
export const boostService = {
  /**
   * Check if a post is boosted by the current user
   */
  async isPostBoosted(postId: string): Promise<boolean> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return false;
      
      const boostDoc = await getDoc(
        doc(db, 'users', userId, 'boosted_posts', postId)
      );
      
      return boostDoc.exists();
    } catch (error) {
      console.error('Error checking if post is boosted:', error);
      return false;
    }
  },
  
  /**
   * Toggle boost status for a post
   */
  async toggleBoost(post: Post): Promise<void> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');
      
      const postId = post.id;
      const boostRef = doc(db, 'users', userId, 'boosted_posts', postId);
      const boostSnapshot = await getDoc(boostRef);
      
      if (boostSnapshot.exists()) {
        // Remove boost
        await deleteDoc(boostRef);
      } else {
        // Add boost
        const boostData: Record<string, any> = {
          post_reference: `/posts/${postId}`,
          organization_id: post.nonprofitId || '',
          boosted_at: new Date(),
          caption: post.caption,
          media_items: post.mediaItems?.map(item => ({
            url: item.url,
            type: item.type,
            thumbnail_url: item.thumbnailUrl
          })) || [],
          legacy_image_url: post.postImage || '',
          legacy_video_url: post.videoUrl || '',
          legacy_is_video: post.video,
          background_color_hex: post.backgroundColorHex || '525252' // Default background
        };
        
        await setDoc(boostRef, boostData);
      }
    } catch (error) {
      console.error('Error toggling boost:', error);
      throw error;
    }
  },
  
  /**
   * Get boosted posts for the current user
   */
  async getBoostedPosts(maxPosts = 20, startAfterId?: string): Promise<BoostData[]> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return [];
      
      let q = query(
        collection(db, 'users', userId, 'boosted_posts'),
        orderBy('boosted_at', 'desc'),
        limit(maxPosts)
      );
      
      // Add pagination if provided
      if (startAfterId) {
        const startAfterDoc = await getDoc(doc(db, 'users', userId, 'boosted_posts', startAfterId));
        if (startAfterDoc.exists()) {
          q = query(
            collection(db, 'users', userId, 'boosted_posts'),
            orderBy('boosted_at', 'desc'),
            limit(maxPosts)
          );
        }
      }
      
      const querySnapshot = await getDocs(q);
      
      // Process results
      const boostPromises = querySnapshot.docs.map(async (document) => {
        const data = document.data();
        
        // Get organization data if available
        let organization = null;
        if (data.organization_id && data.organization_id !== '') {
          try {
            const orgDoc = await getDoc(doc(db, 'nonprofits', data.organization_id));
            if (orgDoc.exists()) {
              const orgData = orgDoc.data();
              organization = {
                id: orgDoc.id,
                name: orgData.display_name || orgData.name || 'Unknown',
                photoURL: orgData.photo_url || ''
              };
            }
          } catch (error) {
            console.error('Error fetching organization for boost:', error);
          }
        }
        
        // Create media items array
        let mediaItems: MediaItem[] = [];
        
        if (Array.isArray(data.media_items) && data.media_items.length > 0) {
          mediaItems = data.media_items.map((item: any, index: number) => ({
            id: String(index),
            url: item.url || '',
            type: item.type,
            order: index,
            thumbnailUrl: item.thumbnail_url || null,
            thumbnailColor: null
          }));
        } else if (data.legacy_image_url && data.legacy_image_url !== '') {
          mediaItems = [{
            id: '0',
            url: data.legacy_image_url,
            type: 'IMAGE',
            order: 0,
            thumbnailUrl: null,
            thumbnailColor: null
          }];
        } else if (data.legacy_video_url && data.legacy_video_url !== '') {
          mediaItems = [{
            id: '0',
            url: data.legacy_video_url,
            type: 'VIDEO',
            order: 0,
            thumbnailUrl: null,
            thumbnailColor: null
          }];
        }
        
        // Create boost data object
        return {
          id: document.id,
          postId: document.id,
          caption: data.caption || '',
          boostedAt: (data.boosted_at as Timestamp)?.toDate() || new Date(),
          organization,
          mediaItems,
          backgroundColorHex: data.background_color_hex || null
        };
      });
      
      return Promise.all(boostPromises);
    } catch (error) {
      console.error('Error getting boosted posts:', error);
      return [];
    }
  }
}; 