// Import components
import FontAwesomeIcon, { IconStyle as FontAwesomeIconStyle } from './FontAwesomeIcon';
import SVGIcon, { SVGIconStyle } from './SVGIcon';
import { 
  Icon as OriginalIcon, 
  colorFromHex, 
  DuotoneColorPresets,
  printAvailableFonts,
  loadFontAwesomeCSS,
  FontFamilies 
} from './FontAwesome';
import type { DuotoneColors } from './FontAwesome';

// Re-export utility functions and types
export { 
  colorFromHex, 
  DuotoneColorPresets,
  printAvailableFonts,
  loadFontAwesomeCSS,
  FontFamilies 
};

export type { DuotoneColors };

// Re-export styles and enums with unique names
export { FontAwesomeIconStyle, SVGIconStyle };

// Define clear component exports with unique names
export const FontIcon = OriginalIcon; // Original icon from FontAwesome.tsx
export const Icon = SVGIcon; // Primary icon implementation (SVG-based)
export const FAIcon = FontAwesomeIcon; // Font Awesome font-based icon

// Direct component references with unique names
export const FontBasedIcon = FontAwesomeIcon; // Font-based implementation 
export const SVGBasedIcon = SVGIcon; // SVG-based implementation

// Alias exports with clear naming
export const DirectFAIcon = FontAwesomeIcon; // Used in components expecting the old font implementation
export const DirectSVGIcon = SVGIcon; // Used in components expecting the SVG implementation

// Debug helpers
export const DebugFontIcon = FontAwesomeIcon; // For debugging font issues

// Default export
export default SVGIcon;

// NOTE: Do not re-export everything from compatibility.ts to avoid circular dependencies
// Re-export specific compatibility items as needed 