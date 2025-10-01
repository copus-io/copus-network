import React from "react";
import { Link } from "react-router-dom";

const menuItems = [
  {
    id: "discovery",
    label: "Discovery",
    icon: "https://c.animaapp.com/w7obk4mX/img/eyes.svg",
    isActive: false,
    href: null,
    iconType: "bg",
  },
  {
    id: "treasury",
    label: "My treasury",
    icon: "https://c.animaapp.com/w7obk4mX/img/icon-wrap.svg",
    isActive: false,
    href: null,
    iconType: "img",
  },
  {
    id: "notification",
    label: "Notification",
    icon: "https://c.animaapp.com/w7obk4mX/img/icon-wrap-1.svg",
    isActive: false,
    href: null,
    iconType: "img",
  },
  {
    id: "setting",
    label: "Setting",
    icon: "https://c.animaapp.com/w7obk4mX/img/icon-wrap-2.svg",
    isActive: true,
    href: "/settingu45wallet",
    iconType: "img",
  },
];

const footerLinks = [
  { label: "About", href: "#" },
  { label: "Support", href: "#" },
  { label: "Contact us", href: "#" },
  { label: "Terms & Privacy", href: "#" },
];

export const SideMenuSection = (): JSX.Element => {
  return (
    <div className="flex flex-col w-[240px] mr-[60px] gap-5">
      {/* White navigation menu */}
      <nav
        className="flex flex-col bg-white rounded-[15px] px-5 py-[30px]"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex flex-col gap-5">
          {menuItems.map((item) => {
            const baseClasses =
              "flex items-center gap-5 px-5 py-2.5 relative w-full rounded-[15px]";
            const activeClasses = item.isActive
              ? "bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]"
              : "";

            const content = (
              <>
                <div className="flex flex-col w-[30px] h-[30px] items-center justify-center gap-2.5 relative">
                  {item.iconType === "bg" ? (
                    <div className="relative w-[30px] h-[23px] aspect-[1.3] bg-[url(https://c.animaapp.com/w7obk4mX/img/eyes.svg)] bg-[100%_100%]" />
                  ) : (
                    <img
                      className="relative w-[30px] h-[30px]"
                      alt={`${item.label} icon`}
                      src={item.icon}
                    />
                  )}
                </div>
                <div
                  className={`relative w-fit [font-family:'Lato',Helvetica] ${item.isActive ? "font-bold" : "font-normal"} text-dark-grey text-lg tracking-[0] leading-[27px] whitespace-nowrap`}
                >
                  {item.label}
                </div>
              </>
            );

            if (item.href) {
              return (
                <Link
                  key={item.id}
                  className={`${baseClasses} ${activeClasses}`}
                  to={item.href}
                  aria-current={item.isActive ? "page" : undefined}
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={item.id}
                className={`${baseClasses} ${activeClasses}`}
                type="button"
                aria-pressed={item.isActive}
              >
                {content}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer section outside white box */}
      <div className="flex flex-col gap-5 px-5">
        <div className="flex flex-col items-start gap-[5px]">
          <img
            className="relative w-[14.47px] h-[14.08px]"
            alt="GitHub icon"
            src="https://c.animaapp.com/w7obk4mX/img/ic-github.svg"
          />
          <div className="[font-family:'Lato',Helvetica] font-normal text-dark-grey text-sm tracking-[0] leading-3">
            Built on
          </div>
        </div>

        <img
          className="relative w-full"
          alt="Social media links"
          src="https://c.animaapp.com/w7obk4mX/img/social.svg"
        />

        <footer className="flex flex-col gap-3">
          <nav
            className="[font-family:'Lato',Helvetica] font-normal text-[#686868] text-base tracking-[0] leading-[25px]"
            role="navigation"
            aria-label="Footer navigation"
          >
            {footerLinks.map((link, index) => (
              <React.Fragment key={link.label}>
                •{" "}
                <a href={link.href} className="hover:underline">
                  {link.label}
                </a>
                {index < footerLinks.length - 1 ? "  " : ""}
              </React.Fragment>
            ))}
          </nav>

          <p className="[font-family:'Lato',Helvetica] font-normal text-[#686868] text-base tracking-[0] leading-[25px]">
            © 2024 S31 Labs
          </p>
        </footer>
      </div>
    </div>
  );
};
