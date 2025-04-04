import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTheme } from '@/lib/context/ThemeContext';

export interface Member {
  id: string;
  name: string;
  photoURL?: string;
  role?: string;
  firstName?: string | null; // Add firstName field to support first name display
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
  const [borderColors, setBorderColors] = useState<string[]>([]);
  const [glowColorValue, setGlowColorValue] = useState<string>('transparent');
  
  // Circle size increased by 15%
  const SIZE = 69; // 60px + 15%
  
  // Update colors whenever the theme or style changes
  useEffect(() => {
    const theme = themeId ? getTheme(themeId) : null;
    
    // Calculate gradient colors
    let colors: string[] = [];
    switch (style) {
      case PersonCircleStyle.STAFF:
        colors = ['#8BBEF9', '#9E91C5'];
        setGlowColorValue('rgba(139, 190, 249, 0.56)');
        break;
      case PersonCircleStyle.STAFF_WITH_THEME:
        if (theme && theme.primaryColor) {
          // Ensure primaryColor has proper format (with #)
          const primaryWithHash = theme.primaryColor.startsWith('#') ? 
            theme.primaryColor : `#${theme.primaryColor}`;
          
          // Generate gradient colors
          if (theme.gradientColors && theme.gradientColors.length >= 2) {
            // Use theme's gradient colors
            colors = theme.gradientColors.map(color => 
              color.startsWith('#') ? color : `#${color}`
            );
          } else {
            // Generate gradient from primary color
            colors = [primaryWithHash, shadeColor(primaryWithHash, -20)];
          }
          
          // Set glow color
          const rgb = hexToRgb(primaryWithHash.replace('#', ''));
          setGlowColorValue(`rgba(${rgb}, 0.56)`);
        } else {
          // Fallback colors if theme is missing
          colors = ['#8BBEF9', '#9E91C5'];
          setGlowColorValue('rgba(139, 190, 249, 0.56)');
        }
        break;
      case PersonCircleStyle.MEMBER:
        colors = ['#FFD700', '#FFA500']; // Gold to orange gradient
        setGlowColorValue('transparent');
        break;
      case PersonCircleStyle.COMMUNITY:
      default:
        colors = []; // No border for community members
        setGlowColorValue('transparent');
        break;
    }
    
    setBorderColors(colors);
  }, [member.id, style, themeId, getTheme]);
  
  // Helper to convert hex to rgb components
  const hexToRgb = (hex: string): string => {
    // Handle both 3 and 6 digit hex codes
    const sanitized = hex.replace(/^#/, '');
    const r = parseInt(sanitized.length === 3 ? sanitized[0] + sanitized[0] : sanitized.substring(0, 2), 16);
    const g = parseInt(sanitized.length === 3 ? sanitized[1] + sanitized[1] : sanitized.substring(2, 4), 16);
    const b = parseInt(sanitized.length === 3 ? sanitized[2] + sanitized[2] : sanitized.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  };
  
  // Helper to darken/lighten a color
  const shadeColor = (color: string, percent: number): string => {
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);

    R = Math.min(255, Math.max(0, R + percent));
    G = Math.min(255, Math.max(0, G + percent));
    B = Math.min(255, Math.max(0, B + percent));

    const rr = ((R.toString(16).length === 1) ? "0" + R.toString(16) : R.toString(16));
    const gg = ((G.toString(16).length === 1) ? "0" + G.toString(16) : G.toString(16));
    const bb = ((B.toString(16).length === 1) ? "0" + B.toString(16) : B.toString(16));

    return "#" + rr + gg + bb;
  };
  
  // Get user's first name initial
  const getFirstInitial = (): string => {
    if (member.firstName && member.firstName.length > 0) {
      return member.firstName.charAt(0).toUpperCase();
    }
    const firstName = member.name.split(' ')[0];
    return firstName.charAt(0).toUpperCase();
  };
  
  // Determine if we should show glow
  const shouldShowGlow = (): boolean => {
    return style === PersonCircleStyle.STAFF || style === PersonCircleStyle.STAFF_WITH_THEME;
  };
  
  return (
    <button 
      onClick={onClick}
      className="relative flex items-center justify-center"
      aria-label={`View ${member.name}'s profile`}
    >
      {/* Container with proper spacing for glow effect */}
      <div className="p-2">
        {/* Main circle container with border */}
        <div 
          className="relative rounded-full overflow-hidden"
          style={{
            width: `${SIZE}px`,
            height: `${SIZE}px`,
            boxShadow: shouldShowGlow() ? `0 0 10px ${glowColorValue}` : 'none',
            border: borderColors.length > 0 ? '2px solid transparent' : 'none',
            background: borderColors.length > 0 ? 
              `linear-gradient(to bottom, ${borderColors.join(', ')}) border-box` : 'none'
          }}
        >
          {/* Inner circle container */}
          <div 
            className="absolute inset-0 rounded-full overflow-hidden" 
            style={{
              margin: '1px',
              background: 'rgb(51, 51, 51)'
            }}
          >
            {member.photoURL ? (
              // With photo
              <img
                src={member.photoURL}
                alt={member.name}
                className="w-full h-full object-cover"
              />
            ) : (
              // Without photo - show initial
              <div 
                className="flex items-center justify-center w-full h-full"
                style={{
                  background: 'linear-gradient(to bottom, rgb(51, 51, 51), rgb(77, 77, 77))'
                }}
              >
                <span className="text-white/70 text-3xl font-marfa font-semibold">
                  {getFirstInitial()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};

export default PersonCircleView; 