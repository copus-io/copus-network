import React from "react";

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  iconAlt: string;
  isActive: boolean;
  iconClassName?: string;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  alt: string;
}

interface FooterLink {
  id: string;
  label: string;
  url: string;
}

export const NavigationMenuSection = (): JSX.Element => {
  const navigationItems: NavigationItem[] = [
    {
      id: "discovery",
      label: "Discovery",
      icon: "https://c.animaapp.com/JscBe9bd/img/eyes.svg",
      iconAlt: "Discovery icon",
      isActive: false,
      iconClassName:
        "relative w-[30px] h-[23px] ml-[-2.00px] mr-[-2.00px] aspect-[1.3] bg-[url(https://c.animaapp.com/JscBe9bd/img/eyes.svg)] bg-[100%_100%]",
    },
    {
      id: "following",
      label: "Following",
      icon: "https://c.animaapp.com/JscBe9bd/img/follow-icon.svg",
      iconAlt: "Follow icon",
      isActive: false,
    },
    {
      id: "treasuries",
      label: "Treasuries",
      icon: "https://c.animaapp.com/JscBe9bd/img/icon-wrap.svg",
      iconAlt: "Icon wrap",
      isActive: false,
    },
    {
      id: "income",
      label: "Income",
      icon: "https://c.animaapp.com/JscBe9bd/img/vector-1.svg",
      iconAlt: "Vector",
      isActive: true,
    },
  ];

  const socialLinks: SocialLink[] = [
    {
      id: "github",
      platform: "GitHub",
      url: "#",
      icon: "https://c.animaapp.com/JscBe9bd/img/ic-github.svg",
      alt: "Ic github",
    },
  ];

  const footerLinks: FooterLink[] = [
    { id: "about", label: "About", url: "#" },
    { id: "support", label: "Support", url: "#" },
    { id: "contact", label: "Contact us", url: "#" },
    { id: "terms", label: "Terms & Privacy", url: "#" },
  ];

  return (
    <nav
      className="inline-flex flex-col items-center justify-between relative self-stretch flex-[0_0_auto] rounded-[15px]"
      aria-label="Main navigation"
    >
      <div className="inline-flex items-center gap-5 px-5 py-[30px] bg-[#ffffff] flex-col relative flex-[0_0_auto]">
        {navigationItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`flex items-center gap-5 px-5 py-2.5 relative self-stretch w-full flex-[0_0_auto] rounded-[15px] ${
              item.isActive
                ? "bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] bg-light-grey-transparent"
                : ""
            }`}
            aria-current={item.isActive ? "page" : undefined}
          >
            {item.id === "discovery" ? (
              <div className="flex flex-col w-[26px] h-[26px] items-center justify-center gap-2.5 relative aspect-[1]">
                <div
                  className={item.iconClassName}
                  role="img"
                  aria-label={item.iconAlt}
                />
              </div>
            ) : (
              <img
                className={`relative ${
                  item.id === "following"
                    ? "w-7 h-7 aspect-[1]"
                    : item.id === "treasuries"
                      ? "w-[30px] h-[30px]"
                      : "w-[26px] h-[26px] aspect-[1]"
                }`}
                alt={item.iconAlt}
                src={item.icon}
              />
            )}

            <span
              className={`relative w-fit ${
                item.id === "discovery" || item.id === "income"
                  ? "mt-[-1.00px]"
                  : item.id === "following"
                    ? "mt-[-0.50px]"
                    : ""
              } [font-family:'Lato',Helvetica] ${
                item.isActive ? "font-bold" : "font-normal"
              } text-dark-grey text-lg tracking-[0] leading-[27px] whitespace-nowrap`}
            >
              {item.label}
            </span>
          </a>
        ))}
      </div>

      <div className="flex items-start self-stretch w-full flex-col relative flex-[0_0_auto]">
        <div className="flex flex-col items-start justify-end gap-2.5 px-0 py-5 relative self-stretch w-full flex-[0_0_auto]">
          <div className="inline-flex flex-col items-start gap-[5px] relative flex-[0_0_auto]">
            {socialLinks.map((social) => (
              <a
                key={social.id}
                href={social.url}
                aria-label={`Visit our ${social.platform}`}
              >
                <img
                  className="relative w-4 h-4 aspect-[1]"
                  alt={social.alt}
                  src={social.icon}
                />
              </a>
            ))}

            <div className="inline-flex items-end gap-[3px] relative flex-[0_0_auto]">
              <p className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-dark-grey text-sm tracking-[0] leading-3 whitespace-nowrap">
                Built on
              </p>
            </div>
          </div>

          <img
            className="relative self-stretch w-full flex-[0_0_auto]"
            alt="Social"
            src="https://c.animaapp.com/JscBe9bd/img/social.svg"
          />
        </div>

        <footer className="flex flex-col items-start justify-center gap-2.5 pt-5 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto] bg-transparent">
          <div className="flex flex-col w-[126px] h-[137px] items-start gap-3">
            <p className="relative flex items-center justify-center self-stretch [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[25px]">
              <span className="[font-family:'Lato',Helvetica] font-normal text-[#686868] text-base tracking-[0] leading-[25px]">
                {footerLinks.map((link, index) => (
                  <React.Fragment key={link.id}>
                    •{" "}
                    <a href={link.url} className="hover:underline">
                      {link.label}
                    </a>
                    {index < footerLinks.length - 1 ? "  " : ""}
                  </React.Fragment>
                ))}
              </span>
            </p>

            <p className="relative flex items-center justify-center self-stretch [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[25px]">
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
