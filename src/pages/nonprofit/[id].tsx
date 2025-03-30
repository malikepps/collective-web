import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import NonprofitProfile from '@/components/nonprofits/NonprofitProfile';

export default function NonprofitPage() {
  const router = useRouter();
  const { id } = router.query;
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  
  useEffect(() => {
    if (id && typeof id === 'string') {
      setOrganizationId(id);
    }
  }, [id]);
  
  if (!organizationId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white/80 text-lg">Loading...</p>
        </div>
      </div>
    );
  }
  
  return <NonprofitProfile organizationId={organizationId} />;
} 