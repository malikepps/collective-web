import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// --- Configuration ---
const serviceAccountPath = path.resolve(__dirname, '../keys/Collective Dev Firebase Service Account.json');
const BATCH_SIZE = 400; // Firestore batch write limit is 500

// Enum equivalent for MediaType.VIDEO (assuming 1 based on typical enum usage)
const MEDIA_TYPE_VIDEO = 1;
// --- End Configuration ---

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
const postsCollection = db.collection('posts');

// --- Main Deletion Logic ---
async function deleteOldVideoPosts() {
  console.log('Starting deletion script for old video posts...');
  let postsToDeleteRefs: admin.firestore.DocumentReference[] = [];

  try {
    // Query for posts (removed mediaType filter)
    console.log('Querying all posts to check for Instagram URLs...');
    const snapshot = await postsCollection.get(); // Removed .where clause
    console.log(`Found ${snapshot.size} total posts.`);

    // Filter for posts with Instagram URLs
    snapshot.forEach(doc => {
      const postData = doc.data();
      // Check if mediaItems exists, has items, and the first item's url contains an Instagram domain
      if (
        postData.mediaItems &&
        Array.isArray(postData.mediaItems) &&
        postData.mediaItems.length > 0 &&
        postData.mediaItems[0].url &&
        (postData.mediaItems[0].url.includes('cdninstagram.com') || postData.mediaItems[0].url.includes('fna.fbcdn.net'))
      ) {
        console.log(`Marking post ${doc.id} for deletion (URL: ${postData.mediaItems[0].url})`);
        postsToDeleteRefs.push(doc.ref);
      }
    });

    console.log(`Found ${postsToDeleteRefs.length} old video posts with Instagram URLs to delete.`);

    if (postsToDeleteRefs.length === 0) {
      console.log('No posts found matching the deletion criteria.');
      return;
    }

    // Batch delete the posts
    for (let i = 0; i < postsToDeleteRefs.length; i += BATCH_SIZE) {
        const batch = db.batch();
        const chunk = postsToDeleteRefs.slice(i, i + BATCH_SIZE);
        console.log(`Processing batch ${i / BATCH_SIZE + 1} with ${chunk.length} deletions...`);
        chunk.forEach(ref => {
            batch.delete(ref);
        });
        await batch.commit();
        console.log(`Batch ${i / BATCH_SIZE + 1} committed.`);
    }

    console.log('Successfully deleted old video posts.');

  } catch (error) {
    console.error('Error deleting old video posts:', error);
  }
}

deleteOldVideoPosts();
