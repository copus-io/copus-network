import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";

const topicData = [
  {
    label: "Life",
    color:
      "border-[#ea7db7] bg-[linear-gradient(0deg,rgba(234,125,183,0.2)_0%,rgba(234,125,183,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    textColor: "text-pink",
    selected: true,
  },
  {
    label: "Art",
    color: "border-[#2b8649]",
    textColor: "text-green",
    selected: false,
  },
  {
    label: "Design",
    color: "border-[#2191fb]",
    textColor: "text-blue",
    selected: false,
  },
  {
    label: "Technology",
    color: "border-[#c9b71f]",
    textColor: "text-[#c9b71f]",
    selected: false,
  },
];

export const Create = (): JSX.Element => {
  return (
    <div className="w-[1440px] flex bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
      <div className="flex w-[1440px] h-[1124px] relative flex-col items-start">
        <header className="flex items-start justify-between p-[30px] relative self-stretch w-full flex-[0_0_auto] bg-transparent">
          <div className="flex w-[45px] h-[45px] items-center justify-center gap-2.5 p-2.5 relative bg-red rounded-[100px]">
            <img
              className="relative w-7 h-7 mt-[-1.50px] mb-[-1.50px] ml-[-1.50px] mr-[-1.50px]"
              alt="Ic fractopus open"
              src="https://c.animaapp.com/mftvplqrDArMzQ/img/ic-fractopus-open.svg"
            />
          </div>

          <div className="inline-flex items-center gap-5 relative flex-[0_0_auto]">
            <Button className="inline-flex items-center justify-center gap-[15px] px-5 py-2.5 relative flex-[0_0_auto] bg-red rounded-[50px] h-auto">
              <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-white text-lg tracking-[0] leading-[27px] whitespace-nowrap">
                Publish
              </div>
            </Button>

            <img
              className="relative w-[47px] h-[47px]"
              alt="Notification"
              src="https://c.animaapp.com/mftvplqrDArMzQ/img/notification.svg"
            />

            <Avatar className="w-[47px] h-[47px]">
              <AvatarImage src="https://c.animaapp.com/mftvplqrDArMzQ/img/-profile-image.png" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="flex flex-col items-start gap-10 px-40 py-0 relative flex-1 self-stretch w-full grow">
          <div className="flex items-center gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
            <div className="relative w-fit mt-[-1.00px] font-h-3 font-[number:var(--h-3-font-weight)] text-off-black text-[length:var(--h-3-font-size)] text-center tracking-[var(--h-3-letter-spacing)] leading-[var(--h-3-line-height)] whitespace-nowrap [font-style:var(--h-3-font-style)]">
              Share treasure
            </div>
          </div>

          <div className="flex items-start gap-[60px] relative self-stretch w-full flex-[0_0_auto]">
            <div className="flex flex-col items-start gap-[30px] pl-0 pr-[60px] py-0 relative flex-1 grow border-r [border-right-style:solid] border-[#ffffff]">
              <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
                <div className="flex flex-col w-[60px] h-[23px] items-start justify-center gap-2.5 relative">
                  <div className="relative flex items-center justify-center w-fit mt-[-2.00px] [font-family:'Lato',Helvetica] font-normal text-transparent text-lg tracking-[0] leading-[18px]">
                    <span className="text-[#f23a00] leading-[var(--p-l-line-height)] font-p-l [font-style:var(--p-l-font-style)] font-[number:var(--p-l-font-weight)] tracking-[var(--p-l-letter-spacing)] text-[length:var(--p-l-font-size)]">
                      *
                    </span>

                    <span className="text-[#686868] leading-[var(--p-l-line-height)] font-p-l [font-style:var(--p-l-font-style)] font-[number:var(--p-l-font-weight)] tracking-[var(--p-l-letter-spacing)] text-[length:var(--p-l-font-size)]">
                      Link
                    </span>
                  </div>
                </div>

                <div className="flex items-center px-[15px] py-2.5 relative self-stretch w-full flex-[0_0_auto] bg-white rounded-[15px] border border-solid border-[#ffffff]">
                  <div className="inline-flex items-center justify-center gap-2.5 px-0 py-[5px] relative flex-[0_0_auto] rounded-[15px]">
                    <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-lg tracking-[0] leading-5 whitespace-nowrap">
                      http://
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
                <div className="relative w-[60px] mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-transparent text-base tracking-[0] leading-4">
                  <span className="text-[#f23a00] leading-[0.1px]">*</span>

                  <span className="text-[length:var(--p-l-font-size)] text-[#686868] leading-[var(--p-l-line-height)] font-p-l [font-style:var(--p-l-font-style)] font-[number:var(--p-l-font-weight)] tracking-[var(--p-l-letter-spacing)]">
                    Title
                  </span>
                </div>

                <Input
                  defaultValue="AI Agents Problems No One Talks About"
                  className="flex items-start gap-[5px] px-[15px] py-2.5 self-stretch w-full bg-white relative flex-[0_0_auto] rounded-[15px] [font-family:'Lato',Helvetica] font-semibold text-dark-grey text-lg tracking-[0] leading-[23.4px]"
                />
              </div>

              <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
                <div className="flex w-[60px] items-center gap-2.5 relative flex-[0_0_auto]">
                  <div className="items-center justify-center w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-transparent text-lg tracking-[0] leading-[18px] relative flex">
                    <span className="text-[#f23a00] leading-[var(--p-l-line-height)] font-p-l [font-style:var(--p-l-font-style)] font-[number:var(--p-l-font-weight)] tracking-[var(--p-l-letter-spacing)] text-[length:var(--p-l-font-size)]">
                      *
                    </span>

                    <span className="text-[#686868] leading-[var(--p-l-line-height)] font-p-l [font-style:var(--p-l-font-style)] font-[number:var(--p-l-font-weight)] tracking-[var(--p-l-letter-spacing)] text-[length:var(--p-l-font-size)]">
                      Cover
                    </span>
                  </div>
                </div>

                <div className="relative self-stretch w-full h-[260px] border border-dashed border-[#a8a8a8] bg-[url(https://c.animaapp.com/mftvplqrDArMzQ/img/preview-image.svg)] bg-cover bg-[50%_50%]" />
              </div>

              <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
                <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-transparent text-base tracking-[0] leading-4">
                  <span className="text-[#f23a00] leading-[0.1px]">*</span>

                  <span className="text-[length:var(--p-l-font-size)] text-[#686868] leading-[var(--p-l-line-height)] font-p-l [font-style:var(--p-l-font-style)] font-[number:var(--p-l-font-weight)] tracking-[var(--p-l-letter-spacing)]">
                    Recommendation
                  </span>
                </div>

                <div className="flex flex-col h-44 items-start justify-between px-[15px] py-2.5 relative self-stretch w-full bg-white rounded-[15px]">
                  <Textarea
                    placeholder="Please describe why you recommend this link..."
                    className="relative self-stretch mt-[-1.00px] font-p-l font-[number:var(--p-l-font-weight)] text-medium-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] [font-style:var(--p-l-font-style)] border-0 resize-none bg-transparent p-0 focus-visible:ring-0"
                  />

                  <div className="relative self-stretch [font-family:'Maven_Pro',Helvetica] font-normal text-medium-grey text-base text-right tracking-[0] leading-[25px]">
                    0/1000
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
                <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-[#231f20] text-base tracking-[0] leading-[23px] whitespace-nowrap">
                  Choose a topic
                </div>

                <div className="gap-2.5 inline-flex items-start relative flex-[0_0_auto]">
                  {topicData.map((topic, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className={`${topic.color} inline-flex items-center gap-[5px] px-2.5 py-2 relative flex-[0_0_auto] rounded-[50px] border border-solid`}
                    >
                      <div
                        className={`font-semibold relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] ${topic.textColor} text-sm tracking-[0] leading-[14px] whitespace-nowrap`}
                      >
                        {topic.label}
                      </div>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="inline-flex flex-col items-start gap-5 relative flex-[0_0_auto]">
              <div className="flex w-[60px] items-center gap-2.5 relative flex-[0_0_auto]">
                <div className="relative flex items-center justify-center w-fit mt-[-1.00px] mr-[-4.00px] font-p-l font-[number:var(--p-l-font-weight)] text-medium-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
                  Preview
                </div>
              </div>

              <Card className="flex flex-col w-[374px] items-start gap-[15px] p-5 relative flex-[0_0_auto] bg-white rounded-lg">
                <CardContent className="flex flex-col items-start justify-center gap-[15px] relative self-stretch w-full flex-[0_0_auto] rounded-[100px] p-0">
                  <div className="flex-col h-[188px] items-start justify-between p-2.5 self-stretch w-full [background:url(https://c.animaapp.com/mftvplqrDArMzQ/img/cover.png)_50%_50%_/_cover] relative flex">
                    <Badge
                      variant="outline"
                      className="border-[#ea7db7] bg-[linear-gradient(0deg,rgba(234,125,183,0.2)_0%,rgba(234,125,183,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] inline-flex items-center gap-[5px] px-2.5 py-2 relative flex-[0_0_auto] rounded-[50px] border border-solid"
                    >
                      <div className="font-bold relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] text-pink text-sm tracking-[0] leading-[14px] whitespace-nowrap">
                        Life
                      </div>
                    </Badge>

                    <div className="flex flex-col items-end gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
                      <div className="gap-[5px] px-2.5 py-[5px] bg-white rounded-[15px] overflow-hidden inline-flex items-start relative flex-[0_0_auto]">
                        <div className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-blue text-sm text-right tracking-[0] leading-[18.2px] whitespace-nowrap">
                          productdesign.com
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-[15px] relative self-stretch w-full flex-[0_0_auto]">
                    <div className="relative self-stretch mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-dark-grey text-[22px] tracking-[0] leading-[33px]">
                      AI Agents Problems No One Talks About
                    </div>

                    <div className="flex flex-col items-start gap-[15px] p-2.5 relative self-stretch w-full flex-[0_0_auto] rounded-lg bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
                      <div className="relative self-stretch mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-dark-grey text-base tracking-[0] leading-6">
                        &quot;Explore the world through window, what&apos;s
                        inside?&quot;
                      </div>

                      <div className="flex items-start justify-between relative self-stretch w-full flex-[0_0_auto]">
                        <div className="inline-flex items-center gap-2 relative flex-[0_0_auto]">
                          <Avatar className="w-4 h-4">
                            <AvatarImage src="https://c.animaapp.com/mftvplqrDArMzQ/img/-profile-image.png" />
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>

                          <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-medium-dark-grey text-sm tracking-[0] leading-[19.6px] whitespace-nowrap">
                            User Name
                          </div>
                        </div>

                        <div className="inline-flex h-[25px] items-center gap-5 relative flex-[0_0_auto]">
                          <div className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-sm tracking-[0] leading-[23px] whitespace-nowrap">
                            Today
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
