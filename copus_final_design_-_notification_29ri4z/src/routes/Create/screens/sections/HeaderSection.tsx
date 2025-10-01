import { BellIcon } from "lucide-react";
import React from "react";
import { Avatar, AvatarImage } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";

export const HeaderSection = (): JSX.Element => {
  return (
    <header className="flex items-start justify-between p-[30px] relative self-stretch w-full flex-[0_0_auto] bg-transparent">
      <div className="inline-flex items-center gap-[15px] relative flex-[0_0_auto]">
        <div className="flex w-[45px] h-[45px] items-center justify-center gap-2.5 p-2.5 relative bg-red rounded-[100px]">
          <img
            className="relative w-7 h-7 mt-[-1.50px] mb-[-1.50px] ml-[-1.50px] mr-[-1.50px]"
            alt="Ic fractopus open"
            src="https://c.animaapp.com/mg28bxb7CC9zCK/img/ic-fractopus-open.svg"
          />
        </div>

        <div className="relative w-fit [font-family:'Lato',Helvetica] font-bold text-dark-grey text-lg tracking-[0.90px] leading-[27px] whitespace-nowrap">
          Copus
        </div>

        <div className="inline-flex items-center justify-center gap-2.5 pl-[15px] pr-0 py-0 relative flex-[0_0_auto] border-l [border-left-style:solid] border-[#a8a8a8]">
          <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-light text-dark-grey text-lg tracking-[0] leading-[27px] whitespace-nowrap">
            Human Internet
          </div>
        </div>
      </div>

      <div className="inline-flex items-center gap-5 relative flex-[0_0_auto]">
        <Button
          variant="ghost"
          size="icon"
          className="relative w-[47px] h-[47px] p-0 hover:bg-transparent"
        >
          <BellIcon className="w-6 h-6 text-dark-grey" />
        </Button>

        <Avatar className="w-[47px] h-[47px]">
          <AvatarImage
            src="https://c.animaapp.com/mg28bxb7CC9zCK/img/-profile-image.png"
            alt="Profile"
            className="object-cover"
          />
        </Avatar>
      </div>
    </header>
  );
};
