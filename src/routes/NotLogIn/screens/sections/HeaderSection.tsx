import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../../components/ui/button";

export const HeaderSection = (): JSX.Element => {
  return (
    <header className="flex w-full items-start justify-between p-[30px] relative bg-transparent">
      <div className="inline-flex items-center gap-[15px] relative flex-[0_0_auto]">
        <Link to="/" className="flex w-[45px] h-[45px] items-center justify-center gap-2.5 p-2.5 relative bg-red rounded-[100px]">
          <img
            className="relative w-7 h-7 mt-[-1.50px] mb-[-1.50px] ml-[-1.50px] mr-[-1.50px]"
            alt="Ic fractopus open"
            src="https://c.animaapp.com/mft5gmofxQLTNf/img/ic-fractopus-open.svg"
          />
        </Link>

        <Link to="/" className="relative w-fit [font-family:'Lato',Helvetica] font-bold text-dark-grey text-lg tracking-[0.90px] leading-[27px] whitespace-nowrap">
          Copus
        </Link>

        <div className="inline-flex items-center justify-center gap-2.5 pl-[15px] pr-0 py-0 relative flex-[0_0_auto] border-l [border-left-style:solid] border-[#a8a8a8]">
          <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-light text-dark-grey text-lg tracking-[0] leading-[27px] whitespace-nowrap">
            Internet Treasure Map
          </div>
        </div>
      </div>

      <div className="inline-flex items-center gap-5 relative flex-[0_0_auto]">
        <Button
          variant="outline"
          className="inline-flex items-center justify-center gap-[15px] px-5 py-2.5 h-auto bg-white rounded-[50px] border border-solid border-[#454545] [font-family:'Lato',Helvetica] font-semibold text-dark-grey text-lg tracking-[0] leading-[27px] whitespace-nowrap hover:bg-gray-50"
          asChild
        >
          <Link to="/login">Log in / Sign up</Link>
        </Button>
      </div>
    </header>
  );
};
