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
  mediaType: MediaType | null;
  mediaItems: MediaItem[] | null;
  backgroundColorHex: string | null;
}

// Helper function to parse document references or paths
const parseReference = (ref: DocumentReference | string | null): string | null => {
  if (!ref) return null;
  
  if (typeof ref === 'string') {
    // Handle path strings
    return ref.split('/').pop() || null;
  } else {
    // Handle DocumentReference objects
    return ref.id;
  }
};

export const postFromFirestore = (doc: QueryDocumentSnapshot | DocumentSnapshot): Post | null => {
  const data = doc.data();
  
  if (!data) return null;
  
  // Required fields
  const caption = data.caption as string;
  const timestamp = (data.created_time || data.created_date) as Timestamp;
  
  if (!caption || !timestamp) {
    console.error('Missing required post fields');
    return null;
  }
  
  // Parse nonprofit reference
  let nonprofitId: string | null = null;
  if (data.nonprofit) {
    nonprofitId = parseReference(data.nonprofit);
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
  let mediaType: MediaType | null = null;
  let mediaItems: MediaItem[] | null = null;
  
  if (Array.isArray(data.media)) {
    // New format with media array
    const mediaArray = data.media as Record<string, any>[];
    
    // Parse media type
    if (data.media_type) {
      const mediaTypeString = data.media_type as string;
      mediaType = mediaTypeString.toUpperCase() as MediaType || 
                  mediaTypeString.toLowerCase() as MediaType;
    } else {
      mediaType = mediaArray.length > 1 ? MediaType.CAROUSEL : MediaType.IMAGE;
    }
    
    // Parse media items
    mediaItems = mediaArray.map((itemData, index) => {
      const type = (itemData.media_type === 'video') ? MediaType.VIDEO : MediaType.IMAGE;
      
      let url: string;
      let thumbnailUrl: string | null;
      
      if (type === MediaType.VIDEO) {
        url = itemData.video_url || '';
        thumbnailUrl = itemData.image_url || null;
      } else {
        url = itemData.image_url || '';
        thumbnailUrl = null;
      }
      
      return {
        id: itemData.id || `${index}`,
        url,
        type,
        order: index,
        thumbnailUrl,
        thumbnailColor: itemData.thumbnail_color || null
      };
    });
  } else {
    // Legacy format
    if (data.media_type === 'video') {
      mediaType = MediaType.VIDEO;
    } else {
      mediaType = MediaType.IMAGE;
    }
  }
  
  return {
    id: doc.id,
    caption,
    createdDate: timestamp.toDate(),
    nonprofitId,
    numComments: data.num_comments || 0,
    numLikes: data.num_likes || 0,
    userId,
    username: data.username || null,
    community,
    postImage: data.image_url || null,
    videoUrl: data.video_url || null,
    video: !!data.video,
    mediaType,
    mediaItems,
    backgroundColorHex: data.background_color_hex || null,
    isForMembersOnly: data.is_for_members_only || false,
    isForBroaderEcosystem: data.is_for_broader_ecosystem || false
  };
}; 