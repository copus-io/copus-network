import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeftIcon, ExternalLinkIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";

// Mock data - in a real app this would come from an API
const contentData = {
  "1": {
    id: 1,
    category: "Academic",
    categoryColor: "border-[#e19e1d] bg-[linear-gradient(0deg,rgba(225,159,29,0.2)_0%,rgba(225,159,29,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    categoryTextColor: "text-yellow",
    coverImage: "https://c.animaapp.com/mfuxsdcbXwMuVe/img/image.png",
    title: "We overestimate AI's impact in the short-term and underestimate it long-term",
    description: "As a developer, I am always wondering how much AI could possibly effect my career and I think I feel more confident after reading this article.",
    website: "productdesign.com",
    url: "https://productdesign.com/ai-impact",
    userName: "User Name",
    userAvatar: "https://c.animaapp.com/mfuxsdcbXwMuVe/img/-profile-image.svg",
    date: "Nov 15, 2022",
    treasureCount: 999,
    visitCount: "999 Visits",
    likes: 245,
    isLiked: false,
  },
  "2": {
    id: 2,
    category: "Sports",
    categoryColor: "border-[#2191fb] bg-[linear-gradient(0deg,rgba(33,145,251,0.2)_0%,rgba(33,145,251,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    categoryTextColor: "text-blue",
    coverImage: "https://c.animaapp.com/mft5gmofxQLTNf/img/cover-1.png",
    title: "Sports Analytics Dashboard",
    description: "A comprehensive sports analytics platform that provides real-time statistics and insights for various sports. Perfect for coaches, analysts, and sports enthusiasts.",
    website: "sportsanalytics.com",
    url: "https://sportsanalytics.com",
    userName: "Sports Analyst",
    userAvatar: "https://c.animaapp.com/mft5gmofxQLTNf/img/-profile-image-4.png",
    date: "Nov 10, 2022",
    treasureCount: 756,
    visitCount: "1.2k Visits",
    likes: 189,
    isLiked: true,
  },
};

