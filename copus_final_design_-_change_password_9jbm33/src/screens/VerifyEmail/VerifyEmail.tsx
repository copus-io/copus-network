import { XIcon } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";

export const VerifyEmail = (): JSX.Element => {
  return (
    <Card
      className="w-[600px] bg-white rounded-[15px] translate-y-[-1rem] animate-fade-in opacity-0"
      data-model-id="9134:12044"
    >
      <CardContent className="flex flex-col items-center justify-center gap-5 p-[30px] relative">
        <div className="flex justify-end w-full">
          <XIcon className="w-6 h-6 text-gray-400 cursor-pointer" />
        </div>

        <div className="flex flex-col w-[555px] items-start gap-5 pt-0 pb-[25px] px-0 relative flex-[0_0_auto] ml-[-7.50px] mr-[-7.50px]">
          <div className="flex flex-col items-start gap-[15px] relative self-stretch w-full flex-[0_0_auto]">
            <h2 className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-off-black text-xl tracking-[0] leading-[23px] whitespace-nowrap translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]">
              Change password
            </h2>

            <p className="relative flex items-center justify-center w-fit [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[23px] whitespace-nowrap translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms]">
              Verify your identity first.
            </p>

            <div className="flex h-[51px] items-center justify-between px-3 py-2.5 relative self-stretch w-full bg-monowhite rounded-lg overflow-hidden border-2 border-solid border-[#ffffff] shadow-inputs translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:600ms]">
              <Input
                defaultValue="xxxx@gmail.com"
                className="border-0 bg-transparent p-0 h-auto font-p font-[number:var(--p-font-weight)] text-medium-dark-grey text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] [font-style:var(--p-font-style)] focus-visible:ring-0 focus-visible:ring-offset-0"
                readOnly
              />

              <Badge className="inline-flex items-center justify-center gap-[30px] px-5 py-[5px] relative flex-[0_0_auto] mt-[-0.50px] mb-[-0.50px] bg-white rounded-[100px] border border-solid border-[#2191fb] text-blue hover:bg-white">
                20
              </Badge>
            </div>

            <div className="flex w-[555px] h-[52px] items-center px-3 py-2.5 relative bg-monowhite rounded-lg overflow-hidden border-2 border-solid border-[#ffffff] shadow-inputs translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:800ms]">
              <Input
                defaultValue="122346"
                className="border-0 bg-transparent p-0 h-auto font-p font-[number:var(--p-font-weight)] text-medium-dark-grey text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] [font-style:var(--p-font-style)] focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-5 pt-5 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:1000ms]">
            <Button
              variant="ghost"
              className="inline-flex items-center justify-center gap-[30px] px-5 py-2.5 relative flex-[0_0_auto] rounded-[15px] h-auto hover:bg-transparent"
            >
              <span className="relative w-fit mt-[-2.00px] font-p-l font-[number:var(--p-l-font-weight)] text-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
                Cancel
              </span>
            </Button>

            <Link to="/new-password">
              <Button className="inline-flex items-center justify-center gap-[15px] px-5 py-2.5 relative flex-[0_0_auto] bg-red rounded-[50px] h-auto hover:bg-red/90">
                <span className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-white text-lg tracking-[0] leading-[25.2px] whitespace-nowrap">
                  Verify
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
