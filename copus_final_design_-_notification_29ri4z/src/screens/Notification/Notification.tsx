import React from "react";
import { HeaderSection } from "../../components/shared/HeaderSection/HeaderSection";
import { SideMenuSection } from "../../components/shared/SideMenuSection/SideMenuSection";
import { NotificationListSection } from "./sections/NotificationListSection/NotificationListSection";

export const Notification = (): JSX.Element => {
  return (
    <div
      className="w-full min-h-screen bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]"
      data-model-id="8911:17577"
    >
      <HeaderSection isLoggedIn={true} />
      <SideMenuSection activeItem="notification" />
      <div className="ml-[360px] mr-[70px] min-h-screen overflow-y-auto pt-[120px] overflow-x-visible">
        <NotificationListSection />
      </div>
    </div>
  );
};