export const Content = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const content = contentData[id as keyof typeof contentData];
  const [isClicked, setIsClicked] = useState(false);

  if (!content) {
    return (
      <div className="w-full min-h-screen bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-h-3 font-[number:var(--h-3-font-weight)] text-off-black text-[length:var(--h-3-font-size)] mb-4">
            Content not found
          </h1>
          <Link to="/discovery" className="text-blue hover:underline">
            Back to Discovery
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] overflow-hidden">
      <header className="flex items-start justify-between p-[30px] w-full bg-transparent">
        <div className="inline-flex items-center gap-[15px]">
          <Link to="/" className="flex w-[45px] h-[45px] items-center justify-center gap-2.5 p-2.5 bg-red rounded-[100px]">
            <img
              className="w-7 h-7"
              alt="Ic fractopus open"
              src="https://c.animaapp.com/mfuxsdcbXwMuVe/img/ic-fractopus-open.svg"
            />
          </Link>

          <Link to="/" className="[font-family:'Lato',Helvetica] font-bold text-dark-grey text-lg tracking-[0.90px] leading-[27px] whitespace-nowrap">
            Copus
          </Link>

          <div className="inline-flex items-center justify-center gap-2.5 pl-[15px] pr-0 py-0 border-l border-[#a8a8a8]">
            <div className="[font-family:'Lato',Helvetica] font-light text-dark-grey text-lg tracking-[0] leading-[27px] whitespace-nowrap">
              Human Internet
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-5">
          <Button 
            className="inline-flex items-center justify-center gap-[15px] px-5 py-2 rounded-[50px] border border-solid border-[#f23a00] bg-transparent text-red hover:bg-[#f23a00]/10 h-auto transition-colors"
            asChild
          >
            <Link to="/create">
              <img
                className="w-5 h-5"
                alt="Vector"
                src="https://c.animaapp.com/mfuxsdcbXwMuVe/img/vector.svg"
              />
              <div className="[font-family:'Lato',Helvetica] font-bold text-lg tracking-[0] leading-[27px] whitespace-nowrap">
                Create
              </div>
            </Link>
          </Button>

          <Link to="/notification">
            <img
              className="w-[47px] h-[47px]"
              alt="Notification"
              src="https://c.animaapp.com/mfuxsdcbXwMuVe/img/notification.svg"
            />
          </Link>

          <Link to="/my-treasury">
            <Avatar className="w-[47px] h-[47px]">
              <AvatarImage
                src="https://c.animaapp.com/mfuxsdcbXwMuVe/img/avatar.png"
                alt="Avatar"
              />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>

      <main className="flex justify-center w-full flex-1 min-h-0">
        <div className="w-full max-w-[1440px] px-[200px] pt-10 flex flex-col min-h-0">
          <div className="flex flex-col items-start flex-1 min-h-0 overflow-y-auto pb-[120px]">
            <article className="flex flex-col pt-0 pb-[30px] px-0 relative self-stretch w-full border-b-2 [border-bottom-style:solid] border-[#e0e0e0]">
          <div className="flex flex-col items-start gap-[30px] self-stretch w-full relative flex-[0_0_auto]">
            <div className="flex items-start gap-[30px] pt-0 pb-[30px] px-0 relative self-stretch w-full flex-[0_0_auto]">
              <div className="flex flex-col h-[205px] items-start justify-between relative flex-1 grow">
                <Badge
                  variant="secondary"
                  className="bg-transparent border-0 p-0 h-auto"
                >
                  <div className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-yellow text-base text-center tracking-[0] leading-5 whitespace-nowrap">
                    {content.category}
                  </div>
                </Badge>

                <h1 className="relative self-stretch [font-family:'Lato',Helvetica] font-medium text-off-black text-[40px] tracking-[0] leading-[56px]">
                  {content.title}
                </h1>
              </div>

              <div 
                className="relative w-[364px] h-[205px] rounded-lg bg-cover bg-center"
                style={{ backgroundImage: `url(${content.coverImage})` }}
              />
            </div>

            <Card className="w-full bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] border-0 shadow-none">
              <CardContent className="p-[30px]">
                <blockquote className="flex items-start gap-5 relative self-stretch w-full flex-[0_0_auto] mb-5">
                  <div className="w-fit whitespace-nowrap relative mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-red text-[50px] tracking-[0] leading-[80px]">
                    &quot;
                  </div>

                  <div className="relative flex-1 mt-[-1.00px] [font-family:'Lato',Helvetica] font-light text-[#231f20] text-xl tracking-[0] leading-8">
                    {content.description}
                  </div>

                  <div className="flex items-end justify-center self-stretch w-5 relative mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-red text-[50px] tracking-[0] leading-[80px]">
                    &quot;
                  </div>
                </blockquote>

                <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]">
                  <Avatar className="w-[25px] h-[25px]">
                    <AvatarImage
                      src={content.userAvatar}
                      alt="Profile image"
                    />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>

                  <div className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-dark-grey text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                    {content.userName}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex h-[25px] items-center justify-between relative self-stretch w-full mt-[50px]">
            <time className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-dark-grey text-base tracking-[0] leading-[23px] whitespace-nowrap">
              {content.date}
            </time>

            <div className="inline-flex items-center gap-5 relative flex-[0_0_auto]">
              <div className="inline-flex items-center gap-[5px] relative flex-[0_0_auto]">
                <img
                  className="relative w-[21px] h-[15px]"
                  alt="Ic view"
                  src="https://c.animaapp.com/mfuxsdcbXwMuVe/img/ic-view.svg"
                />

                <div className="mt-[-1.00px] relative w-fit [font-family:'Lato',Helvetica] font-normal text-dark-grey text-lg text-center tracking-[0] leading-5 whitespace-nowrap">
                  {content.visitCount}
                </div>
              </div>

              <img
                className="relative w-6 h-6"
                alt="Arweave ar logo"
                src="https://c.animaapp.com/mg1z5yfj4I9HZO/img/arweave-ar-logo-1.svg"
              />
            </div>
          </div>
        </article>

        <div className="flex justify-between w-full items-center relative py-[30px] px-[200px] bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] fixed bottom-0 left-0 right-0">
          <div className="inline-flex items-center gap-5 relative flex-[0_0_auto]">
            <Button
              className={`inline-flex items-center justify-center gap-2.5 px-[15px] py-2 rounded-[50px] border border-solid border-[#e19e1d] transition-all ${
                isClicked 
                  ? 'bg-[#e19e1d] text-white' 
                  : 'bg-[#e19e1d1a] text-dark-grey hover:bg-[#e19e1d2a]'
              }`}
              onClick={() => setIsClicked(!isClicked)}
            >
              <img
                className="relative w-3.5 h-[22px]"
                alt="Treasure icon"
                src="https://c.animaapp.com/mg1z5yfj4I9HZO/img/treasure-icon.svg"
                style={{ filter: isClicked ? 'brightness(0) invert(1)' : 'none' }}
              />

              <span className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-lg text-center tracking-[0] leading-5 whitespace-nowrap">
                {content.treasureCount}
              </span>
            </Button>

            <img
              className="w-[38px] relative self-stretch"
              alt="Share"
              src="https://c.animaapp.com/mg1z5yfj4I9HZO/img/share.svg"
            />
          </div>

          <Button 
            className="h-auto gap-[15px] px-[30px] py-2 bg-red rounded-[100px] border border-solid border-[#f23a00] hover:bg-red/90"
            asChild
          >
            <a href={content.url} target="_blank" rel="noopener noreferrer">
              <span className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-white text-xl tracking-[0] leading-[30px] whitespace-nowrap">
                Visit
              </span>

              <img
                className="relative w-[31px] h-[14.73px] mr-[-1.00px]"
                alt="Arrow"
                src="https://c.animaapp.com/mg1z5yfj4I9HZO/img/arrow-1.svg"
              />
            </a>
          </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
