import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { doc, getDoc, collection, query, where, getDocs, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { UserNonprofitRelationship, relationshipFromFirestore } from '@/lib/models/UserNonprofitRelationship';

export function useUserOrganizationRelationship(organizationId: string | null) {
  const { user } = useAuth();
  const [relationship, setRelationship] = useState<UserNonprofitRelationship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Computed state
  const isUserMember = !!relationship?.isMember && !!relationship?.isActive;
  const isUserInCommunity = !!relationship?.isCommunity && !!relationship?.isActive;
  const isUserStaff = !!relationship?.isStaff && !!relationship?.isActive;
  
  const refreshRelationship = async () => {
    if (!user || !organizationId) {
      setRelationship(null);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // First try with direct document ID lookup (most reliable)
      const relationshipId = `${user.uid}:${organizationId}`;
      const directDocRef = doc(db, 'user_nonprofit_relationships', relationshipId);
      const directDocSnap = await getDoc(directDocRef);
      
      if (directDocSnap.exists()) {
        const relationshipData = relationshipFromFirestore(directDocSnap);
        setRelationship(relationshipData);
        setError(null);
        setLoading(false);
        return;
      }
      
      // Fall back to query if direct lookup fails
      const relationshipsRef = collection(db, 'user_nonprofit_relationships');
      const q = query(
        relationshipsRef,
        where('user', '==', doc(db, 'users', user.uid)),
        where('nonprofit', '==', doc(db, 'nonprofits', organizationId))
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setRelationship(null);
      } else {
        const relationshipData = relationshipFromFirestore(querySnapshot.docs[0]);
        setRelationship(relationshipData);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching relationship:', err);
      setError('Failed to load relationship status');
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle community membership
  const toggleCommunity = async (): Promise<boolean> => {
    if (!user || !organizationId) {
      setError('You must be logged in to join/leave a community');
      return false;
    }
    
    try {
      setLoading(true);
      
      // Determine the relationship ID
      const relationshipId = relationship?.id || `${user.uid}:${organizationId}`;
      const relationshipRef = doc(db, 'user_nonprofit_relationships', relationshipId);
      
      if (!relationship || !relationship.isCommunity || !relationship.isActive) {
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
        
        // Refresh relationship after toggle
        await refreshRelationship();
        return true; // Joined successfully
      } else {
        // User is in community - leave community
        // Don't allow leaving if they're a member
        if (relationship.isMember) {
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
        
        // Refresh relationship after toggle
        await refreshRelationship();
        return false; // Left successfully (returning false indicates no longer in community)
      }
    } catch (err) {
      console.error('Error toggling community membership:', err);
      setError('Failed to update community membership');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Load relationship when user or organizationId changes
  useEffect(() => {
    refreshRelationship();
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