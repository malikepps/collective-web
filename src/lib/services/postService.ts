import { collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, where, writeBatch, DocumentReference, Timestamp, QueryDocumentSnapshot } from 'firebase/firestore';
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
        orderBy('created_time', 'desc'),
        limit(limitCount)
      );
      
      // Query 2: Using the nonprofit document path as string (alternate format)
      console.log(`[DEBUG] Query 2: Using nonprofit path string`);
      const nonprofitPath = `nonprofits/${organizationId}`;
      const query2 = query(
        collection(db, 'posts'),
        where('nonprofit', '==', nonprofitPath),
        orderBy('created_time', 'desc'),
        limit(limitCount)
      );

      // Query 3: Using direct ID as the nonprofit field value
      console.log(`[DEBUG] Query 3: Using direct ID in nonprofit field`);
      const query3 = query(
        collection(db, 'posts'),
        where('nonprofit', '==', organizationId),
        orderBy('created_time', 'desc'),
        limit(limitCount)
      );
      
      // Query 4: Check for posts with a direct nonprofitId field
      // This query requires a composite index that might not exist yet
      console.log(`[DEBUG] Query 4: Using nonprofitId field (requires composite index)`);
      const query4 = query(
        collection(db, 'posts'),
        where('nonprofitId', '==', organizationId),
        orderBy('created_time', 'desc'),
        limit(limitCount)
      );
      
      // Execute queries in parallel, but handle potential index errors
      let snapshot1Results: any = { docs: [] };
      let snapshot2Results: any = { docs: [] };
      let snapshot3Results: any = { docs: [] };
      let snapshot4Results: any = { docs: [] };
      let useFallback = false;
      
      try {
        // Execute the first three queries that typically don't require special indexes
        const results = await Promise.all([
          getDocs(query1),
          getDocs(query2),
          getDocs(query3)
        ]);
        
        snapshot1Results = results[0];
        snapshot2Results = results[1];
        snapshot3Results = results[2];
        
        // Try the fourth query separately since it may fail due to missing index
        try {
          snapshot4Results = await getDocs(query4);
          console.log(`[DEBUG] Query 4 returned ${snapshot4Results.docs.length} posts`);
        } catch (error: any) {
          // Log the index creation link if this is an index error
          if (error.code === 'failed-precondition' || error.message?.includes('index')) {
            console.warn(
              `[DEBUG] Query 4 requires a composite index. Missing index for nonprofitId + created_time. ` +
              `To improve post fetching, please create this index using the link in the error message above.`
            );
            snapshot4Results = { docs: [] };
          } else {
            // Rethrow if it's not an index error
            throw error;
          }
        }
      } catch (error) {
        console.error('[DEBUG] Error executing queries:', error);
        console.log('[DEBUG] Falling back to client-side filtering method');
        useFallback = true;
      }
      
      let mergedDocs: QueryDocumentSnapshot[] = [];
      
      if (!useFallback) {
        console.log(`[DEBUG] Query 1 returned ${snapshot1Results.docs.length} posts`);
        console.log(`[DEBUG] Query 2 returned ${snapshot2Results.docs.length} posts`);
        console.log(`[DEBUG] Query 3 returned ${snapshot3Results.docs.length} posts`);
        
        // Merge the results, avoiding duplicates by using a Map with document ID as key
        const docMap = new Map();
        
        // Add docs from all queries, with null checks
        [
          ...(snapshot1Results?.docs || []), 
          ...(snapshot2Results?.docs || []), 
          ...(snapshot3Results?.docs || []), 
          ...(snapshot4Results?.docs || [])
        ].forEach(doc => {
          if (!docMap.has(doc.id)) {
            docMap.set(doc.id, doc);
          }
        });
        
        // Convert the merged set to an array
        mergedDocs = Array.from(docMap.values());
        console.log(`[DEBUG] Combined queries returned ${mergedDocs.length} unique documents`);
      }
      
      // If we got no results or an error, try the fallback method (client-side filtering)
      if (useFallback || mergedDocs.length === 0) {
        console.log('[DEBUG] No posts found with direct queries, using fallback method');
        const fallbackPosts = await this.getAllPostsFallback(organizationId, limitCount);
        return fallbackPosts;
      }
      
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
   * Fallback method to get all posts and filter by nonprofit client-side
   * This is less efficient but works when indexes are missing
   */
  async getAllPostsFallback(organizationId: string, limitCount = 100): Promise<Post[]> {
    console.log(`[DEBUG] Using fallback method to get posts for ${organizationId}`);
    try {
      // Get the most recent posts without filtering by nonprofit
      const q = query(
        collection(db, 'posts'),
        orderBy('created_time', 'desc'),
        limit(limitCount * 5) // Get more posts since we'll filter most out
      );
      
      const snapshot = await getDocs(q);
      console.log(`[DEBUG] Fallback query returned ${snapshot.docs.length} total posts`);
      
      // Parse all posts
      const allPosts = snapshot.docs
        .map(doc => postFromFirestore(doc))
        .filter(post => post !== null) as Post[];
      
      // Filter to only posts for this nonprofit
      const filteredPosts = allPosts.filter(post => {
        const matches = post.nonprofitId === organizationId;
        return matches;
      });
      
      console.log(`[DEBUG] Fallback method found ${filteredPosts.length} posts for ${organizationId}`);
      
      // Sort by date and limit
      return filteredPosts
        .sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime())
        .slice(0, limitCount);
    } catch (error) {
      console.error('[DEBUG] Error in fallback post fetching:', error);
      return [];
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