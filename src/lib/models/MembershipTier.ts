import { DocumentSnapshot } from 'firebase/firestore';

export interface MembershipTier {
  id: string;
  displayName: string;
  description: string;
  price: number;
  emoji: string;
  isDefault: boolean;
  isActive: boolean;
  isRecommended: boolean;
}

export const membershipTierFromFirestore = (doc: DocumentSnapshot): MembershipTier | null => {
  const data = doc.data();
  if (!data) return null;
  
  return {
    id: doc.id,
    displayName: data.display_name || '',
    description: data.description || '',
    price: data.price || 0,
    emoji: data.emoji || '✨',
    isDefault: data.is_default || false,
    isActive: data.is_active || true,
    isRecommended: data.is_recommended || false
  };
};

export const membershipTierToFirestore = (tier: MembershipTier): Record<string, any> => {
  return {
    display_name: tier.displayName,
    description: tier.description,
    price: tier.price,
    emoji: tier.emoji,
    is_default: tier.isDefault,
    is_active: tier.isActive,
    is_recommended: tier.isRecommended
  };
};

export const getStandardTiers = (): MembershipTier[] => {
  return [
    {
      id: 'community',
      displayName: 'Community',
      description: 'Just getting to know (nonprofit)? Let them know that you support their mission!',
      price: 8,
      emoji: '💫',
      isDefault: true,
      isActive: true,
      isRecommended: false
    },
    {
      id: 'supporter',
      displayName: 'Supporter',
      description: 'Regular supporters help fund our ongoing programs and initiatives.',
      price: 25,
      emoji: '⭐️',
      isDefault: true,
      isActive: true,
      isRecommended: false
    },
    {
      id: 'champion',
      displayName: 'Champion',
      description: 'Champions receive exclusive updates and early access to events.',
      price: 75,
      emoji: '🌟',
      isDefault: true,
      isActive: true,
      isRecommended: true
    }
  ];
}; 