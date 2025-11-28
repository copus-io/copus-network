import React from "react";
import { Button } from "../../../../components/ui/button";

const menuItems = [
  {
    id: "discovery",
    label: "Discovery",
    icon: "https://c.animaapp.com/mfw5a2xo4LOvv6/img/eyes.svg",
    isActive: false,
    fontWeight: "font-normal",
  },
  {
    id: "treasury",
    label: "My treasury",
    icon: "https://c.animaapp.com/mfw5a2xo4LOvv6/img/treasure-icon.svg",
    isActive: true,
    fontWeight: "font-bold",
  },
  {
    id: "notification",
    label: "Notification",
    icon: "https://c.animaapp.com/mfw5a2xo4LOvv6/img/notification-icon.svg",
    isActive: false,
    fontWeight: "font-normal",
  },
  {
    id: "setting",
    label: "Setting",
    icon: "https://c.animaapp.com/mfw5a2xo4LOvv6/img/setting.svg",
    isActive: false,
    fontWeight: "font-normal",
  },
];

export const SideMenuSection = (): JSX.Element => {
  return (
    <nav className="inline-flex flex-col items-center justify-between relative self-stretch flex-[0_0_auto] rounded-[15px]">
      <div className="inline-flex items-center gap-5 px-5 py-[30px] bg-[#ffffff] flex-col relative flex-[0_0_auto]">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={`flex items-center gap-5 px-5 py-2.5 relative self-stretch w-full flex-[0_0_auto] rounded-[15px] h-auto ${
              item.isActive
                ? "bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] bg-light-grey-transparent"
                : "hover:bg-gray-50"
            }`}
          >
            <div className="flex w-[30px] h-[30px] items-center justify-center gap-2.5 relative">
              {item.id === "discovery" ? (
                <div className="relative w-[30px] h-[23px] bg-[url(https://c.animaapp.com/mfw5a2xo4LOvv6/img/eyes.svg)] bg-[100%_100%]" />
              ) : (
                <img
                  className={`relative ${
                    item.id === "treasury"
                      ? "w-[17px] h-[26px]"
                      : item.id === "notification"
                        ? "w-6 h-[26px]"
                        : "w-[25.6px] h-[26.6px]"
                  }`}
                  alt={`${item.label} icon`}
                  src={item.icon}
                />
              )}
            </div>

            <div
              className={`relative w-fit [font-family:'Lato',Helvetica] ${item.fontWeight} text-dark-grey text-lg tracking-[0] leading-[27px] whitespace-nowrap`}
            >
              {item.label}
            </div>
          </Button>
        ))}
      </div>

      <div className="flex items-start self-stretch w-full flex-col relative flex-[0_0_auto]">
        <div className="flex flex-col items-start justify-end gap-2.5 px-0 py-5 relative self-stretch w-full flex-[0_0_auto]">
          <div className="inline-flex flex-col items-start gap-[5px] relative flex-[0_0_auto]">
            <img
              className="relative w-4 h-4"
              alt="Ic github"
              src="https://c.animaapp.com/mfw5a2xo4LOvv6/img/ic-github.svg"
            />

            <div className="inline-flex items-end gap-[3px] relative flex-[0_0_auto]">
              <div className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-dark-grey text-sm tracking-[0] leading-3 whitespace-nowrap">
                Built on
              </div>

              <img
                className="relative w-[12.8px] h-3"
                alt="Ic fractopus"
                src="https://c.animaapp.com/mfw5a2xo4LOvv6/img/ic-fractopus.svg"
              />
            </div>
          </div>

          <img
            className="relative self-stretch w-full flex-[0_0_auto]"
            alt="Social"
            src="https://c.animaapp.com/mfw5a2xo4LOvv6/img/social.svg"
          />
        </div>

        <footer className="flex flex-col items-start justify-center gap-2.5 pt-5 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto] bg-transparent">
          <div className="flex flex-col w-[126px] h-[137px] items-start gap-3">
            <div className="relative flex items-center justify-center self-stretch [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[25px]">
              <span className="[font-family:'Lato',Helvetica] font-normal text-[#686868] text-base tracking-[0] leading-[25px]">
                • About • Support • Contact us • Terms &amp; Privacy
              </span>
            </div>

            <div className="relative flex items-center justify-center self-stretch [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[25px]">
              <span className="[font-family:'Lato',Helvetica] font-normal text-[#686868] text-base tracking-[0] leading-[25px]">
                © 2024 S31 Labs
              </span>
            </div>
          </div>
        </footer>
      </div>
    </nav>
  );
};
