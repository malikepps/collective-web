import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import { MediaType, Post } from '../src/lib/models/Post'; // Adjust path as needed
import { MediaItem } from '../src/lib/models/MediaItem'; // Adjust path as needed

// --- Configuration ---
const serviceAccountPath = path.resolve(__dirname, '../keys/Collective Dev Firebase Service Account.json');
const baseProfileFolderPath = path.resolve(__dirname, '../Misc_tasks/API Profile Folders');
const firebaseUserId = 'nbWN14A9CKSPYaifWpznpMSIGAm2'; // Your user ID for posts
const nonprofitsToExclude = ['Reality Ministries']; // Nonprofits folders to skip
// --- End Configuration ---

interface InstagramPostData {
  id: string; // Use this for Post.id
  caption?: string;
  type: 'Image' | 'Video' | 'Sidecar' | string; // Handle potential other types
  timestamp: string; // ISO 8601 format
  commentsCount?: number;
  likesCount?: number;
  ownerId?: string; // Use this? Or firebaseUserId?
  ownerUsername?: string;
  // Image/Video specific
  displayUrl?: string;
  videoUrl?: string;
  // Sidecar specific
  childPosts?: InstagramChildPostData[];
}

interface InstagramChildPostData {
  id: string;
  type: 'Image' | 'Video' | string;
  displayUrl?: string;
  videoUrl?: string; // Does this exist on child posts?
}

