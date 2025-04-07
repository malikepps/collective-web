import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// --- Configuration ---
const serviceAccountPath = path.resolve(__dirname, '../keys/Collective Dev Firebase Service Account.json');

// Source Nonprofit ID (SeekHealing)
const sourceNonprofitId = 'G4q8eBRkKJodg5L6L3Ss';

// List of Target Nonprofit Display Names (Excluding the source)
const targetNonprofitDisplayNames = [
  "DurhamCares",
  "Echo NC",
  "LGBTQ Center of Durham",
  "Leadership Triangle",
  "Living with Autism",
  "Meals on Wheels Durham",
  "Oak City Cares",
  // "A Place At The Table Cafe", // Removed because it might have different tiers?
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
  try {
    const snapshot = await nonprofitsCollection.where('display_name', '==', name).limit(1).get();
    return snapshot.empty ? null : snapshot.docs[0].id;
  } catch (error) {
    console.error(`Error searching for nonprofit ID for: ${name}`, error);
    return null;
  }
}

// --- Main Logic ---
async function copyMembershipTiers() {
  console.log(`Starting script to copy membership tiers from Source ID: ${sourceNonprofitId}...`);
  let sourceTiers: admin.firestore.QueryDocumentSnapshot[] = [];

  // 1. Fetch Source Tiers
  try {
    console.log(`  - Fetching tiers from ${sourceNonprofitId}...`);
    const sourceTierSnapshot = await nonprofitsCollection.doc(sourceNonprofitId).collection('membershipTiers').get();
    if (sourceTierSnapshot.empty) {
      console.error(`  - Error: No membership tiers found for source nonprofit ${sourceNonprofitId}. Aborting.`);
      return;
    }
    sourceTiers = sourceTierSnapshot.docs;
    console.log(`  - Found ${sourceTiers.length} tiers to copy.`);
  } catch (error) {
    console.error(`  - Error fetching source tiers from ${sourceNonprofitId}:`, error);
    return;
  }

  // 2. Iterate through Targets and Copy
  let nonprofitsProcessed = 0;
  let nonprofitsNotFound = 0;
  let totalTiersCopied = 0;

  for (const displayName of targetNonprofitDisplayNames) {
    console.log(`\nProcessing target nonprofit: ${displayName}`);
    const targetNonprofitId = await findNonprofitIdByName(displayName);

    if (!targetNonprofitId) {
      console.warn(`  - Skipping ${displayName} - Nonprofit ID not found.`);
      nonprofitsNotFound++;
      continue;
    }

    if (targetNonprofitId === sourceNonprofitId) {
        console.log(`  - Skipping ${displayName} - Target is the same as source.`);
        continue;
    }
    
    nonprofitsProcessed++;
    console.log(`  - Found target nonprofit ID: ${targetNonprofitId}. Copying tiers...`);
    const targetTierCollection = nonprofitsCollection.doc(targetNonprofitId).collection('membershipTiers');
    let tiersCopiedForThisNonprofit = 0;

    for (const sourceTierDoc of sourceTiers) {
      const tierId = sourceTierDoc.id;
      const tierData = sourceTierDoc.data();
      try {
        console.log(`    - Copying tier ID: ${tierId}`);
        await targetTierCollection.doc(tierId).set(tierData); // Use set to overwrite
        tiersCopiedForThisNonprofit++;
      } catch (error) {
        console.error(`    - Failed to copy tier ID: ${tierId} to ${displayName}:`, error);
      }
    }
    console.log(`  - Finished copying ${tiersCopiedForThisNonprofit} tiers to ${displayName}.`);
    totalTiersCopied += tiersCopiedForThisNonprofit;
  }

  console.log(`\nScript finished. Processed ${nonprofitsProcessed} target nonprofits (skipped ${nonprofitsNotFound}). Copied ${totalTiersCopied} tiers in total.`);
}

// --- Run Script ---
copyMembershipTiers().catch(error => {
  console.error('Unhandled error in main script execution:', error);
});
