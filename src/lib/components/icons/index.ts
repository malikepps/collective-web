// Export main components
export { default as FontAwesomeIcon } from './FontAwesomeIcon';
export { default as IconDemo } from './IconDemo';
export { default as DebugIcon } from './DebugIcon';
export { default as DirectFontAwesome } from './DirectFontAwesome';
export { default as DebugFontAwesome } from './DebugFontAwesome';
export { default as ProperFontAwesome } from './ProperFontAwesome';

// Export types and utilities
export { IconStyle as FontIconStyle } from './FontAwesomeIcon';
export { IconStyle as ProperIconStyle } from './ProperFontAwesome';
export { 
  Icon, 
  colorFromHex, 
  DuotoneColorPresets,
  printAvailableFonts,
  loadFontAwesomeCSS,
  FontFamilies
} from './FontAwesome';

// Export types
export type { DuotoneColors } from './FontAwesome';

// Export FontAwesome icon components
import FontAwesomeIcon, { IconStyle } from './FontAwesomeIcon';
import SVGIcon, { SVGIconStyle } from './SVGIcon';

// Create aliases for different icon implementations
export const FAIcon = FontAwesomeIcon; // The original font-based implementation
export const Icon = SVGIcon; // The new SVG-based implementation
export { SVGIconStyle };
export { IconStyle as FontAwesomeIconStyle };

// Direct export of component
export const DirectFontAwesome = FontAwesomeIcon;
export const DirectSVG = SVGIcon;

// Define proper icon implementation - use SVG by default
export const ProperFontAwesome = SVGIcon;
export const ProperIconStyle = SVGIconStyle;

// For debugging font issues
export const DebugIcon = FontAwesomeIcon;

export default SVGIcon; 