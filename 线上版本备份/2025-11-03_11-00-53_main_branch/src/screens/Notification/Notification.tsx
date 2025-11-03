import React from "react";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { NotificationListSection } from "./sections/NotificationListSection/NotificationListSection";

export const Notification = (): JSX.Element => {
  return (
    <PageWrapper activeMenuItem="notification" requireAuth={true}>
      <NotificationListSection />
    </PageWrapper>
  );
};
