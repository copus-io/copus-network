import React from "react";
import { HeaderSection } from "./sections/HeaderSection";
import { IncomeDetailsSection } from "./sections/IncomeDetailsSection";
import { NavigationMenuSection } from "./sections/NavigationMenuSection";

export const MyTreasury = (): JSX.Element => {
  return (
    <div
      className="w-[1440px] flex bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]"
      data-model-id="9660:6719"
    >
      <div className="flex w-[1440px] h-[1124px] relative flex-col items-start">
        <HeaderSection />
        <div className="flex h-[1019px] items-start px-[30px] py-0 relative self-stretch w-full">
          <NavigationMenuSection />
          <IncomeDetailsSection />
        </div>
      </div>
    </div>
  );
};
