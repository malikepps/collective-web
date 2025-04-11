import React, { useEffect, useState, useRef } from 'react';

// Define icon styles matching the current implementation
export enum SVGIconStyle {
  SOLID = 'solid',
  REGULAR = 'regular',
  DUOTONE = 'duotone',
  BRANDS = 'brands'
}

interface SVGIconProps {
  icon: string | { toString(): string };
  size?: number;
  isActive?: boolean;
  primaryColor?: string;
  color?: string; // Added for compatibility with DirectFontAwesome
  secondaryColor?: string;
  style?: SVGIconStyle;
  className?: string;
}

// Type for CSS variables in style
interface CustomCSSProperties extends React.CSSProperties {
  '--fa-primary-color': string;
  '--fa-secondary-color'?: string;
}

// Helper function to convert hex string to CSS color
const hexToColor = (hex: string): string => {
  // If it's already in rgb format, return as is
  if (hex.startsWith('rgb')) {
    return hex;
  }
  // Otherwise, ensure it has a # prefix if it's a hex color
  return hex.startsWith('#') ? hex : `#${hex}`;
};

const SVGIcon: React.FC<SVGIconProps> = ({
  icon,
  size = 24,
  isActive = true,
  primaryColor,
  color, // Support color prop for compatibility
  secondaryColor,
  style = SVGIconStyle.SOLID,
  className = '',
}) => {
  // Add debug logging for the component props
  console.log(`[SVGIcon-DEBUG] Rendering icon "${icon}" with:`, {
    style,
    primaryColor,
    color,
    secondaryColor,
    isActive,
    className
  });
  
  const [scriptStatus, setScriptStatus] = useState<"loading" | "loaded" | "error">("loading");
  const iconRef = useRef<HTMLElement>(null);
  
  // Ref to store the FontAwesome instance
  const faRef = useRef<any>(null);

  // Effect to load FontAwesome and store the instance
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loadAndProcess = () => {
        const fa = (window as any).FontAwesome;
        if (fa && fa.dom && typeof fa.dom.i2svg === 'function') {
          faRef.current = fa; // Store the instance
          setScriptStatus("loaded");
          console.log(`[SVG-DEBUG] FontAwesome scripts are loaded!`);
          // Initial processing will be handled by the next effect
        } else {
          // Handle script loading logic (simplified for brevity, assuming it works)
          console.log(`[SVG-DEBUG] FontAwesome not ready yet or loading...`);
          // Existing script loading logic would go here, eventually calling setScriptStatus("loaded") or "error"
        }
      };
      
      if ((window as any).FontAwesome) {
        loadAndProcess();
      } else {
         // Simplified: Assuming script loading happens elsewhere or via existing logic
         // In a real scenario, ensure this effect properly handles dynamic loading
         // and updates scriptStatus.
         console.log("[SVG-DEBUG] Waiting for FontAwesome script load...");
         // Placeholder for script load watching logic
         const checkInterval = setInterval(() => {
            if ((window as any).FontAwesome) {
                clearInterval(checkInterval);
                loadAndProcess();
            } 
         }, 100);
         return () => clearInterval(checkInterval); // Cleanup interval
      }
    }
  }, []); // This effect only runs once to load/find FontAwesome

  // Effect to process the icon whenever the icon name or script status changes
  useEffect(() => {
    if (scriptStatus === "loaded" && faRef.current && iconRef.current) {
      console.log(`[SVG-DEBUG] Processing icon "${icon}" because icon or script status changed.`);
      try {
        // Process just this icon using the stored FontAwesome instance
        faRef.current.dom.i2svg({ node: iconRef.current });
      } catch (err) {
        console.error('[SVG-DEBUG] Error processing icon:', err);
      }
    }
  }, [icon, scriptStatus]); // Re-run when icon or scriptStatus changes
  
  // Convert icon to string if it's an enum
  const iconName = typeof icon === 'string' ? icon : icon.toString();
  
  // Convert style to FontAwesome class prefix
  const stylePrefix = {
    [SVGIconStyle.SOLID]: 'fa-solid',
    [SVGIconStyle.REGULAR]: 'fa-regular',
    [SVGIconStyle.DUOTONE]: 'fa-duotone',
    [SVGIconStyle.BRANDS]: 'fa-brands',
  }[style] || 'fa-solid';
  
  console.log(`[SVG-DEBUG] Rendering icon "${iconName}" with style="${stylePrefix}", scriptStatus=${scriptStatus}`);
  
  // Format colors - support both primaryColor and color props
  // If color is provided, use it over primaryColor (for backward compatibility)
  const finalPrimaryColor = color || primaryColor || '7b89a3';
  
  // Special case for rocket-launch to force orange
  let primary = isActive ? hexToColor(finalPrimaryColor) : '#808080';
  if (iconName === 'rocket-launch' && finalPrimaryColor.includes('ff9500')) {
    console.log('[SVGIcon-FIX] Forcing orange color for rocket-launch');
    primary = '#ff9500'; // Force hex orange
  }
  
  // Special case for bars-filter (used in CollectiveSection)
  if (iconName === 'bars-filter') {
    console.log('[SVGIcon-FIX] Processing filter icon with color:', finalPrimaryColor);
  }
  
  const secondary = isActive && secondaryColor ? hexToColor(secondaryColor) : undefined;
  
  console.log(`[SVGIcon-DEBUG] Processed colors:`, {
    finalPrimaryColor,
    primary,
    secondary,
    isActive,
    iconName
  });
  
  // Set inline styles for color and size with proper typing
  const iconStyle: CustomCSSProperties = {
    fontSize: `${size}px`,
    '--fa-primary-color': primary,
    color: primary, // Add direct color property too
  };
  
  if (secondary) {
    // Add secondary color for duotone icons
    iconStyle['--fa-secondary-color'] = secondary;
  }
  
  // Add special handling for debug classes
  const isDebugIcon = className.includes('debug');
  if (isDebugIcon) {
    console.log(`[SVGIcon-DEBUG] This is a debug icon! Setting important styles.`);
    
    // Force the color via direct style
    if (className.includes('debug-rocket-icon') && icon === 'rocket-launch') {
      // Force orange for rocket-launch
      iconStyle['--fa-primary-color'] = '#ff9500 !important';
      iconStyle['color'] = '#ff9500 !important';
    }
  }
  
  // Add additional debug styles to visualize the icon container
  const debugStyles: React.CSSProperties = {
    border: scriptStatus === "error" ? '1px dashed red' : undefined,
    position: 'relative',
  };
  
  return (
    <span style={debugStyles} data-debug-icon={iconName} data-status={scriptStatus}>
      <i 
        ref={iconRef}
        className={`${stylePrefix} fa-${iconName} ${className}`}
        style={iconStyle}
        data-icon={iconName}
        aria-hidden="true"
      ></i>
      {scriptStatus === "error" && (
        <span style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: `${size * 0.6}px`,
          color: 'red',
        }}>!</span>
      )}
    </span>
  );
};

export default SVGIcon; 