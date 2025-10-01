import { GithubIcon } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../../ui/button";

interface SideMenuSectionProps {
  activeItem?: string;
}

const menuItems = [
  {
    iconSvg: "1-discover.svg",
    label: "Discovery",
    href: "/discovery",
    key: "discovery",
  },
  {
    iconSvg: "2-my treasury.svg",
    label: "My treasury",
    href: "/my-treasury",
    key: "treasury",
  },
  {
    iconSvg: "3-notification.svg",
    label: "Notification",
    href: "/notification",
    key: "notification",
  },
  {
    iconSvg: "4-setting.svg",
    label: "Setting",
    href: "/setting",
    key: "setting",
  },
];

const footerLinks = ["About", "Support", "Contact us", "Terms & Privacy"];

export const SideMenuSection = ({ activeItem }: SideMenuSectionProps): JSX.Element => {
  return (
    <aside className="flex flex-col h-screen w-[300px] fixed left-0 top-0 pt-[90px] px-[30px] pb-[30px]">
      <nav className="inline-flex items-center gap-5 px-5 py-[30px] bg-[#ffffff] flex-col relative flex-[0_0_auto] rounded-lg w-[240px]">
        {menuItems.map((item, index) => {
          const isActive = activeItem === item.key;
          return (
            <Button
              key={item.label}
              asChild
              variant="ghost"
              className={`flex items-center gap-5 px-5 py-2.5 relative self-stretch w-full flex-[0_0_auto] rounded-[15px] h-auto justify-start transition-colors hover:bg-gray-50 ${
                isActive
                  ? "bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]"
                  : ""
              }`}
            >
              <Link to={item.href}>
                <div className="relative w-[30px] h-[30px] flex items-center justify-center">
                  <img
                    className="w-[30px] h-[30px]"
                    alt={`${item.label} icon`}
                    src={`/${item.iconSvg}`}
                  />
                </div>
                <span
                  className={`relative w-fit [font-family:'Lato',Helvetica] text-dark-grey text-lg tracking-[0] leading-[27px] whitespace-nowrap ${
                    isActive ? "font-bold" : "font-normal"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            </Button>
          );
        })}
      </nav>

      <div className="flex-1" />

      <div className="flex flex-col items-start gap-2.5 relative">
        <div className="inline-flex flex-col items-start gap-[5px] relative flex-[0_0_auto]">
          <GithubIcon className="relative w-4 h-4 text-dark-grey" />

          <div className="inline-flex items-end gap-[3px] relative flex-[0_0_auto]">
            <div className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-dark-grey text-sm tracking-[0] leading-3 whitespace-nowrap">
              Built on
            </div>

            <img
              className="relative w-[12.8px] h-3"
              alt="Ic fractopus"
              src="https://c.animaapp.com/mft9nppdGctUh1/img/ic-fractopus.svg"
            />
          </div>
        </div>

        <img
          className="relative self-stretch w-full flex-[0_0_auto]"
          alt="Social"
          src="https://c.animaapp.com/mft9nppdGctUh1/img/social.svg"
        />

        <footer className="flex flex-col items-start gap-2.5 pt-5 relative self-stretch w-full flex-[0_0_auto] bg-transparent">
          <div className="flex flex-col items-start gap-3">
            <div className="flex flex-col items-start">
              {footerLinks.map((link, index) => (
                <div key={index} className="[font-family:'Lato',Helvetica] font-normal text-[#686868] text-base tracking-[0] leading-[25px]">
                  • {link}
                </div>
              ))}
            </div>

            <div className="[font-family:'Lato',Helvetica] font-normal text-[#686868] text-base tracking-[0] leading-[25px]">
              © 2024 S31 Labs
            </div>
          </div>
        </footer>
      </div>
    </aside>
  );
};
