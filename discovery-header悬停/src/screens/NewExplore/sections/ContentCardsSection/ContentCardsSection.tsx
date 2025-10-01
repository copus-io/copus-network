import React from "react";

interface ContentCard {
  id: number;
  title: string;
  description: string;
  category: string;
  categoryColor: string;
  categoryBg: string;
  coverImage: string;
  domain: string;
  userName: string;
  userImage: string;
  date: string;
  treasureCount: number;
  viewCount: number;
  treasureIcon: string;
  viewIcon: string;
  branchIcon: string;
  isHighlighted?: boolean;
}

const contentCards: ContentCard[] = [
  {
    id: 1,
    title: "Window Swap",
    description: "Explore the world through window, what's inside?",
    category: "Art",
    categoryColor: "text-green",
    categoryBg:
      "border-green bg-[linear-gradient(0deg,rgba(43,134,73,0.2)_0%,rgba(43,134,73,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    coverImage: "https://c.animaapp.com/1aPszOHA/img/cover-2@2x.png",
    domain: "productdesign.com",
    userName: "User Name",
    userImage: "https://c.animaapp.com/1aPszOHA/img/-profile-image@2x.png",
    date: "Nov 15, 2022",
    treasureCount: 999,
    viewCount: 999,
    treasureIcon: "https://c.animaapp.com/1aPszOHA/img/treasure-icon.svg",
    viewIcon: "https://c.animaapp.com/1aPszOHA/img/ic-view.svg",
    branchIcon: "https://c.animaapp.com/1aPszOHA/img/branch-it.svg",
  },
  {
    id: 2,
    title: "Window Swap",
    description: "Explore the world through window, what's inside?",
    category: "Sports",
    categoryColor: "text-blue",
    categoryBg:
      "border-blue bg-[linear-gradient(0deg,rgba(33,145,251,0.2)_0%,rgba(33,145,251,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    coverImage: "https://c.animaapp.com/1aPszOHA/img/cover-1@2x.png",
    domain: "productdesign.com",
    userName: "User Name",
    userImage: "https://c.animaapp.com/1aPszOHA/img/-profile-image-1@2x.png",
    date: "Nov 15, 2022",
    treasureCount: 999,
    viewCount: 999,
    treasureIcon: "https://c.animaapp.com/1aPszOHA/img/treasure-icon.svg",
    viewIcon: "https://c.animaapp.com/1aPszOHA/img/ic-view.svg",
    branchIcon: "https://c.animaapp.com/1aPszOHA/img/branch-it.svg",
  },
  {
    id: 3,
    title: "Window Swap",
    description: "Explore the world through window, what's inside?",
    category: "Technology",
    categoryColor: "text-green",
    categoryBg:
      "border-green shadow-pop-up bg-[linear-gradient(0deg,rgba(43,134,73,0.2)_0%,rgba(43,134,73,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    coverImage: "https://c.animaapp.com/1aPszOHA/img/cover-2@2x.png",
    domain: "productdesign.com",
    userName: "User Name",
    userImage: "https://c.animaapp.com/1aPszOHA/img/-profile-image-2@2x.png",
    date: "Nov 15, 2022",
    treasureCount: 999,
    viewCount: 999,
    treasureIcon: "/img/treasure-icon-2.png",
    viewIcon: "/img/image.png",
    branchIcon: "/img/branch-it-2.png",
    isHighlighted: true,
  },
  {
    id: 4,
    title: "Window Swap",
    description: "Explore the world through window, what's inside?",
    category: "Life",
    categoryColor: "text-pink",
    categoryBg:
      "border-pink bg-[linear-gradient(0deg,rgba(234,125,183,0.2)_0%,rgba(234,125,183,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    coverImage: "https://c.animaapp.com/1aPszOHA/img/cover-3@2x.png",
    domain: "productdesign.com",
    userName: "User Name",
    userImage: "https://c.animaapp.com/1aPszOHA/img/-profile-image-3@2x.png",
    date: "Nov 15, 2022",
    treasureCount: 999,
    viewCount: 999,
    treasureIcon: "https://c.animaapp.com/1aPszOHA/img/treasure-icon-1.svg",
    viewIcon: "https://c.animaapp.com/1aPszOHA/img/ic-view-1.svg",
    branchIcon: "https://c.animaapp.com/1aPszOHA/img/branch-it-1.svg",
  },
  {
    id: 5,
    title: "Window Swap",
    description: "Explore the world through window, what's inside?",
    category: "Technology",
    categoryColor: "text-yellow",
    categoryBg:
      "border-yellow bg-[linear-gradient(0deg,rgba(201,139,20,0.2)_0%,rgba(201,139,20,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    coverImage: "https://c.animaapp.com/1aPszOHA/img/cover-4@2x.png",
    domain: "productdesign.com",
    userName: "User Name",
    userImage: "https://c.animaapp.com/1aPszOHA/img/-profile-image-4@2x.png",
    date: "Nov 15, 2022",
    treasureCount: 999,
    viewCount: 999,
    treasureIcon: "/img/treasure-icon-3.png",
    viewIcon: "/img/ic-view-2.png",
    branchIcon: "/img/branch-it-3.png",
  },
];

