import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import { MediaType, Post } from '../src/lib/models/Post'; // Adjust path as needed
import { MediaItem } from '../src/lib/models/MediaItem'; // Adjust path as needed
import { v4 as uuidv4 } from 'uuid'; // Import uuid
import axios from 'axios'; // Import axios for HTTP requests

// --- Configuration ---
const serviceAccountPath = path.resolve(__dirname, '../keys/Collective Dev Firebase Service Account.json');
const reelsDataPath = path.resolve(__dirname, '../Misc_tasks/Profile_reels.json'); // NEW: Path to the single Reels JSON file
const firebaseUserId = 'nbWN14A9CKSPYaifWpznpMSIGAm2'; // Your user ID for posts
// Map Instagram username to Firestore display_name - VERIFY THESE ARE CORRECT
const nonprofitUsernameToDisplayNameMap: { [key: string]: string } = {
  "durhamcares": "DurhamCares",
  "echo.entrepreneurs": "Echo NC",
  "lgbtqdurham": "LGBTQ Center of Durham",
  "leadershiptriangle": "Leadership Triangle",
  "livingwithautismnc": "Living with Autism",
  "mowdurham": "Meals on Wheels Durham",
  "oakcitycares": "Oak City Cares",
  "tableraleigh": "A Place At The Table Cafe",
  "bikedurham": "Bike Durham"
};
// --- End Configuration ---

// --- Interface for the Reels JSON structure (adjust based on actual file) ---
interface InstagramReelData {
  id: string;
  caption?: string;
  type: 'Video'; // Assuming always video for Reels
  timestamp: string; // ISO 8601 format
  videoViewCount?: number;
  likesCount?: number;
  ownerUsername?: string;
  displayUrl?: string; // Thumbnail URL
  videoUrl?: string; // Video URL
  // Add other relevant fields if needed
}

// --- NEW: Specify target usernames to process ---
const targetUsernames = [
  'livingwithautismnc',    // Corrected: removed underscore
  'lgbtqdurham',           // Corrected: shortened name
  'echo.entrepreneurs',    // Corrected: used full name with dot
  'tableraleigh'           // No change needed
];

// --- Firebase Initialization (same as before) ---
try {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: `${serviceAccount.project_id}.appspot.com`
  });
  admin.firestore().settings({ ignoreUndefinedProperties: true });
  console.log('Firebase Admin SDK Initialized.');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  process.exit(1);
}

const db = admin.firestore();
const storage = admin.storage().bucket(); // Initialize storage bucket
const nonprofitsCollection = db.collection('nonprofits');
const postsCollection = db.collection('posts');

// --- Media Upload Function (same as before) ---
async function uploadPostMedia(mediaUrl: string, postId: string, mediaIndex: number, isThumbnail: boolean = false): Promise<string | null> {
  if (!mediaUrl) {
    console.log(`Skipping media upload for post ${postId} index ${mediaIndex} - no URL provided.`);
    return null;
  }

  console.log(`Attempting to download ${isThumbnail ? 'thumbnail' : 'media'} for post ${postId} index ${mediaIndex} from: ${mediaUrl}`);
  try {
    const response = await axios({
      method: 'get',
      url: mediaUrl,
      responseType: 'arraybuffer'
    });

    const mediaBuffer = Buffer.from(response.data, 'binary');
    const guessedExtension = mediaUrl.split('.').pop()?.split('?')[0] || (response.headers['content-type']?.includes('video') ? 'mp4' : 'jpg');
    const uniqueFilename = `${mediaIndex}_${uuidv4()}.${guessedExtension}`;
    const storageDir = isThumbnail ? `posts/${postId}/thumbnails` : `posts/${postId}`;
    const storagePath = `${storageDir}/${uniqueFilename}`;
    const file = storage.file(storagePath);

    console.log(`Uploading ${isThumbnail ? 'thumbnail' : 'media'} for post ${postId} index ${mediaIndex} to: ${storagePath}`);

    await file.save(mediaBuffer, {
      metadata: {
        contentType: response.headers['content-type'] || (isThumbnail ? 'image/jpeg' : 'video/mp4'), // Default to mp4 if video
      },
      public: true,
    });
    await file.makePublic();

    const [metadata] = await file.getMetadata();
    const tokenizedUrl = metadata.mediaLink;

    console.log(`Successfully uploaded ${isThumbnail ? 'thumbnail' : 'media'}. Public URL: ${tokenizedUrl}`);
    return tokenizedUrl ?? null;

  } catch (error: any) {
    console.error(`Error downloading/uploading ${isThumbnail ? 'thumbnail' : 'media'} for post ${postId} index ${mediaIndex} from ${mediaUrl}:`, error.message || error);
    return null;
  }
}

