// Import base components
import FontAwesomeIcon, { IconStyle } from './FontAwesomeIcon';
import SVGIcon, { SVGIconStyle } from './SVGIcon';
import DirectFontAwesomeComponent from './DirectFontAwesome'; 
import DirectSVGComponent from './DirectSVG';
import { 
  colorFromHex, 
  DuotoneColorPresets,
  printAvailableFonts,
  loadFontAwesomeCSS,
  FontFamilies 
} from './FontAwesome';
import type { DuotoneColors } from './FontAwesome';
import SVGIconInitializer from './SVGIconInitializer';

// Try to import optional components
let DebugIconComponent;
try {
  DebugIconComponent = require('./DebugIcon').default;
} catch {
  DebugIconComponent = FontAwesomeIcon;
}

// Define fallback IconSize if not available
export enum IconSize {
  SMALL = 16,
  MEDIUM = 24,
  LARGE = 32
}

// Direct exports of core components - these are what components actually import
export { default as FontAwesomeIcon } from './FontAwesomeIcon';
export { default as SVGIcon } from './SVGIcon';
export { default as DirectFontAwesome } from './DirectFontAwesome';
export { default as DirectSVG } from './DirectSVG';
export { default as SVGIconInitializer } from './SVGIconInitializer';

// Export types and enums
export { IconStyle, SVGIconStyle };
export type { DuotoneColors };

// Export utility functions
export { 
  colorFromHex, 
  DuotoneColorPresets,
  printAvailableFonts,
  loadFontAwesomeCSS,
  FontFamilies 
};

// Aliases for components
export const FAIcon = FontAwesomeIcon;
export const Icon = SVGIcon;
export const DebugIcon = DebugIconComponent;
export const DebugFontIcon = FontAwesomeIcon;
export const DebugFontAwesome = FontAwesomeIcon;
export const FontIconStyle = IconStyle;
export const FontAwesomeIconStyle = IconStyle;

// Default export
export default SVGIcon; 