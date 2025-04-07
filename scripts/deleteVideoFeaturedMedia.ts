import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// --- Configuration ---
const serviceAccountPath = path.resolve(__dirname, '../keys/Collective Dev Firebase Service Account.json');
const BATCH_SIZE = 400; // Firestore batch write limit is 500

// List of Nonprofit Display Names to process
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

// --- Helper Function to Find Nonprofit ID (copied from previous script) ---
async function findNonprofitIdByName(name: string): Promise<string | null> {
  // No need for extensive logging here as it's just a helper
  try {
    const snapshot = await nonprofitsCollection.where('display_name', '==', name).limit(1).get();
    if (snapshot.empty) {
      return null;
    }
    return snapshot.docs[0].id;
  } catch (error) {
    console.error(`Error searching for nonprofit ID for: ${name}`, error);
    return null;
  }
}

// --- Main Deletion Logic ---
async function deleteVideoFeaturedMedia() {
  console.log('Starting script to delete video featured media...');
  let totalDeleted = 0;

  for (const displayName of nonprofitDisplayNames) {
    console.log(`\nProcessing nonprofit: ${displayName}`);
    const nonprofitId = await findNonprofitIdByName(displayName);

    if (!nonprofitId) {
      console.log(`  - Skipping ${displayName} - Nonprofit ID not found.`);
      continue;
    }

    const featuredMediaCollection = nonprofitsCollection.doc(nonprofitId).collection('featured_media');
    let docsToDeleteRefs: admin.firestore.DocumentReference[] = [];
    let nonprofitDeletedCount = 0;

    try {
      console.log(`  - Querying for featured media with media_type == 'video'...`);
      const snapshot = await featuredMediaCollection.where('media_type', '==', 'video').get();
      console.log(`  - Found ${snapshot.size} video documents to delete for ${displayName}.`);

      if (snapshot.empty) {
        console.log(`  - No video documents found for ${displayName}.`);
        continue;
      }

      snapshot.forEach(doc => {
        docsToDeleteRefs.push(doc.ref);
      });

      // Batch delete the documents
      for (let i = 0; i < docsToDeleteRefs.length; i += BATCH_SIZE) {
          const batch = db.batch();
          const chunk = docsToDeleteRefs.slice(i, i + BATCH_SIZE);
          console.log(`    - Processing batch ${Math.floor(i / BATCH_SIZE) + 1} with ${chunk.length} deletions...`);
          chunk.forEach(ref => {
              batch.delete(ref);
          });
          await batch.commit();
          nonprofitDeletedCount += chunk.length;
          console.log(`    - Batch ${Math.floor(i / BATCH_SIZE) + 1} committed.`);
      }

      console.log(`  - Successfully deleted ${nonprofitDeletedCount} video documents for ${displayName}.`);
      totalDeleted += nonprofitDeletedCount;

    } catch (error) {
      console.error(`  - Error querying or deleting video featured media for ${displayName} (ID: ${nonprofitId}):`, error);
    }
  }

  console.log(`\nScript finished. Total video featured media documents deleted: ${totalDeleted}.`);
}

// --- Run Script ---
deleteVideoFeaturedMedia().catch(error => {
  console.error('Unhandled error in main script execution:', error);
});
