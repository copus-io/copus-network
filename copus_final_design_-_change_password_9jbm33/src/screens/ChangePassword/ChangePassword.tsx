import { XIcon } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";

export const ChangePassword = (): JSX.Element => {
  return (
    <Card
      className="w-[600px] bg-white rounded-[15px] translate-y-[-1rem] animate-fade-in opacity-0"
      data-model-id="9134:12006"
    >
      <CardContent className="flex flex-col items-center justify-center gap-5 p-[30px] relative">
        <div className="flex justify-end w-full">
          <Link to="/verify-emailu452">
            <XIcon className="w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors" />
          </Link>
        </div>

        <div className="flex flex-col w-[555px] items-start gap-2.5 pt-0 pb-[25px] px-0 relative flex-[0_0_auto] ml-[-7.50px] mr-[-7.50px] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]">
          <div className="inline-flex flex-col items-start justify-center gap-[15px] relative flex-[0_0_auto]">
            <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-off-black text-xl tracking-[0] leading-[23px] whitespace-nowrap">
              Change password
            </div>

            <div className="relative flex items-center justify-center w-fit [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[23px] whitespace-nowrap">
              Verify your identity first.
            </div>

            <div className="flex w-[555px] items-center justify-between px-3 py-2.5 relative flex-[0_0_auto] bg-monowhite rounded-lg overflow-hidden border-2 border-solid border-[#ffffff] shadow-inputs">
              <Input
                className="border-0 bg-transparent p-0 h-auto font-p font-[number:var(--p-font-weight)] text-medium-dark-grey text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] [font-style:var(--p-font-style)] focus-visible:ring-0"
                defaultValue="xxxx@gmail.com"
                readOnly
              />

              <Button className="inline-flex items-center justify-center gap-[30px] px-[15px] py-[5px] h-auto bg-red rounded-[100px] hover:bg-red/90 transition-colors">
                <span className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-white text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                  Send code
                </span>
              </Button>
            </div>

            <Input
              className="flex w-[555px] h-[52px] items-center px-3 py-2.5 bg-monowhite rounded-lg border-2 border-solid border-[#ffffff] shadow-inputs font-p font-[number:var(--p-font-weight)] text-medium-dark-grey text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] [font-style:var(--p-font-style)] focus-visible:ring-0"
              placeholder="Enter code"
            />
          </div>

          <div className="flex items-center justify-end gap-5 pt-[30px] pb-0 px-0 relative self-stretch w-full flex-[0_0_auto]">
            <Button
              variant="ghost"
              className="inline-flex items-center justify-center gap-[30px] px-5 py-2.5 h-auto rounded-[15px] hover:bg-gray-50 transition-colors"
            >
              <span className="relative w-fit mt-[-2.00px] font-p-l font-[number:var(--p-l-font-weight)] text-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
                Cancel
              </span>
            </Button>

            <Button
              disabled
              className="inline-flex items-center justify-center gap-[15px] px-5 py-2.5 h-auto rounded-[50px] bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] bg-light-grey-transparent hover:bg-light-grey-transparent"
            >
              <span className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-medium-grey text-lg tracking-[0] leading-[25.2px] whitespace-nowrap">
                Verify
              </span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
