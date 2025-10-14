import React from "react";
import { Link } from "react-router-dom";

const menuItems = [
  {
    id: "discovery",
    label: "Discovery",
    icon: "https://c.animaapp.com/1aPszOHA/img/eyes.svg",
    isActive: true,
    link: "/newu45explore",
  },
  {
    id: "treasury",
    label: "My treasury",
    icon: "https://c.animaapp.com/1aPszOHA/img/icon-wrap.svg",
    isActive: false,
  },
  {
    id: "notification",
    label: "Notification",
    icon: "https://c.animaapp.com/1aPszOHA/img/icon-wrap-1.svg",
    isActive: false,
  },
  {
    id: "setting",
    label: "Setting",
    icon: "https://c.animaapp.com/1aPszOHA/img/icon-wrap-2.svg",
    isActive: false,
  },
];

const footerLinks = ["About", "Support", "Contact us", "Terms & Privacy"];

export const SideMenuSection = (): JSX.Element => {
  return (
    <nav
      className="inline-flex flex-col items-center justify-between relative self-stretch flex-[0_0_auto] rounded-[15px]"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="inline-flex items-center gap-5 px-5 py-[30px] rounded-lg bg-[linear-gradient(0deg,rgba(224,224,224,0)_0%,rgba(224,224,224,0)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] flex-col relative flex-[0_0_auto]">
        {menuItems.map((item) => {
          if (item.isActive && item.link) {
            return (
              <Link
                key={item.id}
                className="flex items-center gap-5 px-5 py-2.5 relative self-stretch w-full flex-[0_0_auto] rounded-[15px] bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] hover:bg-[linear-gradient(0deg,rgba(224,224,224,0.6)_0%,rgba(224,224,224,0.6)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] transition-colors duration-200"
                to={item.link}
                aria-current="page"
              >
                <div className="flex flex-col w-[30px] h-[30px] items-center justify-center gap-2.5 relative">
                  <div className="relative w-[30px] h-[23px] aspect-[1.3] bg-[url(https://c.animaapp.com/1aPszOHA/img/eyes.svg)] bg-[100%_100%]" />
                </div>

                <div className="relative w-fit [font-family:'Lato',Helvetica] font-bold text-dark-grey text-lg tracking-[0] leading-[27px] whitespace-nowrap">
                  {item.label}
                </div>
              </Link>
            );
          }

          return (
            <button
              key={item.id}
              className="flex items-center gap-5 px-5 py-2.5 self-stretch w-full flex-[0_0_auto] rounded-[15px] relative hover:bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] transition-colors duration-200 cursor-pointer"
              type="button"
              aria-label={item.label}
            >
              <img
                className="relative w-[30px] h-[30px]"
                alt=""
                src={item.icon}
              />

              <div className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-dark-grey text-lg tracking-[0] leading-[27px] whitespace-nowrap">
                {item.label}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-start self-stretch w-full flex-col relative flex-[0_0_auto]">
        <div className="flex flex-col items-start justify-end gap-2.5 px-0 py-5 relative self-stretch w-full flex-[0_0_auto]">
          <div className="inline-flex flex-col items-start gap-[5px] relative flex-[0_0_auto]">
            <img
              className="relative w-[14.47px] h-[14.08px] aspect-[1]"
              alt="GitHub"
              src="https://c.animaapp.com/1aPszOHA/img/ic-github.svg"
            />

            <div className="inline-flex items-end gap-[3px] relative flex-[0_0_auto]">
              <div className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-dark-grey text-sm tracking-[0] leading-3 whitespace-nowrap">
                Built on
              </div>
            </div>
          </div>

          <img
            className="relative self-stretch w-full flex-[0_0_auto]"
            alt="Social media links"
            src="https://c.animaapp.com/1aPszOHA/img/social.svg"
          />
        </div>

        <footer className="flex flex-col items-start justify-center gap-2.5 pt-5 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto] bg-transparent">
          <div className="w-[126px] h-[137px] flex flex-col items-start gap-3">
            <p className="flex items-center justify-center text-medium-dark-grey text-base leading-[25px] relative self-stretch [font-family:'Lato',Helvetica] font-normal tracking-[0]">
              <span className="[font-family:'Lato',Helvetica] font-normal text-[#686868] text-base tracking-[0] leading-[25px]">
                {footerLinks.map((link, index) => (
                  <span key={link}>
                    • {link}
                    {index < footerLinks.length - 1 ? "  " : ""}
                  </span>
                ))}
              </span>
            </p>

            <p className="flex items-center justify-center text-medium-dark-grey text-base leading-[25px] relative self-stretch [font-family:'Lato',Helvetica] font-normal tracking-[0]">
              <span className="[font-family:'Lato',Helvetica] font-normal text-[#686868] text-base tracking-[0] leading-[25px]">
                © 2024 S31 Labs
              </span>
            </p>
          </div>
        </footer>
      </div>
    </nav>
  );
};
