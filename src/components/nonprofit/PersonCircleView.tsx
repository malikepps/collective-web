import React from 'react';
import Image from 'next/image';
import { useTheme } from '@/lib/context/ThemeContext';

export interface Member {
  id: string;
  name: string;
  photoURL?: string;
  role?: string;
}

export enum PersonCircleStyle {
  STAFF = 'staff',
  STAFF_WITH_THEME = 'staffWithTheme',
  MEMBER = 'member',
  COMMUNITY = 'community'
}

interface PersonCircleViewProps {
  member: Member;
  style: PersonCircleStyle;
  themeId?: string;
  onClick?: () => void;
}

const PersonCircleView: React.FC<PersonCircleViewProps> = ({
  member,
  style,
  themeId,
  onClick
}) => {
  const { getTheme } = useTheme();
  const theme = themeId ? getTheme(themeId) : null;
  
  // Determine gradient colors based on style
  const gradientColors = (): string[] => {
    switch (style) {
      case PersonCircleStyle.STAFF:
        return ['#8BBEF9', '#9E91C5'];
      case PersonCircleStyle.STAFF_WITH_THEME:
        if (theme?.gradientColors && theme.gradientColors.length >= 2) {
          return theme.gradientColors.map(color => `#${color}`);
        }
        return ['#8BBEF9', '#9E91C5'];
      case PersonCircleStyle.MEMBER:
        return ['#FFD700', '#FFA500'];
      case PersonCircleStyle.COMMUNITY:
      default:
        return [];
    }
  };
  
  // Determine if the style should show glow
  const shouldShowGlow = (): boolean => {
    return style === PersonCircleStyle.STAFF || style === PersonCircleStyle.STAFF_WITH_THEME;
  };
  
  // Determine glow color based on style
  const glowColor = (): string => {
    if (style === PersonCircleStyle.STAFF) {
      return 'rgba(139, 190, 249, 0.42)'; // #8BBEF9 with opacity
    } else if (style === PersonCircleStyle.STAFF_WITH_THEME && theme?.primaryColor) {
      return `rgba(${hexToRgb(theme.primaryColor)}, 0.42)`;
    }
    return 'transparent';
  };
  
  // Helper to convert hex to rgba
  const hexToRgb = (hex: string): string => {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  };
  
  return (
    <button 
      onClick={onClick}
      className="relative flex items-center justify-center"
    >
      <div className={`w-[60px] h-[60px] rounded-full overflow-hidden
        ${shouldShowGlow() ? 'shadow-lg' : ''}
      `}
        style={{
          boxShadow: shouldShowGlow() ? `0 0 12px ${glowColor()}` : 'none'
        }}
      >
        {member.photoURL ? (
          // With photo
          <div className="relative w-full h-full">
            <Image
              src={member.photoURL}
              alt={member.name}
              fill
              style={{ objectFit: 'cover' }}
            />
            
            {/* Add border gradient if needed */}
            {gradientColors().length > 0 && (
              <div 
                className="absolute inset-0 rounded-full z-10 pointer-events-none"
                style={{
                  background: 'transparent',
                  border: '2px solid transparent',
                  borderRadius: '9999px',
                  backgroundImage: `linear-gradient(to bottom, ${gradientColors().join(', ')})`,
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                  boxSizing: 'border-box'
                }}
              />
            )}
          </div>
        ) : (
          // Without photo - show initials
          <div className={`flex items-center justify-center w-full h-full
            ${gradientColors().length > 0 ? 'border-2 border-transparent' : ''}
          `}
            style={{
              background: 'linear-gradient(to bottom, rgb(51, 51, 51), rgb(77, 77, 77))',
              backgroundOrigin: gradientColors().length > 0 ? 'border-box' : 'padding-box',
              backgroundClip: gradientColors().length > 0 ? 'padding-box, border-box' : 'padding-box',
              boxSizing: 'border-box',
              position: 'relative'
            }}
          >
            <span className="text-white/70 text-3xl font-semibold">
              {member.name.charAt(0).toUpperCase()}
            </span>
            
            {/* Add border gradient if needed */}
            {gradientColors().length > 0 && (
              <div 
                className="absolute inset-0 rounded-full z-10 pointer-events-none"
                style={{
                  background: 'transparent',
                  border: '2px solid transparent',
                  borderRadius: '9999px',
                  backgroundImage: `linear-gradient(to bottom, ${gradientColors().join(', ')})`,
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                  boxSizing: 'border-box'
                }}
              />
            )}
          </div>
        )}
      </div>
    </button>
  );
};

export default PersonCircleView; 