import React, { useEffect } from "react";
import { useUser } from "../../contexts/UserContext";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { ProfileContentSection } from "./sections/ProfileContentSection/ProfileContentSection";

export const Setting = (): JSX.Element => {
  const { logout, fetchUserInfo } = useUser();

  // Fetch latest user data when entering Settings page
  useEffect(() => {
    const loadUserData = async () => {
      try {
        await fetchUserInfo();
      } catch (error) {
        // Ignore errors - user is already logged in if they're on this page
        // fetchUserInfo will only logout if there's a real auth error
        console.warn('Failed to refresh user data on Settings mount:', error);
      }
    };

    loadUserData();
  }, [fetchUserInfo]);

  return (
    <PageWrapper activeMenuItem="setting" requireAuth={true}>
      <ProfileContentSection onLogout={logout} />
    </PageWrapper>
  );
};
