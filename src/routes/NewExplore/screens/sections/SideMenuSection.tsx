import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../../components/ui/button";

export const SideMenuSection = (): JSX.Element => {
  const menuItems = [
    {
      id: "discovery",
      label: "Discovery",
      icon: "https://c.animaapp.com/mfta56k9y0NEnT/img/eyes.svg",
      isActive: true,
      link: "/newu45explore",
    },
    {
      id: "treasury",
      label: "My treasury",
      icon: "https://c.animaapp.com/mfta56k9y0NEnT/img/icon-wrap.svg",
      isActive: false,
      link: null,
    },
    {
      id: "notification",
      label: "Notification",
      icon: "https://c.animaapp.com/mfta56k9y0NEnT/img/icon-wrap-2.svg",
      isActive: false,
      link: null,
    },
    {
      id: "setting",
      label: "Setting",
      icon: "https://c.animaapp.com/mfta56k9y0NEnT/img/icon-wrap-1.svg",
      isActive: false,
      link: null,
    },
  ];

  return (
    <aside className="inline-flex flex-col items-center justify-between relative self-stretch flex-[0_0_auto] rounded-[15px]">
      <nav className="inline-flex items-center gap-5 px-5 py-[30px] rounded-lg bg-[linear-gradient(0deg,rgba(224,224,224,0)_0%,rgba(224,224,224,0)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] flex-col relative flex-[0_0_auto]">
        {menuItems.map((item) => {
          const content = (
            <>
              <div className="flex flex-col w-[30px] h-[30px] items-center justify-center gap-2.5 relative">
                <div
                  className="relative w-[30px] h-[23px] bg-[100%_100%]"
                  style={{ backgroundImage: `url(${item.icon})` }}
                />
              </div>
              <div
                className={`relative w-fit [font-family:'Lato',Helvetica] ${item.isActive ? "font-bold" : "font-normal"} text-dark-grey text-lg tracking-[0] leading-[27px] whitespace-nowrap`}
              >
                {item.label}
              </div>
            </>
          );

          if (item.link) {
            return (
              <Link
                key={item.id}
                className={`flex items-center gap-5 px-5 py-2.5 relative self-stretch w-full flex-[0_0_auto] rounded-[15px] ${item.isActive ? "bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]" : ""}`}
                to={item.link}
              >
                {content}
              </Link>
            );
          }

          return (
            <Button
              key={item.id}
              variant="ghost"
              className={`flex items-center gap-5 px-5 py-2.5 self-stretch w-full flex-[0_0_auto] rounded-[15px] relative h-auto justify-start ${item.isActive ? "bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]" : ""}`}
            >
              {content}
            </Button>
          );
        })}
      </nav>

      <div className="flex items-start self-stretch w-full flex-col relative flex-[0_0_auto]">
        <div className="flex flex-col items-start justify-end gap-2.5 px-0 py-5 relative self-stretch w-full flex-[0_0_auto]">
          <div className="inline-flex flex-col items-start gap-[5px] relative flex-[0_0_auto]">
            <img
              className="relative w-4 h-4"
              alt="Ic github"
              src="https://c.animaapp.com/mfta56k9y0NEnT/img/ic-github.svg"
            />

            <div className="inline-flex items-end gap-[3px] relative flex-[0_0_auto]">
              <div className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-dark-grey text-sm tracking-[0] leading-3 whitespace-nowrap">
                Built on
              </div>

              <img
                className="relative w-[12.8px] h-3"
                alt="Ic fractopus"
                src="https://c.animaapp.com/mfta56k9y0NEnT/img/ic-fractopus.svg"
              />
            </div>
          </div>

          <img
            className="relative self-stretch w-full flex-[0_0_auto]"
            alt="Social"
            src="https://c.animaapp.com/mfta56k9y0NEnT/img/social.svg"
          />
        </div>

        <footer className="flex flex-col items-start justify-center gap-2.5 pt-5 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto] bg-transparent">
          <div className="flex flex-col w-[126px] h-[137px] items-start gap-3">
            <div className="flex items-center justify-center self-stretch text-medium-dark-grey leading-[25px] relative [font-family:'Lato',Helvetica] font-normal text-base tracking-[0]">
              <span className="[font-family:'Lato',Helvetica] font-normal text-[#686868] text-base tracking-[0] leading-[25px]">
                • About • Support • Contact us • Terms &amp; Privacy
              </span>
            </div>

            <div className="flex items-center justify-center self-stretch text-medium-dark-grey leading-[25px] relative [font-family:'Lato',Helvetica] font-normal text-base tracking-[0]">
              <span className="[font-family:'Lato',Helvetica] font-normal text-[#686868] text-base tracking-[0] leading-[25px]">
                © 2024 S31 Labs
              </span>
            </div>
          </div>
        </footer>
      </div>
    </aside>
  );
};
