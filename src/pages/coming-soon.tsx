import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { DirectSVG } from '@/lib/components/icons';
import { SVGIconStyle } from '@/lib/components/icons/SVGIcon';

export default function ComingSoonPage() {
  const router = useRouter();
  const { title } = router.query;
  
  const pageTitle = typeof title === 'string' ? title : 'This Feature';
  
  return (
    <>
      <Head>
        <title>Coming Soon | Collective</title>
        <meta name="description" content="This feature is coming soon to Collective" />
      </Head>
      <div className="min-h-screen bg-[#1D1D1D] flex flex-col">
        {/* Header */}
        <div className="bg-[#1D1D1D] py-4 px-4 border-b border-gray-800">
          <div className="max-w-md mx-auto flex items-center">
            <button 
              onClick={() => router.back()}
              className="mr-4"
            >
              <DirectSVG 
                icon="arrow-left"
                size={24}
                style={SVGIconStyle.SOLID}
                primaryColor="ffffff"
              />
            </button>
            <h1 className="text-white text-xl font-marfa">{pageTitle}</h1>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <div className="mb-6">
            <DirectSVG 
              icon="rocket"
              size={80}
              style={SVGIconStyle.SOLID}
              primaryColor="404040"
            />
          </div>
          <h2 className="text-white text-2xl font-marfa mb-2">Coming Soon</h2>
          <p className="text-gray-400 max-w-sm">
            {pageTitle} is under development and will be available soon. 
            Check back later for updates!
          </p>
        </div>
      </div>
    </>
  );
} 