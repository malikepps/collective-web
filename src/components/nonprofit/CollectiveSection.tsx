import React, { useState, useEffect } from 'react';
import { Organization } from '@/lib/models/Organization';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import PersonCircleView, { Member, PersonCircleStyle } from './PersonCircleView';

interface CollectiveSectionProps {
  organization: Organization;
  onShowFilterSheet: () => void;
}

const CollectiveSection: React.FC<CollectiveSectionProps> = ({
  organization,
  onShowFilterSheet
}) => {
  const [staffMembers, setStaffMembers] = useState<Member[]>([]);
  const [regularMembers, setRegularMembers] = useState<Member[]>([]);
  const [communityMembers, setCommunityMembers] = useState<Member[]>([]);
  const [displayFilter, setDisplayFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchMembers = async () => {
      if (!organization.id) return;
      
      setLoading(true);
      try {
        // Staff members (managers)
        const staffIds = organization.staff || [];
        const managersPromises = staffIds.map(async (userId) => {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            return {
              id: userId,
              name: userDoc.data().display_name || 'Unknown User',
              photoURL: userDoc.data().photo_url,
              role: 'staff'
            } as Member;
          }
          return null;
        });
        
        // Regular members
        const memberIds = organization.members || [];
        const membersPromises = memberIds
          .filter(id => !staffIds.includes(id)) // exclude staff
          .map(async (userId) => {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
              return {
                id: userId,
                name: userDoc.data().display_name || 'Unknown User',
                photoURL: userDoc.data().photo_url,
                role: 'member'
              } as Member;
            }
            return null;
          });
        
        // Community members (simplified for now)
        const communityPromises: Promise<Member | null>[] = [];
        if (organization.id) {
          const relationsRef = collection(db, 'user_nonprofit_relationships');
          // This is a placeholder - would need proper query in production
          // This would normally query relationships where is_community=true
          communityPromises.push(
            Promise.resolve({
              id: 'community1',
              name: 'Community User',
              photoURL: undefined,
              role: 'community'
            })
          );
        }
        
        // Resolve all promises
        const [staffResults, memberResults, communityResults] = await Promise.all([
          Promise.all(managersPromises),
          Promise.all(membersPromises),
          Promise.all(communityPromises)
        ]);
        
        // Filter out nulls
        const staff = staffResults.filter((member): member is Member => member !== null);
        const members = memberResults.filter((member): member is Member => member !== null);
        const community = communityResults.filter((member): member is Member => member !== null);
        
        setStaffMembers(staff);
        setRegularMembers(members);
        setCommunityMembers(community);
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMembers();
  }, [organization.id, organization.staff, organization.members]);
  
  // Function to filter members based on selected filter
  const filteredMembers = () => {
    switch (displayFilter) {
      case 'manager':
        return staffMembers;
      case 'member':
        return regularMembers;
      case 'community':
        return communityMembers;
      case 'all':
      default:
        return [...staffMembers, ...regularMembers, ...communityMembers];
    }
  };
  
  // Helper to determine member style
  const getMemberStyle = (member: Member): PersonCircleStyle => {
    if (staffMembers.some(staff => staff.id === member.id)) {
      return organization.themeId
        ? PersonCircleStyle.STAFF_WITH_THEME
        : PersonCircleStyle.STAFF;
    } else if (regularMembers.some(m => m.id === member.id)) {
      return PersonCircleStyle.MEMBER;
    }
    return PersonCircleStyle.COMMUNITY;
  };
  
  return (
    <div className="bg-card p-4 text-white mt-1">
      {/* Header with filter button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-marfa font-semibold text-2xl">Collective</h2>
        
        <button 
          onClick={onShowFilterSheet}
          className="bg-white/20 rounded-lg px-3 py-1.5 flex items-center"
        >
          <span className="text-white/70 text-xs font-marfa mr-1">Filter</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white/70" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
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
        <div className="overflow-x-auto pb-2">
          <div className="flex space-x-3 px-2">
            {filteredMembers().map((member) => (
              <div key={member.id} className="flex flex-col items-center">
                <PersonCircleView 
                  member={member} 
                  style={getMemberStyle(member)}
                  themeId={organization.themeId || undefined}
                  onClick={() => console.log('Member clicked:', member.name)}
                />
                <span className="text-white text-xs mt-1 w-16 truncate text-center font-marfa">
                  {member.name.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectiveSection; 