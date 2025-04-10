import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFirestore, collection, getDocs, QueryDocumentSnapshot } from 'firebase/firestore';
import { app } from '@/lib/firebase/config';
import { updateNonprofitTheme } from '@/lib/firebase/firestoreUtils';
import { sortByROYGBIV } from '@/lib/utils/colorUtils';
import ThemeSquare from './ThemeSquare';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import { DirectSVG, SVGIconStyle } from '@/lib/components/icons';

// Define the structure of a Theme document from Firestore
interface ThemeDoc {
  id: string;
  name?: string;
  category?: string;
  primary_color?: string;
  secondary_color?: string;
  gradient_colors?: string[];
  // Add other potential fields if needed
}

interface ThemeSelectionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newThemeId: string) => void; // Callback when theme is successfully saved
  organizationId: string;
  initialThemeId: string | null;
}

const ThemeSelectionSheet: React.FC<ThemeSelectionSheetProps> = ({ 
  isOpen,
  onClose,
  onSave,
  organizationId,
  initialThemeId
}) => {
  const [themes, setThemes] = useState<ThemeDoc[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(initialThemeId);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const db = getFirestore(app);

  // Fetch themes from Firestore on mount
  useEffect(() => {
    const fetchThemes = async () => {
      if (!isOpen) return;
      
      setIsLoading(true);
      setError(null);
      console.log("[ThemeSheet] Fetching themes...");
      try {
        const themesCollection = collection(db, 'themes');
        const themeSnapshot = await getDocs(themesCollection);
        console.log(`[ThemeSheet] Fetched ${themeSnapshot.docs.length} raw documents.`);
        // Log raw data for one doc if available
        if (themeSnapshot.docs.length > 0) {
            console.log("[ThemeSheet] Raw data sample (doc 0):", themeSnapshot.docs[0].data());
        }
        const themesList = themeSnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
          id: doc.id,
          ...doc.data()
        } as ThemeDoc));
        setThemes(themesList);
        console.log("[ThemeSheet] Mapped themes state:", themesList);
      } catch (err) {
        console.error("[ThemeSheet] Error fetching themes:", err);
        setError('Failed to load themes. Please try again.');
      } finally { // Use finally to ensure isLoading is always set to false
        setIsLoading(false);
        console.log("[ThemeSheet] Fetching finished. isLoading:", false);
      }
    };

    fetchThemes();
  }, [db, isOpen]);

  // Reset selection when initialThemeId changes
  useEffect(() => {
    setSelectedThemeId(initialThemeId);
  }, [initialThemeId]);

  // Group and sort themes for display
  const groupedAndSortedThemes = useMemo(() => {
    console.log("[ThemeSheet] Memoizing: Grouping and sorting themes. Input themes count:", themes.length);
    const categoryOrder = ["bright", "neutral", "subtle", "light"];
    const groups: { [key: string]: ThemeDoc[] } = {};

    themes.forEach(theme => {
      const category = theme.category || 'other';
      if (!groups[category]) {
        groups[category] = [];
      }
      if (theme.primary_color) { // Ensure primary color exists
          groups[category].push(theme);
      } else {
          console.log(`[ThemeSheet] Skipping theme ${theme.id} due to missing primary_color.`);
      }
    });
    console.log("[ThemeSheet] Memoizing: Grouped themes (before sorting categories):", groups);

    Object.keys(groups).forEach(category => {
      groups[category] = sortByROYGBIV(groups[category]);
    });

    const sortedGroups = Object.entries(groups).sort(([catA], [catB]) => {
      const indexA = categoryOrder.indexOf(catA);
      const indexB = categoryOrder.indexOf(catB);
      if (indexA === -1 && indexB === -1) return catA.localeCompare(catB);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
    console.log("[ThemeSheet] Memoizing: Final grouped and sorted themes structure:", sortedGroups);
    return sortedGroups;
  }, [themes]);

  const handleThemeSelect = (themeId: string) => {
    setSelectedThemeId(themeId);
  };

  const handleAttemptSave = () => {
    if (selectedThemeId !== initialThemeId && selectedThemeId) {
      setShowConfirmation(true);
    } else {
      onClose(); 
    }
  };

  const handleConfirmSave = async () => {
    if (!selectedThemeId) return;
    
    setIsSaving(true);
    setShowConfirmation(false);
    setError(null);
    console.log(`[ThemeSheet] Attempting to save theme ${selectedThemeId} for org ${organizationId}`);
    try {
      await updateNonprofitTheme(organizationId, selectedThemeId);
      console.log(`[ThemeSheet] Successfully saved theme.`);
      onSave(selectedThemeId); 
    } catch (err) {
      console.error("[ThemeSheet] Error saving theme:", err);
      setError('Failed to save theme. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelSave = () => {
    setShowConfirmation(false);
  };

  const hasChanged = selectedThemeId !== initialThemeId;

  const sheetVariants = {
    hidden: { y: "100%" },
    visible: { y: "0%" },
  };
  
  // Log state before rendering content area
  console.log(`[ThemeSheet] Rendering content. isLoading: ${isLoading}, error: ${error}, groupedThemes count: ${groupedAndSortedThemes.length}`);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-60 z-[90] flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-card w-full ios-sheet-top overflow-hidden flex flex-col"
            style={{ maxHeight: '65vh' }}
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 sticky top-0 bg-card z-10">
              <button 
                onClick={onClose}
                className="text-blue-400 font-medium text-lg"
                disabled={isSaving}
              >
                Cancel
              </button>
              <h2 className="text-white font-semibold text-lg">Select Theme</h2>
              <button 
                onClick={handleAttemptSave}
                className={`font-semibold text-lg ${hasChanged ? 'text-blue-400' : 'text-gray-500'}`}
                disabled={!hasChanged || isSaving}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-grow overflow-y-auto p-4">
              {isLoading && (
                <div className="flex justify-center items-center h-40">
                  <p className="text-gray-400">Loading themes...</p>
                </div>
              )}
              {error && (
                 <div className="text-center text-red-500 p-4">{error}</div>
              )}
              {!isLoading && !error && (
                <div className="space-y-6">
                  {groupedAndSortedThemes.length > 0 ? (
                     groupedAndSortedThemes.map(([category, categoryThemes]) => (
                        <div key={category}>
                          <h3 className="text-gray-400 font-medium mb-3 capitalize text-lg pl-1">{category}</h3>
                          <div className="grid grid-cols-4 gap-4">
                            {categoryThemes.map((theme) => (
                              <ThemeSquare
                                key={theme.id}
                                id={theme.id}
                                primaryColor={theme.primary_color!} 
                                isSelected={selectedThemeId === theme.id}
                                onClick={handleThemeSelect}
                              />
                            ))}
                          </div>
                        </div>
                      ))
                  ) : (
                     <p className="text-gray-500 text-center pt-10">No themes available to display.</p>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Confirmation Dialog */}
          <ConfirmationDialog
             isOpen={showConfirmation}
             title="Confirm Theme Change"
             message="Are you sure you want to apply this theme?"
             confirmText="Apply Theme"
             onConfirm={handleConfirmSave}
             onCancel={handleCancelSave}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ThemeSelectionSheet; 