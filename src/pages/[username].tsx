import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { Organization, organizationFromFirestore } from '@/lib/models/Organization';
import NonprofitProfile from '@/components/nonprofit/NonprofitProfile';

// Mobile-only detection component
const MobileOnlyMessage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
    <h1 className="text-xl font-marfa font-semibold mb-4 text-white">Mobile Only</h1>
    <p className="text-white/70">
      Collective is optimized for mobile devices. Please open this page on your phone.
    </p>
  </div>
);

const NonprofitProfilePage = () => {
  const router = useRouter();
  const { username } = router.query;
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(true);
  
  // Check if device is mobile
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkIsMobile = () => {
        setIsMobile(window.innerWidth <= 768);
      };
      
      checkIsMobile();
      window.addEventListener('resize', checkIsMobile);
      return () => window.removeEventListener('resize', checkIsMobile);
    }
  }, []);
  
  // Fetch organization data
  useEffect(() => {
    const fetchOrganization = async () => {
      if (!username || typeof username !== 'string') return;
      
      setLoading(true);
      try {
        // Query by username
        const organizationsRef = collection(db, 'nonprofits');
        const q = query(
          organizationsRef,
          where('username', '==', username),
          limit(1)
        );
        
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          setError('Nonprofit not found');
          setLoading(false);
          return;
        }
        
        const orgDoc = snapshot.docs[0];
        const orgData = organizationFromFirestore(orgDoc);
        
        if (orgData) {
          setOrganization(orgData);
        } else {
          setError('Failed to parse organization data');
        }
      } catch (err) {
        console.error('Error fetching organization:', err);
        setError('Failed to load nonprofit');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrganization();
  }, [username]);
  
  if (!isMobile) {
    return <MobileOnlyMessage />;
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (error || !organization) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 text-center">
        <div>
          <h1 className="text-xl font-marfa font-semibold mb-4 text-white">
            {error || 'Nonprofit not found'}
          </h1>
          <button 
            onClick={() => router.push('/')}
            className="text-white bg-primary px-4 py-2 rounded-lg mt-4"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Head>
        <title>{organization.name} | Collective</title>
        <meta name="description" content={organization.description} />
      </Head>
      
      <NonprofitProfile organization={organization} />
    </>
  );
};

export default NonprofitProfilePage; 