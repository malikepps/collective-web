import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '@/lib/firebase/config';
import { useAuth } from '@/lib/context/AuthContext';

export default function Profile() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login if not authenticated
      router.push('/login');
    }
    if (user) {
      setDisplayName(user.displayName || '');
      setBio(user.bio || '');
      setPhotoURL(user.photoURL || '');
    }
  }, [user, loading, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileUpload(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewURL(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsUpdating(true);
    try {
      let updatedPhotoURL = photoURL;
      
      // Handle file upload if any
      if (fileUpload) {
        const storageRef = ref(storage, `users/${user.id}/profile_${Date.now()}`);
        await uploadBytes(storageRef, fileUpload);
        updatedPhotoURL = await getDownloadURL(storageRef);
      }
      
      // Update Firestore user document
      const userDocRef = doc(db, 'users', user.id);
      await updateDoc(userDocRef, {
        display_name: displayName,
        bio: bio,
        photo_url: updatedPhotoURL,
      });
      
      // Update Firebase Auth profile if needed
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: displayName,
          photoURL: updatedPhotoURL,
        });
      }
      
      setPhotoURL(updatedPhotoURL);
      setIsEditing(false);
      setPreviewURL(null);
      setFileUpload(null);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white/80 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Router will handle redirect
  }

  return (
    <div className="min-h-screen bg-background text-white">
      <div className="max-w-screen-md mx-auto px-4 py-8">
        <div className="bg-card rounded-lg p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-700">
                {(previewURL || photoURL) ? (
                  <Image 
                    src={previewURL || photoURL}
                    alt={displayName || 'Profile picture'}
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-3xl">👤</span>
                  </div>
                )}
              </div>
              {isEditing && (
                <div className="mt-2">
                  <label 
                    htmlFor="photo-upload" 
                    className="text-primary text-sm cursor-pointer hover:text-primary/80"
                  >
                    Change photo
                  </label>
                  <input 
                    id="photo-upload" 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              )}
            </div>
            
            <div className="flex-1 w-full text-center sm:text-left">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-white/80 mb-1">
                      Display Name
                    </label>
                    <input
                      id="displayName"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Display Name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-white/80 mb-1">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Tell us about yourself"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setDisplayName(user.displayName || '');
                        setBio(user.bio || '');
                        setPreviewURL(null);
                        setFileUpload(null);
                      }}
                      className="px-4 py-2 text-white/80 hover:text-white"
                      disabled={isUpdating}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
                      disabled={isUpdating}
                    >
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">{displayName || 'Anonymous User'}</h1>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-primary hover:text-primary/80"
                    >
                      Edit Profile
                    </button>
                  </div>
                  
                  {user.username && (
                    <p className="text-white/70 mb-3">@{user.username}</p>
                  )}
                  
                  {bio ? (
                    <p className="text-white/90 mb-4">{bio}</p>
                  ) : (
                    <p className="text-white/60 italic mb-4">No bio provided</p>
                  )}
                  
                  <div className="border-t border-gray-700 pt-4 mt-4">
                    <h2 className="text-lg font-semibold mb-2">Account Information</h2>
                    <div className="space-y-2">
                      <p className="text-white/80">
                        <span className="text-white/60">Email:</span> {user.email || 'No email provided'}
                      </p>
                      <p className="text-white/80">
                        <span className="text-white/60">Phone:</span> {user.phoneNumber || 'No phone provided'}
                      </p>
                      <p className="text-white/80">
                        <span className="text-white/60">Member since:</span> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 