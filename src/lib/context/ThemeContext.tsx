import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Theme, themeFromFirestore } from '@/lib/models/Theme';

interface ThemeContextType {
  themes: Theme[];
  isLoading: boolean;
  getTheme: (themeId: string | null) => Theme | undefined;
  appBackgroundColor: string;
}

const ThemeContext = createContext<ThemeContextType>({
  themes: [],
  isLoading: false,
  getTheme: () => undefined,
  appBackgroundColor: '111214'
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [themeCache, setThemeCache] = useState<Record<string, Theme>>({});
  
  // Default app background color (used for contrast calculations)
  const appBackgroundColor = '111214'; // Dark background
  
  // Name of the default theme to use when none is specified
  const defaultThemeId = 'blue';
  
  useEffect(() => {
    const loadThemes = async () => {
      if (isLoading || themes.length > 0) return;
      
      setIsLoading(true);
      
      try {
        const timeoutPromise = new Promise<void>((_, reject) => {
          setTimeout(() => reject(new Error('Timeout loading themes')), 5000);
        });
        
        const loadingPromise = new Promise<void>(async (resolve) => {
          try {
            const themesQuery = query(collection(db, 'themes'), orderBy('name'));
            const snapshot = await getDocs(themesQuery);
            
            const loadedThemes: Theme[] = [];
            const cacheMap: Record<string, Theme> = {};
            
            snapshot.docs.forEach(doc => {
              const theme = themeFromFirestore(doc);
              if (theme) {
                loadedThemes.push(theme);
                cacheMap[theme.id] = theme;
              }
            });
            
            setThemes(loadedThemes);
            setThemeCache(cacheMap);
            resolve();
          } catch (error) {
            console.error('Error loading themes:', error);
            resolve(); // Still resolve to prevent hanging
          }
        });
        
        await Promise.race([loadingPromise, timeoutPromise]);
      } catch (error) {
        console.error('Themes loading timed out or failed:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadThemes();
  }, [isLoading, themes.length]);
  
  // Get a theme by ID, returns default if not found
  const getTheme = (themeId: string | null): Theme | undefined => {
    if (!themeId) {
      // Return default theme
      return themeCache[defaultThemeId] || themes.find(t => t.id === defaultThemeId);
    }
    
    // Check cache first
    if (themeCache[themeId]) {
      return themeCache[themeId];
    }
    
    // Otherwise search in array
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      // Update cache
      setThemeCache(prevCache => ({
        ...prevCache,
        [themeId]: theme
      }));
    }
    
    return theme || themeCache[defaultThemeId] || themes.find(t => t.id === defaultThemeId);
  };
  
  return (
    <ThemeContext.Provider value={{ 
      themes, 
      isLoading, 
      getTheme,
      appBackgroundColor
    }}>
      {children}
    </ThemeContext.Provider>
  );
}; 