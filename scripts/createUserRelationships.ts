import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// --- Configuration ---
const serviceAccountPath = path.resolve(__dirname, '../keys/Collective Dev Firebase Service Account.json');

// List of Nonprofit Display Names to process
const nonprofitDisplayNames = [
  "DurhamCares",          // Manager for special user
  "Echo NC",              // Manager for special user
  "LGBTQ Center of Durham", // Manager for special user
  "Leadership Triangle",
  "Living with Autism",
  "Meals on Wheels Durham",
  "Oak City Cares",
  "A Place At The Table Cafe",
  "Bike Durham"
];

// User ID requiring special handling
const specialManagerUserId = 'nbWN14A9CKSPYaifWpznpMSIGAm2';

// Mapping of User IDs to desired Roles (excluding the special user)
const userRoles: { [userId: string]: 'community' | 'member' | 'manager' } = {
  'k1ZQEU6lbveRBWw3ScLRwjbnhu22': 'community',
  'vYIFgGL4itPY67p3eM5loxpLsTo2': 'member',
  'riiKOJs3acQxWgrAcKr8lRNhCtA3': 'manager',
  // 'nbWN14A9CKSPYaifWpznpMSIGAm2': 'manager', // Handled separately
  'kmUc1kQnOHeqfdxiPyVDe4Sx9Ov1': 'manager',
  '5XjApaorWcR9c7w1Y79abBVUC3k1': 'community',
  'BaZMg5hj4xVc6JFmu8oHLu4QFEU2': 'member',
  'ZYGFh0HwsuhZLwklsdt8s13TANW2': 'community',
  'Z5VxDjX7uSXxFPoyEqARNv7eTVm1': 'community'
};

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
const usersCollection = db.collection('users');
const relationshipsCollection = db.collection('user_nonprofit_relationships');

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

// --- Function to create relationship data based on role ---
function createRelationshipData(userId: string, nonprofitId: string, role: 'community' | 'member' | 'manager'): any {
  const isManager = role === 'manager';
  const isMember = role === 'member' || role === 'manager'; // Managers are also members
  const isCommunity = role === 'community' || isMember; // Members/Managers are also in community
  
  return {
    user: usersCollection.doc(userId),
    nonprofit: nonprofitsCollection.doc(nonprofitId),
    is_manager: isManager,
    is_member: isMember,
    is_community: isCommunity,
    is_active: true, // Assume active
    created_time: admin.firestore.FieldValue.serverTimestamp(),
    display_filter: role // Set display_filter directly to role
  };
}

// --- Main Logic ---
async function createRelationships() {
  console.log('Starting script to create user-nonprofit relationships...');
  let relationshipsCreated = 0;
  let nonprofitsProcessed = 0;
  let nonprofitsNotFound = 0;

  const managerNonprofits = nonprofitDisplayNames.slice(0, 3);

  for (const displayName of nonprofitDisplayNames) {
    console.log(`\nProcessing nonprofit: ${displayName}`);
    const nonprofitId = await findNonprofitIdByName(displayName);

    if (!nonprofitId) {
      console.warn(`  - Skipping ${displayName} - Nonprofit ID not found.`);
      nonprofitsNotFound++;
      continue;
    }
    
    nonprofitsProcessed++;
    console.log(`  - Found nonprofit ID: ${nonprofitId}. Creating relationships...`);

    // Process users from the main map
    for (const userId in userRoles) {
      const role = userRoles[userId];
      const relationshipId = `${userId}:${nonprofitId}`; // Generate composite ID
      const relationshipData = createRelationshipData(userId, nonprofitId, role);

      try {
        console.log(`    - Creating/updating relationship for User: ${userId} -> Role: ${role} (Doc ID: ${relationshipId})`);
        await relationshipsCollection.doc(relationshipId).set(relationshipData, { merge: true });
        relationshipsCreated++;
      } catch (error) {
        console.error(`    - Failed to create/update relationship for User: ${userId}, Nonprofit: ${nonprofitId}:`, error);
      }
    }

    // Process the special manager user
    {
      const userId = specialManagerUserId;
      const isManagerNonprofit = managerNonprofits.includes(displayName);
      const role = isManagerNonprofit ? 'manager' : 'community';
      const relationshipId = `${userId}:${nonprofitId}`; // Generate composite ID
      const relationshipData = createRelationshipData(userId, nonprofitId, role);
      
      try {
        console.log(`    - Creating/updating relationship for User: ${userId} -> Role: ${role} (Doc ID: ${relationshipId})`);
        await relationshipsCollection.doc(relationshipId).set(relationshipData, { merge: true });
        relationshipsCreated++; // Count this relationship as well
      } catch (error) {
        console.error(`    - Failed to create/update relationship for User: ${userId}, Nonprofit: ${nonprofitId}:`, error);
      }
    }

    console.log(`  - Finished relationships for ${displayName}.`);
  }

  console.log(`\nScript finished. Processed ${nonprofitsProcessed} nonprofits (skipped ${nonprofitsNotFound}). Created/updated ${relationshipsCreated} relationships in total.`);
}

// --- Run Script ---
createRelationships().catch(error => {
  console.error('Unhandled error in main script execution:', error);
});
