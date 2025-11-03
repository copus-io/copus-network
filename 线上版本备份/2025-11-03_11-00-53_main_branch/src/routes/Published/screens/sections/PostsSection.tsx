import React from "react";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import { getCategoryInlineStyle } from "../../../../utils/categoryStyles";

const postsData = [
  {
    id: 1,
    category: "Art",
    categoryColor:
      "border-[#2b8649] bg-[linear-gradient(0deg,rgba(43,134,73,0.2)_0%,rgba(43,134,73,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] text-green",
    coverImage: "https://c.animaapp.com/mfvxfxl8h2iGNO/img/cover.png",
    title: "AI Agents Problems No One Talks About",
    description: '"Explore the world through window, what\'s inside?"',
    author: "User Name",
    date: "Nov 15, 2022",
    treasureCount: "999",
    visitCount: "999 Visits",
    profileImage:
      "https://c.animaapp.com/mfvxfxl8h2iGNO/img/-profile-image-4.png",
    websiteUrl: "productdesign.com",
    treasureIcon: "https://c.animaapp.com/mfvxfxl8h2iGNO/img/treasure-icon.svg",
    viewIcon: "https://c.animaapp.com/mfvxfxl8h2iGNO/img/ic-view.svg",
    branchIcon: "https://c.animaapp.com/mfvxfxl8h2iGNO/img/branch-it.svg",
  },
  {
    id: 2,
    category: "Sports",
    categoryColor:
      "border-[#2191fb] bg-[linear-gradient(0deg,rgba(33,145,251,0.3)_0%,rgba(33,145,251,0.3)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] text-blue",
    coverImage: "https://c.animaapp.com/mfvxfxl8h2iGNO/img/cover-1.png",
    title: "Window Swap",
    description: '"Explore the world through window, what\'s inside?"',
    author: "User Name",
    date: "Nov 15, 2022",
    treasureCount: "999",
    visitCount: "999访问",
    profileImage:
      "https://c.animaapp.com/mfvxfxl8h2iGNO/img/-profile-image-4.png",
    websiteUrl: "productdesign.com",
    treasureIcon: "https://c.animaapp.com/mfvxfxl8h2iGNO/img/treasure-icon.svg",
    viewIcon: "https://c.animaapp.com/mfvxfxl8h2iGNO/img/ic-view.svg",
    branchIcon: "https://c.animaapp.com/mfvxfxl8h2iGNO/img/branch-it.svg",
  },
  {
    id: 3,
    category: "Technology",
    categoryColor:
      "border-[#2b8649] shadow-pop-up bg-[linear-gradient(0deg,rgba(43,134,73,0.2)_0%,rgba(43,134,73,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] text-green",
    coverImage: "https://c.animaapp.com/mfvxfxl8h2iGNO/img/cover-2.png",
    title: "Window Swap",
    description: '"Explore the world through window, what\'s inside?"',
    author: "User Name",
    date: "Nov 15, 2022",
    treasureCount: "999",
    visitCount: "999访问",
    profileImage:
      "https://c.animaapp.com/mfvxfxl8h2iGNO/img/-profile-image-4.png",
    websiteUrl: "productdesign.com",
    treasureIcon: "https://c.animaapp.com/mfvxfxl8h2iGNO/img/treasure-icon.svg",
    viewIcon: "https://c.animaapp.com/mfvxfxl8h2iGNO/img/ic-view.svg",
    branchIcon: "https://c.animaapp.com/mfvxfxl8h2iGNO/img/branch-it.svg",
    fontFamily: "[font-family:'Lato',Helvetica]",
  },
  {
    id: 4,
    category: "Life",
    categoryColor:
      "border-[#ea7db7] bg-[linear-gradient(0deg,rgba(234,125,183,0.2)_0%,rgba(234,125,183,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] text-pink",
    coverImage: "https://c.animaapp.com/mfvxfxl8h2iGNO/img/cover-3.png",
    title: "Window Swap",
    description: '"Explore the world through window, what\'s inside?"',
    author: "User Name",
    date: "Nov 15, 2022",
    treasureCount: "999",
    visitCount: "999 Visits",
    profileImage:
      "https://c.animaapp.com/mfvxfxl8h2iGNO/img/-profile-image-4.png",
    websiteUrl: "productdesign.com",
    treasureIcon: "https://c.animaapp.com/mfvxfxl8h2iGNO/img/treasure-icon.svg",
    viewIcon: "https://c.animaapp.com/mfvxfxl8h2iGNO/img/ic-view.svg",
    branchIcon: "https://c.animaapp.com/mfvxfxl8h2iGNO/img/branch-it.svg",
  },
  {
    id: 5,
    category: "Technology",
    categoryColor:
      "border-[#e19e1d] bg-[linear-gradient(0deg,rgba(201,139,20,0.4)_0%,rgba(201,139,20,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] text-yellow",
    coverImage: "https://c.animaapp.com/mfvxfxl8h2iGNO/img/cover-4.png",
    title: "Window Swap",
    description: '"Explore the world through window, what\'s inside?"',
    author: "User Name",
    date: "Nov 15, 2022",
    treasureCount: "999",
    visitCount: "999访问",
    profileImage:
      "https://c.animaapp.com/mfvxfxl8h2iGNO/img/-profile-image-4.png",
    websiteUrl: "productdesign.com",
    treasureIcon: "https://c.animaapp.com/mfvxfxl8h2iGNO/img/treasure-icon.svg",
    viewIcon: "https://c.animaapp.com/mfvxfxl8h2iGNO/img/ic-view.svg",
    branchIcon: "https://c.animaapp.com/mfvxfxl8h2iGNO/img/branch-it.svg",
    fontFamily: "[font-family:'Lato',Helvetica]",
    coverShadow: "rounded-lg shadow-[0px_4px_4px_#00000040]",
  },
];

