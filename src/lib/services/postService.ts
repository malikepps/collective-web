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
  async getPosts(organizationId: string, filterOption: 'all' | 'members' | 'media' = 'all', limitCount = 50): Promise<Post[]> {
    try {
      console.log(`[DEBUG] Fetching posts for organization: ${organizationId}, filter: ${filterOption}, limit: ${limitCount}`);
      
      // Create reference to nonprofit document
      const nonprofitRef = doc(db, 'nonprofits', organizationId);
      console.log(`[DEBUG] Using nonprofit ref path: ${nonprofitRef.path}`);
      
      // The problem is that posts might have different formats for the nonprofit field:
      // 1. DocumentReference: nonprofit field is a reference to a nonprofit doc
      // 2. String path: nonprofit field is a string like "nonprofits/{id}"
      // 3. Direct ID: nonprofit field might be just the ID
      
      // Unfortunately, Firestore doesn't support OR queries directly, so we need to do multiple queries
      // and merge the results
      
      // Query 1: Using the nonprofit document reference (most common format)
      console.log(`[DEBUG] Query 1: Using nonprofit document reference`);
      const query1 = query(
        collection(db, 'posts'),
        where('nonprofit', '==', nonprofitRef),
        orderBy('created_date', 'desc'),
        limit(limitCount)
      );
      
      // Query 2: Using the nonprofit document path as string (alternate format)
      console.log(`[DEBUG] Query 2: Using nonprofit path string`);
      const nonprofitPath = `nonprofits/${organizationId}`;
      const query2 = query(
        collection(db, 'posts'),
        where('nonprofit', '==', nonprofitPath),
        orderBy('created_date', 'desc'),
        limit(limitCount)
      );

      // Query 3: Using direct ID as the nonprofit field value
      console.log(`[DEBUG] Query 3: Using direct ID in nonprofit field`);
      const query3 = query(
        collection(db, 'posts'),
        where('nonprofit', '==', organizationId),
        orderBy('created_date', 'desc'),
        limit(limitCount)
      );
      
      // Query 4: Check for posts with a direct nonprofitId field
      console.log(`[DEBUG] Query 4: Using nonprofitId field`);
      const query4 = query(
        collection(db, 'posts'),
        where('nonprofitId', '==', organizationId),
        orderBy('created_date', 'desc'),
        limit(limitCount)
      );
      
      // Execute all queries in parallel
      const [snapshot1, snapshot2, snapshot3, snapshot4] = await Promise.all([
        getDocs(query1),
        getDocs(query2),
        getDocs(query3),
        getDocs(query4)
      ]);
      
      console.log(`[DEBUG] Query 1 returned ${snapshot1.docs.length} posts`);
      console.log(`[DEBUG] Query 2 returned ${snapshot2.docs.length} posts`);
      console.log(`[DEBUG] Query 3 returned ${snapshot3.docs.length} posts`);
      console.log(`[DEBUG] Query 4 returned ${snapshot4.docs.length} posts`);
      
      // Merge the results, avoiding duplicates by using a Map with document ID as key
      const docMap = new Map();
      
      // Add docs from all queries
      [...snapshot1.docs, ...snapshot2.docs, ...snapshot3.docs, ...snapshot4.docs].forEach(doc => {
        if (!docMap.has(doc.id)) {
          docMap.set(doc.id, doc);
        }
      });
      
      // Convert the merged set to an array
      const mergedDocs = Array.from(docMap.values());
      console.log(`[DEBUG] Combined queries returned ${mergedDocs.length} unique documents`);
      
      // Log each document for debugging
      mergedDocs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`[DEBUG] Post #${index + 1} ID: ${doc.id}`);
        console.log(`[DEBUG] Post #${index + 1} nonprofit ref:`, data.nonprofit);
        if (data.nonprofit && typeof data.nonprofit === 'object') {
          console.log(`[DEBUG] Post #${index + 1} nonprofit path: ${data.nonprofit.path}`);
        }
      });
      
      // Parse posts
      let posts = mergedDocs
        .map(doc => {
          const post = postFromFirestore(doc);
          if (!post) {
            console.warn(`[DEBUG] Failed to parse post document: ${doc.id}`);
          } else {
            console.log(`[DEBUG] Successfully parsed post: ${doc.id}, for nonprofit: ${post.nonprofitId}`);
          }
          return post;
        })
        .filter(post => post !== null) as Post[];
      
      console.log(`[DEBUG] Successfully parsed ${posts.length} posts`);
      
      // Filter for members-only content if requested
      if (filterOption === 'members') {
        posts = posts.filter(post => post.isForMembersOnly);
        console.log(`[DEBUG] Filtered to ${posts.length} members-only posts`);
      }
      
      // Additional client-side filtering for media
      if (filterOption === 'media') {
        const mediaPosts = posts.filter(post => 
          (post.mediaItems && post.mediaItems.length > 0) || 
          post.postImage || 
          post.videoUrl
        );
        console.log(`[DEBUG] Filtered to ${mediaPosts.length} media posts`);
        return mediaPosts;
      }
      
      // Sort posts by created date
      posts.sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime());
      
      return posts;
    } catch (error) {
      console.error('[DEBUG] Error getting posts:', error);
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