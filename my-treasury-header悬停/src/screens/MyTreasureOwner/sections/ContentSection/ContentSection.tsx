import React from "react";

export const ContentSection = (): JSX.Element => {
  const socialLinks = [
    {
      username: "@sophiawuuu",
      icon: "https://c.animaapp.com/uJfL8gGM/img/logo-wrap-2.svg",
    },
    {
      username: "@sophiawuuu",
      icon: "https://c.animaapp.com/uJfL8gGM/img/logo-wrap-2.svg",
    },
    {
      username: "@sophiawuuu",
      icon: "https://c.animaapp.com/uJfL8gGM/img/logo-wrap-2.svg",
    },
  ];

  const treasureCards = [
    {
      id: 1,
      category: "Art",
      categoryColor: "green",
      coverImage: "https://c.animaapp.com/uJfL8gGM/img/cover@2x.png",
      title: "Window Swap",
      description: '"Explore the world through window, what\'s inside?"',
      profileImage: "https://c.animaapp.com/uJfL8gGM/img/-profile-image@2x.png",
      userName: "User Name",
      date: "Nov 15, 2022",
      treasureCount: 999,
      viewCount: 999,
      treasureIcon: "https://c.animaapp.com/uJfL8gGM/img/treasure-icon.svg",
      viewIcon: "https://c.animaapp.com/uJfL8gGM/img/ic-view.svg",
      isHighlighted: false,
      hasLikes: true,
      likesIcon: "https://c.animaapp.com/uJfL8gGM/img/likes.svg",
    },
    {
      id: 2,
      category: "Life",
      categoryColor: "pink",
      coverImage: "https://c.animaapp.com/uJfL8gGM/img/cover-1@2x.png",
      title: "Window Swap",
      description: '"Explore the world through window, what\'s inside?"',
      profileImage:
        "https://c.animaapp.com/uJfL8gGM/img/-profile-image-1@2x.png",
      userName: "User Name",
      date: "Nov 15, 2022",
      treasureCount: 999,
      viewCount: 999,
      treasureIcon: "https://c.animaapp.com/uJfL8gGM/img/treasure-icon-1.svg",
      viewIcon: "https://c.animaapp.com/uJfL8gGM/img/ic-view-1.svg",
      isHighlighted: false,
      hasLikes: true,
      likesIcon: "https://c.animaapp.com/uJfL8gGM/img/likes.svg",
    },
  ];

  return (
    <div className="flex flex-col items-start gap-[30px] pl-[60px] pr-10 pt-0 pb-[30px] relative flex-1 grow h-full overflow-y-auto">
      <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
        <div className="relative self-stretch w-full h-[200px] rounded-lg bg-[url(https://c.animaapp.com/uJfL8gGM/img/banner.png)] bg-cover bg-[50%_50%]" />

        <div className="gap-10 pl-5 pr-10 py-0 mt-[-46px] flex items-start relative self-stretch w-full flex-[0_0_auto]">
          <div className="w-[100px] h-[100px] rounded-[60px] border-2 border-solid border-white bg-[url(https://c.animaapp.com/uJfL8gGM/img/profile-1@2x.png)] bg-cover bg-[50%_50%] relative aspect-[1]" />

          <div className="flex flex-col items-start gap-5 pt-[60px] pb-0 px-0 relative flex-1 grow">
            <div className="inline-flex flex-col items-start justify-center relative flex-[0_0_auto]">
              <div className="inline-flex items-center gap-[15px] relative flex-[0_0_auto]">
                <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-medium text-off-black text-3xl tracking-[0] leading-[42.0px] whitespace-nowrap">
                  Sophiaaaaa
                </div>

                <img
                  className="relative flex-[0_0_auto] mr-[-0.39px]"
                  alt="Share"
                  src="https://c.animaapp.com/uJfL8gGM/img/share.svg"
                />
              </div>

              <div className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-off-black text-lg tracking-[0] leading-[25.2px] whitespace-nowrap">
                @nan09
              </div>
            </div>

            <div className="flex-col gap-[15px] flex items-start relative self-stretch w-full flex-[0_0_auto]">
              <div className="flex items-center gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
                <p className="relative w-fit mt-[-1.00px] font-p-l font-[number:var(--p-l-font-weight)] text-off-black text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
                  Hello, welcome to my creativce space. Design, travel, and
                  everyday life.
                </p>
              </div>

              <div className="inline-flex items-center gap-[30px] relative flex-[0_0_auto]">
                {socialLinks.map((link, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center justify-center gap-2.5 relative flex-[0_0_auto]"
                  >
                    <div className="gap-[5px] inline-flex items-center relative flex-[0_0_auto]">
                      <img
                        className="relative flex-[0_0_auto]"
                        alt="Logo wrap"
                        src={link.icon}
                      />

                      <div className="relative w-fit mt-[-1.00px] font-p-l font-[number:var(--p-l-font-weight)] text-medium-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
                        {link.username}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-start gap-[30px] relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-[#E0E0E0]">
          <div className="flex flex-col gap-2.5 flex-1 grow items-center relative">
            <div className="flex items-center justify-center px-[15px] py-2.5 relative self-stretch w-full flex-[0_0_auto]">
              <div className="relative w-fit mt-[-1.00px] font-p-l font-[number:var(--p-l-font-weight)] text-dark-grey text-[length:var(--p-l-font-size)] text-center tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
                My treasury collection
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2.5 relative flex-1 grow">
            <div className="inline-flex justify-center px-[15px] py-2.5 flex-[0_0_auto] border-b [border-bottom-style:solid] border-dark-grey items-center relative">
              <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-dark-grey text-lg text-center tracking-[0] leading-[25.2px] whitespace-nowrap">
                My share
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-20 relative self-stretch w-full flex-[0_0_auto]">
          {treasureCards.map((card) => (
            <div
              key={card.id}
              className="flex flex-col items-start justify-center gap-10 pt-0 pb-5 px-0 relative flex-1 grow rounded-[0px_0px_25px_25px] group cursor-pointer"
            >
              <div className="flex flex-col items-start gap-[25px] px-[30px] py-5 relative self-stretch w-full flex-[0_0_auto] rounded-lg bg-white group-hover:shadow-[1px_1px_10px_#c5c5c5] group-hover:bg-[linear-gradient(0deg,rgba(224,224,224,0.25)_0%,rgba(224,224,224,0.25)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] transition-all duration-200">
                <div className="flex flex-col items-start justify-center gap-5 relative self-stretch w-full flex-[0_0_auto] rounded-[100px]">
                  <div
                    className={`flex flex-col h-60 items-start justify-between p-[15px] relative self-stretch w-full bg-[url(${card.coverImage})] bg-cover bg-[50%_50%]`}
                  >
                    <div
                      className={`inline-flex items-center gap-[5px] px-2.5 py-2 relative flex-[0_0_auto] rounded-[50px] border border-solid ${
                        card.categoryColor === "green"
                          ? "border-green bg-[linear-gradient(0deg,rgba(43,134,73,0.2)_0%,rgba(43,134,73,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]"
                          : "border-pink bg-[linear-gradient(0deg,rgba(234,125,183,0.2)_0%,rgba(234,125,183,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]"
                      }`}
                    >
                      <div
                        className={`relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-sm tracking-[0] leading-[14px] whitespace-nowrap ${
                          card.categoryColor === "green"
                            ? "text-green"
                            : "text-pink"
                        }`}
                      >
                        {card.category}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2.5 self-stretch w-full relative flex-[0_0_auto]">
                      <div className="inline-flex items-start gap-[5px] px-2.5 py-[5px] bg-[#ffffffcc] rounded-[15px] overflow-hidden relative flex-[0_0_auto]">
                        <div
                          className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] text-blue text-sm text-right tracking-[0] leading-[18.2px] whitespace-nowrap font-medium group-hover:font-bold transition-all duration-200"
                        >
                          productdesign.com
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-[15px] relative self-stretch w-full flex-[0_0_auto]">
                    <div className="relative self-stretch mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-dark-grey text-2xl tracking-[0] leading-9">
                      {card.title}
                    </div>

                    <div className="flex flex-col items-start gap-[15px] px-2.5 py-[15px] relative self-stretch w-full flex-[0_0_auto] rounded-lg bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] group-hover:bg-[linear-gradient(0deg,rgba(224,224,224,0.45)_0%,rgba(224,224,224,0.45)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] transition-all duration-200">
                      <p className="relative self-stretch mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-dark-grey text-lg tracking-[0] leading-[27px]">
                        {card.description}
                      </p>

                      <div className="flex items-start justify-between relative self-stretch w-full flex-[0_0_auto]">
                        <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]">
                          <img
                            className="w-[18px] h-[18px] object-cover relative aspect-[1]"
                            alt="Profile image"
                            src={card.profileImage}
                          />

                          <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-medium-dark-grey text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                            {card.userName}
                          </div>
                        </div>

                        <div className="inline-flex h-[25px] items-center gap-5 relative flex-[0_0_auto]">
                          <div className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[23px] whitespace-nowrap">
                            {card.date}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  className={`all-[unset] box-border flex items-center relative self-stretch w-full flex-[0_0_auto] ${
                    card.hasLikes ? "justify-between" : ""
                  }`}
                >
                  <div className="inline-flex items-center gap-5 relative flex-[0_0_auto]">
                    <div className="inline-flex items-center gap-2 relative flex-[0_0_auto]">
                      <img
                        className="relative w-[13px] h-5 aspect-[0.65]"
                        alt="Treasure icon"
                        src={card.treasureIcon}
                      />

                      <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-dark-grey text-base text-center tracking-[0] leading-[20.8px] whitespace-nowrap">
                        {card.treasureCount}
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-2 relative flex-[0_0_auto]">
                      <img
                        className={`relative w-5 h-3.5 ${card.isHighlighted ? "aspect-[1.4]" : "aspect-[1.43]"}`}
                        alt="Ic view"
                        src={card.viewIcon}
                      />

                      <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-dark-grey text-base text-center tracking-[0] leading-[20.8px] whitespace-nowrap">
                        {card.viewCount}
                      </div>
                    </div>
                  </div>

                  {card.hasLikes && (
                    <img
                      className="relative flex-[0_0_auto] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      alt="Likes"
                      src={card.likesIcon}
                    />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