const leftColumnPosts = [postsData[0], postsData[1], postsData[2]];
const rightColumnPosts = [postsData[3], postsData[4]];

export const PostsSection = (): JSX.Element => {
  return (
    <section className="flex items-start gap-[60px] pl-[60px] pr-10 pt-0 pb-[30px] flex-1 self-stretch grow">
      <div className="flex flex-col items-start justify-center gap-10 pt-0 pb-5 px-0 flex-1 grow rounded-[0px_0px_25px_25px]">
        {leftColumnPosts.map((post, index) => (
          <Card
            key={post.id}
            className={`flex flex-col items-start gap-[25px] px-[30px] py-5 self-stretch w-full bg-white rounded-lg ${index === 2 ? "border border-solid border-[#ffffff]" : ""}`}
          >
            <CardContent className="flex flex-col items-start justify-center gap-5 self-stretch w-full rounded-[100px] p-0">
              <div
                className={`flex flex-col h-60 items-start justify-between p-[15px] self-stretch w-full ${post.coverShadow || ""}`}
                style={{
                  background: `url(${post.coverImage}) 50% 50% / cover`,
                }}
              >
                <Badge
                  variant="outline"
                  style={getCategoryInlineStyle(post.categoryColor)}
                >
                  {post.category}
                </Badge>

                <div className="flex flex-col items-end gap-2.5 self-stretch w-full">
                  <div
                    className={`inline-flex items-start gap-[5px] px-2.5 py-[5px] bg-[#ffffffcc] rounded-[15px] overflow-hidden ${index === 2 ? "shadow-[1px_1px_8px_#505050cc] backdrop-blur-[2px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(2px)_brightness(100%)]" : ""}`}
                  >
                    <span className="font-bold flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] text-blue text-sm text-right tracking-[0] leading-[18.2px] whitespace-nowrap">
                      {post.websiteUrl}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start gap-[15px] self-stretch w-full">
                <h3 className="self-stretch mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-dark-grey text-2xl tracking-[0] leading-9">
                  {post.title}
                </h3>

                <div
                  className={`flex flex-col items-start gap-[15px] px-2.5 py-[15px] self-stretch w-full rounded-lg ${
                    index === 0
                      ? "bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]"
                      : index === 1
                        ? "bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]"
                        : "bg-[linear-gradient(0deg,rgba(224,224,224,0.3)_0%,rgba(224,224,224,0.3)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]"
                  }`}
                >
                  <p className="self-stretch mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-dark-grey text-lg tracking-[0] leading-[27px]">
                    {post.description}
                  </p>

                  <div className="flex items-start justify-between self-stretch w-full">
                    <div className="inline-flex items-center gap-2.5">
                      <img
                        className="w-[18px] h-[18px] object-cover"
                        alt="Profile image"
                        src={post.profileImage}
                      />
                      <span className="w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-medium-dark-grey text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                        {post.author}
                      </span>
                    </div>

                    <div className="inline-flex h-[25px] items-center gap-5">
                      <span className="w-fit [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[23px] whitespace-nowrap">
                        {post.date}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>

            <div className="flex items-center justify-between self-stretch w-full">
              <div
                className={`inline-flex items-center ${index === 0 ? "gap-[15px]" : "gap-4"}`}
              >
                <div className="inline-flex items-center gap-2">
                  <img
                    className="w-[13px] h-5"
                    alt="Treasure icon"
                    src={post.treasureIcon}
                  />
                  <span className="w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-dark-grey text-base text-center tracking-[0] leading-[20.8px] whitespace-nowrap">
                    {post.treasureCount}
                  </span>
                </div>

                <div className="inline-flex items-center gap-2">
                  <img
                    className="w-5 h-3.5"
                    alt="Ic view"
                    src={post.viewIcon}
                  />
                  <span className="w-fit mt-[-1.00px] text-dark-grey text-center leading-[20.8px] whitespace-nowrap [font-family:'Lato',Helvetica] font-normal text-base tracking-[0]">
                    {post.visitCount}
                  </span>
                </div>
              </div>

              <img
                className="flex-[0_0_auto] mr-[-0.61px]"
                alt="Branch it"
                src={post.branchIcon}
              />
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-col items-start justify-center gap-10 pt-0 pb-5 px-0 flex-1 grow rounded-[0px_0px_25px_25px]">
        {rightColumnPosts.map((post, index) => (
          <Card
            key={post.id}
            className={`flex flex-col items-start gap-[25px] px-[30px] py-5 self-stretch w-full bg-white rounded-lg ${index === 0 ? "shadow-[1px_1px_10px_#c5c5c5] bg-[linear-gradient(0deg,rgba(224,224,224,0.25)_0%,rgba(224,224,224,0.25)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]" : ""}`}
          >
            <CardContent className="flex flex-col items-start justify-center gap-5 self-stretch w-full rounded-[100px] p-0">
              <div
                className={`flex flex-col h-60 items-start justify-between p-[15px] self-stretch w-full ${post.coverShadow || ""}`}
                style={{
                  background: `url(${post.coverImage}) 50% 50% / cover`,
                }}
              >
                <Badge
                  variant="outline"
                  style={getCategoryInlineStyle(post.categoryColor)}
                >
                  {post.category}
                </Badge>

                <div className="flex flex-col items-end gap-2.5 self-stretch w-full">
                  <div className="inline-flex items-start gap-[5px] px-2.5 py-[5px] bg-[#ffffffcc] rounded-[15px] overflow-hidden">
                    <span className="font-bold flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] text-blue text-sm text-right tracking-[0] leading-[18.2px] whitespace-nowrap">
                      {post.websiteUrl}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start gap-[15px] self-stretch w-full">
                <h3 className="self-stretch mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-dark-grey text-2xl tracking-[0] leading-9">
                  {post.title}
                </h3>

                <div
                  className={`flex flex-col items-start gap-[15px] px-2.5 py-[15px] self-stretch w-full rounded-lg ${
                    index === 0
                      ? "bg-[linear-gradient(0deg,rgba(224,224,224,0.45)_0%,rgba(224,224,224,0.45)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]"
                      : "bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]"
                  }`}
                >
                  <p className="self-stretch mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-dark-grey text-lg tracking-[0] leading-[27px]">
                    {post.description}
                  </p>

                  <div className="flex items-start justify-between self-stretch w-full">
                    <div className="inline-flex items-center gap-2.5">
                      <img
                        className="w-[18px] h-[18px] object-cover"
                        alt="Profile image"
                        src={post.profileImage}
                      />
                      <span className="w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-medium-dark-grey text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                        {post.author}
                      </span>
                    </div>

                    <div className="inline-flex h-[25px] items-center gap-5">
                      <span className="w-fit [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[23px] whitespace-nowrap">
                        {post.date}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>

            <div className="flex items-center justify-between self-stretch w-full">
              <div
                className={`inline-flex items-center ${index === 0 ? "gap-[15px]" : "gap-4"}`}
              >
                <div className="inline-flex items-center gap-2">
                  <img
                    className="w-[13px] h-5"
                    alt="Treasure icon"
                    src={post.treasureIcon}
                  />
                  <span className="w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-dark-grey text-base text-center tracking-[0] leading-[20.8px] whitespace-nowrap">
                    {post.treasureCount}
                  </span>
                </div>

                <div className="inline-flex items-center gap-2">
                  <img
                    className="w-5 h-3.5"
                    alt="Ic view"
                    src={post.viewIcon}
                  />
                  <span className="w-fit mt-[-1.00px] text-dark-grey text-center leading-[20.8px] whitespace-nowrap [font-family:'Lato',Helvetica] font-normal text-base tracking-[0]">
                    {post.visitCount}
                  </span>
                </div>
              </div>

              <img
                className="flex-[0_0_auto] mr-[-0.61px]"
                alt="Branch it"
                src={post.branchIcon}
              />
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};
