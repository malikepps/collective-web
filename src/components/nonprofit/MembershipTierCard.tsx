import React from 'react';
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
  // Format price to show as a whole number if it's a whole number
  const formattedPrice = tier.price % 1 === 0 ? tier.price.toString() : tier.price.toFixed(2);
  
  // Format description to replace (nonprofit) with actual organization name
  const formattedDescription = tier.description.replace(/\(nonprofit\)/g, organizationName);

  // Theme colors with fallbacks
  const primaryColor = theme?.primaryColor ? `#${theme.primaryColor}` : '#ADD3FF';
  const textColor = theme?.primaryColor && theme?.textOnPrimaryColor 
    ? `#${theme.textOnPrimaryColor}` 
    : (isColorLight(theme?.primaryColor || 'ADD3FF') ? '#000000' : '#FFFFFF');

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
          <DirectFontAwesome
            icon="star"
            size={12}
            color={textColor}
            className="mr-2"
          />
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
      
      {/* Description with bullet points support */}
      <div className="mb-6 text-left">
        {descriptionLines}
      </div>
      
      {/* Join button */}
      <button 
        className="w-full py-3 rounded-lg font-marfa font-semibold text-base"
        style={{ 
          backgroundColor: primaryColor,
          color: textColor
        }}
      >
        Join
      </button>
    </div>
  );
};

export default MembershipTierCard; 