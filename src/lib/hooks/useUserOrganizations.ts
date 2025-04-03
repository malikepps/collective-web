import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { collection, query, where, getDocs, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { UserNonprofitRelationship, relationshipFromFirestore } from '@/lib/models/UserNonprofitRelationship';
import { Organization } from '@/lib/models/Organization';

interface OrganizationWithRelationship {
  organization: Organization;
  relationship: UserNonprofitRelationship;
}

export function useUserOrganizations() {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<OrganizationWithRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserOrganizations = async () => {
      if (!user) {
        setOrganizations([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Query all relationships for this user
        const relationshipsRef = collection(db, 'user_nonprofit_relationships');
        const relationshipsQuery = query(
          relationshipsRef,
          where('user', '==', doc(db, 'users', user.uid)),
          where('is_active', '==', true)
        );

        const relationshipsSnapshot = await getDocs(relationshipsQuery);
        
        // Fetch organization data for each relationship
        const orgPromises = relationshipsSnapshot.docs.map(async (relationshipDoc) => {
          const relationship = relationshipFromFirestore(relationshipDoc);
          if (!relationship || !relationship.nonprofitId) return null;
          
          try {
            const orgDoc = await doc(db, 'nonprofits', relationship.nonprofitId);
            const orgSnapshot = await getDocs(query(collection(db, 'nonprofits'), where('__name__', '==', relationship.nonprofitId)));
            
            if (orgSnapshot.empty) return null;
            
            const orgData = orgSnapshot.docs[0].data();
            const organization: Organization = {
              id: relationship.nonprofitId,
              name: orgData.name || 'Unknown Organization',
              username: orgData.username || null,
              photoURL: orgData.photo_url || '',
              description: orgData.description || '',
              themeId: orgData.theme_id || null,
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
              welcomeMessage: orgData.welcome_message || null
            };
            
            return {
              organization,
              relationship,
            };
          } catch (err) {
            console.error('[DEBUG] Error fetching organization data:', err);
            return null;
          }
        });
        
        const results = await Promise.all(orgPromises);
        const validResults = results.filter((result): result is OrganizationWithRelationship => result !== null);
        
        // Sort: staff/manager first, then members, then community
        validResults.sort((a, b) => {
          // First sort by manager/staff status
          if (a.relationship.isManager && !b.relationship.isManager) return -1;
          if (!a.relationship.isManager && b.relationship.isManager) return 1;
          
          // Then sort by member status
          if (a.relationship.isMember && !b.relationship.isMember) return -1;
          if (!a.relationship.isMember && b.relationship.isMember) return 1;
          
          // Finally sort alphabetically by name
          return a.organization.name.localeCompare(b.organization.name);
        });
        
        setOrganizations(validResults);
        setError(null);
      } catch (err) {
        console.error('[DEBUG] Error in useUserOrganizations:', err);
        setError('Failed to load organizations');
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrganizations();
  }, [user]);

  return {
    organizations,
    loading,
    error,
  };
} 