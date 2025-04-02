/**
 * FontAwesome Icons Compatibility File
 * 
 * This file contains compatibility exports to ensure existing code
 * continues to work with the new icon system that uses SVG+JS.
 */

// Import from the main index file - use only names that actually exist
import {
  FAIcon,
  Icon,
  DebugIcon,
  DebugFontIcon,
  FontAwesomeIconStyle,
  SVGIconStyle
} from './index';

// No need to directly import DirectFontAwesome since it's now properly
// exported from the index.ts file directly
import { default as DirectSVGComponent } from './DirectSVG';

// Re-export with old names for backward compatibility
export const DirectSVG = DirectSVGComponent;
export const DebugFontAwesome = DebugFontIcon;
export const ProperFontAwesome = Icon;
export const ProperIconStyle = SVGIconStyle;
export const IconStyle = FontAwesomeIconStyle;
export const FontIconStyle = FontAwesomeIconStyle;
export const FontAwesomeIcon = FAIcon; 