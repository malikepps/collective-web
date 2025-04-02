# FontAwesome Setup for Collective Web

This directory should contain the FontAwesome Pro font files and JS files. Since we're using FontAwesome Pro, these files are not included in the repository and must be downloaded separately with your Pro license.

## Required Font Files

Place the following font files in this directory:

1. `fa-solid-900.woff2` 
2. `fa-regular-400.woff2`
3. `fa-brands-400.woff2`
4. `fa-duotone-900.woff2`
5. `fa-duotone-regular-400.woff2` (if using duotone regular icons)

## Required JS Files

Place the following JS files in the `js` subdirectory:

1. `fontawesome.js` (core library)
2. `solid.js` (solid icons)
3. `regular.js` (regular icons)
4. `duotone.js` (duotone icons) 
5. `brands.js` (brand icons)

## Deployment Checklist

When deploying to Vercel or other platforms, make sure to:

1. Include all font files in the deployment (they should be in `/public/fonts/`)
2. Include all JS files in the deployment (they should be in `/public/fonts/js/`)
3. Verify the files are properly accessible by checking the `/api/font-check` endpoint

If any of these files are missing in production, the app will attempt to use a fallback method of loading icons which may not support all icon styles.

## How to Get the Font Files

1. Log in to your FontAwesome Pro account at [fontawesome.com](https://fontawesome.com)
2. Download the "Web" package 
3. Extract the package and:
   - Copy the font files from the `/webfonts` directory to this `/public/fonts` directory
   - Copy the JS files from the `/js` directory to the `/public/fonts/js` directory

## Alternative Setup with npm

You can also set up FontAwesome Pro via npm:

1. Create a `.npmrc` file in the project root with your FontAwesome token:
   ```
   @fortawesome:registry=https://npm.fontawesome.com/
   //npm.fontawesome.com/:_authToken=YOUR_TOKEN
   ```

2. Install the required packages:
   ```
   npm install @fortawesome/fontawesome-svg-core @fortawesome/react-fontawesome @fortawesome/pro-solid-svg-icons @fortawesome/pro-regular-svg-icons @fortawesome/pro-duotone-svg-icons
   ```

3. Update the implementation in `src/lib/components/icons` to use the npm packages instead of web fonts

## Using FontAwesome in the Project

Import the FontAwesome components from our icons library:

```tsx
import { FAIcon, Icon, IconStyle } from '@/lib/components/icons';

// Use in your component
<FAIcon 
  icon={Icon.HEART} 
  size={24} 
  primaryColor="ff3b30" 
  style={IconStyle.CLASSIC}
/>

// For duotone icons
<FAIcon 
  icon={Icon.SOLAR_SYSTEM} 
  size={28} 
  primaryColor="7b89a3" 
  secondaryColor="95df9e" 
  style={IconStyle.DUOTONE}
/>
``` 