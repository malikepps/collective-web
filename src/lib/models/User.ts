import { DocumentSnapshot } from 'firebase/firestore';

export enum UserType {
  INDIVIDUAL = 'individual',
  ORGANIZATION = 'organization'
}

export interface CollectiveUser {
  id: string;
  displayName: string;
  email: string | null;
  phoneNumber: string;
  photoURL: string | null;
  username: string | null;
  bio: string | null;
  zipCode: string | null;
  type: UserType;
  createdAt: Date;
  isOnboarded: boolean;
  hasSetUpOrganization: boolean;
  isSuperUser: boolean;
  firstName: string | null;
  lastName: string | null;
}

export const userFromFirestore = (doc: DocumentSnapshot): CollectiveUser | null => {
  const data = doc.data();
  if (!data) return null;
  
  return {
    id: doc.id,
    displayName: data.display_name || '',
    email: data.email || null,
    phoneNumber: data.phone_number || '',
    photoURL: data.photo_url || null,
    username: data.username || null,
    bio: data.bio || null,
    zipCode: data.zip_code || null,
    type: (data.type as UserType) || UserType.INDIVIDUAL,
    createdAt: data.created_time?.toDate() || new Date(),
    isOnboarded: data.is_onboarded || false,
    hasSetUpOrganization: data.has_setup_organization || false,
    isSuperUser: data.is_super_user || false,
    firstName: data.first_name || null,
    lastName: data.last_name || null,
  };
};

export const userToFirestore = (user: CollectiveUser): Record<string, any> => {
  return {
    display_name: user.displayName,
    email: user.email,
    phone_number: user.phoneNumber,
    photo_url: user.photoURL,
    username: user.username,
    bio: user.bio,
    zip_code: user.zipCode,
    type: user.type,
    is_onboarded: user.isOnboarded,
    has_setup_organization: user.hasSetUpOrganization,
    is_super_user: user.isSuperUser
  };
}; 