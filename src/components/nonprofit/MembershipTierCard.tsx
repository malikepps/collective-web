import React, { useState, useRef, useEffect } from 'react';
import { MembershipTier } from '@/lib/models/MembershipTier';
import { isColorLight } from '@/lib/models/Theme';
import { Theme } from '@/lib/models/Theme';
import { DirectFontAwesome } from '@/lib/components/icons';

interface MembershipTierCardProps {
  tier: MembershipTier;
  organizationName: string;
  theme?: Theme;
  isRecommended: boolean;
  onClick?: () => void;
}

const MembershipTierCard: React.FC<MembershipTierCardProps> = ({
  tier,
  organizationName,
  theme,
  isRecommended,
  onClick
}) => {
  const [expanded, setExpanded] = useState(false);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);
  
  // Format price to show as a whole number if it's a whole number
  const formattedPrice = tier.price % 1 === 0 ? tier.price.toString() : tier.price.toFixed(2);
  
  // Format description to replace (nonprofit) with actual organization name
  const formattedDescription = tier.description.replace(/\(nonprofit\)/g, organizationName);

  // Get theme colors with proper formatting
  const primaryColor = theme?.primaryColor ? 
    (theme.primaryColor.startsWith('#') ? theme.primaryColor : `#${theme.primaryColor}`) : 
    '#ADD3FF';
  
  // Get secondary color for "Show more" text
  const secondaryColor = theme?.secondaryColor ? 
    (theme.secondaryColor.startsWith('#') ? theme.secondaryColor : `#${theme.secondaryColor}`) : 
    primaryColor;

  // Get proper text color for primary color background
  const textColor = theme?.primaryColor && theme?.textOnPrimaryColor ? 
    (theme.textOnPrimaryColor.startsWith('#') ? theme.textOnPrimaryColor : `#${theme.textOnPrimaryColor}`) : 
    (isColorLight(theme?.primaryColor || 'ADD3FF') ? '#000000' : '#FFFFFF');

  // Parse description to handle bullet points
  const descriptionLines = formattedDescription.split('\n').map((line, index) => {
    const trimmedLine = line.trim();
    const isBullet = trimmedLine.startsWith('•') || trimmedLine.startsWith('-');
    const bulletText = isBullet ? trimmedLine.substring(1).trim() : trimmedLine;
    
    return (
      <div key={index} className={`${isBullet ? 'flex items-start' : ''}`}>
        {isBullet && (
          <span className="text-white/80 mr-2 mt-0.5">•</span>
        )}
        <p className={`text-white/80 font-marfa font-light text-base ${isBullet ? '' : 'mb-2'}`}>
          {bulletText}
        </p>
      </div>
    );
  });

  // Check if content needs "Show More" button when component mounts or window resizes
  useEffect(() => {
    const checkHeight = () => {
      if (descriptionRef.current) {
        // If the scroll height is greater than the client height, we need to show the expansion button
        const needsToExpand = descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight;
        setNeedsExpansion(needsToExpand);
      }
    };

    checkHeight();
    
    // Add resize listener
    window.addEventListener('resize', checkHeight);
    
    return () => {
      window.removeEventListener('resize', checkHeight);
    };
  }, []);

  return (
    <div 
      className={`bg-[#2A2A2A] rounded-xl p-6 ${onClick ? 'cursor-pointer' : ''}`}
      style={{ 
        border: isRecommended 
          ? `2px solid ${primaryColor}` 
          : '1px solid rgba(255, 255, 255, 0.1)'
      }}
      onClick={onClick}
    >
      {/* Recommended banner */}
      {isRecommended && (
        <div 
          className="flex items-center justify-center py-1.5 px-3 rounded-md mb-4"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="mr-2">
            <DirectFontAwesome
              icon="star"
              size={12}
              color={textColor}
            />
          </div>
          <span 
            className="text-sm font-marfa font-medium"
            style={{ color: textColor }}
          >
            Recommended
          </span>
        </div>
      )}
      
      {/* Tier name with emoji */}
      <h3 className="text-white font-marfa font-semibold text-2xl mb-2">
        {tier.emoji} {tier.displayName}
      </h3>
      
      {/* Price */}
      <div className="flex items-baseline mb-6">
        <span className="text-white font-marfa font-bold text-4xl">${formattedPrice}</span>
        <span className="text-white/70 font-marfa ml-1">/ mo</span>
      </div>
      
      {/* Join button - moved above description */}
      <button 
        className="w-full py-3 rounded-lg font-marfa font-semibold text-base mb-4"
        style={{ 
          backgroundColor: primaryColor,
          color: textColor
        }}
      >
        Join
      </button>
      
      {/* Description wrapper with fade effect */}
      <div className="relative">
        {/* Description with bullet points support */}
        <div 
          ref={descriptionRef}
          className="text-left overflow-hidden transition-all duration-300 ease-in-out"
          style={{ 
            maxHeight: expanded ? '1000px' : 'calc(45vh - 260px)',
            maskImage: !expanded && needsExpansion ? 'linear-gradient(to bottom, black 70%, transparent 100%)' : 'none',
            WebkitMaskImage: !expanded && needsExpansion ? 'linear-gradient(to bottom, black 70%, transparent 100%)' : 'none'
          }}
        >
          {descriptionLines}
        </div>
        
        {/* Show more button with theme's secondary color for text */}
        {needsExpansion && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="w-full py-2 mt-2 flex items-center justify-center"
          >
            <span 
              className="font-marfa text-sm mr-2"
              style={{ color: secondaryColor }}
            >
              {expanded ? 'Show less' : 'Show more'}
            </span>
            <DirectFontAwesome
              icon={expanded ? 'chevron-up' : 'chevron-down'}
              size={12}
              color={secondaryColor.replace('#', '')}
            />
          </button>
        )}
      </div>
    </div>
  );
};

export default MembershipTierCard; 