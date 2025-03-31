import React, { useState, useEffect } from 'react';
import { Organization } from '@/lib/models/Organization';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import PersonCircleView, { Member, PersonCircleStyle } from './PersonCircleView';
import { DirectFontAwesome } from '@/lib/components/icons';
import { useTheme } from '@/lib/context/ThemeContext';
import { UserNonprofitRelationship, relationshipFromFirestore } from '@/lib/models/UserNonprofitRelationship';
import { CollectiveUser, userFromFirestore } from '@/lib/models/User';

interface CollectiveSectionProps {
  organization: Organization;
  onShowFilterSheet: () => void;
}

// Extend Member interface to include relationship
interface MemberWithRelationship extends Member {
  relationship: UserNonprofitRelationship;
}

const CollectiveSection: React.FC<CollectiveSectionProps> = ({
  organization,
  onShowFilterSheet
}) => {
  const [members, setMembers] = useState<MemberWithRelationship[]>([]);
  const [displayFilter, setDisplayFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { getTheme } = useTheme();
  const theme = getTheme(organization.themeId);
  
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
            name: user.displayName,
            photoURL: user.photoURL || undefined,
            role: relationship.displayFilter || 'community',
            relationship
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
          return a.name.localeCompare(b.name);
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
  
  // Get secondary color from theme
  const secondaryColor = theme?.secondaryColor ? `#${theme.secondaryColor}` : '#ADD3FF';
  
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
  
  return (
    <div className="bg-card p-4 text-white continuous-corner">
      {/* Header with filter button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-marfa font-semibold text-2xl">Collective</h2>
        
        <button 
          onClick={onShowFilterSheet}
          className="bg-white/20 ios-rounded-sm px-3 h-8 flex items-center"
        >
          <span 
            className="text-sm font-marfa mr-1"
            style={{ color: secondaryColor }}
          >
            Filter
          </span>
          <DirectFontAwesome 
            icon="bars-filter"
            size={16}
            color={secondaryColor}
          />
        </button>
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
        <div className="overflow-hidden">
          {getRows().map((row, rowIndex) => (
            <div 
              key={`row-${rowIndex}`} 
              className="overflow-x-auto pb-4 hide-scrollbar"
              style={{ marginBottom: rowIndex === 0 && showTwoRows ? '12px' : '0' }}
            >
              <div className="flex space-x-4 px-2 min-w-min">
                {row.map((member) => (
                  <div key={member.id} className="flex flex-col items-center min-w-[66px]">
                    <PersonCircleView 
                      member={member} 
                      style={getMemberStyle(member)}
                      themeId={organization.themeId || undefined}
                      onClick={() => console.log('Member clicked:', member.name)}
                    />
                    <span className="text-white text-xs mt-2 w-16 truncate text-center font-marfa">
                      {member.name.split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectiveSection; 