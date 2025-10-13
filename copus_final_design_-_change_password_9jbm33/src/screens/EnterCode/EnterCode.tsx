import { EyeIcon, EyeOffIcon, XIcon } from "lucide-react";
import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";

export const EnterCode = (): JSX.Element => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:0ms]">
      <Card
        className="w-[600px] bg-white rounded-[15px] border-0 shadow-lg"
        data-model-id="9134:12088"
      >
        <CardContent className="flex flex-col items-center justify-center gap-5 p-[30px]">
          <div className="flex justify-end w-full">
            <Button variant="ghost" size="sm" className="h-auto p-1">
              <XIcon className="w-5 h-5 text-gray-500" />
            </Button>
          </div>

          <div className="flex flex-col w-[555px] items-start gap-2.5 pt-0 pb-[25px] px-0">
            <div className="inline-flex flex-col items-start justify-center gap-[15px]">
              <h2 className="[font-family:'Lato',Helvetica] font-semibold text-off-black text-xl tracking-[0] leading-[23px] whitespace-nowrap translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]">
                Change password
              </h2>

              <div className="flex flex-col gap-[15px] w-[555px] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms]">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    defaultValue="********"
                    className="w-full h-[52px] px-3 py-2.5 bg-monowhite rounded-lg border-2 border-[#ffffff] shadow-inputs font-p font-[number:var(--p-font-weight)] text-dark-grey text-[length:var(--p-font-size)] pr-12"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-auto p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="w-5 h-5 text-gray-500" />
                    ) : (
                      <EyeIcon className="w-5 h-5 text-gray-500" />
                    )}
                  </Button>
                </div>

                <div className="relative">
                  <Input
                    type="text"
                    defaultValue="12345678"
                    className="w-full h-[52px] px-3 py-2.5 bg-monowhite rounded-lg border-2 border-[#ffffff] shadow-inputs font-p font-[number:var(--p-font-weight)] text-dark-grey text-[length:var(--p-font-size)] pr-12"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <img
                      className="w-5 h-[13px]"
                      alt="Vector"
                      src="https://c.animaapp.com/mg9isbvz7JX80a/img/vector.svg"
                    />
                  </div>
                </div>
              </div>

              <p className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[normal] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:600ms]">
                You can use lower case, upper case, number, and punctuation.{" "}
                <br />
                Maximum XX characters.
              </p>
            </div>

            <div className="flex items-center justify-end gap-5 pt-[30px] w-full translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:800ms]">
              <Button
                variant="ghost"
                className="h-auto px-5 py-2.5 rounded-[15px] font-p-l font-[number:var(--p-l-font-weight)] text-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] [font-style:var(--p-l-font-style)] hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Button>

              <Button className="h-auto px-5 py-2.5 bg-red rounded-[50px] [font-family:'Lato',Helvetica] font-bold text-white text-lg tracking-[0] leading-[25.2px] hover:bg-red/90 transition-colors">
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
