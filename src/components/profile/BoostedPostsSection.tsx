import React from 'react';
import PostCard from '@/components/post/PostCard'; // Assuming PostCard is correctly located
import { BoostData, boostService } from '@/lib/services/boostService'; // Import BoostData and boostService
import { usePostReactions } from '@/lib/hooks/usePostReactions'; // Correct hook import
import { usePostBoosts as useProfileBoosts } from '@/lib/hooks/usePostBoosts'; // Alias to avoid name clash
import { useAuth } from '@/lib/context/AuthContext';
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
    <div className="bg-card-secondary rounded-xl overflow-hidden"> {/* Match org section background/rounding */}
      {/* Header */}
      <div className="p-4 border-b border-gray-700"> {/* Add padding and border */}
        <h3 className="text-white font-marfa font-semibold text-xl">
          Boosted Posts
        </h3>
      </div>

      {/* Posts List */}
      <div className="p-4 flex flex-col space-y-4"> {/* Add padding and spacing */}
        {boosts.length === 0 ? (
          <p className="text-gray-400 text-center py-4">You haven't boosted any posts yet.</p>
        ) : (
          boosts.map(({ post, organization }) => (
            <PostCard 
              key={post.id}
              post={post}
              organization={organization} // Pass the organization data from BoostData
              isUserMember={false} // TODO: Determine if user is member of this org
              isUserStaff={false}  // TODO: Determine if user is staff of this org
              isLiked={isPostLiked(post.id)} // Use isPostLiked function from hook
              isBoosted={userBoostedPosts.includes(post.id)} // Use state from aliased hook
              onToggleLike={() => toggleLike(post.id)} // Pass postId to toggleLike
              onToggleBoost={() => toggleBoost(post)} // Use function from boosts hook
              onShowDetail={() => handleShowDetail(post.id)}
              // onDeletePost prop is optional, not needed here typically
            />
          ))
        )}
      </div>
    </div>
  );
};

export default BoostedPostsSection; 