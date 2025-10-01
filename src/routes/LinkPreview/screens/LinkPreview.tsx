import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";

export const LinkPreview = (): JSX.Element => {
  const [isClicked, setIsClicked] = useState(false);

  return (
    <div className="w-full min-h-screen bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
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

      <main className="flex justify-center w-full">
        <div className="w-[1120px] max-w-[1120px] px-10 py-10">
          <div className="flex flex-col items-start gap-10 w-full">
            <article className="flex flex-col items-start gap-[30px] pt-[30px] pb-10 px-0 w-full border-b border-white">
              <div className="flex flex-col items-start gap-5 w-full">
                <div className="flex justify-start w-full">
                  <Badge
                    variant="secondary"
                    className="flex items-center justify-center w-fit [font-family:'Lato',Helvetica] font-normal text-yellow text-base text-center tracking-[0] leading-5 whitespace-nowrap bg-transparent border-0"
                  >
                    Academic
                  </Badge>
                </div>

                <h1 className="w-full [font-family:'Lato',Helvetica] font-medium text-off-black text-[40px] tracking-[0] leading-[56px]">
                  We overestimate AI's impact in the short-term and underestimate it long-term
                </h1>
              </div>

              <div className="flex items-start gap-[60px] w-full">
                <img
                  className="w-[552px] h-[310px] rounded-lg object-cover border border-solid border-white"
                  alt="Featured article image"
                  src="https://c.animaapp.com/mfuxsdcbXwMuVe/img/image.png"
                />

                <Card className="flex flex-col h-[310px] items-start justify-between p-[30px] flex-1 bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] border border-solid border-white shadow-none rounded-lg">
                  <CardContent className="p-0 w-full h-full flex flex-col justify-between">
                    <blockquote className="flex items-start gap-5 w-full">
                      <div className="w-fit whitespace-nowrap [font-family:'Lato',Helvetica] font-bold text-red text-[50px] tracking-[0] leading-[80px]">
                        &quot;
                      </div>

                      <div className="flex-1 [font-family:'Lato',Helvetica] font-light text-[#231f20] text-xl tracking-[0] leading-8">
                        As a developer, I am always wondering how much AI could possibly effect my career and I think I feel more confident after reading this article.
                      </div>

                      <div className="self-end [font-family:'Lato',Helvetica] font-bold text-red text-[50px] tracking-[0] leading-[80px]">
                        &quot;
                      </div>
                    </blockquote>

                    <div className="flex items-start justify-between w-full">
                      <div className="inline-flex items-center gap-2.5">
                        <Avatar className="w-[25px] h-[25px]">
                          <AvatarImage
                            src="https://c.animaapp.com/mfuxsdcbXwMuVe/img/-profile-image.svg"
                            alt="Profile image"
                            className="object-cover"
                          />
                          <AvatarFallback>UN</AvatarFallback>
                        </Avatar>

                        <div className="[font-family:'Lato',Helvetica] font-semibold text-dark-grey text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                          User Name
                        </div>
                      </div>

                      <div className="inline-flex h-[25px] items-center gap-5">
                        <time className="[font-family:'Lato',Helvetica] font-normal text-dark-grey text-base tracking-[0] leading-[23px] whitespace-nowrap">
                          Nov 15, 2022
                        </time>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </article>

            <div className="flex justify-between w-full items-center">
              <Button className="inline-flex items-center justify-center gap-[15px] px-[30px] py-2 bg-red rounded-[100px] border border-solid border-[#f23a00] text-white hover:bg-red/90 h-auto">
                <div className="flex items-center justify-center w-fit [font-family:'Lato',Helvetica] font-bold text-xl tracking-[0] leading-[30px] whitespace-nowrap">
                  Visit
                </div>

                <img
                  className="w-[31px] h-[14.73px]"
                  alt="Arrow"
                  src="https://c.animaapp.com/mfuxsdcbXwMuVe/img/arrow-1.svg"
                />
              </Button>

              <div className="inline-flex items-center gap-[15px]">
                <Button
                  className={`inline-flex items-center justify-center gap-2.5 px-[15px] py-2 rounded-[50px] border border-solid border-[#e19e1d] transition-all ${
                    isClicked 
                      ? 'bg-[#e19e1d] text-white' 
                      : 'bg-white text-dark-grey hover:bg-[#e19e1d]/10'
                  }`}
                  onClick={() => setIsClicked(!isClicked)}
                >
                  <img
                    className="w-3.5 h-[22px]"
                    alt="Treasure icon"
                    src="https://c.animaapp.com/mfuxsdcbXwMuVe/img/treasure-icon.svg"
                    style={{ filter: isClicked ? 'brightness(0) invert(1)' : 'none' }}
                  />

                  <div className="[font-family:'Lato',Helvetica] font-normal text-lg text-center tracking-[0] leading-5 whitespace-nowrap">
                    999
                  </div>
                </Button>

                <img
                  className="w-[38px]"
                  alt="Share"
                  src="https://c.animaapp.com/mfuxsdcbXwMuVe/img/share.svg"
                />

                <div className="inline-flex items-center gap-[5px]">
                  <img
                    className="w-[21px] h-[15px]"
                    alt="Ic view"
                    src="https://c.animaapp.com/mfuxsdcbXwMuVe/img/ic-view.svg"
                  />

                  <div className="[font-family:'Lato',Helvetica] font-normal text-dark-grey text-lg text-center tracking-[0] leading-5 whitespace-nowrap">
                    999
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
