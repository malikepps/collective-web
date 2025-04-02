import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

type FontCheckResponse = {
  fontFiles: {
    path: string;
    exists: boolean;
    size?: number;
  }[];
  jsFiles: {
    path: string;
    exists: boolean;
    size?: number;
  }[];
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<FontCheckResponse>
) {
  const publicDir = path.join(process.cwd(), 'public');
  
  // Check font files
  const fontPaths = [
    '/fonts/fa-solid-900.woff2',
    '/fonts/fa-regular-400.woff2',
    '/fonts/fa-duotone-900.woff2',
    '/fonts/fa-brands-400.woff2',
  ];
  
  const fontFiles = fontPaths.map(fontPath => {
    const fullPath = path.join(publicDir, fontPath);
    let exists = false;
    let size = undefined;
    
    try {
      const stats = fs.statSync(fullPath);
      exists = stats.isFile();
      size = stats.size;
    } catch (error) {
      exists = false;
    }
    
    return {
      path: fontPath,
      exists,
      size
    };
  });
  
  // Check JS files
  const jsPaths = [
    '/fonts/js/fontawesome.js',
    '/fonts/js/solid.js',
    '/fonts/js/regular.js',
    '/fonts/js/duotone.js',
    '/fonts/js/brands.js',
  ];
  
  const jsFiles = jsPaths.map(jsPath => {
    const fullPath = path.join(publicDir, jsPath);
    let exists = false;
    let size = undefined;
    
    try {
      const stats = fs.statSync(fullPath);
      exists = stats.isFile();
      size = stats.size;
    } catch (error) {
      exists = false;
    }
    
    return {
      path: jsPath,
      exists,
      size
    };
  });
  
  res.status(200).json({ fontFiles, jsFiles });
} 