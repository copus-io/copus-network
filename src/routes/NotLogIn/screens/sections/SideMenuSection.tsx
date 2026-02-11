import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../../components/ui/button";

export const SideMenuSection = (): JSX.Element => {
  const menuItems = [
    {
      id: "discovery",
      label: "Discovery",
      icon: "https://c.animaapp.com/mft5gmofxQLTNf/img/eyes.svg",
      isActive: true,
      iconType: "bg",
      href: "/copus",
    },
    {
      id: "notification",
      label: "Notification",
      icon: "https://c.animaapp.com/mft5gmofxQLTNf/img/icon-wrap-2.svg",
      isActive: false,
      iconType: "img",
      href: "/notification",
    },
    {
      id: "setting",
      label: "Setting",
      icon: "https://c.animaapp.com/mft5gmofxQLTNf/img/icon-wrap-1.svg",
      isActive: false,
      iconType: "img",
      href: "/setting",
    },
  ];

  const footerLinks = ["About", "Support", "Contact us", "Terms & Privacy"];

  return (
    <nav className="inline-flex flex-col items-center justify-between relative self-stretch flex-[0_0_auto] rounded-[15px]">
      <div className="inline-flex items-center gap-5 px-5 py-[30px] rounded-lg bg-[linear-gradient(0deg,rgba(224,224,224,0)_0%,rgba(224,224,224,0)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] flex-col relative flex-[0_0_auto]">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={`flex items-center gap-5 px-5 py-2.5 relative self-stretch w-full flex-[0_0_auto] h-auto ${
              item.isActive
                ? "rounded-[15px] bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]"
                : "rounded-[15px]"
            } hover:bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]`}
            asChild
          >
            <Link to={item.href}>
              <div className="flex flex-col w-[30px] h-[30px] items-center justify-center gap-2.5 relative">
                {item.iconType === "bg" ? (
                  <div className="relative w-[30px] h-[23px] bg-[url(https://c.animaapp.com/mft5gmofxQLTNf/img/eyes.svg)] bg-[100%_100%]" />
                ) : (
                  <img
                    className="relative w-[30px] h-[30px]"
                    alt="Icon wrap"
                    src={item.icon}
                  />
                )}
              </div>

              <div
                className={`relative w-fit [font-family:'Lato',Helvetica] ${
                  item.isActive ? "font-bold" : "font-normal"
                } text-dark-grey text-lg tracking-[0] leading-[27px] whitespace-nowrap`}
              >
                {item.label}
              </div>
            </Link>
          </Button>
        ))}
      </div>

      <div className="flex items-start self-stretch w-full flex-col relative flex-[0_0_auto]">
        <div className="flex flex-col items-start justify-end gap-2.5 px-0 py-5 relative self-stretch w-full flex-[0_0_auto]">
          <div className="inline-flex flex-col items-start gap-[5px] relative flex-[0_0_auto]">
            <img
              className="relative w-4 h-4"
              alt="Ic github"
              src="https://c.animaapp.com/mft8gpvyGX4EV6/img/ic-github.svg"
            />

            <div className="inline-flex items-end gap-[3px] relative flex-[0_0_auto]">
              <div className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-dark-grey text-sm tracking-[0] leading-3 whitespace-nowrap">
                Built on
              </div>

              <img
                className="relative w-[12.8px] h-3"
                alt="Ic fractopus"
                src="https://c.animaapp.com/mft8gpvyGX4EV6/img/ic-fractopus.svg"
              />
            </div>
          </div>

          <img
            className="relative self-stretch w-full flex-[0_0_auto]"
            alt="Social"
            src="https://c.animaapp.com/mft8gpvyGX4EV6/img/social.svg"
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
    </nav>
  );
};
