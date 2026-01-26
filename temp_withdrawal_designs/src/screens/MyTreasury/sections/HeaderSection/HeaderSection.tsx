import React from "react";

export const HeaderSection = (): JSX.Element => {
  return (
    <header className="flex items-start justify-between pt-[30px] pb-5 px-[30px] relative self-stretch w-full flex-[0_0_auto] bg-transparent">
      <div className="inline-flex items-center gap-[15px] relative flex-[0_0_auto]">
        <div className="flex w-[45px] h-[45px] items-center justify-center gap-2.5 p-2.5 relative bg-red rounded-[100px] aspect-[1]">
          <img
            className="relative w-7 h-7 mt-[-1.50px] mb-[-1.50px] ml-[-1.50px] mr-[-1.50px] aspect-[1]"
            alt="Fractopus logo"
            src="https://c.animaapp.com/JscBe9bd/img/ic-fractopus-open.svg"
          />
        </div>

        <h1 className="relative w-fit [font-family:'Lato',Helvetica] font-bold text-dark-grey text-lg tracking-[0.90px] leading-[27px] whitespace-nowrap">
          Copus
        </h1>

        <div className="inline-flex items-center justify-center gap-2.5 pl-[15px] pr-0 py-0 relative flex-[0_0_auto] border-l [border-left-style:solid] border-medium-grey">
          <p className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-light text-dark-grey text-lg tracking-[0] leading-[27px] whitespace-nowrap">
            Human Internet
          </p>
        </div>
      </div>

      <nav className="inline-flex items-center gap-5 relative flex-[0_0_auto]">
        <button
          className="inline-flex items-center justify-center gap-[15px] px-5 py-2.5 relative flex-[0_0_auto] rounded-[50px] border border-solid border-red"
          aria-label="Curate content"
        >
          <img
            className="relative w-5 h-5 aspect-[0.99]"
            alt=""
            src="https://c.animaapp.com/JscBe9bd/img/vector.svg"
          />

          <span className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-red text-lg tracking-[0] leading-[27px] whitespace-nowrap">
            Curate
          </span>
        </button>

        <button
          className="relative w-[47px] h-[47px] aspect-[1]"
          aria-label="View notifications"
        >
          <img
            className="w-full h-full"
            alt="Notifications"
            src="https://c.animaapp.com/JscBe9bd/img/notification.svg"
          />
        </button>

        <button
          className="flex w-[47px] h-[47px] items-center justify-center gap-[5px] relative rounded-[500px] aspect-[1]"
          aria-label="User profile"
        >
          <img
            className="relative flex-1 self-stretch grow"
            alt="User avatar"
            src="https://c.animaapp.com/JscBe9bd/img/avatar@2x.png"
          />
        </button>
      </nav>
    </header>
  );
};
