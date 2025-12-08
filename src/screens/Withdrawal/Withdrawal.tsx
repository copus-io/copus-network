import React from "react";
import { HeaderSection } from "../../components/shared/HeaderSection/HeaderSection";
import { SideMenuSection } from "../../components/shared/SideMenuSection/SideMenuSection";
import { IncomeDetailsSection } from "./sections/IncomeDetailsSection";

export const Withdrawal = (): JSX.Element => {
  return (
    <div className="w-full min-h-screen bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
      <HeaderSection />
      <SideMenuSection activeItem="income" />
      <div className="lg:ml-[360px] lg:mr-[40px] min-h-screen overflow-y-auto pt-[70px] lg:pt-[110px] pb-[100px]">
        <div className="flex h-full items-center justify-center px-[30px] py-0 relative w-full">
          <IncomeDetailsSection />
        </div>
      </div>
    </div>
  );
};