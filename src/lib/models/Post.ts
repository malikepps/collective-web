import { DocumentReference, DocumentSnapshot, QueryDocumentSnapshot, Timestamp } from 'firebase/firestore';
import { MediaItem } from './MediaItem';

export enum MediaType {
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
  CAROUSEL_ALBUM = 'CAROUSEL_ALBUM',
  CAROUSEL = 'carousel',
  REELS = 'REELS'
}

export interface Post {
  id: string;
  caption: string;
  createdDate: Date;
  nonprofitId: string | null;
  numComments: number;
  numLikes: number;
  userId: string | null;
  username: string | null;
  community: string | null;
  
  // Audience settings
  isForMembersOnly: boolean;
  isForBroaderEcosystem: boolean;
  
  // Legacy fields
  postImage: string | null;
  videoUrl: string | null;
  video: boolean;
  
  // New fields for multiple media
  mediaType?: MediaType;
  mediaItems?: MediaItem[];
  backgroundColorHex: string | null;
}

// Helper function to parse document references or paths
const parseReference = (ref: DocumentReference | string | null): string | null => {
  if (!ref) return null;
  
  if (typeof ref === 'string') {
    // Handle path strings
    const id = ref.split('/').pop() || null;
    console.log(`[DEBUG] Parsed string reference: ${ref} -> ID: ${id}`);
    return id;
  } else {
    // Handle DocumentReference objects
    console.log(`[DEBUG] Parsed DocumentReference: path=${ref.path} -> ID: ${ref.id}`);
    return ref.id;
  }
};

