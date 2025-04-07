import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// --- Configuration ---
const serviceAccountPath = path.resolve(__dirname, '../keys/Collective Dev Firebase Service Account.json');

// List of Nonprofit Display Names to trigger
const nonprofitDisplayNames = [
  "DurhamCares",
  "Echo NC",
  "LGBTQ Center of Durham",
  "Leadership Triangle",
  "Living with Autism",
  "Meals on Wheels Durham",
  "Oak City Cares",
  "A Place At The Table Cafe",
  "Bike Durham"
];

// --- Firebase Initialization ---
try {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  admin.firestore().settings({ ignoreUndefinedProperties: true });
  console.log('Firebase Admin SDK Initialized.');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  process.exit(1);
}

const db = admin.firestore();
const nonprofitsCollection = db.collection('nonprofits');

// --- Main Logic ---
async function triggerHeroGeneration() {
  console.log('Starting script to trigger hero video generation (two-step update)...');
  let updatedToFalse = 0;
  let updatedToTrue = 0;
  let notFoundCount = 0;

  // --- Step 1: Set all to False first ---
  console.log('\n--- Step 1: Setting rerender_hero to false for all nonprofits ---');
  for (const displayName of nonprofitDisplayNames) {
    console.log(`Processing (Step 1: False): ${displayName}`);
    try {
      const snapshot = await nonprofitsCollection.where('display_name', '==', displayName).limit(1).get();
      if (snapshot.empty) {
        console.warn(`  - No nonprofit found with display_name: ${displayName}. Skipping.`);
        notFoundCount++; // Count only once
        continue;
      }
      const nonprofitDoc = snapshot.docs[0];
      // Update only if it's not already false (minor optimization)
      if (nonprofitDoc.data()?.rerender_hero !== false) { 
        await nonprofitDoc.ref.update({ rerender_hero: false });
        console.log(`  - Set rerender_hero = false for ${displayName} (ID: ${nonprofitDoc.id}).`);
        updatedToFalse++;
      } else {
         console.log(`  - rerender_hero already false for ${displayName} (ID: ${nonprofitDoc.id}). Skipping update.`);
      }
    } catch (error) {
      console.error(`  - Error setting flag to false for ${displayName}:`, error);
    }
  }
  console.log(`--- Step 1 Finished: Set ${updatedToFalse} flags to false ---`);

  // --- Step 2: Set all to True ---
  console.log('\n--- Step 2: Setting rerender_hero to true for all nonprofits ---');
  await new Promise(resolve => setTimeout(resolve, 2000)); // Small delay to ensure writes propagate
  
  for (const displayName of nonprofitDisplayNames) {
    console.log(`Processing (Step 2: True): ${displayName}`);
    try {
      const snapshot = await nonprofitsCollection.where('display_name', '==', displayName).limit(1).get();
      if (snapshot.empty) {
        // Already warned in step 1
        continue;
      }
      const nonprofitDoc = snapshot.docs[0];
      console.log(`  - Setting rerender_hero = true for ${displayName} (ID: ${nonprofitDoc.id}).`);
      await nonprofitDoc.ref.update({ rerender_hero: true });
      console.log(`  - Successfully set rerender_hero = true for ${displayName} (ID: ${nonprofitDoc.id}).`);
      updatedToTrue++;
    } catch (error) {
      console.error(`  - Error setting flag to true for ${displayName}:`, error);
    }
  }

  console.log(`\nScript finished. Set ${updatedToFalse} flags to false, then set ${updatedToTrue} flags to true. Could not find ${notFoundCount} nonprofits.`);
}

// --- Run Script ---
triggerHeroGeneration().catch(error => {
  console.error('Unhandled error in main script execution:', error);
});
