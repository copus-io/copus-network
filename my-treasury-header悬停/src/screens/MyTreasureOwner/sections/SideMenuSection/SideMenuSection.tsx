import React, { useState } from "react";

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  isActive?: boolean;
}

interface FooterLink {
  label: string;
  href: string;
}

export const SideMenuSection = (): JSX.Element => {
  const [activeMenuItem, setActiveMenuItem] = useState<string>("my-treasury");

  const menuItems: MenuItem[] = [
    {
      id: "discovery",
      label: "Discovery",
      icon: "https://c.animaapp.com/uJfL8gGM/img/eyes.svg",
      isActive: false,
    },
    {
      id: "my-treasury",
      label: "My treasury",
      icon: "https://c.animaapp.com/uJfL8gGM/img/icon-wrap.svg",
      isActive: true,
    },
    {
      id: "notification",
      label: "Notification",
      icon: "https://c.animaapp.com/uJfL8gGM/img/icon-wrap-1.svg",
      isActive: false,
    },
    {
      id: "setting",
      label: "Setting",
      icon: "https://c.animaapp.com/uJfL8gGM/img/icon-wrap-2.svg",
      isActive: false,
    },
  ];

  const footerLinks: FooterLink[] = [
    { label: "About", href: "#" },
    { label: "Support", href: "#" },
    { label: "Contact us", href: "#" },
    { label: "Terms & Privacy", href: "#" },
  ];

  const handleMenuItemClick = (itemId: string) => {
    setActiveMenuItem(itemId);
  };

  return (
    <nav
      className="inline-flex flex-col items-center justify-between relative h-full flex-[0_0_auto] rounded-[15px]"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="inline-flex items-center gap-5 px-5 py-[30px] bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] flex-col relative flex-[0_0_auto]">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleMenuItemClick(item.id)}
            className={`flex items-center gap-5 px-5 py-2.5 relative self-stretch w-full flex-[0_0_auto] rounded-[15px] transition-colors duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              activeMenuItem === item.id
                ? "bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] bg-light-grey-transparent"
                : ""
            }`}
            aria-current={activeMenuItem === item.id ? "page" : undefined}
          >
            {item.id === "discovery" ? (
              <div className="flex flex-col w-[30px] h-[30px] items-center justify-center gap-2.5 relative">
                <div
                  className="relative w-[30px] h-[23px] aspect-[1.3] bg-[url(https://c.animaapp.com/uJfL8gGM/img/eyes.svg)] bg-[100%_100%]"
                  role="img"
                  aria-label="Discovery icon"
                />
              </div>
            ) : (
              <img
                className="relative w-[30px] h-[30px]"
                alt={`${item.label} icon`}
                src={item.icon}
              />
            )}

            <span
              className={`relative w-fit [font-family:'Lato',Helvetica] text-dark-grey text-lg tracking-[0] leading-[27px] whitespace-nowrap ${
                activeMenuItem === item.id ? "font-bold" : "font-normal"
              }`}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-start self-stretch w-full flex-col relative flex-1 bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
        <div className="flex flex-col items-start justify-end gap-2.5 px-0 py-5 relative self-stretch w-full flex-[0_0_auto]">
          <div className="inline-flex flex-col items-start gap-[5px] relative flex-[0_0_auto]">
            <img
              className="relative w-[14.47px] h-[14.08px] aspect-[1]"
              alt="GitHub icon"
              src="https://c.animaapp.com/uJfL8gGM/img/ic-github.svg"
            />

            <div className="inline-flex items-end gap-[3px] relative flex-[0_0_auto]">
              <span className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-dark-grey text-sm tracking-[0] leading-3 whitespace-nowrap">
                Built on
              </span>
            </div>
          </div>

          <img
            className="relative self-stretch w-full flex-[0_0_auto]"
            alt="Social media links"
            src="https://c.animaapp.com/uJfL8gGM/img/social.svg"
          />
        </div>

        <footer className="flex flex-col items-start justify-center gap-2.5 pt-5 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto] bg-transparent">
          <div className="flex flex-col items-start gap-3 relative self-stretch w-full">
            <nav aria-label="Footer navigation" className="relative self-stretch w-full">
              <div className="flex flex-col gap-1">
                {footerLinks.map((link) => (
                  <p key={link.label} className="relative [font-family:'Lato',Helvetica] font-normal text-[#686868] text-base tracking-[0] leading-[25px]">
                    • <a
                      href={link.href}
                      className="hover:underline focus:outline-none focus:underline"
                      tabIndex={0}
                    >
                      {link.label}
                    </a>
                  </p>
                ))}
              </div>
            </nav>

            <p className="relative self-stretch [font-family:'Lato',Helvetica] font-normal text-[#686868] text-base tracking-[0] leading-[25px]">
              © 2024 S31 Labs
            </p>
          </div>
        </footer>
      </div>
    </nav>
  );
};