// --- Find Nonprofit ID Function (same as before) ---
async function findNonprofitIdByName(name: string): Promise<string | null> {
  console.log(`Searching for nonprofit ID for: ${name}`);
  try {
    const snapshot = await nonprofitsCollection.where('display_name', '==', name).limit(1).get();
    if (snapshot.empty) {
      console.warn(`No nonprofit found with display_name: ${name}`);
      return null;
    }
    return snapshot.docs[0].id;
  } catch (error) {
    console.error(`Error searching for nonprofit ID for: ${name}`, error);
    return null;
  }
}

// --- REVISED: createMediaItems specifically for Reels ---
async function createMediaItemsForReel(reelData: InstagramReelData): Promise<{ mediaType?: MediaType; mediaItems?: MediaItem[] }> {
  let mediaType: MediaType | undefined = undefined;
  let mediaItems: MediaItem[] = [];

  // Check if video and thumbnail URLs exist
  if (reelData.videoUrl && reelData.displayUrl) {
    // Upload video and thumbnail
    const videoFirebaseUrl = await uploadPostMedia(reelData.videoUrl, reelData.id, 0, false);
    const thumbnailFirebaseUrl = await uploadPostMedia(reelData.displayUrl, reelData.id, 0, true);

    // Only create media item if both uploads were successful
    if (videoFirebaseUrl && thumbnailFirebaseUrl) { 
      mediaType = MediaType.VIDEO;
      mediaItems.push({
        id: `${reelData.id}_0`, 
        url: videoFirebaseUrl, // Use Firebase video URL
        type: MediaType.VIDEO,
        order: 0,
        thumbnailUrl: thumbnailFirebaseUrl, // Use Firebase thumbnail URL
        thumbnailColor: null 
      });
    } else {
      console.warn(`Failed to upload video or thumbnail for Reel ${reelData.id}. Video URL: ${videoFirebaseUrl}, Thumb URL: ${thumbnailFirebaseUrl}`);
    }
  } else {
    console.warn(`Skipping Reel ${reelData.id} due to missing videoUrl or displayUrl.`);
  }

  return { mediaType, mediaItems: mediaItems.length > 0 ? mediaItems : undefined };
}
// --- END REVISED createMediaItemsForReel ---

// --- REVISED: createPostDocument to use Reels data structure ---
async function createReelPostDocument(reelData: InstagramReelData, nonprofitId: string): Promise<void> {
  console.log(`Processing Reel ID: ${reelData.id} for nonprofit ID: ${nonprofitId}`);
  
  // Create media items (handles upload)
  const { mediaType, mediaItems } = await createMediaItemsForReel(reelData);

  // If no valid media items were created/uploaded, skip Firestore document creation
  if (!mediaItems || mediaItems.length === 0) {
    console.warn(`Skipping Reel post ${reelData.id} - no valid media items could be created/uploaded.`);
    return;
  }

  // Prepare Firestore data
  // Explicitly define the structure instead of relying on Partial<Post>
  const firestorePostData: {
    caption: string;
    created_time: admin.firestore.Timestamp;
    nonprofit: admin.firestore.DocumentReference;
    numComments: number;
    numLikes: number;
    user: admin.firestore.DocumentReference;
    is_for_members_only: boolean;
    is_for_broader_ecosystem: boolean;
    mediaType?: MediaType; // Optional because it depends on upload success
    mediaItems: MediaItem[];
    community: admin.firestore.DocumentReference;
    videoViewCount: number;
  } = {
    caption: reelData.caption || '',
    created_time: admin.firestore.Timestamp.fromDate(new Date(reelData.timestamp)), // Use created_time
    nonprofit: db.doc(`nonprofits/${nonprofitId}`),
    numComments: 0, // Default to 0
    numLikes: reelData.likesCount || 0,
    user: db.doc(`users/${firebaseUserId}`),
    is_for_members_only: false,
    is_for_broader_ecosystem: false,
    mediaType: mediaType,
    mediaItems: mediaItems,
    community: db.doc("communities/DqRTdPa7yGTgU7Z6e5LR"), // Default community
    videoViewCount: reelData.videoViewCount || 0 // Add view count
  };

  // Write to Firestore
  try {
    await postsCollection.doc(reelData.id).set(firestorePostData, { merge: true }); // Use set with merge to overwrite or create
    console.log(`Successfully created/updated Reel post document: ${reelData.id}`);
  } catch (error) {
    console.error(`Failed to create/update Firestore document for Reel post ${reelData.id}:`, error);
  }
}
// --- END REVISED createPostDocument ---

