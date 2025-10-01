import React from "react";
import { ShareTreasureHeaderSection } from "./sections/ShareTreasureHeaderSection";
import { ShareTreasureMainContentSection } from "./sections/ShareTreasureMainContentSection/ShareTreasureMainContentSection";

export const Create = (): JSX.Element => {
  return (
    <div
      className="w-[1440px] flex bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]"
      data-model-id="8915:34523"
    >
      <div className="flex w-[1440px] h-[1124px] relative flex-col items-start">
        <ShareTreasureHeaderSection />
        <div className="flex flex-col items-start gap-[30px] px-40 py-0 relative flex-1 self-stretch w-full grow">
          <div className="flex items-center gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
            <div className="relative w-fit mt-[-1.00px] font-h-3 font-[number:var(--h-3-font-weight)] text-[#231f20] text-[length:var(--h-3-font-size)] text-center tracking-[var(--h-3-letter-spacing)] leading-[var(--h-3-line-height)] whitespace-nowrap [font-style:var(--h-3-font-style)]">
              Share treasure
            </div>
          </div>

          <ShareTreasureMainContentSection />
        </div>
      </div>
    </div>
  );
};
