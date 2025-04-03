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
  
  useEffect(() => {
    // Check if the FontAwesome scripts are loaded
    if (typeof window !== 'undefined') {
      console.log(`[SVG-DEBUG] Checking if FontAwesome scripts are loaded...`);
      
      // Check if FontAwesome is defined in the window
      const isFontAwesomeDefined = !!(window as any).FontAwesome;
      console.log(`[SVG-DEBUG] FontAwesome object exists: ${isFontAwesomeDefined}`);
      
      if (isFontAwesomeDefined) {
        setScriptStatus("loaded");
        console.log(`[SVG-DEBUG] FontAwesome scripts are loaded!`);
        
        // Process this specific icon
        try {
          const fa = (window as any).FontAwesome;
          if (fa && fa.dom && typeof fa.dom.i2svg === 'function' && iconRef.current) {
            // Process just this icon
            fa.dom.i2svg({ node: iconRef.current });
          }
        } catch (err) {
          console.error('[SVG-DEBUG] Error processing icon:', err);
        }
      } else {
        // Look for script tags to see if they're being loaded
        const scripts = document.querySelectorAll('script');
        let fontAwesomeScripts = Array.from(scripts).filter(script => 
          script.src && script.src.includes('fontawesome')
        );
        
        console.log(`[SVG-DEBUG] FontAwesome script tags found: ${fontAwesomeScripts.length}`);
        fontAwesomeScripts.forEach(script => {
          console.log(`[SVG-DEBUG] Script: ${script.src}, status: ${script.getAttribute('data-status') || 'unknown'}`);
        });
        
        if (fontAwesomeScripts.length === 0) {
          console.error('[SVG-DEBUG] FontAwesome script tags not found in the document! Attempting to load them dynamically.');
          
          // Dynamically add the FontAwesome script tags if they're missing
          const scriptSrcs = [
            '/fonts/js/fontawesome.js',
            '/fonts/js/solid.js',
            '/fonts/js/regular.js',
            '/fonts/js/duotone.js',
            '/fonts/js/brands.js'
          ];
          
          const loadedScripts: HTMLScriptElement[] = [];
          
          const loadScript = (src: string): Promise<void> => {
            return new Promise((resolve, reject) => {
              const script = document.createElement('script');
              script.src = src;
              script.async = false;
              script.defer = true;
              script.onload = () => {
                console.log(`[SVG-DEBUG] Script loaded successfully: ${src}`);
                resolve();
              };
              script.onerror = (err) => {
                console.error(`[SVG-DEBUG] Error loading script ${src}:`, err);
                reject(err);
              };
              document.head.appendChild(script);
              loadedScripts.push(script);
            });
          };
          
          // Load scripts in sequence, fontawesome.js first, then others
          loadScript(scriptSrcs[0])
            .then(() => Promise.all(scriptSrcs.slice(1).map(loadScript)))
            .then(() => {
              console.log('[SVG-DEBUG] All FontAwesome scripts loaded successfully!');
              setScriptStatus("loaded");
              
              // Verify FontAwesome object is now available
              const faAvailable = !!(window as any).FontAwesome;
              console.log(`[SVG-DEBUG] FontAwesome object available after script load: ${faAvailable}`);
              
              if (faAvailable) {
                // Try to initialize FontAwesome manually if needed
                try {
                  const fa = (window as any).FontAwesome;
                  if (typeof fa.dom.i2svg === 'function' && iconRef.current) {
                    console.log('[SVG-DEBUG] Manually initializing FontAwesome DOM processing for this icon');
                    fa.dom.i2svg({ node: iconRef.current });
                  }
                } catch (err) {
                  console.error('[SVG-DEBUG] Error initializing FontAwesome:', err);
                }
              }
            })
            .catch(err => {
              console.error('[SVG-DEBUG] Failed to load FontAwesome scripts:', err);
              setScriptStatus("error");
            });
        } else {
          // Add an event listener to check when scripts load
          const checkScriptsLoaded = () => {
            console.log(`[SVG-DEBUG] Document load event fired, checking FontAwesome again...`);
            const isFaAvailableNow = !!(window as any).FontAwesome;
            console.log(`[SVG-DEBUG] FontAwesome available after load: ${isFaAvailableNow}`);
            if (isFaAvailableNow) {
              setScriptStatus("loaded");
              
              // Try to initialize FontAwesome manually if needed
              try {
                const fa = (window as any).FontAwesome;
                if (typeof fa.dom.i2svg === 'function' && iconRef.current) {
                  console.log('[SVG-DEBUG] Manually initializing FontAwesome DOM processing for this icon');
                  fa.dom.i2svg({ node: iconRef.current });
                }
              } catch (err) {
                console.error('[SVG-DEBUG] Error initializing FontAwesome:', err);
              }
            } else {
              setScriptStatus("error");
            }
          };
          
          if (document.readyState === 'complete') {
            checkScriptsLoaded();
          } else {
            window.addEventListener('load', checkScriptsLoaded);
            return () => window.removeEventListener('load', checkScriptsLoaded);
          }
        }
      }
    }
  }, []);
  
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