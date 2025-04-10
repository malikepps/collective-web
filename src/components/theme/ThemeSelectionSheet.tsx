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
      if (!isOpen) return; // Don't fetch if sheet is not open
      
      setIsLoading(true);
      setError(null);
      console.log("Fetching themes from Firestore...");
      try {
        const themesCollection = collection(db, 'themes');
        const themeSnapshot = await getDocs(themesCollection);
        const themesList = themeSnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
          id: doc.id,
          ...doc.data()
        } as ThemeDoc));
        setThemes(themesList);
        console.log(`Fetched ${themesList.length} themes.`);
      } catch (err) {
        console.error("Error fetching themes:", err);
        setError('Failed to load themes. Please try again.');
      }
      setIsLoading(false);
    };

    fetchThemes();
  }, [db, isOpen]); // Refetch if sheet re-opens

  // Reset selection when initialThemeId changes (e.g., opening for different org)
  useEffect(() => {
    setSelectedThemeId(initialThemeId);
  }, [initialThemeId]);

  // Group and sort themes for display
  const groupedAndSortedThemes = useMemo(() => {
    const categoryOrder = ["bright", "neutral", "subtle", "light"]; // Desired order
    const groups: { [key: string]: ThemeDoc[] } = {};

    themes.forEach(theme => {
      const category = theme.category || 'other';
      if (!groups[category]) {
        groups[category] = [];
      }
      // Only include themes with a primary color
      if (theme.primary_color) {
        groups[category].push(theme);
      }
    });

    // Sort themes within each category by ROYGBIV
    Object.keys(groups).forEach(category => {
      groups[category] = sortByROYGBIV(groups[category]);
    });

    // Sort the groups based on the defined category order
    const sortedGroups = Object.entries(groups).sort(([catA], [catB]) => {
      const indexA = categoryOrder.indexOf(catA);
      const indexB = categoryOrder.indexOf(catB);
      // Place categories not in the order list at the end
      if (indexA === -1 && indexB === -1) return catA.localeCompare(catB); // Alphabetical for others
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });

    return sortedGroups;
  }, [themes]);

  const handleThemeSelect = (themeId: string) => {
    setSelectedThemeId(themeId);
  };

  const handleAttemptSave = () => {
    if (selectedThemeId !== initialThemeId && selectedThemeId) {
      setShowConfirmation(true);
    } else {
      // If no change or no selection, just close
      onClose(); 
    }
  };

  const handleConfirmSave = async () => {
    if (!selectedThemeId) return;
    
    setIsSaving(true);
    setShowConfirmation(false);
    setError(null);

    try {
      await updateNonprofitTheme(organizationId, selectedThemeId);
      onSave(selectedThemeId); // Notify parent component of successful save
      // onClose() will be called by the parent or in the success handler of updateNonprofitTheme if needed
    } catch (err) {
      console.error("Error saving theme:", err);
      setError('Failed to save theme. Please try again.');
      // Optionally keep the sheet open on error, or close it
      // onClose(); 
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-60 z-[90] flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose} // Close on backdrop click
        >
          <motion.div
            className="bg-gray-900 w-full ios-sheet-top overflow-hidden flex flex-col"
            style={{ maxHeight: '65vh' }} // Approx 60-65% height
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()} // Prevent backdrop click closing the sheet
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
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
                <div className="flex justify-center items-center h-full">
                  <p className="text-gray-400">Loading themes...</p>
                  {/* Add a spinner here if desired */}
                </div>
              )}
              {error && (
                 <div className="text-center text-red-500 p-4">{error}</div>
              )}
              {!isLoading && !error && (
                <div className="space-y-6">
                  {groupedAndSortedThemes.map(([category, categoryThemes]) => (
                    <div key={category}>
                      <h3 className="text-gray-400 font-medium mb-3 capitalize text-lg pl-1">{category}</h3>
                      <div className="grid grid-cols-4 gap-4">
                        {categoryThemes.map((theme) => (
                          <ThemeSquare
                            key={theme.id}
                            id={theme.id}
                            primaryColor={theme.primary_color!} // Already filtered for themes with primary_color
                            isSelected={selectedThemeId === theme.id}
                            onClick={handleThemeSelect}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                  {groupedAndSortedThemes.length === 0 && !isLoading && (
                     <p className="text-gray-500 text-center pt-10">No themes found.</p>
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