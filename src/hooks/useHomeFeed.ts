import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase/config';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  doc, 
  getDoc, 
  DocumentReference,
  where
} from 'firebase/firestore';
import { useAuth } from '@/lib/context/AuthContext';
import { Post, postFromFirestore } from '@/lib/models/Post';
import { Organization, organizationFromFirestore } from '@/lib/models/Organization';
// We might need user relationship later to determine staff/member status for posts
// import { useUserOrganizationRelationship } from './useUserOrganizationRelationship';

// Define the structure of the feed item combining post and organization
export interface FeedItem {
  post: Post;
  organization: Organization;
  isLiked: boolean; // Placeholder - implement like state management later
  isBoosted: boolean; // Placeholder - implement boost state management later
  // Add relationship status if needed for rendering specific post elements
  // isUserMember: boolean;
  // isUserStaff: boolean;
}

// Define the return type of the hook
interface UseHomeFeedReturn {
  feedItems: FeedItem[];
  loading: boolean;
  error: Error | null;
  fetchFeed: () => Promise<void>; // Function to manually trigger fetch/refresh
}

const POSTS_PER_PAGE = 50; // Increased from 10

export function useHomeFeed(): UseHomeFeedReturn {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchFeed = useCallback(async () => {
    if (!user) {
        console.log('[useHomeFeed] fetchFeed called, but no user found. Aborting.');
        setFeedItems([]);
        setLoading(false);
        setError(null);
        return; 
    }
    
    console.log(`[useHomeFeed] Starting feed fetch for user: ${user.uid}`);
    setLoading(true);
    setError(null);
    setFeedItems([]);

    try {
      // 1. Fetch Posts
      const postsQuery = query(
        collection(db, 'posts'),
        orderBy('created_time', 'desc'), // Assuming 'created_time' exists and is a Timestamp
        limit(POSTS_PER_PAGE)
        // Add pagination later: startAfter(lastVisibleDoc)
      );
      const postsSnapshot = await getDocs(postsQuery);
      const posts = postsSnapshot.docs
        .map(doc => postFromFirestore(doc)) // Use postFromFirestore
        .filter((post): post is Post => post !== null); // Filter out nulls
      
      console.log(`[useHomeFeed] Parsed ${posts.length} posts using postFromFirestore.`);

      if (posts.length === 0) {
        setLoading(false);
        console.log('[useHomeFeed] No posts found.');
        return;
      }

      // 2. Get unique Organization IDs from posts
      const organizationIdsSet = new Set(posts.map(post => post.nonprofitId).filter(Boolean) as string[]);
      const organizationIds = Array.from(organizationIdsSet); // Convert Set to Array
      console.log(`[useHomeFeed] Unique organization IDs from posts: ${organizationIds.join(', ')}`);

      // 3. Fetch Organizations
      const organizationPromises = organizationIds.map(id => getDoc(doc(db, 'nonprofits', id)));
      const organizationDocs = await Promise.all(organizationPromises);

      const organizationsMap = new Map<string, Organization>();
      organizationDocs.forEach(docSnap => {
        if (docSnap.exists()) {
          const orgData = organizationFromFirestore(docSnap); // Use organizationFromFirestore
          if (orgData) {
            organizationsMap.set(docSnap.id, orgData);
            console.log(`[useHomeFeed] Parsed organization using organizationFromFirestore: ${orgData.name} (${orgData.id})`);
          } else {
             console.warn(`[useHomeFeed] organizationFromFirestore failed for ID: ${docSnap.id}`);
          }
        } else {
           console.warn(`[useHomeFeed] Organization document not found for ID: ${docSnap.id}`);
        }
      });

      // 4. Fetch User Reactions
      const userReactions = new Map<string, { liked: boolean; boosted: boolean }>();
      console.log(`[useHomeFeed] Fetching reactions for user: ${user.uid}`);
      const postIds = posts.map(p => p.id);
      if (postIds.length > 0) {
          const reactionQuery = query(
              collection(db, 'user_post_reactions'),
              where('user_id', '==', user.uid),
              where('post_id', 'in', postIds.slice(0, 30))
          );
          try {
            const reactionSnapshot = await getDocs(reactionQuery);
            reactionSnapshot.forEach(reactionDoc => {
              const data = reactionDoc.data();
              userReactions.set(data.post_id, {
                liked: data.liked === true,
                boosted: data.boosted === true,
              });
            });
             console.log(`[useHomeFeed] Found ${reactionSnapshot.size} reactions for current user.`);
          } catch (reactionError) {
            console.error("[useHomeFeed] Error fetching user reactions:", reactionError);
            // Continue without reactions if fetch fails
          }
      }

      // 5. Combine Posts, Organizations, and Reactions
      const combinedFeedItems: FeedItem[] = posts
        .map(post => {
          const organization = organizationsMap.get(post.nonprofitId ?? '');
          const reaction = userReactions.get(post.id) ?? { liked: false, boosted: false }; // Get reaction or default
          if (organization) {
            return {
              post,
              organization,
              isLiked: reaction.liked,
              isBoosted: reaction.boosted
            };
          }
          console.warn(`[useHomeFeed] Could not find organization (${post.nonprofitId}) for post ${post.id}`);
          return null; // Filter out posts without a valid organization
        })
        .filter((item): item is FeedItem => item !== null); // Type guard to filter out nulls

      console.log(`[useHomeFeed] Created ${combinedFeedItems.length} combined feed items.`);
      setFeedItems(combinedFeedItems);

    } catch (err: any) {
      console.error('[useHomeFeed] Error fetching feed:', err);
      setError(err);
    } finally {
      setLoading(false);
      console.log('[useHomeFeed] Feed fetch finished.');
    }
  }, [user]);

  // Initial fetch on mount - now depends on the context user state
  useEffect(() => {
    console.log('[useHomeFeed] useEffect triggered. User:', user?.uid);
    if (user) {
        fetchFeed();
    } else {
        console.log('[useHomeFeed] No user found on initial mount, setting loading false.');
        setLoading(false);
        setFeedItems([]);
        setError(null);
    }
  }, [fetchFeed]);

  return { feedItems, loading, error, fetchFeed };
} 