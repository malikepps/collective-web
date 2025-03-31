import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { fetchUserRelationship, toggleCommunityMembership } from '../services/UserOrganizationService';
import { UserNonprofitRelationship } from '../models/UserNonprofitRelationship';

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
      const rel = await fetchUserRelationship(user.uid, organizationId);
      setRelationship(rel);
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
      const result = await toggleCommunityMembership(user.uid, organizationId);
      
      // Refresh the relationship after toggling
      await refreshRelationship();
      
      return result;
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