import React from "react";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { NotificationListSection } from "./sections/NotificationListSection/NotificationListSection";
import { SEO } from "../../components/SEO/SEO";

export const Notification = (): JSX.Element => {
  return (
    <PageWrapper activeMenuItem="notification" requireAuth={true}>
      <SEO title="Notifications" />
      <NotificationListSection />
    </PageWrapper>
  );
};
