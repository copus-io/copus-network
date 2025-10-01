import React from "react";
import { HeaderSection } from "./sections/HeaderSection";
import { ShareTreasureFormSection } from "./sections/ShareTreasureFormSection";

export const Create = (): JSX.Element => {
  return (
    <div className="w-full min-h-screen flex bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
      <div className="flex w-full relative flex-col items-start">
        <HeaderSection />
        <div className="flex justify-center items-start pt-[5%] px-[11%] relative flex-1 self-stretch w-full">
          <ShareTreasureFormSection />
        </div>
      </div>
    </div>
  );
};
