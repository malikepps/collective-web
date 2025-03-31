import { useState, useEffect } from 'react';
import { collection, getDocs, query, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { MembershipTier, tierFromFirestore, standardTiers } from '@/lib/models/MembershipTier';

export function useMembershipTiers(organizationId: string | null) {
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendedTier, setRecommendedTier] = useState<MembershipTier | null>(null);

  const loadTiers = async () => {
    if (!organizationId) {
      setTiers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('[DEBUG] Loading membership tiers for nonprofit:', organizationId);
      
      // Get reference to the nonprofit's membership_tiers subcollection
      const tiersRef = collection(db, 'nonprofits', organizationId, 'membershipTiers');
      const snapshot = await getDocs(tiersRef);
      
      let loadedTiers: MembershipTier[] = [];
      
      snapshot.forEach(doc => {
        const tier = tierFromFirestore(doc);
        if (tier) {
          loadedTiers.push(tier);
        }
      });
      
      // If no tiers found, use standard tiers
      if (loadedTiers.length === 0) {
        console.log('[DEBUG] No membership tiers found, using standard tiers');
        loadedTiers = standardTiers();
      }
      
      // Sort tiers by price
      loadedTiers.sort((a, b) => a.price - b.price);
      
      // Find recommended tier
      const recommended = loadedTiers.find(tier => tier.isRecommended);
      setRecommendedTier(recommended || null);
      
      setTiers(loadedTiers);
      setError(null);
    } catch (err) {
      console.error('[DEBUG] Error loading membership tiers:', err);
      setError('Failed to load membership tiers');
      
      // Fallback to standard tiers
      const defaultTiers = standardTiers();
      setTiers(defaultTiers);
      
      // Find recommended tier in default tiers
      const recommended = defaultTiers.find(tier => tier.isRecommended);
      setRecommendedTier(recommended || null);
    } finally {
      setLoading(false);
    }
  };

  // Load tiers when organizationId changes
  useEffect(() => {
    loadTiers();
  }, [organizationId]);

  return {
    tiers,
    loading,
    error,
    recommendedTier,
    refreshTiers: loadTiers
  };
} 