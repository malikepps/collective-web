import { DocumentReference, DocumentSnapshot, Timestamp } from 'firebase/firestore';

export interface Organization {
  id: string | null;
  name: string;
  description: string;
  photoURL: string;
  location: string;
  zipCode: string;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  staff: string[] | null;
  members: string[] | null;
  pitch: string;
  linkInBio: string;
  videoURL: string;
  hero_video_url: string | null;
  membershipFee: number | null;
  username: string | null;
  communityRef: string;
  communityDisplayName: string | null;
  userID: string | null;
  igAccessToken: string;
  themeId: string | null;
  welcomeMessage: string | null;
}

export const organizationFromFirestore = (doc: DocumentSnapshot): Organization | null => {
  const data = doc.data();
  if (!data) return null;
  
  let communityRef = '';
  if (data.community) {
    if (typeof data.community === 'string') {
      communityRef = data.community;
    } else {
      // Assume it's a DocumentReference
      communityRef = (data.community as DocumentReference).path;
    }
  }
  
  let userID: string | null = null;
  if (data.user) {
    if (typeof data.user === 'string') {
      userID = data.user;
    } else {
      // Assume it's a DocumentReference
      userID = (data.user as DocumentReference).id;
    }
  } else {
    userID = data.user_id as string || null;
  }
  
  return {
    id: doc.id,
    name: data.display_name || '',
    description: data.bio || '',
    photoURL: data.photo_url || '',
    location: data.city_town || '',
    zipCode: data.zip_code || '',
    city: data.city || '',
    state: data.state || '',
    latitude: data.latitude || null,
    longitude: data.longitude || null,
    staff: data.staff || null,
    members: data.members || null,
    pitch: data.pitch || '',
    linkInBio: data.website || '',
    videoURL: data.video_url || '',
    hero_video_url: data.hero_video_url || null,
    membershipFee: data.membership_fee || null,
    username: data.username || null,
    communityRef,
    communityDisplayName: null, // Will be populated later
    userID,
    igAccessToken: data.ig_access_token || '',
    themeId: data.theme_id || null,
    welcomeMessage: data.welcome_message || null
  };
};

export const organizationToFirestore = (org: Organization): Record<string, any> => {
  const data: Record<string, any> = {
    display_name: org.name,
    bio: org.description,
    photo_url: org.photoURL,
    city_town: org.location,
    zip_code: org.zipCode,
    city: org.city,
    state: org.state,
    pitch: org.pitch,
    website: org.linkInBio,
    video_url: org.videoURL,
    community: org.communityRef
  };
  
  // Add optional fields
  if (org.hero_video_url) data.hero_video_url = org.hero_video_url;
  if (org.userID) data.user_id = org.userID;
  if (org.username) data.username = org.username;
  if (org.staff) data.staff = org.staff;
  if (org.members) data.members = org.members;
  if (org.membershipFee) data.membership_fee = org.membershipFee;
  if (org.latitude) data.latitude = org.latitude;
  if (org.longitude) data.longitude = org.longitude;
  if (org.communityDisplayName) data.community_display_name = org.communityDisplayName;
  if (org.themeId) data.theme_id = org.themeId;
  if (org.welcomeMessage) data.welcome_message = org.welcomeMessage;
  
  return data;
}; 