// Initialize Firebase Admin SDK
try {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
    // No need to specify storageBucket if only using Firestore
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

async function findNonprofitIdByName(name: string): Promise<string | null> {
  console.log(`Searching for nonprofit ID for: ${name}`);
  try {
    const snapshot = await nonprofitsCollection.where('display_name', '==', name).limit(1).get();
    if (snapshot.empty) {
      console.warn(`Nonprofit not found in Firestore for display_name: ${name}`);
      return null;
    }
    const nonprofitId = snapshot.docs[0].id;
    console.log(`Found nonprofit ID: ${nonprofitId} for ${name}`);
    return nonprofitId;
  } catch (error) {
    console.error(`Error querying Firestore for nonprofit ${name}:`, error);
    return null;
  }
}

function createMediaItems(postData: InstagramPostData): { mediaType?: MediaType, mediaItems?: MediaItem[] } {
  let mediaType: MediaType | undefined = undefined;
  let mediaItems: MediaItem[] = [];

  switch (postData.type) {
    case 'Image':
      if (postData.displayUrl) {
        mediaType = MediaType.IMAGE;
        mediaItems.push({
          id: `${postData.id}_0`,
          url: postData.displayUrl,
          type: MediaType.IMAGE,
          order: 0,
          thumbnailUrl: null,
          thumbnailColor: null
        });
      }
      break;
    case 'Video':
      if (postData.videoUrl) {
        mediaType = MediaType.VIDEO;
        mediaItems.push({
          id: `${postData.id}_0`,
          url: postData.videoUrl,
          type: MediaType.VIDEO,
          order: 0,
          thumbnailUrl: postData.displayUrl || null, // Use displayUrl as thumbnail
          thumbnailColor: null
        });
      }
      break;
    case 'Sidecar':
      if (postData.childPosts && postData.childPosts.length > 0) {
        mediaType = MediaType.CAROUSEL_ALBUM;
        postData.childPosts.forEach((child, index) => {
          let childMediaType = MediaType.IMAGE;
          let childUrl = child.displayUrl;
          // Basic check if child might be a video - adjust if childPosts have explicit videoUrl
          if (child.type === 'Video' && child.videoUrl) { 
            childMediaType = MediaType.VIDEO;
            childUrl = child.videoUrl; // Assuming child posts might have videoUrl
            // Note: Instagram API might not provide videoUrl for children, test this
          }

          if (childUrl) {
            mediaItems.push({
              id: child.id || `${postData.id}_${index}`,
              url: childUrl,
              type: childMediaType,
              order: index,
              thumbnailUrl: childMediaType === MediaType.VIDEO ? child.displayUrl : null,
              thumbnailColor: null
            });
          } else {
             console.warn(`Skipping child post ${index} for ${postData.id} due to missing URL.`);
          }
        });
         // Filter out any items that didn't get a URL
         mediaItems = mediaItems.filter(item => item.url);
         if (mediaItems.length === 0) {
            mediaType = undefined; // No valid media items found
         }
      } else if (postData.displayUrl) {
         // Fallback for Sidecar with no childPosts but a displayUrl (treat as single image)
         console.warn(`Sidecar post ${postData.id} has no childPosts, treating as single image.`);
         mediaType = MediaType.IMAGE;
         mediaItems.push({
            id: `${postData.id}_0`,
            url: postData.displayUrl,
            type: MediaType.IMAGE,
            order: 0,
            thumbnailUrl: null,
            thumbnailColor: null
          });
      }
      break;
    default:
      console.warn(`Unknown post type: ${postData.type} for post ID: ${postData.id}`);
      // Attempt to treat as image if displayUrl exists
      if (postData.displayUrl) {
          mediaType = MediaType.IMAGE;
          mediaItems.push({
            id: `${postData.id}_0`,
            url: postData.displayUrl,
            type: MediaType.IMAGE,
            order: 0,
            thumbnailUrl: null,
            thumbnailColor: null
          });
       }
  }

  return { mediaType, mediaItems: mediaItems.length > 0 ? mediaItems : undefined };
}

async function createPostDocument(postData: InstagramPostData, nonprofitId: string) {
  console.log(`Processing post ID: ${postData.id} for nonprofit ID: ${nonprofitId}`);

  const { mediaType, mediaItems } = createMediaItems(postData);

  if (!mediaItems || mediaItems.length === 0) {
    console.warn(`Skipping post ${postData.id} - no valid media items could be created.`);
    return;
  }

  const firestorePostData = {
    caption: postData.caption || '',
    created_time: admin.firestore.Timestamp.fromDate(new Date(postData.timestamp)),
    nonprofit: db.doc(`nonprofits/${nonprofitId}`),
    numComments: postData.commentsCount || 0,
    numLikes: postData.likesCount || 0,
    user: db.doc(`users/${firebaseUserId}`),
    is_for_members_only: false,
    is_for_broader_ecosystem: false,
    mediaType: mediaType,
    mediaItems: mediaItems,
    community: db.doc(`communities/DqRTdPa7yGTgU7Z6e5LR`),
    postImage: null,
    videoUrl: null,
    video: false,
    backgroundColorHex: null,
    text_content: null,
  };

  try {
    await postsCollection.doc(postData.id).set(firestorePostData);
    console.log(`Successfully created/updated post document: ${postData.id}`);
  } catch (error) {
    console.error(`Failed to create/update Firestore document for post ${postData.id}:`, error);
  }
}

async function processNonprofitFolder(folderName: string) {
  if (nonprofitsToExclude.includes(folderName)) {
    console.log(`Skipping excluded folder: ${folderName}`);
    return;
  }

  // --- Handle known name mismatches ---
  let firestoreDisplayName = folderName; // Default to folder name
  switch (folderName) {
    case 'Durham Cares':
      firestoreDisplayName = 'DurhamCares';
      break;
    case 'Echo Entrepreneurs':
      firestoreDisplayName = 'Echo NC';
      break;
    case 'Living with Autism NC':
      firestoreDisplayName = 'Living with Autism';
      break;
    case 'Place at the Table':
      firestoreDisplayName = 'A Place At The Table Cafe';
      break;
    // Add other cases if needed
  }
  // --- End name mismatch handling ---

  // Use the potentially corrected display name for the lookup
  const nonprofitId = await findNonprofitIdByName(firestoreDisplayName); 
  if (!nonprofitId) {
    console.error(`Could not find nonprofit ID for folder ${folderName} (searched for name: ${firestoreDisplayName}). Skipping post import.`);
    return;
  }

  // Construct JSON path (assuming filename matches folder name, except for known exceptions)
  let jsonFileName = `${folderName}.json`;
  if (folderName === 'Living with Autism NC') {
    jsonFileName = 'Living With Autism.json'; // Corrected filename
  }
  const jsonFilePath = path.join(baseProfileFolderPath, folderName, jsonFileName);

  console.log(`Reading posts from: ${jsonFilePath}`);

  let postsData: InstagramPostData[] = [];
  try {
    if (!fs.existsSync(jsonFilePath)) {
      console.error(`Error: JSON file not found at ${jsonFilePath}`);
      return;
    }
    const rawData = fs.readFileSync(jsonFilePath, 'utf8');
    postsData = JSON.parse(rawData);
    if (!Array.isArray(postsData)) {
       console.error(`Error: Data in ${jsonFilePath} is not an array.`);
       return;
    }
    console.log(`Found ${postsData.length} posts in ${jsonFileName}`);
  } catch (error) {
    console.error(`Error reading or parsing ${jsonFilePath}:`, error);
    return;
  }

  // Process each post for this nonprofit
  for (const post of postsData) {
    if (!post.id || !post.timestamp) {
       console.warn('Skipping post due to missing ID or timestamp:', post);
       continue;
    }
    await createPostDocument(post, nonprofitId);
    // Optional delay
    // await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function main() {
  console.log('Starting post creation script...');

  let folderNames: string[] = [];
  try {
    folderNames = fs.readdirSync(baseProfileFolderPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    console.log(`Found nonprofit folders: ${folderNames.join(', ')}`);
  } catch (error) {
    console.error(`Error reading nonprofit folders from ${baseProfileFolderPath}:`, error);
    process.exit(1);
  }

  // Process each folder sequentially
  for (const folderName of folderNames) {
    await processNonprofitFolder(folderName);
  }

  console.log('Post creation script finished.');
}

main().catch(error => {
  console.error('Unhandled error in main post script execution:', error);
}); 