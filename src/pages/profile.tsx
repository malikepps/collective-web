import React from 'react';
import UserProfilePage from '@/components/profile/UserProfilePage';
import AppLayout from '@/components/layout/AppLayout'; // Assuming you have a main layout

const Profile: React.FC = () => {
  return (
    <AppLayout>
      <UserProfilePage />
    </AppLayout>
  );
};

export default Profile; 