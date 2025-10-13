import { XIcon } from "lucide-react";
import React from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";

export const VerifyEmail = (): JSX.Element => {
  return (
    <Card
      className="w-[600px] bg-white rounded-[15px] translate-y-[-1rem] animate-fade-in opacity-0"
      data-model-id="9133:11817"
    >
      <CardContent className="flex flex-col items-center justify-center gap-5 p-[30px] relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 h-auto p-1 hover:bg-gray-100"
        >
          <XIcon className="h-5 w-5 text-gray-500" />
        </Button>

        <div className="flex flex-col w-[555px] items-start gap-5 pt-0 pb-[25px] px-0 relative flex-[0_0_auto] ml-[-7.50px] mr-[-7.50px] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]">
          <div className="flex flex-col items-start gap-[15px] relative self-stretch w-full flex-[0_0_auto]">
            <h2 className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-off-black text-xl tracking-[0] leading-[23px] whitespace-nowrap">
              Email
            </h2>

            <p className="relative flex items-center justify-center w-fit [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[23px] whitespace-nowrap">
              Verify your identity first.
            </p>

            <div className="flex h-[51px] items-center justify-between px-3 py-2.5 relative self-stretch w-full bg-monowhite rounded-lg overflow-hidden border-2 border-solid border-[#ffffff] shadow-inputs">
              <Input
                defaultValue="xxxx@gmail.com"
                className="border-0 bg-transparent p-0 h-auto font-p font-[number:var(--p-font-weight)] text-medium-dark-grey text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] [font-style:var(--p-font-style)] focus-visible:ring-0 focus-visible:ring-offset-0"
                readOnly
              />

              <div className="inline-flex items-center justify-center gap-[30px] px-5 py-[5px] relative flex-[0_0_auto] mt-[-0.50px] mb-[-0.50px] bg-white rounded-[100px] border border-solid border-[#2191fb]">
                <span className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-blue text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                  20
                </span>
              </div>
            </div>

            <Input
              defaultValue="122346"
              className="flex w-[555px] h-[52px] items-center px-3 py-2.5 bg-monowhite rounded-lg border-2 border-solid border-[#ffffff] shadow-inputs font-p font-[number:var(--p-font-weight)] text-medium-dark-grey text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] [font-style:var(--p-font-style)]"
            />
          </div>

          <div className="flex items-center justify-end gap-5 pt-5 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms]">
            <Button
              variant="ghost"
              className="inline-flex items-center justify-center gap-[30px] px-5 py-2.5 relative flex-[0_0_auto] rounded-[15px] h-auto hover:bg-gray-50"
            >
              <span className="relative w-fit mt-[-2.00px] font-p-l font-[number:var(--p-l-font-weight)] text-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
                Cancel
              </span>
            </Button>

            <Button className="inline-flex items-center justify-center gap-[15px] px-5 py-2.5 relative flex-[0_0_auto] bg-red rounded-[50px] h-auto hover:bg-red/90 transition-colors">
              <span className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-white text-lg tracking-[0] leading-[25.2px] whitespace-nowrap">
                Verify
              </span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
