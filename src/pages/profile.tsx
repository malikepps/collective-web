import React from 'react';
import UserProfilePage from '@/components/profile/UserProfilePage';
import Layout from '@/components/layout/Layout'; // Use the correct Layout component

const Profile: React.FC = () => {
  return (
    <Layout>
      <UserProfilePage />
    </Layout>
  );
};

export default Profile; 