import React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";

export const HeaderSection = (): JSX.Element => {
  return (
    <header className="flex items-center justify-between p-[30px] w-full bg-transparent">
      <div className="flex items-center gap-[15px]">
        <div className="flex w-[45px] h-[45px] items-center justify-center rounded-full bg-red">
          <img
            className="w-7 h-7"
            alt="Ic fractopus open"
            src="https://c.animaapp.com/mfw5a2xo4LOvv6/img/ic-fractopus-open.svg"
          />
        </div>

        <div className="[font-family:'Lato',Helvetica] font-bold text-dark-grey text-lg tracking-[0.90px] leading-[27px] whitespace-nowrap">
          Copus
        </div>

        <div className="flex items-center justify-center pl-[15px] border-l border-[#a8a8a8]">
          <div className="[font-family:'Lato',Helvetica] font-light text-dark-grey text-lg leading-[27px] whitespace-nowrap">
            Human Internet
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <Button
          variant="outline"
          className="flex items-center gap-[15px] px-5 py-2.5 h-auto rounded-[50px] border-red text-red hover:bg-red/10"
        >
          <img
            className="w-5 h-5"
            alt="Vector"
            src="https://c.animaapp.com/mfw5a2xo4LOvv6/img/vector.svg"
          />
          <span className="[font-family:'Lato',Helvetica] font-bold text-lg">
            Create
          </span>
        </Button>

        <img
          className="w-[47px] h-[47px]"
          alt="Notification"
          src="https://c.animaapp.com/mfw5a2xo4LOvv6/img/notification.svg"
        />

        <Avatar className="w-[47px] h-[47px]">
          <AvatarImage
            src="https://c.animaapp.com/mfw5a2xo4LOvv6/img/avatar.png"
            alt="Avatar"
          />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};
