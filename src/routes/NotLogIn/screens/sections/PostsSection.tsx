import React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../../components/ui/avatar";
import { Badge } from "../../../../components/ui/badge";
import { Card, CardContent } from "../../../../components/ui/card";

const postsData = [
  {
    id: 1,
    category: "Art",
    categoryColor:
      "border-[#2b8649] bg-[linear-gradient(0deg,rgba(43,134,73,0.2)_0%,rgba(43,134,73,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    categoryTextColor: "text-green",
    coverImage: "https://c.animaapp.com/mft5gmofxQLTNf/img/cover-2.png",
    title: "Window Swap",
    description: "Explore the world through window, what's inside?",
    author: "User Name",
    authorImage:
      "https://c.animaapp.com/mft5gmofxQLTNf/img/-profile-image-4.png",
    date: "Nov 15, 2022",
    treasureCount: "999",
    viewCount: "999 Visits",
    website: "productdesign.com",
    websiteWeight: "font-medium",
    column: "left",
  },
  {
    id: 2,
    category: "Sports",
    categoryColor:
      "border-[#2191fb] bg-[linear-gradient(0deg,rgba(33,145,251,0.2)_0%,rgba(33,145,251,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    categoryTextColor: "text-blue",
    coverImage: "https://c.animaapp.com/mft5gmofxQLTNf/img/cover-1.png",
    title: "Window Swap",
    description: "Explore the world through window, what's inside?",
    author: "User Name",
    authorImage:
      "https://c.animaapp.com/mft5gmofxQLTNf/img/-profile-image-4.png",
    date: "Nov 15, 2022",
    treasureCount: "999",
    viewCount: "999 Visits",
    website: "productdesign.com",
    websiteWeight: "font-bold",
    column: "left",
  },
  {
    id: 3,
    category: "Technology",
    categoryColor:
      "border-[#2b8649] bg-[linear-gradient(0deg,rgba(43,134,73,0.2)_0%,rgba(43,134,73,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    categoryTextColor: "text-green",
    coverImage: "https://c.animaapp.com/mft5gmofxQLTNf/img/cover-2.png",
    title: "Window Swap",
    description: "Explore the world through window, what's inside?",
    author: "User Name",
    authorImage:
      "https://c.animaapp.com/mft5gmofxQLTNf/img/-profile-image-4.png",
    date: "Nov 15, 2022",
    treasureCount: "999",
    viewCount: "999 Visits",
    website: "productdesign.com",
    websiteWeight: "font-bold",
    fontFamily: "[font-family:'Maven_Pro',Helvetica]",
    shadow: "shadow-pop-up",
    websiteShadow:
      "shadow-[1px_1px_8px_#505050cc] backdrop-blur-[2px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(2px)_brightness(100%)]",
    contentBg:
      "bg-[linear-gradient(0deg,rgba(224,224,224,0.3)_0%,rgba(224,224,224,0.3)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    cardBorder: "border border-solid border-[#ffffff]",
    column: "left",
  },
  {
    id: 4,
    category: "Life",
    categoryColor:
      "border-[#ea7db7] bg-[linear-gradient(0deg,rgba(234,125,183,0.2)_0%,rgba(234,125,183,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    categoryTextColor: "text-pink",
    coverImage: "https://c.animaapp.com/mft5gmofxQLTNf/img/cover-3.png",
    title: "Window Swap",
    description: "Explore the world through window, what's inside?",
    author: "User Name",
    authorImage:
      "https://c.animaapp.com/mft5gmofxQLTNf/img/-profile-image-4.png",
    date: "Nov 15, 2022",
    treasureCount: "999",
    viewCount: "999 Visits",
    website: "productdesign.com",
    websiteWeight: "font-bold",
    cardShadow: "shadow-[1px_1px_10px_#c5c5c5]",
    cardBg:
      "bg-[linear-gradient(0deg,rgba(224,224,224,0.25)_0%,rgba(224,224,224,0.25)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    contentBg:
      "bg-[linear-gradient(0deg,rgba(224,224,224,0.45)_0%,rgba(224,224,224,0.45)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    column: "right",
  },
  {
    id: 5,
    category: "Technology",
    categoryColor:
      "border-[#e19e1d] bg-[linear-gradient(0deg,rgba(201,139,20,0.2)_0%,rgba(201,139,20,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    categoryTextColor: "text-yellow",
    coverImage: "https://c.animaapp.com/mft5gmofxQLTNf/img/cover-4.png",
    title: "Window Swap",
    description: "Explore the world through window, what's inside?",
    author: "User Name",
    authorImage:
      "https://c.animaapp.com/mft5gmofxQLTNf/img/-profile-image-4.png",
    date: "Nov 15, 2022",
    treasureCount: "999",
    viewCount: "999 Visits",
    website: "productdesign.com",
    websiteWeight: "font-bold",
    fontFamily: "[font-family:'Maven_Pro',Helvetica]",
    coverShadow: "shadow-[0px_4px_4px_#00000040]",
    contentBg:
      "bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    column: "right",
  },
];

const leftColumnPosts = postsData.filter((post) => post.column === "left");
const rightColumnPosts = postsData.filter((post) => post.column === "right");

export const PostsSection = (): JSX.Element => {
  const renderPostCard = (post: (typeof postsData)[0]) => (
    <Card
      key={post.id}
      className={`${post.cardBg || "bg-white"} ${post.cardShadow || ""} ${post.cardBorder || ""} rounded-lg border-0 shadow-none`}
    >
      <CardContent className="flex flex-col gap-[25px] p-[30px]">
        <div className="flex flex-col gap-5">
          <div
            className={`flex flex-col h-60 items-start justify-between p-[15px] ${post.coverShadow || ""} rounded-lg`}
            style={{
              background: `url(${post.coverImage}) 50% 50% / cover`,
            }}
          >
            <Badge
              variant="outline"
              className={`${post.categoryColor} ${post.shadow || ""} px-2.5 py-2 rounded-[50px] border border-solid w-fit`}
            >
              <span
                className={`${post.categoryTextColor} ${post.fontFamily || "[font-family:'Lato',Helvetica]"} font-semibold text-sm tracking-[0] leading-[14px] whitespace-nowrap`}
              >
                {post.category}
              </span>
            </Badge>

            <div className="flex justify-end">
              <div
                className={`inline-flex items-start gap-[5px] px-2.5 py-[5px] bg-[#ffffffcc] rounded-[15px] overflow-hidden ${post.websiteShadow || ""}`}
              >
                <span
                  className={`[font-family:'Lato',Helvetica] ${post.websiteWeight} text-blue text-sm text-right tracking-[0] leading-[18.2px] whitespace-nowrap`}
                >
                  {post.website}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-[15px]">
            <h3 className="[font-family:'Lato',Helvetica] font-semibold text-dark-grey text-2xl tracking-[0] leading-9">
              {post.title}
            </h3>

            <div
              className={`flex flex-col gap-[15px] px-2.5 py-[15px] rounded-lg ${post.contentBg || "bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]"}`}
            >
              <p className="[font-family:'Lato',Helvetica] font-normal text-dark-grey text-lg tracking-[0] leading-[27px]">
                &quot;{post.description}&quot;
              </p>

              <div className="flex items-start justify-between">
                <div className="inline-flex items-center gap-2.5">
                  <Avatar className="w-[18px] h-[18px]">
                    <AvatarImage src={post.authorImage} alt="Profile image" className="object-cover" />
                    <AvatarFallback>UN</AvatarFallback>
                  </Avatar>
                  <span className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                    {post.author}
                  </span>
                </div>

                <div className="inline-flex h-[25px] items-center">
                  <span className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[23px] whitespace-nowrap">
                    {post.date}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-[15px]">
            <div className="inline-flex items-center gap-2">
              <img
                className="w-[13px] h-5"
                alt="Treasure icon"
                src="https://c.animaapp.com/mft5gmofxQLTNf/img/treasure-icon.svg"
              />
              <span className="[font-family:'Lato',Helvetica] font-normal text-dark-grey text-base text-center tracking-[0] leading-[20.8px] whitespace-nowrap">
                {post.treasureCount}
              </span>
            </div>

            <div className="inline-flex items-center gap-2">
              <img
                className="w-5 h-3.5"
                alt="Ic view"
                src="https://c.animaapp.com/mft5gmofxQLTNf/img/ic-view.svg"
              />
              <span className="[font-family:'Lato',Helvetica] font-normal text-dark-grey text-base text-center tracking-[0] leading-[20.8px] whitespace-nowrap">
                {post.viewCount}
              </span>
            </div>
          </div>

          <img
            className="flex-shrink-0"
            alt="Branch it"
            src="https://c.animaapp.com/mft5gmofxQLTNf/img/branch-it.svg"
          />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section className="flex items-start gap-[60px] px-10 pt-5 pb-[30px] min-h-screen">
      <div className="flex flex-col gap-10 pt-0 pb-5 flex-1 rounded-[0px_0px_25px_25px]">
        {leftColumnPosts.map(renderPostCard)}
      </div>

      <div className="flex flex-col gap-10 pt-0 pb-5 flex-1 rounded-[0px_0px_25px_25px]">
        {rightColumnPosts.map(renderPostCard)}
      </div>
    </section>
  );
};
