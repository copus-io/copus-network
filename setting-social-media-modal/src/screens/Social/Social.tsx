import React, { useState } from "react";

interface SocialLink {
  id: string;
  name: string;
  placeholder: string;
  icon: string;
  value: string;
}

export const Social = (): JSX.Element => {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    {
      id: "instagram",
      name: "Instagram",
      placeholder: "https://instagram.com/username",
      icon: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png",
      value: "",
    },
    {
      id: "reddit",
      name: "Reddit",
      placeholder: "https://reddit.com/u/username",
      icon: "https://www.redditstatic.com/desktop2x/img/favicon/android-icon-192x192.png",
      value: "",
    },
    {
      id: "twitter",
      name: "Twitter",
      placeholder: "https://twitter.com/sophiaaaa",
      icon: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg",
      value: "https://twitter.com/sophiaaaa",
    },
    {
      id: "discord",
      name: "Discord",
      placeholder: "https://discord.gg/username",
      icon: "https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/636e0a6918e57475a843dcf5_icon_clyde_white_RGB.svg",
      value: "",
    },
  ]);

  const handleInputChange = (id: string, value: string) => {
    setSocialLinks((prev) =>
      prev.map((link) => (link.id === id ? { ...link, value } : link)),
    );
  };

  const handleSave = () => {
    console.log("Saving social links:", socialLinks);
  };

  const handleCancel = () => {
    console.log("Cancelling changes");
  };

  return (
    <div
      className="flex flex-col w-[600px] items-center justify-center gap-5 p-[30px] relative bg-white rounded-[15px]"
      data-model-id="9080:54291"
      role="dialog"
      aria-labelledby="social-links-title"
    >
      <button
        className="relative self-stretch w-full flex-[0_0_auto] bg-transparent border-0 p-0 cursor-pointer"
        onClick={handleCancel}
        aria-label="Close dialog"
      >
        <img
          className="relative self-stretch w-full flex-[0_0_auto]"
          alt="Close"
          src="https://c.animaapp.com/lMY7Uldi/img/close.svg"
        />
      </button>

      <div className="flex flex-col items-start gap-5 relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex-col items-start flex gap-5 relative self-stretch w-full flex-[0_0_auto]">
          <div className="items-start flex relative self-stretch w-full flex-[0_0_auto]">
            <h2
              id="social-links-title"
              className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-dark-grey text-lg tracking-[0] leading-[normal]"
            >
              External Links
            </h2>
          </div>

          <div className="flex-col items-start flex gap-5 relative self-stretch w-full flex-[0_0_auto]">
            {socialLinks.map((link) => (
              <div
                key={link.id}
                className="flex flex-col items-start gap-5 px-5 py-[15px] relative self-stretch w-full flex-[0_0_auto] rounded-[15px] border border-solid border-[#E0E0E0]"
              >
                <div className="items-center flex relative self-stretch w-full flex-[0_0_auto]">
                  <label
                    htmlFor={`${link.id}-input`}
                    className="relative w-fit mt-[-1.00px] font-p font-[number:var(--p-font-weight)] text-dark-grey text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] whitespace-nowrap [font-style:var(--p-font-style)]"
                  >
                    {link.name}
                  </label>
                </div>

                <div className="items-center flex gap-5 relative self-stretch w-full flex-[0_0_auto]">
                  <img
                    className="relative w-[35px] h-[35px]"
                    alt={`${link.name} icon`}
                    src={link.icon}
                  />

                  {link.id === "twitter" ? (
                    <input
                      id={`${link.id}-input`}
                      className="px-2.5 py-[15px] overflow-hidden relative grow bg-monowhite rounded-lg border-2 border-solid border-light-grey shadow-inputs mt-[-2.00px] [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[20.8px] whitespace-nowrap"
                      placeholder={link.placeholder}
                      type="url"
                      value={link.value}
                      onChange={(e) =>
                        handleInputChange(link.id, e.target.value)
                      }
                      aria-describedby={`${link.id}-description`}
                    />
                  ) : (
                    <input
                      id={`${link.id}-input`}
                      className="px-2.5 py-[15px] overflow-hidden relative grow bg-monowhite rounded-lg border-2 border-solid border-light-grey shadow-inputs [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[20.8px] whitespace-nowrap"
                      placeholder={link.placeholder}
                      type="url"
                      value={link.value}
                      onChange={(e) =>
                        handleInputChange(link.id, e.target.value)
                      }
                      aria-describedby={`${link.id}-description`}
                    />
                  )}
                  <span id={`${link.id}-description`} className="sr-only">
                    Enter your {link.name} profile URL
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-5 pt-5 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto]">
          <button
            className="all-[unset] box-border inline-flex items-center justify-center gap-[30px] px-5 py-2.5 relative flex-[0_0_auto] rounded-[15px] cursor-pointer"
            onClick={handleCancel}
            type="button"
          >
            <div className="relative w-fit mt-[-2.00px] font-p-l font-[number:var(--p-l-font-weight)] text-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
              Cancel
            </div>
          </button>

          <button
            className="all-[unset] box-border inline-flex items-center justify-center gap-[15px] px-5 py-2.5 relative flex-[0_0_auto] bg-red rounded-[50px] cursor-pointer"
            onClick={handleSave}
            type="button"
          >
            <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-white text-lg tracking-[0] leading-[25.2px] whitespace-nowrap">
              Save
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
