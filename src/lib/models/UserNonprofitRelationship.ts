import { DocumentSnapshot, DocumentReference } from 'firebase/firestore';

export interface UserNonprofitRelationship {
  id: string;
  userId: string;
  nonprofitId: string | null;
  isStaff: boolean;
  isMember: boolean;
  isCommunity: boolean;
  isActive: boolean;
  displayFilter: string | null;
  isManager: boolean;
}

export const relationshipFromFirestore = (doc: DocumentSnapshot): UserNonprofitRelationship | null => {
  const data = doc.data();
  if (!data) return null;
  
  // Get user ID from the reference
  let userId: string;
  if (data.user instanceof DocumentReference) {
    userId = data.user.id;
  } else {
    userId = data.user_id as string || '';
  }
  
  // Get nonprofit ID from the reference
  let nonprofitId: string | null = null;
  if (data.nonprofit instanceof DocumentReference) {
    nonprofitId = data.nonprofit.id;
  } else if (typeof data.nonprofit_id === 'string') {
    nonprofitId = data.nonprofit_id;
  }
  
  // Get display filter and check for manager status
  const displayFilter = data.display_filter as string || null;
  const isManager = displayFilter === 'manager' || (data.is_manager as boolean || false);
  
  return {
    id: doc.id,
    userId,
    nonprofitId,
    isStaff: isManager, // For backwards compatibility
    isMember: data.is_member as boolean || false,
    isCommunity: data.is_community as boolean || false,
    isActive: data.is_active as boolean ?? true,
    displayFilter,
    isManager
  };
}; 