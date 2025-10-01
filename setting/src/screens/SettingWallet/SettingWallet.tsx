import React from "react";
import { HeaderSection } from "./sections/HeaderSection";
import { ProfileContentSection } from "./sections/ProfileContentSection/ProfileContentSection";
import { SideMenuSection } from "./sections/SideMenuSection/SideMenuSection";

export const SettingWallet = (): JSX.Element => {
  return (
    <div
      className="min-h-screen flex"
      style={{
        background: 'linear-gradient(0deg, rgba(224, 224, 224, 0.18) 0%, rgba(224, 224, 224, 0.18) 100%), linear-gradient(0deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 1) 100%)'
      }}
      data-model-id="8923:2029"
    >
      <div className="w-full flex-col flex relative items-start">
        <HeaderSection />
        <div className="flex-1 px-[30px] py-5 w-full flex relative items-start">
          <SideMenuSection />
          <ProfileContentSection />
        </div>
      </div>
    </div>
  );
};