// --- NEW MAIN LOGIC for Reels Processing ---
async function main() {
  console.log('Starting Reels post creation script...');

  // --- Configuration within main scope ---
  const targetUsernames = [
    'livingwithautismnc',    // Corrected: removed underscore
    'lgbtqdurham',           // Corrected: shortened name
    'echo.entrepreneurs',    // Corrected: used full name with dot
    'tableraleigh'           // No change needed
  ];

  // --- Read and parse data (existing logic) ---
  let allReelsData: any[] = [];
  try {
    console.log(`Reading Reels data from: ${reelsDataPath}`);
    if (!fs.existsSync(reelsDataPath)) {
      console.error(`Error: Reels JSON file not found at ${reelsDataPath}`);
      process.exit(1);
    }
    const rawData = fs.readFileSync(reelsDataPath, 'utf8');
    allReelsData = JSON.parse(rawData);
    if (!Array.isArray(allReelsData)) {
      console.error(`Error: Data in ${reelsDataPath} is not an array.`);
      process.exit(1);
    }
    console.log(`Found ${allReelsData.length} total Reels in the file.`);
  } catch (error) {
    console.error(`Error reading or parsing ${reelsDataPath}:`, error);
    process.exit(1);
  }

  // --- Group reels by username (existing logic) ---
  const reelsByUsername: { [key: string]: any[] } = {};
  for (const reel of allReelsData) {
    if (reel.ownerUsername) {
      if (!reelsByUsername[reel.ownerUsername]) {
        reelsByUsername[reel.ownerUsername] = [];
      }
      reelsByUsername[reel.ownerUsername].push(reel);
    }
  }

  // --- MODIFIED LOOP: Iterate only through target usernames ---
  for (const username of targetUsernames) {
    // Check if the username exists in our map and has data
    if (nonprofitUsernameToDisplayNameMap[username] && reelsByUsername[username]) {
      const displayName = nonprofitUsernameToDisplayNameMap[username];
      console.log(`\n--- Processing TARGET Reels for ${username} (mapped to ${displayName}) ---`);
      
      const nonprofitId = await findNonprofitIdByName(displayName);
      if (!nonprofitId) {
        console.warn(`Could not find nonprofit ID for ${displayName}. Skipping Reels for ${username}.`);
        continue; // Skip to the next target username
      }

      // Sort and filter reels (existing logic)
      const sortedReels = reelsByUsername[username]
        .filter(reel => reel.videoViewCount !== undefined && reel.videoViewCount !== null) 
        .sort((a, b) => (b.videoViewCount ?? 0) - (a.videoViewCount ?? 0))
        .slice(0, 3);
      
      console.log(`Found ${reelsByUsername[username].length} Reels for ${username}. Processing top ${sortedReels.length} by view count.`);

      if (sortedReels.length === 0) {
        console.log(`No valid Reels with view counts found for ${username}.`);
        continue; // Skip to the next target username
      }

      // Process each selected reel (existing logic)
      for (const reel of sortedReels) {
        if (!reel.id || !reel.timestamp || !reel.videoUrl || !reel.displayUrl) {
          console.warn('Skipping Reel due to missing ID, timestamp, videoUrl, or displayUrl:', reel.id || 'unknown ID');
          continue;
        }
        console.log(`  - Reel ID: ${reel.id}, Views: ${reel.videoViewCount}`);
        await createReelPostDocument(reel, nonprofitId);
      }
    } else if (nonprofitUsernameToDisplayNameMap[username]) {
      // Handle case where username is mapped but no reels data exists for it
      console.log(`\n--- Skipping TARGET ${username} - No Reels found in the data file for this username. ---`);
    } else {
      // Handle case where username isn't in the map (shouldn't happen if targetUsernames is based on the map keys)
      console.warn(`\n--- Skipping TARGET ${username} - Username not found in nonprofitUsernameToDisplayNameMap. ---`);
    }
  }
  // --- END MODIFIED LOOP ---

  console.log('\nReels post creation script finished.');
}

// --- END NEW MAIN LOGIC ---

main().catch(error => {
  console.error('Unhandled error in main Reels script execution:', error);
});