const ContentCardComponent: React.FC<{ card: ContentCard }> = ({ card }) => {
  return (
    <article
      className={`flex flex-col items-start gap-[25px] px-[30px] py-5 relative self-stretch w-full flex-[0_0_auto] bg-white rounded-lg ${card.isHighlighted ? "border border-solid border-light-grey" : ""}`}
    >
      <div className="flex flex-col items-start justify-center gap-5 relative self-stretch w-full flex-[0_0_auto] rounded-[100px]">
        <div
          className={`bg-[url(${card.coverImage})] flex flex-col h-60 items-start justify-between p-[15px] relative self-stretch w-full bg-cover bg-[50%_50%] ${card.id === 5 ? "rounded-lg shadow-[0px_4px_4px_#00000040]" : ""}`}
        >
          <div
            className={`px-2.5 py-2 ${card.categoryBg} inline-flex items-center gap-[5px] relative flex-[0_0_auto] rounded-[50px] border border-solid`}
          >
            <div
              className={`[font-family:'${card.category === "Technology" && (card.id === 3 || card.id === 5) ? "Maven_Pro" : "Lato"}',Helvetica] ${card.categoryColor} relative w-fit mt-[-1.00px] font-semibold text-sm tracking-[0] leading-[14px] whitespace-nowrap`}
            >
              {card.category}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2.5 self-stretch w-full relative flex-[0_0_auto]">
            <div
              className={`inline-flex items-start gap-[5px] px-2.5 py-[5px] bg-[#ffffffcc] rounded-[15px] overflow-hidden relative flex-[0_0_auto] ${card.isHighlighted ? "shadow-[1px_1px_8px_#505050cc] backdrop-blur-[2px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(2px)_brightness(100%)]" : ""}`}
            >
              <div
                className={`${card.id === 2 || card.id === 4 || card.id === 5 ? "font-bold" : "font-medium"} relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] text-blue text-sm text-right tracking-[0] leading-[18.2px] whitespace-nowrap`}
              >
                {card.domain}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-[15px] relative self-stretch w-full flex-[0_0_auto]">
          <h2 className="relative self-stretch mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-dark-grey text-2xl tracking-[0] leading-9">
            {card.title}
          </h2>

          <div
            className={`flex-col px-2.5 py-[15px] rounded-lg ${card.isHighlighted ? "bg-[linear-gradient(0deg,rgba(224,224,224,0.3)_0%,rgba(224,224,224,0.3)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]" : "bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]"} flex items-start gap-[15px] relative self-stretch w-full flex-[0_0_auto]`}
          >
            <p className="relative self-stretch mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-dark-grey text-lg tracking-[0] leading-[27px]">
              &quot;{card.description}&quot;
            </p>

            <div className="flex items-start justify-between relative self-stretch w-full flex-[0_0_auto]">
              <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]">
                <img
                  className="w-[18px] h-[18px] object-cover relative aspect-[1]"
                  alt="Profile image"
                  src={card.userImage}
                />

                <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-medium-dark-grey text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                  {card.userName}
                </div>
              </div>

              <div className="inline-flex h-[25px] items-center gap-5 relative flex-[0_0_auto]">
                <time className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[23px] whitespace-nowrap">
                  {card.date}
                </time>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        className="all-[unset] box-border flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]"
        aria-label={`Interact with ${card.title} post`}
      >
        <div
          className={`inline-flex items-center gap-${card.id === 1 || card.id === 4 ? "5" : "[25px]"} relative flex-[0_0_auto]`}
        >
          <div className="inline-flex items-center gap-2 relative flex-[0_0_auto]">
            <img
              className="relative w-[13px] h-5 aspect-[0.65]"
              alt="Treasure icon"
              src={card.treasureIcon}
            />

            <span className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-dark-grey text-base text-center tracking-[0] leading-[20.8px] whitespace-nowrap">
              {card.treasureCount}
            </span>
          </div>

          <div className="inline-flex items-center gap-2 relative flex-[0_0_auto]">
            <img
              className="relative w-5 h-3.5 aspect-[1.43]"
              alt="View icon"
              src={card.viewIcon}
            />

            <span className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-dark-grey text-base text-center tracking-[0] leading-[20.8px] whitespace-nowrap">
              {card.viewCount}
            </span>
          </div>
        </div>

        <img
          className="relative flex-[0_0_auto] mr-[-0.61px]"
          alt="Branch it"
          src={card.branchIcon}
        />
      </button>
    </article>
  );
};

