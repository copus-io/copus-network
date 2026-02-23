import React from "react";
import { HeaderSection } from "../../components/shared/HeaderSection/HeaderSection";
import { SideMenuSection } from "../../components/shared/SideMenuSection/SideMenuSection";
import { MainContentSection } from "./sections/MainContentSection/MainContentSection";

interface MainFrameProps {
  children?: React.ReactNode;
}

export const MainFrame = ({ children }: MainFrameProps): JSX.Element => {
  return (
    <div className="w-full max-w-full min-h-screen overflow-x-hidden bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
      <HeaderSection />
      <SideMenuSection />
      <div className="lg:ml-[310px] lg:mr-[40px] min-h-screen overflow-y-auto pt-[50px] lg:pt-[60px] pb-[100px] overflow-x-hidden">
        {children || <MainContentSection />}
      </div>
    </div>
  );
};
