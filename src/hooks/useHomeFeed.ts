import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { Post } from '@/lib/models/Post';
import { Organization } from '@/lib/models/Organization';
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

const POSTS_PER_PAGE = 10; // Adjust as needed

export function useHomeFeed(): UseHomeFeedReturn {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  // We might need pagination state later (lastVisibleDoc)

  const fetchFeed = useCallback(async () => {
    console.log('[useHomeFeed] Starting feed fetch...');
    setLoading(true);
    setError(null);
    // Reset items for a fresh fetch/refresh
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
      const posts = postsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Ensure createdDate is a Date object (Firestore timestamps need conversion)
          createdDate: data.created_time?.toDate ? data.created_time.toDate() : new Date(),
        } as Post;
      });
      console.log(`[useHomeFeed] Fetched ${posts.length} posts.`);

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
          const orgData = { id: docSnap.id, ...docSnap.data() } as Organization;
          organizationsMap.set(docSnap.id, orgData);
          console.log(`[useHomeFeed] Fetched organization: ${orgData.name} (${orgData.id})`);
        } else {
           console.warn(`[useHomeFeed] Organization document not found for ID: ${docSnap.id}`);
        }
      });

      // 4. Combine Posts and Organizations
      const combinedFeedItems: FeedItem[] = posts
        .map(post => {
          const organization = organizationsMap.get(post.nonprofitId ?? '');
          if (organization) {
            // TODO: Replace placeholders with actual like/boost state logic
            // TODO: Fetch user relationship if needed for isUserMember/isUserStaff
            return {
              post,
              organization,
              isLiked: false, // Placeholder
              isBoosted: false // Placeholder
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
  }, []); // Dependency array is empty, fetchFeed is stable

  // Initial fetch on mount
  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  return { feedItems, loading, error, fetchFeed };
} 