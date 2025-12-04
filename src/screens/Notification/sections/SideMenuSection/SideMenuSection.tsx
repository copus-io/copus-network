import {
  BellIcon,
  EyeIcon,
  GithubIcon,
  SettingsIcon,
  WalletIcon,
} from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../../components/ui/button";

const menuItems = [
  {
    icon: EyeIcon,
    label: "Discovery",
    href: "/copus",
    isActive: false,
  },
  {
    icon: WalletIcon,
    label: "Treasury",
    href: "/treasury",
    isActive: false,
  },
  {
    icon: BellIcon,
    label: "Notification",
    href: "/notification",
    isActive: true,
  },
  {
    icon: SettingsIcon,
    label: "Setting",
    href: "/setting",
    isActive: false,
  },
];

const footerLinks = ["About", "Support", "Contact us", "Terms & Privacy"];

export const SideMenuSection = (): JSX.Element => {
  return (
    <aside className="inline-flex flex-col items-center justify-between relative self-stretch flex-[0_0_auto] rounded-[15px] translate-y-[-1rem] animate-fade-in opacity-0">
      <nav className="inline-flex items-center gap-5 px-5 py-[30px] bg-[#ffffff] flex-col relative flex-[0_0_auto]">
        {menuItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <Button
              key={item.label}
              asChild
              variant="ghost"
              className={`flex items-center gap-5 px-5 py-2.5 relative self-stretch w-full flex-[0_0_auto] rounded-[15px] h-auto justify-start transition-colors hover:bg-gray-50 ${
                item.isActive
                  ? "bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] bg-light-grey-transparent"
                  : ""
              } translate-y-[-1rem] animate-fade-in opacity-0`}
              style={
                {
                  "--animation-delay": `${(index + 1) * 100}ms`,
                } as React.CSSProperties
              }
            >
              <Link to={item.href}>
                <IconComponent className="relative w-[30px] h-[30px] text-dark-grey" />
                <span
                  className={`relative w-fit [font-family:'Lato',Helvetica] text-dark-grey text-lg tracking-[0] leading-[27px] whitespace-nowrap ${
                    item.isActive ? "font-bold" : "font-normal"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            </Button>
          );
        })}
      </nav>

      <div
        className="flex items-start self-stretch w-full flex-col relative flex-[0_0_auto] translate-y-[-1rem] animate-fade-in opacity-0"
        style={{ "--animation-delay": "500ms" } as React.CSSProperties}
      >
        <div className="flex flex-col items-start justify-end gap-2.5 px-0 py-5 relative self-stretch w-full flex-[0_0_auto]">
          <div className="inline-flex flex-col items-start gap-[5px] relative flex-[0_0_auto]">
            <GithubIcon className="relative w-4 h-4 text-dark-grey" />

            <div className="inline-flex items-end gap-[3px] relative flex-[0_0_auto]">
              <div className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-dark-grey text-sm tracking-[0] leading-3 whitespace-nowrap">
                Built on
              </div>

              <img
                className="relative w-[12.8px] h-3"
                alt="Ic fractopus"
                src="https://c.animaapp.com/mft4oqz6uyUKY7/img/ic-fractopus.svg"
              />
            </div>
          </div>

          <img
            className="relative self-stretch w-full flex-[0_0_auto]"
            alt="Social"
            src="https://c.animaapp.com/mft4oqz6uyUKY7/img/social.svg"
          />
        </div>

        <footer className="flex flex-col items-start justify-center gap-2.5 pt-5 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto] bg-transparent">
          <div className="flex flex-col w-[126px] h-[137px] items-start gap-3">
            <div className="relative flex items-center justify-center self-stretch [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[25px]">
              <span className="[font-family:'Lato',Helvetica] font-normal text-[#686868] text-base tracking-[0] leading-[25px]">
                • {footerLinks.join("  • ")}
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
    </aside>
  );
};
