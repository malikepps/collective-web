/**
 * FontAwesome Icons Compatibility File
 * 
 * This file contains compatibility exports to ensure existing code
 * continues to work with the new icon system that uses SVG+JS.
 */

// Import from the new main index
import {
  FontBasedIcon,
  SVGBasedIcon,
  DirectFAIcon,
  DirectSVGIcon,
  DebugFontIcon,
  FontAwesomeIconStyle,
  SVGIconStyle,
  FAIcon
} from './index';

// Import directly from source files for components that need special handling
import DirectFontAwesomeComponent from './DirectFontAwesome';

// Re-export with old names for backward compatibility
export { DirectFontAwesomeComponent as DirectFontAwesome };
export const DirectSVG = DirectSVGIcon;
export const DebugIcon = DebugFontIcon;
export const DebugFontAwesome = DebugFontIcon;
export const ProperFontAwesome = SVGBasedIcon;
export const ProperIconStyle = SVGIconStyle;
export const IconStyle = FontAwesomeIconStyle;
export const FontIconStyle = FontAwesomeIconStyle;
export const FontAwesomeIcon = FAIcon; 