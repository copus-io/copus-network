import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Separator } from "../components/ui/separator";

export const LinkPreview = (): JSX.Element => {
  return (
    <div className="w-full max-w-[1440px] mx-auto flex justify-center overflow-hidden bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
      <div className="flex mt-0 w-full max-w-[1440px] min-h-[855px] ml-0 relative flex-col items-start">
        <header className="flex items-start justify-between p-[30px] relative self-stretch w-full flex-[0_0_auto] bg-transparent">
          <div className="inline-flex items-center gap-[15px] relative flex-[0_0_auto]">
            <div className="flex w-[45px] h-[45px] items-center justify-center gap-2.5 p-2.5 relative bg-red rounded-[100px]">
              <img
                className="relative w-7 h-7 mt-[-1.50px] mb-[-1.50px] ml-[-1.50px] mr-[-1.50px]"
                alt="Ic fractopus open"
                src="https://c.animaapp.com/mg1z5yfj4I9HZO/img/ic-fractopus-open.svg"
              />
            </div>

            <div className="relative w-fit [font-family:'Lato',Helvetica] font-bold text-dark-grey text-lg tracking-[0.90px] leading-[27px] whitespace-nowrap">
              Copus
            </div>

            <Separator orientation="vertical" className="h-6 bg-[#a8a8a8]" />

            <div className="inline-flex items-center justify-center gap-2.5 pl-[15px] pr-0 py-0 relative flex-[0_0_auto]">
              <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-light text-dark-grey text-lg tracking-[0] leading-[27px] whitespace-nowrap">
                Human Internet
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-5 relative flex-[0_0_auto]">
            <Button
              variant="outline"
              className="h-[47px] gap-[15px] px-5 py-2 rounded-[50px] border-[#f23a00] text-red hover:bg-red/10"
            >
              <img
                className="relative w-5 h-5"
                alt="Vector"
                src="https://c.animaapp.com/mg1z5yfj4I9HZO/img/vector.svg"
              />
              <span className="[font-family:'Lato',Helvetica] font-bold text-lg tracking-[0] leading-[27px]">
                Create
              </span>
            </Button>

            <img
              className="relative w-[47px] h-[47px]"
              alt="Notification"
              src="https://c.animaapp.com/mg1z5yfj4I9HZO/img/notification.svg"
            />

            <Avatar className="w-[47px] h-[47px]">
              <AvatarImage
                src="https://c.animaapp.com/mg1z5yfj4I9HZO/img/avatar.png"
                alt="Avatar"
              />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex flex-col items-start gap-[30px] pt-5 pb-10 px-[200px] relative flex-1 self-stretch w-full grow">
          <article className="flex flex-col items-start justify-between pt-0 pb-[30px] px-0 relative flex-1 self-stretch w-full grow border-b-2 [border-bottom-style:solid] border-[#ffffff]">
            <div className="flex flex-col items-start gap-[30px] self-stretch w-full relative flex-[0_0_auto]">
              <div className="flex items-start gap-[30px] pt-0 pb-[30px] px-0 relative self-stretch w-full flex-[0_0_auto]">
                <div className="flex flex-col h-[205px] items-start justify-between relative flex-1 grow">
                  <Badge
                    variant="secondary"
                    className="bg-transparent border-0 p-0 h-auto"
                  >
                    <div className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-yellow text-base text-center tracking-[0] leading-5 whitespace-nowrap">
                      Academic
                    </div>
                  </Badge>

                  <h1 className="relative self-stretch [font-family:'Lato',Helvetica] font-medium text-off-black text-[40px] tracking-[0] leading-[56px]">
                    We overestimate AI&apos;s impact in the short-term and
                    underestimate it <br />
                    long-term
                  </h1>
                </div>

                <div className="relative w-[364px] h-[205px] rounded-lg [background:url(https://c.animaapp.com/mg1z5yfj4I9HZO/img/image.png)_50%_50%_/_cover]" />
              </div>

              <Card className="w-full bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] border-0">
                <CardContent className="p-[30px]">
                  <blockquote className="flex items-start gap-5 relative self-stretch w-full flex-[0_0_auto] mb-5">
                    <div className="w-fit whitespace-nowrap relative mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-red text-[50px] tracking-[0] leading-[80px]">
                      &quot;
                    </div>

                    <div className="relative flex-1 mt-[-1.00px] [font-family:'Lato',Helvetica] font-light text-[#231f20] text-xl tracking-[0] leading-8">
                      As a developer, I am always wondering how much AI could
                      possibly effect my career and I think I feel more
                      confident after reading this article. As a developer, I am
                      always wondering how much AI could possibly effect my
                      career and I think I feel more confident after reading
                      this article.As a developer, I am always wondering how
                      much AI could possibly effect my career and I think I feel
                      more confident.
                    </div>

                    <div className="flex items-end justify-center self-stretch w-5 relative mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-red text-[50px] tracking-[0] leading-[80px]">
                      &quot;
                    </div>
                  </blockquote>

                  <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]">
                    <Avatar className="w-[25px] h-[25px]">
                      <AvatarImage
                        src="https://c.animaapp.com/mg1z5yfj4I9HZO/img/-profile-image.svg"
                        alt="Profile image"
                      />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>

                    <div className="relative w-fit [font-family:'Lato',Helvetica] font-semibold text-dark-grey text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                      User Name
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex h-[25px] items-center justify-between relative self-stretch w-full">
              <time className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-dark-grey text-base tracking-[0] leading-[23px] whitespace-nowrap">
                Nov 15, 2022
              </time>

              <div className="inline-flex items-center gap-5 relative flex-[0_0_auto]">
                <div className="inline-flex items-center gap-[5px] relative flex-[0_0_auto]">
                  <img
                    className="relative w-[21px] h-[15px]"
                    alt="Ic view"
                    src="https://c.animaapp.com/mg1z5yfj4I9HZO/img/ic-view.svg"
                  />

                  <div className="mt-[-1.00px] relative w-fit [font-family:'Lato',Helvetica] font-normal text-dark-grey text-lg text-center tracking-[0] leading-5 whitespace-nowrap">
                    999
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

          <div className="flex justify-between self-stretch w-full items-center relative flex-[0_0_auto]">
            <div className="inline-flex items-center gap-5 relative flex-[0_0_auto]">
              <Button
                variant="outline"
                className="h-auto gap-2.5 px-[15px] py-2 bg-[#e19e1d1a] rounded-[50px] border-[#e19e1d] hover:bg-[#e19e1d2a]"
              >
                <img
                  className="relative w-3.5 h-[22px]"
                  alt="Treasure icon"
                  src="https://c.animaapp.com/mg1z5yfj4I9HZO/img/treasure-icon.svg"
                />

                <span className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-dark-grey text-lg text-center tracking-[0] leading-5 whitespace-nowrap">
                  999
                </span>
              </Button>

              <img
                className="w-[38px] relative self-stretch"
                alt="Share"
                src="https://c.animaapp.com/mg1z5yfj4I9HZO/img/share.svg"
              />
            </div>

            <Button className="h-auto gap-[15px] px-[30px] py-2 bg-red rounded-[100px] border border-solid border-[#f23a00] hover:bg-red/90">
              <span className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-white text-xl tracking-[0] leading-[30px] whitespace-nowrap">
                Visit
              </span>

              <img
                className="relative w-[31px] h-[14.73px] mr-[-1.00px]"
                alt="Arrow"
                src="https://c.animaapp.com/mg1z5yfj4I9HZO/img/arrow-1.svg"
              />
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
};
