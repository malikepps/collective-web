import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { MembershipTier, tierFromFirestore, standardTiers } from '@/lib/models/MembershipTier';

export function useMembershipTiers(organizationId: string | null) {
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendedTier, setRecommendedTier] = useState<MembershipTier | null>(null);
  const [loadCount, setLoadCount] = useState(0); // Add a counter to prevent excessive loading

  // Use useCallback to memoize the loadTiers function
  const refreshTiers = useCallback(async () => {
    // Limit the number of load attempts to prevent infinite loops
    if (loadCount > 2) {
      console.log('[DEBUG] Too many load attempts, stopping to prevent infinite loop');
      setLoading(false);
      return;
    }

    if (!organizationId) {
      setTiers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setLoadCount(prevCount => prevCount + 1);
      console.log('[DEBUG] Loading membership tiers for nonprofit:', organizationId, 'attempt:', loadCount + 1);
      
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
  }, [organizationId, loadCount]);

  // Load tiers only once when organizationId changes
  useEffect(() => {
    refreshTiers();
  }, [organizationId]); // Deliberately not including refreshTiers in dependencies

  return {
    tiers,
    loading,
    error,
    recommendedTier,
    refreshTiers
  };
} 