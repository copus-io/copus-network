import React from "react";

export const HeaderSection = (): JSX.Element => {
  return (
    <header className="flex items-start justify-between p-[30px] relative self-stretch w-full flex-[0_0_auto] bg-transparent">
      <div className="inline-flex items-center gap-[15px] relative flex-[0_0_auto]">
        <div className="flex w-[45px] h-[45px] items-center justify-center gap-2.5 p-2.5 relative bg-red rounded-[100px] aspect-[1]">
          <img
            className="relative w-7 h-7 mt-[-1.50px] mb-[-1.50px] ml-[-1.50px] mr-[-1.50px] aspect-[1]"
            alt="Ic fractopus open"
            src="https://c.animaapp.com/1aPszOHA/img/ic-fractopus-open.svg"
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
        <div className="inline-flex items-center justify-center gap-[15px] px-5 py-2.5 relative flex-[0_0_auto] rounded-[50px] border border-solid border-red hover:bg-[#F23A001A] transition-colors duration-200 cursor-pointer">
          <img
            className="relative w-5 h-5 aspect-[0.99]"
            alt="Vector"
            src="https://c.animaapp.com/1aPszOHA/img/vector.svg"
          />

          <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-red text-lg tracking-[0] leading-[27px] whitespace-nowrap">
            Create
          </div>
        </div>

        <img
          className="w-[47px] h-[47px] aspect-[1] relative hover:rotate-[5deg] transition-transform duration-200 cursor-pointer"
          alt="Notification"
          src="https://c.animaapp.com/1aPszOHA/img/notification.svg"
        />

        <div className="flex w-[47px] h-[47px] items-center justify-center gap-[5px] rounded-[500px] relative aspect-[1] hover:ring-2 hover:ring-red transition-all duration-200 cursor-pointer">
          <img
            className="relative flex-1 self-stretch grow rounded-[500px]"
            alt="Avatar"
            src="https://c.animaapp.com/1aPszOHA/img/avatar@2x.png"
          />
        </div>
      </div>
    </header>
  );
};
