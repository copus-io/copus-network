import React, { useState } from "react";

export const ProfileContentSection = (): JSX.Element => {
  const [notifications, setNotifications] = useState({
    treasureCollection: true,
    systemNotification: true,
    emailNotification: true,
  });

  const socialLinks = [
    { platform: "X", handle: "@sophiawuuu" },
    { platform: "X", handle: "@sophiawuuu" },
    { platform: "X", handle: "@sophiawuuu" },
  ];

  const notificationSettings = [
    {
      id: "treasureCollection",
      label: "Show new treasure collection",
      enabled: notifications.treasureCollection,
    },
    {
      id: "systemNotification",
      label: "Show system notification",
      enabled: notifications.systemNotification,
    },
    {
      id: "emailNotification",
      label: "Show email notification",
      enabled: notifications.emailNotification,
    },
  ];

  const handleNotificationToggle = (id: string) => {
    setNotifications((prev) => ({
      ...prev,
      [id]: !prev[id as keyof typeof prev],
    }));
  };

  return (
    <main className="flex flex-col items-start gap-[30px] pl-[60px] pr-10 pt-0 pb-[30px] relative flex-1 self-stretch grow bg-transparent">
      <section className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
        <div
          className="relative self-stretch w-full h-40 rounded-lg bg-[url(https://c.animaapp.com/w7obk4mX/img/banner.png)] bg-cover bg-[50%_50%]"
          role="img"
          aria-label="Profile banner"
        />

        <div className="gap-10 pl-5 pr-10 py-0 mt-[-46px] flex items-start relative self-stretch w-full flex-[0_0_auto]">
          <div
            className="w-[100px] h-[100px] rounded-[60px] border-2 border-solid border-white bg-[url(https://c.animaapp.com/w7obk4mX/img/profile@2x.png)] bg-cover bg-[50%_50%] relative aspect-[1]"
            role="img"
            aria-label="Profile picture"
          />

          <div className="flex flex-col items-start gap-5 pt-[60px] pb-0 px-0 relative flex-1 grow">
            <header className="h-[60px] inline-flex flex-col items-start justify-center relative">
              <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto] mt-[-3.50px]">
                <h1 className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-off-black text-3xl tracking-[0] leading-[42.0px] whitespace-nowrap">
                  Sophiaaaaa
                </h1>

                <button
                  className="relative w-4 h-5 aspect-[0.8] cursor-pointer"
                  aria-label="Edit profile name"
                >
                  <img
                    alt="Edit"
                    src="https://c.animaapp.com/w7obk4mX/img/edit-1.svg"
                  />
                </button>
              </div>

              <div className="relative w-fit mb-[-2.50px] [font-family:'Lato',Helvetica] font-normal text-off-black text-lg tracking-[0] leading-[25.2px] whitespace-nowrap">
                @nan09
              </div>
            </header>

            <div className="flex-col gap-2.5 flex items-start relative self-stretch w-full flex-[0_0_auto]">
              <div className="flex items-center gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
                <p className="relative w-fit mt-[-1.00px] font-p-l font-[number:var(--p-l-font-weight)] text-off-black text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
                  Hello, welcome to my creativce space. Design, travel, and
                  everyday life.
                </p>
              </div>

              <div className="inline-flex items-center gap-[25px] relative flex-[0_0_auto]">
                {socialLinks.map((link, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center justify-center gap-2.5 relative flex-[0_0_auto]"
                  >
                    <img
                      className="relative flex-[0_0_auto]"
                      alt={`${link.platform} logo`}
                      src="https://c.animaapp.com/w7obk4mX/img/logo-wrap-2.svg"
                    />

                    <div className="relative w-fit mt-[-1.00px] font-p-l font-[number:var(--p-l-font-weight)] text-medium-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
                      {link.handle}
                    </div>
                  </div>
                ))}

                <button
                  className="relative w-4 h-5 aspect-[0.8] cursor-pointer"
                  aria-label="Edit social links"
                >
                  <img
                    alt="Edit"
                    src="https://c.animaapp.com/w7obk4mX/img/edit-1.svg"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col items-start gap-5 pt-5 pb-[30px] px-0 relative self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-light-grey">
        <div className="pt-0 pb-2.5 px-0 flex-[0_0_auto] inline-flex flex-col items-start justify-center relative">
          <h2 className="relative w-fit mt-[-1.00px] font-h-3 font-[number:var(--h-3-font-weight)] text-off-black text-[length:var(--h-3-font-size)] tracking-[var(--h-3-letter-spacing)] leading-[var(--h-3-line-height)] whitespace-nowrap [font-style:var(--h-3-font-style)]">
            Account
          </h2>
        </div>

        <div className="inline-flex flex-col items-start justify-center gap-[15px] relative flex-[0_0_auto]">
          <div className="inline-flex items-center justify-end gap-0.5 relative flex-[0_0_auto]">
            <h3 className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-dark-grey text-xl tracking-[0] leading-[23px] whitespace-nowrap">
              Wallet address
            </h3>
          </div>

          <div className="relative w-fit font-p-l font-[number:var(--p-l-font-weight)] text-medium-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
            XXXXXXXXXXXXXXX
          </div>
        </div>
      </section>

      <section className="flex flex-col items-start gap-5 relative self-stretch w-full flex-[0_0_auto]">
        <div className="pt-0 pb-2.5 px-0 flex-[0_0_auto] inline-flex flex-col items-start justify-center relative">
          <h2 className="relative w-fit mt-[-1.00px] font-h-3 font-[number:var(--h-3-font-weight)] text-off-black text-[length:var(--h-3-font-size)] tracking-[var(--h-3-letter-spacing)] leading-[var(--h-3-line-height)] whitespace-nowrap [font-style:var(--h-3-font-style)]">
            Notification
          </h2>
        </div>

        <div className="flex flex-col items-start gap-5 pt-0 pb-[25px] px-0 relative self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-light-grey">
          {notificationSettings.map((setting) => (
            <div
              key={setting.id}
              className="inline-flex items-center gap-[15px] relative flex-[0_0_auto] rounded-[100px]"
            >
              <button
                className="relative w-[26px] h-[16.42px] bg-[#f23a00] rounded-[50px] aspect-[1.58] cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f23a00] flex items-center justify-start"
                onClick={() => handleNotificationToggle(setting.id)}
                role="switch"
                aria-checked={setting.enabled}
                aria-label={`Toggle ${setting.label}`}
              >
                <div className="w-3 h-3 bg-white rounded-full ml-0.5" />
              </button>

              <div className="inline-flex flex-col items-start justify-center gap-[5px] relative flex-[0_0_auto]">
                <label className="relative w-fit mt-[-1.00px] font-p-lato font-[number:var(--p-lato-font-weight)] text-off-black text-[length:var(--p-lato-font-size)] tracking-[var(--p-lato-letter-spacing)] leading-[var(--p-lato-line-height)] whitespace-nowrap [font-style:var(--p-lato-font-style)] cursor-pointer">
                  {setting.label}
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="inline-flex flex-col items-start gap-5 relative flex-[0_0_auto]">
        <button className="inline-flex items-center justify-center gap-2.5 relative flex-[0_0_auto] cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red">
          <span className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-red text-lg tracking-[0] leading-[23px] whitespace-nowrap">
            Delete account
          </span>
        </button>

        <button className="inline-flex items-center justify-center gap-2.5 relative flex-[0_0_auto] cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red">
          <span className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-red text-lg tracking-[0] leading-[23px] whitespace-nowrap">
            Log out
          </span>
        </button>
      </section>
    </main>
  );
};
