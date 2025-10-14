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
    href: "/discovery",
    isActive: true,
  },
  {
    icon: WalletIcon,
    label: "My treasury",
    href: "/treasury",
    isActive: false,
  },
  {
    icon: BellIcon,
    label: "Notification",
    href: "/notification",
    isActive: false,
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
      <nav className="inline-flex items-center gap-5 px-5 py-[30px] bg-[#ffffff] flex-col relative flex-[0_0_auto] rounded-lg">
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

          <div className="flex items-center gap-4 py-2">
            <a href="https://github.com/copus-io/copus-network" target="_blank" rel="noopener noreferrer" className="text-dark-grey hover:text-gray-900 transition-colors">
              <GithubIcon className="w-5 h-5" />
            </a>
            <a href="https://discord.gg/copus" target="_blank" rel="noopener noreferrer" className="text-dark-grey hover:text-gray-900 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0002 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-dark-grey hover:text-gray-900 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
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
                © 2025 S31 Labs
              </span>
            </div>
          </div>
        </footer>
      </div>
    </aside>
  );
};
