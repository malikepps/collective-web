import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// --- Configuration ---
const serviceAccountPath = path.resolve(__dirname, '../keys/Collective Dev Firebase Service Account.json');
const uploaderUserId = 'nbWN14A9CKSPYaifWpznpMSIGAm2'; // User ID for uploaded_by

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

// Enum mapping (assuming based on previous scripts/models)
const MediaType = {
  IMAGE: 0,
  VIDEO: 1,
};

// Map numeric MediaType to string
function mapMediaTypeToString(type: number | undefined): string {
  if (type === MediaType.VIDEO) {
    return 'video';
  }
  // Default to image if type is IMAGE (0) or undefined/null
  return 'image';
}

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
const postsCollection = db.collection('posts');

// --- Helper Function to Find Nonprofit ID ---
async function findNonprofitIdByName(name: string): Promise<string | null> {
  console.log(`Searching for nonprofit ID for: ${name}`);
  try {
    const snapshot = await nonprofitsCollection.where('display_name', '==', name).limit(1).get();
    if (snapshot.empty) {
      console.warn(`  - No nonprofit found with display_name: ${name}`);
      return null;
    }
    const nonprofitId = snapshot.docs[0].id;
    console.log(`  - Found nonprofit ID: ${nonprofitId}`);
    return nonprofitId;
  } catch (error) {
    console.error(`  - Error searching for nonprofit ID for: ${name}`, error);
    return null;
  }
}

// --- Main Logic ---
async function createFeaturedMediaForAll() {
  console.log('Starting featured media creation script...');

  for (const displayName of nonprofitDisplayNames) {
    console.log(`\nProcessing nonprofit: ${displayName}`);
    const nonprofitId = await findNonprofitIdByName(displayName);

    if (!nonprofitId) {
      console.log(`  - Skipping ${displayName} - Nonprofit ID not found.`);
      continue;
    }

    const nonprofitRef = nonprofitsCollection.doc(nonprofitId);
    const featuredMediaCollection = nonprofitRef.collection('featured_media');
    let sequence = 1; // Sequence counter for this nonprofit
    let featuredMediaCount = 0;

    try {
      console.log(`  - Querying posts for nonprofit ID: ${nonprofitId}...`);
      const postsSnapshot = await postsCollection.where('nonprofit', '==', nonprofitRef).get();
      console.log(`  - Found ${postsSnapshot.size} posts for ${displayName}.`);

      if (postsSnapshot.empty) {
          console.log(`  - No posts found for ${displayName}, skipping featured media creation.`);
          continue;
      }

      for (const postDoc of postsSnapshot.docs) {
        const postData = postDoc.data();
        console.log(`    - Processing post ID: ${postDoc.id}`);

        if (postData.mediaItems && Array.isArray(postData.mediaItems)) {
          for (const item of postData.mediaItems) {
            if (item && item.url) {
              const mediaTypeString = mapMediaTypeToString(item.type);
              
              const featuredMediaData = {
                created_at: admin.firestore.FieldValue.serverTimestamp(), // Use server timestamp
                media_type: mediaTypeString,
                media_url: item.url,
                nonprofit: nonprofitRef,
                sequence: sequence,
                source_type: "direct",
                uploaded_by: uploaderUserId
              };

              try {
                console.log(`      - Adding featured media: sequence ${sequence}, type ${mediaTypeString}, URL: ${item.url.substring(0, 60)}...`);
                await featuredMediaCollection.add(featuredMediaData);
                sequence++;
                featuredMediaCount++;
              } catch (addError) {
                console.error(`      - Error adding featured media document for post ${postDoc.id}, item URL ${item.url}:`, addError);
              }
            } else {
              console.log(`      - Skipping media item in post ${postDoc.id} - missing URL.`);
            }
          }
        } else {
          console.log(`    - Post ${postDoc.id} has no mediaItems array.`);
        }
      }
      console.log(`  - Finished processing ${displayName}. Added ${featuredMediaCount} featured media documents.`);

    } catch (error) {
      console.error(`  - Error processing posts or featured media for ${displayName} (ID: ${nonprofitId}):`, error);
    }
  }

  console.log('\nFeatured media creation script finished.');
}

// --- Run Script ---
createFeaturedMediaForAll().catch(error => {
  console.error('Unhandled error in main script execution:', error);
});
