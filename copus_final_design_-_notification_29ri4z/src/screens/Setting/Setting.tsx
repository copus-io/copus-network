import React, { useState } from "react";
import { HeaderSection } from "../../components/shared/HeaderSection/HeaderSection";
import { SideMenuSection } from "../../components/shared/SideMenuSection/SideMenuSection";
import { ProfileContentSection } from "./sections/ProfileContentSection/ProfileContentSection";

export const Setting = (): JSX.Element => {
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  const handleLogout = () => {
    setIsLoggedOut(true);
  };

  return (
    <div
      className="w-full min-h-screen bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]"
      data-model-id="8911:17363"
    >
      <HeaderSection isLoggedIn={!isLoggedOut} />
      <SideMenuSection activeItem="setting" />
      <div className="ml-[360px] mr-[70px] min-h-screen overflow-y-auto pt-[120px]">
        <ProfileContentSection onLogout={handleLogout} />
      </div>
    </div>
  );
};
