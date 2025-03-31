import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  setDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { UserNonprofitRelationship } from '@/lib/models/UserNonprofitRelationship';

export const fetchUserRelationship = async (
  userId: string,
  organizationId: string
): Promise<UserNonprofitRelationship | null> => {
  if (!userId || !organizationId) return null;
  
  try {
    // First try with direct document ID lookup (most reliable)
    const relationshipId = `${userId}:${organizationId}`;
    const directDocRef = doc(db, 'user_nonprofit_relationships', relationshipId);
    const directDocSnap = await getDoc(directDocRef);
    
    if (directDocSnap.exists()) {
      const data = directDocSnap.data();
      return {
        id: directDocSnap.id,
        userId,
        nonprofitId: organizationId,
        isStaff: data.is_manager || false,
        isMember: data.is_member || false,
        isCommunity: data.is_community || false,
        isActive: data.is_active !== false, // true by default
        displayFilter: data.display_filter || null,
        isManager: data.is_manager || false
      };
    }
    
    // Fall back to query if direct lookup fails
    const relationshipsRef = collection(db, 'user_nonprofit_relationships');
    const q = query(
      relationshipsRef,
      where('user', '==', doc(db, 'users', userId)),
      where('nonprofit', '==', doc(db, 'nonprofits', organizationId))
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const docData = querySnapshot.docs[0].data();
    
    return {
      id: querySnapshot.docs[0].id,
      userId,
      nonprofitId: organizationId,
      isStaff: docData.is_manager || false,
      isMember: docData.is_member || false,
      isCommunity: docData.is_community || false,
      isActive: docData.is_active !== false, // true by default
      displayFilter: docData.display_filter || null,
      isManager: docData.is_manager || false
    };
  } catch (error) {
    console.error('Error fetching user relationship:', error);
    return null;
  }
};

export const toggleCommunityMembership = async (
  userId: string,
  organizationId: string
): Promise<boolean> => {
  if (!userId || !organizationId) return false;
  
  try {
    // Get current relationship
    const relationship = await fetchUserRelationship(userId, organizationId);
    
    // Determine the relationship ID
    const relationshipId = relationship?.id || `${userId}:${organizationId}`;
    const relationshipRef = doc(db, 'user_nonprofit_relationships', relationshipId);
    
    if (!relationship || !relationship.isCommunity || !relationship.isActive) {
      // User is not in community or relationship is inactive - join community
      await setDoc(relationshipRef, {
        user: doc(db, 'users', userId),
        nonprofit: doc(db, 'nonprofits', organizationId),
        is_manager: false,
        is_member: false,
        is_community: true,
        is_active: true,
        created_time: Timestamp.now(),
        display_filter: 'community'
      });
      return true; // Joined successfully
    } else {
      // User is in community - leave community
      // Don't allow leaving if they're a member
      if (relationship.isMember) {
        return false;
      }
      
      await setDoc(relationshipRef, {
        user: doc(db, 'users', userId),
        nonprofit: doc(db, 'nonprofits', organizationId),
        is_manager: false,
        is_member: false,
        is_community: false,
        is_active: false,
        created_time: Timestamp.now(),
        display_filter: 'community'
      });
      return false; // Left successfully (returning false indicates no longer in community)
    }
  } catch (error) {
    console.error('Error toggling community membership:', error);
    throw error;
  }
}; 