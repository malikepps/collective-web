import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/config';

// User profile data interface
interface UserProfileData {
  firstName: string;
  lastName: string;
  displayName: string;
  phoneNumber: string;
  zipCode: string;
  city: string;
  state: string;
  profileImageFile: File | null;
}

export async function createUserProfile(userId: string, profileData: UserProfileData) {
  if (!userId) throw new Error('No user ID provided');

  // Upload profile image if provided
  let profileImageUrl = null;
  if (profileData.profileImageFile) {
    const storageRef = ref(storage, `profile_images/${userId}`);
    await uploadBytes(storageRef, profileData.profileImageFile);
    profileImageUrl = await getDownloadURL(storageRef);
  }

  // Check if user document exists
  const userDoc = await getDoc(doc(db, 'users', userId));
  
  // Create or update user profile in Firestore
  if (!userDoc.exists()) {
    // Create new user document
    await setDoc(doc(db, 'users', userId), {
      first_name: profileData.firstName,
      last_name: profileData.lastName,
      display_name: profileData.displayName,
      phone_number: profileData.phoneNumber,
      zip_code: profileData.zipCode,
      city: profileData.city,
      state: profileData.state,
      profile_image_url: profileImageUrl,
      is_onboarded: true,
      created_time: serverTimestamp(),
      onboarded_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });
  } else {
    // Update existing user document
    await updateDoc(doc(db, 'users', userId), {
      first_name: profileData.firstName,
      last_name: profileData.lastName,
      display_name: profileData.displayName,
      phone_number: profileData.phoneNumber,
      zip_code: profileData.zipCode,
      city: profileData.city,
      state: profileData.state,
      profile_image_url: profileImageUrl,
      is_onboarded: true,
      onboarded_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });
  }

  // Clear temporary localStorage data
  localStorage.removeItem('temp_first_name');
  localStorage.removeItem('temp_last_name');
  localStorage.removeItem('temp_display_name');
  localStorage.removeItem('temp_profile_image');
  localStorage.removeItem('temp_zip_code');
  localStorage.removeItem('temp_city');
  localStorage.removeItem('temp_state');
  
  // Update auth_user in localStorage
  try {
    const authUser = localStorage.getItem('auth_user');
    if (authUser) {
      const userData = JSON.parse(authUser);
      userData.isOnboarded = true;
      userData.displayName = profileData.displayName;
      userData.firstName = profileData.firstName;
      userData.lastName = profileData.lastName;
      
      localStorage.setItem('auth_user', JSON.stringify(userData));
    }
  } catch (error) {
    console.error('Error updating auth_user in localStorage:', error);
  }
  
  return userDoc.exists();
} 