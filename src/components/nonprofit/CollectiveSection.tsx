import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Organization } from '@/lib/models/Organization';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import PersonCircleView, { Member, PersonCircleStyle } from './PersonCircleView';
import { DirectSVG } from '@/lib/components/icons';
import { SVGIconStyle } from '@/lib/components/icons/SVGIcon';
import { useTheme } from '@/lib/context/ThemeContext';
import { UserNonprofitRelationship, relationshipFromFirestore } from '@/lib/models/UserNonprofitRelationship';
import { CollectiveUser, userFromFirestore } from '@/lib/models/User';

interface CollectiveSectionProps {
  organization: Organization;
  onShowFilterSheet: () => void;
  displayFilter?: string;
  isUserStaff?: boolean;
}

// Extend Member interface to include relationship and firstName
interface MemberWithRelationship extends Member {
  relationship: UserNonprofitRelationship;
  firstName?: string | null;
  username?: string | null;
}

const CollectiveSection: React.FC<CollectiveSectionProps> = ({
  organization,
  onShowFilterSheet,
  displayFilter = 'all',
  isUserStaff = false
}) => {
  const [members, setMembers] = useState<MemberWithRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const { getTheme } = useTheme();
  const theme = getTheme(organization.themeId);
  const router = useRouter();
  
  // Get secondary color from theme
  const secondaryColor = theme?.secondaryColor ? `#${theme.secondaryColor}` : '#ADD3FF';
  
  // Add useEffect for debugging
  useEffect(() => {
    console.log('[DEBUG] Filter icon color:', {
      secondaryColor,
      secondaryColorStripped: secondaryColor.replace(/#/g, ''),
      colorType: typeof secondaryColor
    });
  }, [secondaryColor]);
  
  useEffect(() => {
    const fetchMembers = async () => {
      if (!organization.id) return;
      
      setLoading(true);
      try {
        // Query the user_nonprofit_relationships collection
        const relationshipsRef = collection(db, 'user_nonprofit_relationships');
        const relationshipsQuery = query(
          relationshipsRef,
          where('nonprofit', '==', doc(db, 'nonprofits', organization.id)),
          where('is_active', '==', true)
        );
        
        const relationshipsSnapshot = await getDocs(relationshipsQuery);
        
        // Process relationships and fetch user data
        const membersPromises = relationshipsSnapshot.docs.map(async (relationshipDoc) => {
          const relationship = relationshipFromFirestore(relationshipDoc);
          if (!relationship) return null;
          
          // Fetch user data
          const userDoc = await getDoc(doc(db, 'users', relationship.userId));
          const user = userFromFirestore(userDoc);
          
          if (!user) return null;
          
          return {
            id: user.id,
            name: user.displayName || 'Unknown User', // Fallback name
            photoURL: user.photoURL || undefined,
            role: relationship.displayFilter || 'community',
            relationship,
            firstName: user.firstName,
            username: user.username
          } as MemberWithRelationship;
        });
        
        const membersResult = await Promise.all(membersPromises);
        const validMembers = membersResult.filter((m): m is MemberWithRelationship => m !== null);
        
        // Sort members: managers first, then members, then community
        validMembers.sort((a, b) => {
          // First sort by manager status (managers first)
          if (a.relationship.isManager && !b.relationship.isManager) return -1;
          if (!a.relationship.isManager && b.relationship.isManager) return 1;
          
          // Then sort by member status (members before community)
          if (a.relationship.isMember && !b.relationship.isMember) return -1;
          if (!a.relationship.isMember && b.relationship.isMember) return 1;
          
          // If same status, sort alphabetically by name
          return getDisplayName(a).localeCompare(getDisplayName(b));
        });
        
        setMembers(validMembers);
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMembers();
  }, [organization.id]);
  
  // Function to filter members based on selected filter
  const filteredMembers = () => {
    switch (displayFilter) {
      case 'manager':
        return members.filter(m => m.relationship.isManager);
      case 'member':
        return members.filter(m => m.relationship.isMember && !m.relationship.isManager);
      case 'community':
        return members.filter(m => m.relationship.isCommunity);
      case 'all':
      default:
        return members;
    }
  };
  
  // Helper to determine member style
  const getMemberStyle = (member: MemberWithRelationship): PersonCircleStyle => {
    if (member.relationship.isManager || member.relationship.isStaff) {
      return organization.themeId
        ? PersonCircleStyle.STAFF_WITH_THEME
        : PersonCircleStyle.STAFF;
    } else if (member.relationship.isMember) {
      return PersonCircleStyle.MEMBER;
    }
    return PersonCircleStyle.COMMUNITY;
  };
  
  // Determine if we should show two rows (when more than 5 members)
  const showTwoRows = filteredMembers().length > 5;
  
  // Split members into rows
  const getRows = () => {
    const filtered = filteredMembers();
    if (!showTwoRows) {
      return [filtered];
    }
    
    // Calculate number of items per row to balance both rows
    const totalMembers = filtered.length;
    const itemsFirstRow = Math.ceil(totalMembers / 2);
    
    return [
      filtered.slice(0, itemsFirstRow),
      filtered.slice(itemsFirstRow)
    ];
  };
  
  // Replace getFirstName with getDisplayName that prioritizes firstName
  const getDisplayName = (member: MemberWithRelationship): string => {
    // Priority order: firstName, first part of displayName, fallback
    if (member.firstName && member.firstName.trim() !== '') {
      return member.firstName;
    }
    
    // Fallback to the first part of the display name
    if (member.name && member.name.trim() !== '') {
      const firstNameFromDisplay = member.name.split(' ')[0];
      if (firstNameFromDisplay) return firstNameFromDisplay;
    }
    
    // Final fallback
    return 'User';
  };
  
  // Get filter label for display
  const getFilterLabel = (): string => {
    switch (displayFilter) {
      case 'manager':
        return 'Staff';
      case 'member':
        return 'Members';
      case 'community':
        return 'Community';
      case 'all':
      default:
        return 'All';
    }
  };
  
  // --- Add handler for member click --- 
  const handleMemberClick = (memberId: string, username?: string | null) => {
    // Reverted navigation: Log intent until /user/[username].tsx page is created
    console.log(`TODO: Navigate to user profile page for ID: ${memberId}, Username: ${username || '(none)'}`);
    // if (username) {
    //   console.log(`Navigating to user profile: /user/${username}`);
    //   router.push(`/user/${username}`);
    // } else {
    //   console.warn(`Cannot navigate to profile for user ${memberId}: username is missing.`);
    // }
  };
  // --- End handler --- 

  return (
    <div className="bg-card p-4 text-white continuous-corner">
      {/* Header with filter button */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="text-white font-marfa font-semibold text-2xl">Collective</h2>
        
        {/* Container for buttons on the right */}
        <div className="flex items-center space-x-2">
          {/* Add Staff Button Placeholder - Conditional */} 
          {isUserStaff && organization.staff && organization.staff.length < 3 && (
            <button
              onClick={() => console.log('TODO: Implement Add Staff Sheet')}
              className="flex items-center px-3 py-1.5 bg-blue-600 rounded-lg text-white font-marfa text-xs hover:bg-blue-700 transition-colors duration-150"
            >
              <DirectSVG
                icon="user-plus"
                size={14}
                style={SVGIconStyle.SOLID}
                primaryColor="ffffff"
              />
              <span className="ml-1.5">Add staff</span>
            </button>
          )}

          {/* Existing Filter Button */}
          <button 
            onClick={onShowFilterSheet}
            className="bg-white/20 ios-rounded-sm px-3 h-8 flex items-center"
          >
            <span 
              className="text-sm font-marfa mr-1 flex items-center"
              style={{ color: secondaryColor }}
            >
              {displayFilter === 'all' ? 'Filter' : getFilterLabel()}
            </span>
            <div className="flex items-center justify-center">
              <DirectSVG 
                icon="bars-filter"
                size={16}
                style={SVGIconStyle.SOLID}
                color={secondaryColor.replace(/#/g, '')}
                primaryColor={secondaryColor.replace(/#/g, '')}
                className="align-middle debug-filter-icon"
                isActive={true}
              />
            </div>
          </button>
        </div>
      </div>
      
      {/* Members grid */}
      {loading ? (
        <div className="flex justify-center items-center h-24">
          <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredMembers().length === 0 ? (
        <div className="flex items-center justify-center h-20">
          <p className="text-white/50">No members found</p>
        </div>
      ) : (
        <div className="overflow-x-auto hide-scrollbar">
          <div className="flex flex-col space-y-1 min-w-min">
            {getRows().map((row, rowIndex) => (
              <div 
                key={`row-${rowIndex}`} 
                className="flex space-x-2 px-2"
              >
                {row.map((member) => (
                  <button 
                    key={member.id} 
                    onClick={() => handleMemberClick(member.id, member.username)}
                    className="flex flex-col items-center min-w-[73px] text-left"
                  >
                    <PersonCircleView 
                      member={member} 
                      style={getMemberStyle(member)}
                      themeId={organization.themeId || undefined}
                    />
                    <span 
                      className="text-white text-sm mt-1 w-20 truncate text-center font-marfa font-normal"
                      title={member.name}
                    >
                      {getDisplayName(member)}
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectiveSection; 