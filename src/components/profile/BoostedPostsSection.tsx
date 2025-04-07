import React from 'react';
import PostCard from '@/components/post/PostCard'; // Assuming PostCard is correctly located
import { BoostData, boostService } from '@/lib/services/boostService'; // Import BoostData and boostService
import { usePostReactions } from '@/lib/hooks/usePostReactions'; // Correct hook import
import { usePostBoosts as useProfileBoosts } from '@/lib/hooks/usePostBoosts'; // Alias to avoid name clash
import { useAuth } from '@/lib/context/AuthContext';
import { Post, MediaType } from '@/lib/models/Post'; // Import Post model
import { Organization } from '@/lib/models/Organization'; // Import Organization model
import { useRouter } from 'next/router';

interface BoostedPostsSectionProps {
  boosts: BoostData[];
}

const BoostedPostsSection: React.FC<BoostedPostsSectionProps> = ({ boosts }) => {
  const { user } = useAuth();
  const router = useRouter();
  const { likedPosts, isPostLiked, toggleLike } = usePostReactions(); // Use correct hook and destructure its return values
  const { boostedPosts: userBoostedPosts, toggleBoost } = useProfileBoosts(); // Use aliased hook

  // Function to handle showing post detail (placeholder)
  const handleShowDetail = (postId: string) => {
    console.log('Show detail for post:', postId);
    // router.push(`/post/${postId}`); // Example navigation
  };

  return (
    <div className="bg-card p-4 text-white mt-1 continuous-corner"> {/* Match PostsSection styling */}
      {/* Header - Removed border, added mb-4 */}
      <h3 className="text-white font-marfa font-semibold text-xl mb-4">
        Boosted Posts
      </h3>

      {/* Posts List - Removed p-4 from here, kept spacing */}
      <div className="flex flex-col space-y-4">
        {boosts.length === 0 ? (
          <p className="text-gray-400 text-center py-4">You haven't boosted any posts yet.</p>
        ) : (
          boosts.map((boost) => {
            // Reconstruct Organization object for PostCard
            const organizationForCard: Organization = {
              id: boost.organization?.id || 'unknown-org',
              name: boost.organization?.name || 'Unknown Organization',
              photoURL: boost.organization?.photoURL || '',
              // Add default/null values for other Organization fields expected by PostCard if any
              // Check PostCardProps interface for required fields
              username: null, // Assume not available in BoostData
              description: '',
              themeId: null,
              location: '',
              zipCode: '',
              city: '',
              state: '',
              latitude: null,
              longitude: null,
              staff: null,
              members: null,
              pitch: '',
              linkInBio: '',
              videoURL: '',
              hero_video_url: null,
              membershipFee: null,
              communityRef: '',
              communityDisplayName: null,
              userID: null,
              igAccessToken: '',
              welcomeMessage: null,
            };

            // Reconstruct Post object for PostCard
            const postForCard: Post = {
              id: boost.postId, // Use postId from BoostData
              caption: boost.caption,
              mediaItems: boost.mediaItems,
              backgroundColorHex: boost.backgroundColorHex ?? null, // Use null instead of undefined
              createdDate: boost.boostedAt, // Use boostedAt as a placeholder date
              nonprofitId: boost.organization?.id || null,
              userId: user?.uid || null, // Assume boosted by current user
              // Add default/null values for other Post fields expected by PostCard
              numLikes: 0, // Not available in BoostData
              numComments: 0, // Not available in BoostData
              username: null, // Not available in BoostData
              community: null, // Not available in BoostData
              isForMembersOnly: false, // Assume not members only unless stored
              isForBroaderEcosystem: false, // Assume not ecosystem unless stored
              postImage: boost.mediaItems?.find(m => m.type === MediaType.IMAGE)?.url || null, // Legacy fallback
              videoUrl: boost.mediaItems?.find(m => m.type === MediaType.VIDEO)?.url || null, // Legacy fallback
              video: boost.mediaItems?.some(m => m.type === MediaType.VIDEO) || false, // Legacy fallback
              mediaType: boost.mediaItems?.[0]?.type || undefined,
            };

            return (
              <PostCard 
                key={boost.postId} // Use postId for key
                post={postForCard} // Pass the reconstructed Post object
                organization={organizationForCard} // Pass the reconstructed Organization object
                isUserMember={false} // TODO: Determine if user is member of this org
                isUserStaff={false}  // TODO: Determine if user is staff of this org
                isLiked={isPostLiked(boost.postId)} // Check like status using postId
                isBoosted={userBoostedPosts.includes(boost.postId)} // Check boost status using postId
                onToggleLike={() => toggleLike(boost.postId)} // Pass postId to toggleLike
                onToggleBoost={() => toggleBoost(postForCard)} // Pass reconstructed Post for toggleBoost
                onShowDetail={() => handleShowDetail(boost.postId)}
                showOrganizationHeader={true}
                // onDeletePost prop is optional, not needed here typically
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default BoostedPostsSection; 