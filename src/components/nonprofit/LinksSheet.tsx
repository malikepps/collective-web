import React, { useState, useEffect } from 'react';
import { Organization } from '@/lib/models/Organization';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface Link {
  id: string;
  title: string;
  url: string;
  order: number;
}

interface LinksSheetProps {
  organization: Organization;
  isOpen: boolean;
  onClose: () => void;
}

const LinksSheet: React.FC<LinksSheetProps> = ({
  organization,
  isOpen,
  onClose
}) => {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadLinks = async () => {
      if (!isOpen || !organization.id) return;
      
      try {
        setLoading(true);
        const linksRef = collection(db, `nonprofits/${organization.id}/links`);
        const q = query(linksRef, orderBy('order'));
        const snapshot = await getDocs(q);
        
        const loadedLinks: Link[] = snapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title,
          url: doc.data().url,
          order: doc.data().order
        }));
        
        setLinks(loadedLinks);
      } catch (error) {
        console.error('Error loading links:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadLinks();
  }, [organization.id, isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60" 
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div 
        className="relative w-full max-w-md bg-[#111214] ios-sheet-top p-4 pb-10 max-h-[60vh] overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag indicator */}
        <div className="flex justify-center mb-6">
          <div className="w-10 h-1 bg-gray-500 rounded-full" />
        </div>
        
        {/* Title */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-marfa font-semibold text-white">Links</h3>
          <button 
            onClick={onClose}
            className="text-white/70 p-2"
          >
            ✕
          </button>
        </div>
        
        {/* Organization name */}
        <p className="text-gray-400 font-marfa mb-4">{organization.name}</p>
        
        {/* Links list */}
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : links.length === 0 ? (
          <p className="text-center text-gray-400 py-4">No links available</p>
        ) : (
          <div className="space-y-4">
            {/* Website link */}
            {organization.linkInBio && (
              <LinkRow
                title="Website"
                url={organization.linkInBio}
              />
            )}
            
            {/* Other links */}
            {links.map(link => (
              <LinkRow
                key={link.id}
                title={link.title}
                url={link.url}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Link Row Component
const LinkRow: React.FC<{ title: string; url: string }> = ({ title, url }) => {
  const handleClick = () => {
    window.open(url, '_blank');
  };
  
  return (
    <button 
      onClick={handleClick}
      className="w-full flex items-center justify-between p-3 bg-[#1D1D1D] ios-rounded-sm"
    >
      <div className="flex items-center">
        <span className="text-white mr-3">🔗</span>
        <div className="text-left">
          <p className="text-white font-marfa">{title}</p>
          <p className="text-gray-400 text-sm font-marfa truncate max-w-[200px]">{url}</p>
        </div>
      </div>
      <span className="text-gray-400">↗</span>
    </button>
  );
};

export default LinksSheet; 