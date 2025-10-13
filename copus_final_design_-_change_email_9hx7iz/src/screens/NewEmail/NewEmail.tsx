import { XIcon } from "lucide-react";
import React from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export const NewEmail = (): JSX.Element => {
  return (
    <Card
      className="w-[600px] bg-white rounded-[15px] p-0 border-0 shadow-lg translate-y-[-1rem] animate-fade-in opacity-0"
      data-model-id="9134:11968"
    >
      <CardContent className="flex flex-col items-center justify-center gap-5 p-[30px]">
        <div className="flex justify-end w-full">
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1 hover:bg-gray-100"
          >
            <XIcon className="w-5 h-5 text-gray-500" />
          </Button>
        </div>

        <div className="flex flex-col w-[555px] items-start gap-2.5 pt-0 pb-[25px] px-0 ml-[-7.50px] mr-[-7.50px] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]">
          <div className="inline-flex flex-col items-start justify-center gap-[15px]">
            <Label className="[font-family:'Lato',Helvetica] font-semibold text-off-black text-xl tracking-[0] leading-[23px]">
              Email
            </Label>

            <div className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[23px]">
              Enter new email
            </div>

            <div className="flex w-[555px] items-center justify-between px-3 py-2.5 bg-monowhite rounded-lg overflow-hidden border-2 border-solid border-[#ffffff] shadow-inputs">
              <Input
                defaultValue="xxxx@gmail.com"
                className="border-0 bg-transparent p-0 font-p font-[number:var(--p-font-weight)] text-medium-dark-grey text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] [font-style:var(--p-font-style)] focus-visible:ring-0 focus-visible:ring-offset-0"
              />

              <Button className="inline-flex items-center justify-center gap-[30px] px-[15px] py-[5px] bg-red rounded-[100px] h-auto hover:bg-red/90 transition-colors">
                <span className="[font-family:'Lato',Helvetica] font-semibold text-white text-base tracking-[0] leading-[22.4px]">
                  Send code
                </span>
              </Button>
            </div>

            <Input
              placeholder="Enter code"
              className="w-[555px] h-[52px] px-3 py-2.5 bg-monowhite rounded-lg border-2 border-solid border-[#ffffff] shadow-inputs font-p font-[number:var(--p-font-weight)] text-medium-dark-grey text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] [font-style:var(--p-font-style)] focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <div className="flex items-center justify-end gap-5 pt-[30px] pb-0 px-0 w-full translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms]">
            <Button
              variant="ghost"
              className="inline-flex items-center justify-center gap-[30px] px-5 py-2.5 rounded-[15px] h-auto hover:bg-gray-50 transition-colors"
            >
              <span className="font-p-l font-[number:var(--p-l-font-weight)] text-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] [font-style:var(--p-l-font-style)]">
                Cancel
              </span>
            </Button>

            <Button
              disabled
              className="inline-flex items-center justify-center gap-[15px] px-5 py-2.5 rounded-[50px] bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] bg-light-grey-transparent h-auto hover:bg-light-grey-transparent"
            >
              <span className="[font-family:'Lato',Helvetica] font-bold text-medium-grey text-lg tracking-[0] leading-[25.2px]">
                Save
              </span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
