import React from "react";
import { ContentSection } from "./sections/ContentSection/ContentSection";
import { HeaderSection } from "./sections/HeaderSection";
import { SideMenuSection } from "./sections/SideMenuSection/SideMenuSection";

export const MyTreasureOwner = (): JSX.Element => {
  return (
    <div
      className="w-screen h-screen min-h-screen flex bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] m-0 p-0"
      data-model-id="8911:17824"
    >
      <div className="flex w-full h-full relative flex-col items-start">
        <HeaderSection />
        <div className="flex flex-1 items-start px-[30px] py-5 relative self-stretch w-full">
          <SideMenuSection />
          <ContentSection />
        </div>
      </div>
    </div>
  );
};
