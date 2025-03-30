import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Organization, organizationFromFirestore } from '@/lib/models/Organization';
import { Post, postFromFirestore } from '@/lib/models/Post';
import { useAuth } from '@/lib/context/AuthContext';
import { useTheme } from '@/lib/context/ThemeContext';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

interface NonprofitProfileProps {
  organizationId: string;
}

const NonprofitProfile: React.FC<NonprofitProfileProps> = ({ organizationId }) => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMembershipOptions, setShowMembershipOptions] = useState(false);
  const { user } = useAuth();
  const { getTheme } = useTheme();
  const router = useRouter();
  
  // States for UI interactions
  const [showConfetti, setShowConfetti] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isUserInCommunity, setIsUserInCommunity] = useState(false);
  const [isUserMember, setIsUserMember] = useState(false);

  useEffect(() => {
    const loadOrganization = async () => {
      setIsLoading(true);
      try {
        // Load organization data
        const orgDoc = await getDoc(doc(db, 'nonprofits', organizationId));
        const org = organizationFromFirestore(orgDoc);
        
        if (org) {
          setOrganization(org);
          
          // Load community data if available
          if (org.communityRef) {
            try {
              const communityDoc = await getDoc(doc(db, org.communityRef));
              if (communityDoc.exists() && communityDoc.data()) {
                const displayName = communityDoc.data()?.display_name;
                if (displayName) {
                  org.communityDisplayName = displayName;
                  setOrganization({...org});
                }
              }
            } catch (error) {
              console.error('Error loading community data:', error);
            }
          }
          
          // Load user relationship with nonprofit if user is logged in
          if (user) {
            try {
              const relationshipDoc = await getDoc(
                doc(db, 'user_nonprofit_relationships', `${user.uid}_${organizationId}`)
              );
              
              if (relationshipDoc.exists()) {
                const relationData = relationshipDoc.data();
                setIsUserInCommunity(relationData?.is_community === true);
                setIsUserMember(relationData?.is_member === true);
              }
            } catch (error) {
              console.error('Error loading user relationship:', error);
            }
          }
          
          // Load posts
          const postsQuery = query(
            collection(db, 'posts'),
            where('nonprofit', '==', doc(db, 'nonprofits', organizationId)),
            orderBy('created_time', 'desc'),
            limit(10)
          );
          
          const postsSnapshot = await getDocs(postsQuery);
          const loadedPosts = postsSnapshot.docs
            .map(doc => postFromFirestore(doc))
            .filter(post => post !== null) as Post[];
          
          setPosts(loadedPosts);
        }
      } catch (error) {
        console.error('Error loading organization:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (organizationId) {
      loadOrganization();
    }
  }, [organizationId, user]);
  
  const handleJoinCommunity = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    setIsJoining(true);
    setShowConfetti(true);
    setShowPulse(true);
    
    // Hide effects after animation completes
    setTimeout(() => {
      setShowConfetti(false);
      setShowPulse(false);
    }, 2000);
    
    try {
      // Join community logic would go here
      // This would make a call to a cloud function or API
      
      // For now, just simulate success
      setTimeout(() => {
        setIsUserInCommunity(true);
        setIsJoining(false);
      }, 1000);
    } catch (error) {
      console.error('Error joining community:', error);
      setIsJoining(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white/80 text-lg">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!organization) {
    return (
      <div className="min-h-screen bg-background text-white flex items-center justify-center">
        <p>Organization not found</p>
      </div>
    );
  }
  
  // Get theme if organization has one
  const theme = getTheme(organization.themeId);
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero media section */}
      <div className="relative w-full h-[52vh] bg-black">
        {organization.hero_video_url ? (
          <video 
            autoPlay 
            muted 
            loop 
            playsInline
            className="w-full h-full object-cover"
            src={organization.hero_video_url}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-white/50">No hero media available</p>
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
        
        {/* Organization info overlay */}
        <div className="absolute bottom-0 left-0 p-6 flex items-end">
          <div>
            {organization.photoURL ? (
              <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
                <Image 
                  src={organization.photoURL} 
                  alt={organization.name}
                  width={90} 
                  height={90}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-600 mb-4" />
            )}
            
            <h1 className="text-white text-4xl font-semibold">{organization.name}</h1>
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="px-6 py-4 space-y-4">
        {/* Info buttons */}
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1.5 bg-white/10 rounded-lg flex items-center gap-1">
            <span>📍</span>
            <span className="text-white/70 text-sm">{organization.location || 'No location'}</span>
          </button>
          
          {organization.linkInBio && (
            <button className="px-3 py-1.5 bg-white/10 rounded-lg flex items-center gap-1">
              <span>🔗</span>
              <span className="text-white/70 text-sm">links</span>
            </button>
          )}
          
          <button className="px-3 py-1.5 bg-white/10 rounded-lg flex items-center gap-1">
            <span className="text-white/70 text-sm">mission</span>
            <span className="text-white/70">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </span>
          </button>
        </div>
        
        {/* Membership button */}
        {isUserMember ? (
          <div className="flex justify-center">
            <div className="px-6 py-2.5 bg-white/10 rounded-lg">
              <span className="text-[#FFD966] font-semibold">✨ Member</span>
            </div>
          </div>
        ) : (
          <button 
            className="w-full py-3 px-4 rounded-lg font-semibold flex justify-center"
            style={{ 
              backgroundColor: theme?.primaryColor ? `#${theme.primaryColor}` : '#ADD3FF',
              color: theme?.primaryColor && !theme.isColorDark ? 'black' : 'white'
            }}
            onClick={() => setShowMembershipOptions(true)}
          >
            See membership options
          </button>
        )}
        
        {/* Community button - only shown if not a member and not in community */}
        {!isUserMember && !isUserInCommunity && (
          <button 
            className={`w-full py-3 px-4 rounded-lg font-semibold flex justify-center items-center gap-2 ${
              isJoining ? 'opacity-70' : ''
            } bg-white/10 text-[#ADD3FF]`}
            onClick={handleJoinCommunity}
            disabled={isJoining}
          >
            {isJoining ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#ADD3FF]"></div>
                <span>Joining...</span>
              </>
            ) : (
              <span>Join community</span>
            )}
          </button>
        )}
      </div>
      
      {/* Posts section */}
      <div className="px-6 mt-6">
        <h2 className="text-white text-lg font-semibold mb-4">Recent Posts</h2>
        
        {posts.length === 0 ? (
          <div className="bg-card rounded-lg p-6 text-center">
            <p className="text-white/60">No posts yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map(post => (
              <div key={post.id} className="bg-card rounded-lg overflow-hidden">
                {post.postImage && (
                  <div className="w-full h-60 relative">
                    <Image 
                      src={post.postImage} 
                      alt={post.caption}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <p className="text-white/90">{post.caption}</p>
                  <div className="mt-4 flex justify-between text-sm text-white/50">
                    <span>{post.createdDate.toLocaleDateString()}</span>
                    <div className="flex gap-4">
                      <span>❤️ {post.numLikes}</span>
                      <span>💬 {post.numComments}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NonprofitProfile; 