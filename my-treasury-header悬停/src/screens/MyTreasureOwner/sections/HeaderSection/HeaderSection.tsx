import React from "react";
import { Link } from "react-router-dom";

export const HeaderSection = (): JSX.Element => {
  return (
    <header className="flex items-start justify-between p-[30px] relative self-stretch w-full flex-[0_0_auto] bg-transparent">
      <div className="inline-flex items-center gap-[15px] relative flex-[0_0_auto]">
        <div className="flex w-[45px] h-[45px] items-center justify-center gap-2.5 p-2.5 relative bg-red rounded-[100px] aspect-[1]">
          <img
            className="relative w-7 h-7 mt-[-1.50px] mb-[-1.50px] ml-[-1.50px] mr-[-1.50px] aspect-[1]"
            alt="Ic fractopus open"
            src="https://c.animaapp.com/uJfL8gGM/img/ic-fractopus-open.svg"
          />
        </div>

        <div className="relative w-fit [font-family:'Lato',Helvetica] font-bold text-dark-grey text-lg tracking-[0.90px] leading-[27px] whitespace-nowrap">
          Copus
        </div>

        <div className="inline-flex items-center justify-center gap-2.5 pl-[15px] pr-0 py-0 relative flex-[0_0_auto] border-l [border-left-style:solid] border-medium-grey">
          <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-light text-dark-grey text-lg tracking-[0] leading-[27px] whitespace-nowrap">
            Human Internet
          </div>
        </div>
      </div>

      <div className="inline-flex items-center gap-5 relative flex-[0_0_auto]">
        <button className="inline-flex items-center justify-center gap-[15px] px-5 py-2.5 relative flex-[0_0_auto] rounded-[50px] border border-solid border-red bg-transparent cursor-pointer hover:bg-[rgba(242,58,0,0.1)] hover:text-red transition-colors duration-200">
          <img
            className="relative w-5 h-5 aspect-[0.99]"
            alt="Add"
            src="https://c.animaapp.com/uJfL8gGM/img/add.svg"
          />

          <span className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-red text-lg tracking-[0] leading-[27px] whitespace-nowrap">
            Create
          </span>
        </button>

        <button
          className="relative w-[47px] h-[47px] aspect-[1] bg-transparent cursor-pointer group"
          aria-label="Notifications"
        >
          <img
            className="relative w-[47px] h-[47px] aspect-[1] transition-transform duration-200 group-hover:rotate-[10deg]"
            alt="Notification"
            src="https://c.animaapp.com/uJfL8gGM/img/notification.svg"
          />
        </button>

        <Link
          className="flex w-[47px] h-[47px] items-center justify-center gap-[5px] relative rounded-[500px] aspect-[1] transition-all duration-200 hover:ring-2 hover:ring-red hover:ring-offset-0 overflow-hidden group"
          to="/my-treasureu45owner"
          aria-label="Profile"
        >
          <div className="absolute inset-0 bg-[url(https://c.animaapp.com/uJfL8gGM/img/profile@2x.png)] bg-cover bg-[50%_50%] rounded-[500px] transition-transform duration-200 group-hover:scale-[1.2]" />
        </Link>
      </div>
    </header>
  );
};
