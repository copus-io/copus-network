import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
import { Input } from "../../components/ui/input";
import { Separator } from "../../components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";

const socialProviders = [
  {
    name: "Google",
    icon: "https://c.animaapp.com/mftc49qfOGKRUh/img/frame-1-3.svg",
  },
  {
    name: "Facebook",
    icon: "https://c.animaapp.com/mftc49qfOGKRUh/img/frame-1.svg",
  },
  {
    name: "X",
    icon: "https://c.animaapp.com/mftc49qfOGKRUh/img/frame-1-2.svg",
  },
  {
    name: "Metamask",
    icon: "https://c.animaapp.com/mftc49qfOGKRUh/img/frame-1.svg",
  },
];

export const Login = (): JSX.Element => {
  const [rememberMe, setRememberMe] = useState(true);

  return (
    <div className="w-full min-h-screen flex bg-[linear-gradient(0deg,rgba(224,224,224,0.15)_0%,rgba(224,224,224,0.15)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
      <div className="flex w-full h-screen relative flex-col items-center">
        <header className="flex items-start justify-between px-[30px] py-5 relative w-full flex-[0_0_auto] bg-transparent">
          <Link to="/discovery" className="flex w-[45px] h-[45px] items-center justify-center gap-2.5 p-2.5 relative bg-red rounded-[100px]">
            <img
              className="relative w-7 h-7 mt-[-1.50px] mb-[-1.50px] ml-[-1.50px] mr-[-1.50px]"
              alt="Ic fractopus open"
              src="https://c.animaapp.com/mftc49qfOGKRUh/img/ic-fractopus-open-1.svg"
            />
          </Link>

          <Link to="/discovery" className="inline-flex items-center justify-end relative flex-[0_0_auto] rounded-[10px_10px_0px_0px]">
            <div className="relative flex items-center justify-center w-fit font-p-l font-[number:var(--p-l-font-weight)] text-dark-grey text-[length:var(--p-l-font-size)] text-center tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
              Discover now
            </div>
          </Link>
        </header>

        <main className="inline-flex items-center gap-2.5 relative flex-1 grow">
          <Card className="w-[480px] bg-white rounded-lg border-0 shadow-none">
            <CardContent className="flex flex-col items-center justify-center gap-[50px] px-[50px] py-[60px]">
              <div className="flex flex-col items-start gap-[15px] relative self-stretch w-full flex-[0_0_auto]">
                <h1 className="relative self-stretch mt-[-1.00px] font-h-3 font-[number:var(--h-3-font-weight)] text-off-black text-[length:var(--h-3-font-size)] text-center tracking-[var(--h-3-letter-spacing)] leading-[var(--h-3-line-height)] [font-style:var(--h-3-font-style)]">
                  Join Copus
                </h1>

                <p className="relative self-stretch font-h-4 font-[number:var(--h-4-font-weight)] text-dark-grey text-[length:var(--h-4-font-size)] text-center tracking-[var(--h-4-letter-spacing)] leading-[var(--h-4-line-height)] [font-style:var(--h-4-font-style)]">
                  Discover and share valuable digital gem
                </p>
              </div>

              <div className="flex flex-col items-center justify-center gap-[30px] relative self-stretch w-full flex-[0_0_auto]">
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-transparent h-auto p-0">
                    <TabsTrigger
                      value="login"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#454545] data-[state=inactive]:border-b-0 rounded-none pb-2.5 px-[15px] bg-transparent"
                    >
                      <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-dark-grey text-lg text-center tracking-[0] leading-[25.2px] whitespace-nowrap">
                        Log in
                      </div>
                    </TabsTrigger>
                    <TabsTrigger
                      value="signup"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=inactive]:bg-transparent rounded-none pb-2.5 px-[15px]"
                      asChild
                    >
                      <Link to="/signup">
                        <div className="relative w-fit mt-[-1.00px] font-p-l font-[number:var(--p-l-font-weight)] text-dark-grey text-[length:var(--p-l-font-size)] text-center tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
                          Sign up
                        </div>
                      </Link>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="mt-[30px]">
                    <div className="flex-col items-start gap-[15px] self-stretch w-full flex-[0_0_auto] flex relative">
                      <Input
                        placeholder="Email"
                        className="flex items-center gap-[213px] p-[15px] relative self-stretch w-full flex-[0_0_auto] bg-white rounded-[15px] border border-solid border-[#a8a8a8] font-p-l font-[number:var(--p-l-font-weight)] text-medium-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] [font-style:var(--p-l-font-style)] h-auto"
                      />

                      <Input
                        type="password"
                        placeholder="Password"
                        className="flex items-center gap-64 p-[15px] relative self-stretch w-full flex-[0_0_auto] bg-white rounded-[15px] border border-solid border-[#a8a8a8] font-p-l font-[number:var(--p-l-font-weight)] text-medium-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] [font-style:var(--p-l-font-style)] h-auto"
                      />

                      <div className="flex items-center justify-between pt-[5px] pb-2.5 px-0 relative self-stretch w-full flex-[0_0_auto]">
                        <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]">
                          <Checkbox
                            id="remember"
                            checked={rememberMe}
                            onCheckedChange={setRememberMe}
                            className="w-[18px] h-[18px] rounded-[9px] border border-solid border-[#231f20] data-[state=checked]:bg-button-green data-[state=checked]:border-[#231f20]"
                          />

                          <label
                            htmlFor="remember"
                            className="relative w-fit mt-[-1.00px] font-p font-[number:var(--p-font-weight)] text-off-black text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] whitespace-nowrap [font-style:var(--p-font-style)] cursor-pointer"
                          >
                            Remember me
                          </label>
                        </div>

                        <Button
                          variant="ghost"
                          className="h-auto p-0 hover:bg-transparent"
                        >
                          <div className="relative w-fit mt-[-1.00px] font-p font-[number:var(--p-font-weight)] text-off-black text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] whitespace-nowrap [font-style:var(--p-font-style)]">
                            Forgot password?
                          </div>
                        </Button>
                      </div>
                    </div>

                    <Button 
                      className="flex items-center justify-center gap-[30px] px-10 py-2.5 relative self-stretch w-full flex-[0_0_auto] rounded-[100px] border border-solid border-[#f23a00] bg-transparent hover:bg-red/5 mt-[30px] h-auto"
                      asChild
                    >
                      <Link to="/discovery">
                        <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-red text-lg text-right tracking-[0] leading-[25.2px] whitespace-nowrap">
                          Log in
                        </div>
                      </Link>
                    </Button>
                  </TabsContent>

                  <TabsContent value="signup" className="mt-[30px]">
                    {/* This content won't be shown since clicking the tab redirects to /signup */}
                  </TabsContent>
                </Tabs>
              </div>

              <div className="flex flex-col items-start gap-5 self-stretch w-full relative flex-[0_0_auto]">
                <div className="gap-[15px] pt-5 pb-2.5 px-0 self-stretch w-full flex-[0_0_auto] rounded-[25px] overflow-hidden flex items-center justify-center relative">
                  <Separator className="flex-1 bg-medium-dark-grey" />

                  <div className="relative flex items-center justify-center w-fit mt-[-1.00px] font-p font-[number:var(--p-font-weight)] text-medium-dark-grey text-[length:var(--p-font-size)] text-center tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] whitespace-nowrap [font-style:var(--p-font-style)] px-4">
                    Or sign in with
                  </div>

                  <Separator className="flex-1 bg-medium-dark-grey" />
                </div>

                <div className="flex flex-wrap items-start justify-center gap-[5px_30px] relative self-stretch w-full flex-[0_0_auto]">
                  {socialProviders.map((provider, index) => (
                    <Button
                      key={`social-${index}`}
                      variant="ghost"
                      className="flex-col w-[66px] gap-[5px] flex items-center justify-center relative h-auto p-0 hover:bg-transparent"
                    >
                      <img
                        className="w-[30px] relative flex-[0_0_auto]"
                        alt={`${provider.name} icon`}
                        src={provider.icon}
                      />

                      <div className="relative flex items-center justify-center w-fit [font-family:'Maven_Pro',Helvetica] font-normal text-off-black text-sm text-center tracking-[0] leading-[19.6px] whitespace-nowrap">
                        {provider.name}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <img
            className="absolute top-[350px] left-[-480px] w-[399px] h-[493px]"
            alt="Ic fractopus open"
            src="https://c.animaapp.com/mftc49qfOGKRUh/img/ic-fractopus-open.svg"
          />
        </main>
      </div>
    </div>
  );
};