export const ContentCardsSection = (): JSX.Element => {
  const leftCard = contentCards.slice(0, 1);
  const rightCard = contentCards.slice(1, 2);

  return (
    <main className="flex flex-col items-start gap-10 pl-[60px] pr-10 py-0 relative flex-1 self-stretch grow">
      <section className="pl-[30px] pr-0 py-[30px] rounded-[0px_8px_8px_0px] border-l-[3px] [border-left-style:solid] border-red shadow-pop-up bg-[linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] flex items-start gap-[15px] relative self-stretch w-full flex-[0_0_auto]">
        <div className="inline-flex flex-col items-start gap-[15px] relative flex-[0_0_auto]">
          <h1 className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-dark-grey text-2xl tracking-[0] leading-9 whitespace-nowrap">
            Welcome to Copus
          </h1>

          <div className="w-[736px] h-[120px] flex flex-col items-start gap-3">
            <p className="text-dark-grey text-lg leading-[27px] relative self-stretch [font-family:'Lato',Helvetica] font-normal tracking-[0]">
              <span className="[font-family:'Lato',Helvetica] font-normal text-[#454545] text-lg tracking-[0] leading-[27px]">
                Discover high-quality content recommended by real users. Here,
                there are no algorithmic recommendations, only knowledge sharing
                between people.
              </span>
            </p>

            <p className="text-dark-grey text-lg leading-[27px] relative self-stretch [font-family:'Lato',Helvetica] font-normal tracking-[0]">
              <span className="[font-family:'Lato',Helvetica] font-normal text-[#454545] text-lg tracking-[0] leading-[27px]">
                Start exploring content that interests you, or click the +
                button in the lower right corner to share your treasured finds.
              </span>
            </p>
          </div>
        </div>

        <div className="absolute bottom-2 right-2 w-[180px] h-[180px] z-10">
          <img
            className="w-full h-full object-contain object-right-bottom"
            alt="Red Octopus"
            src="https://c.animaapp.com/1aPszOHA/img/mask-group.png"
          />
        </div>
      </section>

      <section className="flex items-start gap-[60px] pt-0 pb-[30px] px-0 relative flex-1 self-stretch w-full grow">
        <div className="flex flex-col items-start justify-center gap-10 pt-0 pb-5 px-0 relative flex-1 grow">
          {leftCard.map((card) => (
            <ContentCardComponent key={card.id} card={card} />
          ))}
        </div>

        <div className="flex flex-col items-start justify-center gap-10 pt-0 pb-5 px-0 relative flex-1 grow">
          {rightCard.map((card) => (
            <ContentCardComponent key={card.id} card={card} />
          ))}
        </div>
      </section>
    </main>
  );
};
