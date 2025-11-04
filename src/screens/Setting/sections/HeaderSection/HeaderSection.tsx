import { BellIcon, PlusIcon } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage } from "../../../../components/ui/avatar";
import { Button } from "../../../../components/ui/button";

export const HeaderSection = (): JSX.Element => {
  return (
    <header className="flex items-start justify-between p-[30px] relative self-stretch w-full flex-[0_0_auto] bg-transparent translate-y-[-1rem] animate-fade-in opacity-0">
      <div className="inline-flex items-center gap-[15px] relative flex-[0_0_auto]">
        <div className="flex w-[45px] h-[45px] items-center justify-center gap-2.5 p-2.5 relative bg-red rounded-[100px]">
          <img
            className="relative w-7 h-7 mt-[-1.50px] mb-[-1.50px] ml-[-1.50px] mr-[-1.50px]"
            alt="Ic fractopus open"
            src="https://c.animaapp.com/mft4oqz6uyUKY7/img/ic-fractopus-open.svg"
          />
        </div>

        <div className="font-bold text-dark-grey tracking-[0.90px] relative w-fit [font-family:'Lato',Helvetica] text-lg leading-[27px] whitespace-nowrap">
          Copus
        </div>

        <div className="inline-flex items-center justify-center gap-2.5 pl-[15px] pr-0 py-0 relative flex-[0_0_auto] border-l [border-left-style:solid] border-[#a8a8a8]">
          <div className="mt-[-1.00px] font-light text-dark-grey tracking-[0] relative w-fit [font-family:'Lato',Helvetica] text-lg leading-[27px] whitespace-nowrap">
            Internet Treasure Map
          </div>
        </div>
      </div>

      <div className="inline-flex items-center gap-5 relative flex-[0_0_auto] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]">
        <Button
          variant="outline"
          className="inline-flex items-center justify-center gap-[15px] px-5 py-2.5 relative flex-[0_0_auto] rounded-[50px] border border-solid border-[#f23a00] bg-transparent hover:bg-red/5 h-auto"
        >
          <PlusIcon className="relative w-5 h-5 text-red" />
          <div className="mt-[-1.00px] font-bold text-red tracking-[0] relative w-fit [font-family:'Lato',Helvetica] text-lg leading-[27px] whitespace-nowrap">
            Create
          </div>
        </Button>

        <Link to="/notification">
          <Button
            variant="ghost"
            size="icon"
            className="relative w-[47px] h-[47px] p-0 hover:bg-transparent"
          >
            <BellIcon className="w-6 h-6 text-dark-grey" />
          </Button>
        </Link>

        <Avatar className="w-[47px] h-[47px]">
          <AvatarImage
            src="https://c.animaapp.com/mft4oqz6uyUKY7/img/avatar-1.png"
            alt="Avatar"
            className="relative flex-1 self-stretch grow"
          />
        </Avatar>
      </div>
    </header>
  );
};
