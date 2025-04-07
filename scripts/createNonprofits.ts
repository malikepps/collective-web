import * as admin from 'firebase-admin';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

// --- Configuration ---
// IMPORTANT: Replace with the correct path to your service account key
const serviceAccountPath = path.resolve(__dirname, '../keys/Collective Dev Firebase Service Account.json');
const profileDetailsPath = path.resolve(__dirname, '../Misc_tasks/Profile_details.json');
const firebaseUserId = 'nbWN14A9CKSPYaifWpznpMSIGAm2'; // Your user ID for storage path
const communityRefPath = 'communities/DqRTdPa7yGTgU7Z6e5LR';
const defaultZipCode = '27705';
const defaultCity = 'Durham';
const defaultState = 'NC';
const nonprofitToExclude = 'Reality Ministries';
// --- End Configuration ---

interface ProfileDetail {
  username: string;
  fullName: string;
  biography?: string;
  externalUrl?: string;
  profilePicUrl?: string;
  // Add other fields if needed, though they aren't used currently
}

// Initialize Firebase Admin SDK
try {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: `${serviceAccount.project_id}.appspot.com` // Dynamically get bucket name
  });
} catch (error) {
  console.error('Error initializing Firebase Admin SDK. Make sure the service account path is correct and the file exists:', error);
  process.exit(1);
}

const db = admin.firestore();
const storage = admin.storage().bucket();
const nonprofitsCollection = db.collection('nonprofits');

async function uploadProfilePicture(imageUrl: string, nonprofitId: string): Promise<string | null> {
  if (!imageUrl) {
    console.log(`Skipping photo upload for ${nonprofitId} - no profilePicUrl found.`);
    return null;
  }

  console.log(`Attempting to download image for ${nonprofitId} from: ${imageUrl}`);
  try {
    const response = await axios({
      method: 'get',
      url: imageUrl,
      responseType: 'arraybuffer' // Important for image data
    });

    const imageBuffer = Buffer.from(response.data, 'binary');
    const imageExtension = imageUrl.split('.').pop()?.split('?')[0] || 'jpg'; // Basic extension extraction
    const uniqueFilename = `${uuidv4()}.${imageExtension}`;
    const storagePath = `users/${firebaseUserId}/organization_photos/${uniqueFilename}`;
    const file = storage.file(storagePath);

    console.log(`Uploading image for ${nonprofitId} to Firebase Storage at: ${storagePath}`);

    await file.save(imageBuffer, {
      metadata: {
        contentType: response.headers['content-type'] || 'image/jpeg', // Use content type from response or default
      },
      public: true, // Make the file publicly readable
    });

    // Important: Force metadata update to ensure public URL generation works reliably
    await file.makePublic();

    // Construct the public URL manually in the expected format
    // Note: Firebase Admin SDK doesn't directly return the tokenized URL in the same way client SDKs might.
    // We construct it based on the standard format. A more robust way might involve getting signed URLs if needed,
    // but this matches the example provided.
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${storage.name}/o/${encodeURIComponent(storagePath)}?alt=media`;

    console.log(`Successfully uploaded photo for ${nonprofitId}. Public URL: ${publicUrl}`);
    return publicUrl;

  } catch (error: any) {
    console.error(`Error downloading or uploading photo for ${nonprofitId} from ${imageUrl}:`, error.message || error);
    if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
    }
    return null; // Return null if upload fails
  }
}

async function createNonprofitDocument(nonprofitData: ProfileDetail) {
  const { username, fullName, biography, externalUrl, profilePicUrl } = nonprofitData;

  // Skip the excluded nonprofit
  if (fullName === nonprofitToExclude) {
    console.log(`Skipping excluded nonprofit: ${fullName}`);
    return;
  }

  console.log(`Processing nonprofit: ${fullName} (${username})`);

  // Prepare Firestore data object
  const firestoreData: Record<string, any> = {
    display_name: fullName || '', // Firestore field name
    username: username || null,
    bio: biography || '',          // Firestore field name
    website: externalUrl || '',     // Firestore field name
    zip_code: defaultZipCode,     // Firestore field name
    city: defaultCity,
    state: defaultState,
    pitch: '',                    // Blank as requested
    community: db.doc(communityRefPath), // Use DocumentReference
    // Add other default/required fields from Organization.ts model if necessary
    city_town: defaultCity,       // Firestore field name for 'location'
    video_url: '',                // Firestore field name for 'videoURL'
    photo_url: null,              // Will be updated after upload
    latitude: null,
    longitude: null,
    staff: null,
    members: null,
    membership_fee: null,
    hero_video_url: null,
    user_id: null,               // Assuming no specific user owner for these imports
    ig_access_token: '',
    theme_id: null,
    welcome_message: null,
    community_display_name: null, // Should be populated later if needed
    // TODO: Add any other mandatory fields with default values based on Organization.ts
  };

  // Attempt to create the document first to get an ID
  let newDocRef;
  try {
    console.log(`Attempting to add document for ${fullName}...`);
    newDocRef = await nonprofitsCollection.add(firestoreData);
    console.log(`Created base document for ${fullName} with ID: ${newDocRef.id}`);

    // Now upload the photo using the new document ID for context/logging if needed
    const uploadedPhotoUrl = await uploadProfilePicture(profilePicUrl || '', newDocRef.id);

    if (uploadedPhotoUrl) {
      // Update the document with the actual photo URL
      await newDocRef.update({ photo_url: uploadedPhotoUrl });
      console.log(`Updated document ${newDocRef.id} with photo_url: ${uploadedPhotoUrl}`);
    } else {
      console.log(`Document ${newDocRef.id} created without a photo_url as upload failed or was skipped.`);
    }

  } catch (error) {
    console.error(`Failed to create or update document for ${fullName}:`, error);
  }
}

async function main() {
  console.log('Starting nonprofit creation script...');

  let profileDetails: ProfileDetail[] = [];
  try {
    const rawData = fs.readFileSync(profileDetailsPath, 'utf8');
    profileDetails = JSON.parse(rawData);
    console.log(`Successfully read ${profileDetails.length} profiles from ${profileDetailsPath}`);
  } catch (error) {
    console.error(`Error reading or parsing ${profileDetailsPath}:`, error);
    process.exit(1);
  }

  if (!Array.isArray(profileDetails)) {
    console.error('Error: Parsed data from Profile_details.json is not an array.');
    process.exit(1);
  }

  console.log(`Found ${profileDetails.length} nonprofit profiles. Processing...`);

  // Process each nonprofit sequentially to avoid overwhelming resources/rate limits
  for (const detail of profileDetails) {
    await createNonprofitDocument(detail);
    // Optional: Add a small delay between processing each nonprofit
    // await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('Nonprofit creation script finished.');
}

main().catch(error => {
  console.error('Unhandled error in main script execution:', error);
}); 