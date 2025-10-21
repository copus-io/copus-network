import React, { useEffect } from "react";
import { useUser } from "../../contexts/UserContext";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { ProfileContentSection } from "./sections/ProfileContentSection/ProfileContentSection";

export const Setting = (): JSX.Element => {
  const { logout, fetchUserInfo } = useUser();

  // Fetch latest user data when entering Settings page
  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  return (
    <PageWrapper activeMenuItem="setting" requireAuth={true}>
      <ProfileContentSection onLogout={logout} />
    </PageWrapper>
  );
};
