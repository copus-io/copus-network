import React from "react";
import { ContentCardsSection } from "./sections/ContentCardsSection/ContentCardsSection";
import { HeaderSection } from "./sections/HeaderSection";
import { SideMenuSection } from "./sections/SideMenuSection";

export const NewExplore = (): JSX.Element => {
  return (
    <div className="w-full min-h-screen flex bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]" data-model-id="8896:1598">
      <div className="flex w-full min-h-screen relative flex-col items-start bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
        <HeaderSection />
        <div className="flex w-full items-start px-[30px] py-5 relative flex-1 grow">
          <SideMenuSection />
          <ContentCardsSection />
        </div>
      </div>
    </div>
  );
};
