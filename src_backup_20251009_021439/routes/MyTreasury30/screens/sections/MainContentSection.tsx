import React from "react";
import { Avatar, AvatarImage } from "../../../../components/ui/avatar";
import { Badge } from "../../../../components/ui/badge";
import { Card, CardContent } from "../../../../components/ui/card";
import { getCategoryInlineStyle } from "../../../../utils/categoryStyles";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui/tabs";

export const MainContentSection = (): JSX.Element => {
  const socialLinks = [
    {
      icon: "https://c.animaapp.com/mfw39tedEil7Am/img/logo-wrap.svg",
      handle: "@sophiawuuu",
    },
    {
      icon: "https://c.animaapp.com/mfw39tedEil7Am/img/logo-wrap.svg",
      handle: "@sophiawuuu",
    },
    {
      icon: "https://c.animaapp.com/mfw39tedEil7Am/img/logo-wrap.svg",
      handle: "@sophiawuuu",
    },
  ];

  const collectionItems = [
    {
      id: 1,
      category: "Art",
      categoryColor: "green",
      categoryBorder: "#2b8649",
      categoryBg:
        "linear-gradient(0deg,rgba(43,134,73,0.2) 0%,rgba(43,134,73,0.2) 100%),linear-gradient(0deg,rgba(255,255,255,1) 0%,rgba(255,255,255,1) 100%)",
      coverImage: "https://c.animaapp.com/mfw39tedEil7Am/img/cover.png",
      title: "Window Swap",
      description: '"Explore the world through window, what\'s inside?"',
      url: "productdesign.com",
      author: "User Name",
      authorImage:
        "https://c.animaapp.com/mfw39tedEil7Am/img/-profile-image-1.png",
      date: "Nov 15, 2022",
      treasureCount: "999",
      visitCount: "999 Visits",
      cardBg: "bg-white",
      contentBg:
        "bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    },
    {
      id: 2,
      category: "Life",
      categoryColor: "pink",
      categoryBorder: "#ea7db7",
      categoryBg:
        "linear-gradient(0deg,rgba(234,125,183,0.2) 0%,rgba(234,125,183,0.2) 100%),linear-gradient(0deg,rgba(255,255,255,1) 0%,rgba(255,255,255,1) 100%)",
      coverImage: "https://c.animaapp.com/mfw39tedEil7Am/img/cover-1.png",
      title: "Window Swap",
      description: '"Explore the world through window, what\'s inside?"',
      url: "productdesign.com",
      author: "User Name",
      authorImage:
        "https://c.animaapp.com/mfw39tedEil7Am/img/-profile-image-1.png",
      date: "Nov 15, 2022",
      treasureCount: "999",
      visitCount: "999 Visits",
      cardBg:
        "shadow-[1px_1px_10px_#c5c5c5] bg-[linear-gradient(0deg,rgba(224,224,224,0.25)_0%,rgba(224,224,224,0.25)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
      contentBg:
        "bg-[linear-gradient(0deg,rgba(224,224,224,0.45)_0%,rgba(224,224,224,0.45)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    },
  ];

  return (
    <main className="flex flex-col items-start gap-[30px] py-5 min-h-screen">
      <section className="flex flex-col items-start w-full">
        <div className="relative self-stretch w-full h-[200px] rounded-lg [background:url(https://c.animaapp.com/mfw39tedEil7Am/img/banner.png)_50%_50%_/_cover]" />

        <div className="gap-10 pl-5 pr-10 py-0 mt-[-46px] flex items-start w-full">
          <Avatar className="w-[100px] h-[100px] rounded-[60px] border-2 border-solid border-[#ffffff]">
            <AvatarImage
              src="https://c.animaapp.com/mfw39tedEil7Am/img/profile.png"
              className="object-cover"
            />
          </Avatar>

          <div className="flex flex-col items-start gap-5 pt-[60px] pb-0 px-0 flex-1 grow">
            <div className="inline-flex flex-col items-start justify-center">
              <div className="inline-flex items-center gap-[15px]">
                <h1 className="w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-medium text-off-black text-3xl tracking-[0] leading-[42px] whitespace-nowrap">
                  Sophiaaaaa
                </h1>

                <img
                  className="flex-[0_0_auto] mr-[-0.39px]"
                  alt="Share"
                  src="https://c.animaapp.com/mfw39tedEil7Am/img/share.svg"
                />
              </div>

              <p className="w-fit [font-family:'Lato',Helvetica] font-normal text-dark-grey text-lg tracking-[0] leading-[25.2px] whitespace-nowrap">
                @nan09
              </p>
            </div>

            <div className="flex-col gap-[15px] flex items-start w-full">
              <div className="flex items-center gap-2.5 w-full">
                <p className="w-fit mt-[-1.00px] font-p-l font-[number:var(--p-l-font-weight)] text-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
                  Hello, welcome to my creativce space. Design, travel, and
                  everyday life.
                </p>
              </div>

              <div className="inline-flex items-center gap-[30px]">
                {socialLinks.map((link, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center justify-center gap-2.5"
                  >
                    <div className="gap-[5px] inline-flex items-center">
                      <img
                        className="flex-[0_0_auto]"
                        alt="Logo wrap"
                        src={link.icon}
                      />

                      <span className="w-fit mt-[-1.00px] font-p-l font-[number:var(--p-l-font-weight)] text-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
                        {link.handle}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col items-start gap-[30px] w-full mb-[-42.00px]">
        <Tabs defaultValue="collection" className="w-full">
          <TabsList className="flex items-center justify-between w-full bg-transparent h-auto p-0 rounded-none relative border-b border-[#ffffff]">
            <TabsTrigger
              value="collection"
              className="flex-1 flex items-center justify-center bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none p-0 relative data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-1/2 data-[state=active]:after:transform data-[state=active]:after:-translate-x-1/2 data-[state=active]:after:w-[calc(100%-30px)] data-[state=active]:after:h-[2px] data-[state=active]:after:bg-[#454545]"
            >
              <div className="inline-flex items-center justify-center px-[15px] py-2.5">
                <span className="[font-family:'Lato',Helvetica] data-[state=active]:font-bold font-normal text-dark-grey text-lg text-center tracking-[0] leading-[25.2px] whitespace-nowrap">
                  My collection
                </span>
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="share"
              className="flex-1 flex items-center justify-center bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none p-0 relative data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-1/2 data-[state=active]:after:transform data-[state=active]:after:-translate-x-1/2 data-[state=active]:after:w-[calc(100%-30px)] data-[state=active]:after:h-[2px] data-[state=active]:after:bg-[#454545]"
            >
              <div className="justify-center px-[15px] py-2.5 w-full flex items-center gap-2.5">
                <span className="[font-family:'Lato',Helvetica] data-[state=active]:font-bold font-normal text-dark-grey text-lg text-center tracking-[0] leading-[25.2px] whitespace-nowrap">
                  My share
                </span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="collection" className="mt-[30px]">
            <div className="flex items-start gap-20 w-full">
              {collectionItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col items-start justify-center gap-10 pt-0 pb-5 px-0 flex-1 grow rounded-[0px_0px_25px_25px]"
                >
                  <Card
                    className={`flex flex-col items-start gap-[25px] px-[30px] py-5 w-full rounded-lg border-0 shadow-none ${item.cardBg}`}
                  >
                    <CardContent className="flex flex-col items-start justify-center gap-5 w-full rounded-[100px] p-0">
                      <div 
                        className="flex flex-col h-60 items-start justify-between p-[15px] w-full rounded-lg"
                        style={{ backgroundImage: `url(${item.coverImage})`, backgroundSize: 'cover', backgroundPosition: '50% 50%' }}
                      >
                        <Badge
                          variant="outline"
                          style={getCategoryInlineStyle(item.categoryColor)}
                        >
                          {item.category}
                        </Badge>

                        <div className="flex flex-col items-end gap-2.5 self-stretch w-full">
                          <div className="inline-flex items-start gap-[5px] px-2.5 py-[5px] bg-[#ffffffcc] rounded-[15px] overflow-hidden">
                            <span className="flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-medium text-blue text-sm text-right tracking-[0] leading-[18.2px] whitespace-nowrap">
                              {item.url}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-start gap-[15px] w-full">
                        <h3 className="self-stretch mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-dark-grey text-2xl tracking-[0] leading-9">
                          {item.title}
                        </h3>

                        <div
                          className={`flex flex-col items-start gap-[15px] px-2.5 py-[15px] w-full rounded-lg ${item.contentBg}`}
                        >
                          <p className="self-stretch mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-dark-grey text-lg tracking-[0] leading-[27px]">
                            {item.description}
                          </p>

                          <div className="flex items-start justify-between w-full">
                            <div className="inline-flex items-center gap-2.5">
                              <img
                                className="w-[18px] h-[18px] object-cover"
                                alt="Profile image"
                                src={item.authorImage}
                              />

              <span className="w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                {item.author}
              </span>
                            </div>

                            <div className="inline-flex h-[25px] items-center gap-5">
                              <span className="w-fit [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[23px] whitespace-nowrap">
                                {item.date}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>

                    <div className="flex items-center justify-between w-full">
                      <div className="gap-[15px] inline-flex items-center">
                        <div className="inline-flex items-center gap-2">
                          <img
                            className="w-[13px] h-5"
                            alt="Treasure icon"
                            src="https://c.animaapp.com/mfw39tedEil7Am/img/treasure-icon.svg"
                          />

                          <span className="w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-dark-grey text-base text-center tracking-[0] leading-[20.8px] whitespace-nowrap">
                            {item.treasureCount}
                          </span>
                        </div>

                        <div className="inline-flex items-center gap-2">
                          <img
                            className="w-5 h-3.5"
                            alt="Ic view"
                            src="https://c.animaapp.com/mfw39tedEil7Am/img/ic-view.svg"
                          />

                          <span className="w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-dark-grey text-base text-center tracking-[0] leading-[20.8px] whitespace-nowrap">
                            {item.visitCount}
                          </span>
                        </div>
                      </div>

                      <img
                        className="flex-[0_0_auto] mr-[-0.61px]"
                        alt="Branch it"
                        src="https://c.animaapp.com/mfw39tedEil7Am/img/branch-it.svg"
                      />
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="share" className="mt-[30px]">
            <div className="flex items-start gap-20 w-full">
              <div className="text-center text-dark-grey">
                My share content would go here
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
};