export const postFromFirestore = (doc: QueryDocumentSnapshot | DocumentSnapshot): Post | null => {
  const data = doc.data();
  
  if (!data) {
    console.log(`[DEBUG] No data found for document: ${doc.id}`);
    return null;
  }
  
  console.log(`[DEBUG] Processing post document: ${doc.id}`);
  
  // Required fields
  const caption = data.caption as string;
  
  // Check for the timestamp field with logging
  console.log(`[DEBUG] Checking timestamp fields for post ${doc.id}:`);
  console.log(`[DEBUG] - created_time exists: ${data.created_time !== undefined}`);
  console.log(`[DEBUG] - created_date exists: ${data.created_date !== undefined}`);
  
  const timestamp = (data.created_time || data.created_date) as Timestamp;
  
  if (!caption || !timestamp) {
    console.error(`[DEBUG] Missing required post fields for doc: ${doc.id}. caption: ${!!caption}, timestamp: ${!!timestamp}`);
    return null;
  }
  
  // Parse nonprofit reference
  let nonprofitId: string | null = null;
  
  console.log(`[DEBUG] Processing nonprofit field for post ${doc.id}`);
  console.log(`[DEBUG] Nonprofit reference type: ${typeof data.nonprofit}`);
  if (data.nonprofit) {
    // Check if it's a string path to a document
    if (typeof data.nonprofit === 'string') {
      // Check if it's a path or just an ID
      if (data.nonprofit.includes('/')) {
        console.log(`[DEBUG] Found nonprofit as string path: ${data.nonprofit}`);
        nonprofitId = parseReference(data.nonprofit);
      } else {
        // It's just an ID string
        console.log(`[DEBUG] Found nonprofit as direct ID string: ${data.nonprofit}`);
        nonprofitId = data.nonprofit;
      }
    } 
    // Check if it's a DocumentReference
    else if (typeof data.nonprofit === 'object' && data.nonprofit.path) {
      console.log(`[DEBUG] Found nonprofit as DocumentReference with path: ${data.nonprofit.path}`);
      nonprofitId = parseReference(data.nonprofit);
    }
    // Special case for handling other formats
    else if (data.nonprofitId) {
      console.log(`[DEBUG] Found direct nonprofitId field: ${data.nonprofitId}`);
      nonprofitId = data.nonprofitId;
    }
    
    console.log(`[DEBUG] Resolved nonprofitId for post ${doc.id}: ${nonprofitId}`);
  } else if (data.nonprofitId) {
    // Some documents might have the ID directly in a separate field
    console.log(`[DEBUG] Found standalone nonprofitId field: ${data.nonprofitId}`);
    nonprofitId = data.nonprofitId;
  } else if (data.community && typeof data.community === 'string' && !data.community.includes('/')) {
    // In some cases, the ID might be in the community field
    console.log(`[DEBUG] No nonprofit reference found, using community as fallback: ${data.community}`);
    nonprofitId = data.community;
  } else if (doc.id.includes('_')) {
    // Last resort: try to extract from post ID if it follows pattern like "nonprofitId_postId"
    const potentialId = doc.id.split('_')[0];
    if (potentialId && potentialId.length > 10) { // Typical Firebase ID length check
      console.log(`[DEBUG] Extracted potential nonprofitId from post ID: ${potentialId}`);
      nonprofitId = potentialId;
    } else {
      console.log(`[DEBUG] No nonprofit reference found for post: ${doc.id}`);
    }
  } else {
    console.log(`[DEBUG] No nonprofit reference found for post: ${doc.id}`);
  }
  
  // Parse user reference
  let userId: string | null = null;
  if (data.user) {
    userId = parseReference(data.user);
  } else {
    userId = data.user_id as string || null;
  }
  
  // Parse community reference
  let community: string | null = null;
  if (data.community) {
    community = parseReference(data.community);
  }
  
  // Handle media
  let mediaType: MediaType | undefined = undefined;
  let mediaItems: MediaItem[] | undefined = undefined;
  
  // Check for the media array
  if (Array.isArray(data.media)) {
    // New format with media array
    const mediaArray = data.media as Record<string, any>[];
    console.log(`[DEBUG] Post ${doc.id} has ${mediaArray.length} media items`);
    
    // Parse media type from data
    if (data.media_type) {
      // Try to match the string to a MediaType enum value
      const mediaTypeString = data.media_type as string;
      mediaType = Object.values(MediaType).find(
        type => type.toLowerCase() === mediaTypeString.toLowerCase()
      ) as MediaType;
      console.log(`[DEBUG] Using specified media_type: ${mediaTypeString} -> ${mediaType}`);
    } else {
      // Infer type based on content or count
      const hasVideo = mediaArray.some(item => item.media_type?.toLowerCase() === 'video');
      if (mediaArray.length > 1) {
          mediaType = MediaType.CAROUSEL_ALBUM;
      } else if (hasVideo) {
          mediaType = MediaType.VIDEO;
      } else {
          mediaType = MediaType.IMAGE;
      }
      console.log(`[DEBUG] Inferring media_type: ${mediaType}`);
    }
    
    // Parse media items
    mediaItems = mediaArray.map((itemData, index): MediaItem => {
      let type: MediaType = MediaType.IMAGE;
      if (itemData.media_type?.toLowerCase() === 'video') {
        type = MediaType.VIDEO;
      }
      
      let url = '';
      let thumbnailUrl: string | null = null;
      
      if (type === MediaType.VIDEO) {
        url = itemData.video_url || itemData.url || '';
        // Use image_url as thumbnail if available, otherwise thumbnail_url
        thumbnailUrl = itemData.image_url || itemData.thumbnail_url || null;
      } else {
        url = itemData.image_url || itemData.url || '';
        thumbnailUrl = null; // Images don't have separate thumbnails in this model
      }
      
      return {
        id: itemData.id || String(index), // Ensure ID exists
        url,
        type,
        order: typeof itemData.order === 'number' ? itemData.order : index, // Ensure order is a number, default to index
        thumbnailUrl,
        thumbnailColor: itemData.thumbnail_color as string || null // Ensure null if undefined
      };
    });
  } else {
    console.log(`[DEBUG] Post ${doc.id} using legacy media format`);
    // Legacy format - Single image or video
    if (data.video || data.video_url) {
      mediaType = MediaType.VIDEO;
      console.log(`[DEBUG] Post ${doc.id} is a legacy video post`);
      
      mediaItems = [{
        id: '0',
        url: data.video_url || '',
        type: MediaType.VIDEO,
        order: 0,
        thumbnailUrl: data.image_url || null, // Legacy video thumbnail is postImage
        thumbnailColor: null // Legacy format doesn't have color
      }];
    } else if (data.postImage || data.image_url) {
      mediaType = MediaType.IMAGE;
      console.log(`[DEBUG] Post ${doc.id} is a legacy image post`);
      
      mediaItems = [{
        id: '0',
        url: data.postImage || data.image_url || '',
        type: MediaType.IMAGE,
        order: 0,
        thumbnailUrl: null,
        thumbnailColor: null
      }];
    }
  }
  
  const post: Post = {
    id: doc.id,
    caption,
    createdDate: timestamp.toDate(),
    nonprofitId,
    numComments: data.num_comments || 0,
    numLikes: data.num_likes || 0,
    userId,
    username: data.username || null,
    community,
    postImage: data.image_url || data.postImage || null,
    videoUrl: data.video_url || null,
    video: !!(data.video || data.video_url),
    mediaType,
    mediaItems,
    backgroundColorHex: data.background_color_hex as string || null,
    isForMembersOnly: data.is_for_members_only === true,
    isForBroaderEcosystem: data.is_for_broader_ecosystem === true
  };
  
  console.log(`[DEBUG] Successfully created post object: ${doc.id}, nonprofitId: ${nonprofitId}`);
  
  return post;
}; 