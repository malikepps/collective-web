import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { doc, getDoc, collection, query, where, getDocs, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { UserNonprofitRelationship, relationshipFromFirestore } from '@/lib/models/UserNonprofitRelationship';

export function useUserOrganizationRelationship(organizationId: string | null) {
  console.log("[DEBUG] useUserOrganizationRelationship hook initialized for org:", organizationId);
  
  const { user } = useAuth();
  const [relationship, setRelationship] = useState<UserNonprofitRelationship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Computed state
  const isUserMember = !!relationship?.isMember && !!relationship?.isActive;
  const isUserInCommunity = !!relationship?.isCommunity && !!relationship?.isActive;
  const isUserStaff = !!relationship?.isStaff && !!relationship?.isActive;
  
  // Additional debug info
  useEffect(() => {
    console.log("[DEBUG] User auth state:", user ? { uid: user.uid, isAnonymous: user.isAnonymous } : "No user");
    console.log("[DEBUG] Organization ID:", organizationId);
  }, [user, organizationId]);
  
  // Also check organization members array as a fallback
  useEffect(() => {
    const checkOrganizationMembers = async () => {
      if (!user || !organizationId) return;
      
      try {
        const orgDoc = await getDoc(doc(db, 'nonprofits', organizationId));
        if (orgDoc.exists()) {
          const orgData = orgDoc.data();
          const membersArray = orgData.members || [];
          const isMemberInOrg = membersArray.includes(user.uid);
          
          console.log("[DEBUG] Checked organization members array:", {
            orgId: organizationId,
            userInMembersArray: isMemberInOrg,
            membersArrayLength: membersArray.length
          });
          
          // If the relationship says they're not a member but they are in the members array,
          // we should update our state to reflect that
          if (isMemberInOrg && !isUserMember) {
            console.log("[DEBUG] User found in members array but not in relationship, updating state");
            // Create synthetic relationship if none exists
            if (!relationship) {
              const syntheticRelationship: UserNonprofitRelationship = {
                id: `${user.uid}:${organizationId}`,
                userId: user.uid,
                nonprofitId: organizationId,
                isStaff: false,
                isMember: true,
                isCommunity: true,
                isActive: true,
                displayFilter: 'member',
                isManager: false
              };
              setRelationship(syntheticRelationship);
            } else {
              // Update existing relationship with member status
              setRelationship({
                ...relationship,
                isMember: true,
                isCommunity: true,
                isActive: true
              });
            }
          }
        }
      } catch (err) {
        console.error("[DEBUG] Error checking organization members:", err);
      }
    };
    
    // Only run this as a fallback if we have a user but no relationship or not a member
    if (user && organizationId && (!relationship || !isUserMember)) {
      checkOrganizationMembers();
    }
  }, [user, organizationId, relationship, isUserMember]);
  
  const refreshRelationship = async () => {
    if (!user || !organizationId) {
      console.log("[DEBUG] Cannot refresh relationship: no user or organizationId");
      setRelationship(null);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log("[DEBUG] Refreshing relationship for user:", user.uid, "and org:", organizationId);
      
      // First try with direct document ID lookup (most reliable)
      const relationshipId = `${user.uid}:${organizationId}`;
      const directDocRef = doc(db, 'user_nonprofit_relationships', relationshipId);
      const directDocSnap = await getDoc(directDocRef);
      
      if (directDocSnap.exists()) {
        console.log("[DEBUG] Found relationship via direct ID lookup:", directDocSnap.id);
        const relationshipData = relationshipFromFirestore(directDocSnap);
        console.log("[DEBUG] Parsed relationship data:", relationshipData);
        setRelationship(relationshipData);
        setError(null);
        setLoading(false);
        return;
      } else {
        console.log("[DEBUG] No relationship found with ID:", relationshipId);
      }
      
      // Fall back to query if direct lookup fails
      const relationshipsRef = collection(db, 'user_nonprofit_relationships');
      const q = query(
        relationshipsRef,
        where('user', '==', doc(db, 'users', user.uid)),
        where('nonprofit', '==', doc(db, 'nonprofits', organizationId))
      );
      
      console.log("[DEBUG] Querying for relationship with filters");
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log("[DEBUG] No relationship found via query");
        setRelationship(null);
      } else {
        console.log("[DEBUG] Found relationship via query:", querySnapshot.docs[0].id);
        const relationshipData = relationshipFromFirestore(querySnapshot.docs[0]);
        console.log("[DEBUG] Parsed relationship data from query:", relationshipData);
        setRelationship(relationshipData);
      }
      
      setError(null);
    } catch (err) {
      console.error("[DEBUG] Error fetching relationship:", err);
      setError('Failed to load relationship status');
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle community membership
  const toggleCommunity = async (): Promise<boolean> => {
    if (!user || !organizationId) {
      console.log("[DEBUG] Cannot toggle membership: no user or organizationId");
      setError('You must be logged in to join/leave a community');
      return false;
    }
    
    try {
      setLoading(true);
      console.log("[DEBUG] Toggling community membership for user:", user.uid, "and org:", organizationId);
      
      // Determine the relationship ID
      const relationshipId = relationship?.id || `${user.uid}:${organizationId}`;
      const relationshipRef = doc(db, 'user_nonprofit_relationships', relationshipId);
      
      if (!relationship || !relationship.isCommunity || !relationship.isActive) {
        console.log("[DEBUG] Joining community - current relationship:", relationship);
        // User is not in community or relationship is inactive - join community
        await setDoc(relationshipRef, {
          user: doc(db, 'users', user.uid),
          nonprofit: doc(db, 'nonprofits', organizationId),
          is_manager: false,
          is_member: false,
          is_community: true,
          is_active: true,
          created_time: Timestamp.now(),
          display_filter: 'community'
        });
        
        console.log("[DEBUG] Successfully joined community");
        
        // Refresh relationship after toggle
        await refreshRelationship();
        return true; // Joined successfully
      } else {
        console.log("[DEBUG] Leaving community - current relationship:", relationship);
        // User is in community - leave community
        // Don't allow leaving if they're a member
        if (relationship.isMember) {
          console.log("[DEBUG] Cannot leave community - user is a member");
          return false;
        }
        
        await setDoc(relationshipRef, {
          user: doc(db, 'users', user.uid),
          nonprofit: doc(db, 'nonprofits', organizationId),
          is_manager: false,
          is_member: false,
          is_community: false,
          is_active: false,
          created_time: Timestamp.now(),
          display_filter: 'community'
        });
        
        console.log("[DEBUG] Successfully left community");
        
        // Refresh relationship after toggle
        await refreshRelationship();
        return false; // Left successfully (returning false indicates no longer in community)
      }
    } catch (err) {
      console.error("[DEBUG] Error toggling community membership:", err);
      setError('Failed to update community membership');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Load relationship when user or organizationId changes
  useEffect(() => {
    if (user && organizationId) {
      console.log("[DEBUG] User or organizationId changed, refreshing relationship");
      refreshRelationship();
    }
  }, [user, organizationId]);
  
  return {
    relationship,
    isUserMember,
    isUserInCommunity,
    isUserStaff,
    loading,
    error,
    refreshRelationship,
    toggleCommunity
  };
} 