import { collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, where, writeBatch, DocumentReference, Timestamp } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Post, postFromFirestore } from '@/lib/models/Post';
import { Organization } from '@/lib/models/Organization';

/**
 * Service for handling post operations
 */
export const postService = {
  /**
   * Get posts for an organization
   */
  async getPosts(organizationId: string, filterOption: 'all' | 'members' | 'media' = 'all', limit = 20): Promise<Post[]> {
    try {
      // Base query filters
      let constraints = [
        where('nonprofit', '==', doc(db, 'nonprofits', organizationId)),
        orderBy('created_date', 'desc'),
        limit(limit)
      ];

      // Add filter for members-only content if needed
      if (filterOption === 'members') {
        constraints.push(where('is_for_members_only', '==', true));
      }

      // Add filter for media content if needed
      if (filterOption === 'media') {
        // Media posts must have either mediaItems or postImage/videoUrl
        // This is a bit complex with Firestore so we'll filter client-side later
      }

      const q = query(collection(db, 'posts'), ...constraints);
      const querySnapshot = await getDocs(q);

      // Convert to Post objects
      const posts = querySnapshot.docs
        .map(doc => postFromFirestore(doc))
        .filter(post => post !== null) as Post[];

      // Additional client-side filtering for media
      if (filterOption === 'media') {
        return posts.filter(post => 
          (post.mediaItems && post.mediaItems.length > 0) || 
          post.postImage || 
          post.videoUrl
        );
      }

      return posts;
    } catch (error) {
      console.error('Error getting posts:', error);
      throw error;
    }
  },

  /**
   * Get a single post by ID
   */
  async getPost(postId: string): Promise<Post | null> {
    try {
      const postDoc = await getDoc(doc(db, 'posts', postId));
      return postFromFirestore(postDoc);
    } catch (error) {
      console.error('Error getting post:', error);
      throw error;
    }
  },

  /**
   * Delete a post and its associated resources
   */
  async deletePost(post: Post): Promise<void> {
    try {
      const postId = post.id;
      const batch = writeBatch(db);

      // Delete post document
      const postRef = doc(db, 'posts', postId);
      batch.delete(postRef);

      // Delete all comments (to be implemented when we add comments)
      // const commentsSnapshot = await getDocs(collection(postRef, 'post_comments'));
      // commentsSnapshot.forEach(comment => {
      //   batch.delete(comment.ref);
      // });

      // Delete all reactions
      const reactionsSnapshot = await getDocs(
        query(collection(db, 'user_post_reactions'), 
              where('post', '==', `/posts/${postId}`))
      );
      reactionsSnapshot.forEach(reaction => {
        batch.delete(reaction.ref);
      });

      // Commit the batch
      await batch.commit();

      // Delete media files from storage
      if (post.mediaItems) {
        for (const mediaItem of post.mediaItems) {
          try {
            // Extract filename from URL
            const urlObj = new URL(mediaItem.url);
            const pathname = urlObj.pathname;
            const segments = pathname.split('/');
            const filename = segments[segments.length - 1];
            
            // Delete the file
            const fileRef = ref(storage, `posts/${filename}`);
            await deleteObject(fileRef);

            // Delete thumbnail if exists
            if (mediaItem.thumbnailUrl) {
              const thumbnailUrlObj = new URL(mediaItem.thumbnailUrl);
              const thumbnailPathname = thumbnailUrlObj.pathname;
              const thumbnailSegments = thumbnailPathname.split('/');
              const thumbnailFilename = thumbnailSegments[thumbnailSegments.length - 1];
              const thumbnailRef = ref(storage, `thumbnails/${thumbnailFilename}`);
              await deleteObject(thumbnailRef);
            }
          } catch (error) {
            console.error('Error deleting media file:', error);
            // Continue deleting other files
          }
        }
      } else {
        // Handle legacy format
        if (post.postImage) {
          try {
            const urlObj = new URL(post.postImage);
            const pathname = urlObj.pathname;
            const segments = pathname.split('/');
            const filename = segments[segments.length - 1];
            const fileRef = ref(storage, `posts/${filename}`);
            await deleteObject(fileRef);
          } catch (error) {
            console.error('Error deleting post image:', error);
          }
        }
        if (post.videoUrl) {
          try {
            const urlObj = new URL(post.videoUrl);
            const pathname = urlObj.pathname;
            const segments = pathname.split('/');
            const filename = segments[segments.length - 1];
            const fileRef = ref(storage, `posts/${filename}`);
            await deleteObject(fileRef);
          } catch (error) {
            console.error('Error deleting video:', error);
          }
        }
      }

      // Decrement nonprofit's post count
      if (post.nonprofitId) {
        const nonprofitRef = doc(db, 'nonprofits', post.nonprofitId);
        try {
          const batch = writeBatch(db);
          batch.update(nonprofitRef, {
            num_posts: Timestamp.now() // This will be handled by a server-side function
          });
          await batch.commit();
        } catch (error) {
          console.error('Error updating nonprofit post count:', error);
        }
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }
}; 