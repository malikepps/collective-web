import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { app } from './config'; // Corrected path to firebase config

const db = getFirestore(app);

/**
 * Updates the theme_id for a specific nonprofit document in Firestore.
 * 
 * @param organizationId The ID of the nonprofit document to update.
 * @param themeId The new theme ID (string) to set.
 * @returns {Promise<void>} A promise that resolves when the update is complete.
 * @throws {Error} Throws an error if the update fails.
 */
export const updateNonprofitTheme = async (organizationId: string, themeId: string): Promise<void> => {
  if (!organizationId) {
    throw new Error('Organization ID is required to update theme.');
  }
  
  const nonprofitRef = doc(db, 'nonprofits', organizationId);
  
  try {
    await updateDoc(nonprofitRef, {
      theme_id: themeId
    });
    console.log(`Successfully updated theme for nonprofit ${organizationId} to ${themeId}`);
  } catch (error) {
    console.error(`Error updating theme for nonprofit ${organizationId}:`, error);
    throw new Error('Failed to update nonprofit theme.'); // Re-throw for handling upstream
  }
}; 