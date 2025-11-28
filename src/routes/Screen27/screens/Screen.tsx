import { XIcon } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../../components/ui/button";

export const Screen = (): JSX.Element => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="inline-flex flex-col items-center justify-center gap-10 pt-[100px] pb-[50px] px-10 bg-white rounded-[15px] relative shadow-lg">
        <button 
          className="absolute right-6 top-6 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <XIcon className="h-6 w-6" />
          <span className="sr-only">Close</span>
        </button>

        <div className="inline-flex flex-col items-center justify-center gap-[30px] px-[30px] py-0 relative flex-[0_0_auto]">
          <div className="inline-flex flex-col items-center justify-center gap-[25px] relative flex-[0_0_auto]">
            <h1 className="relative w-[400px] mt-[-1.00px] font-h3-s font-[number:var(--h3-s-font-weight)] text-off-black text-[length:var(--h3-s-font-size)] text-center tracking-[var(--h3-s-letter-spacing)] leading-[var(--h3-s-line-height)] [font-style:var(--h3-s-font-style)]">
              Are you sure you want to delete your account?
            </h1>
          </div>

          <div className="inline-flex items-center justify-center gap-[15px] relative flex-[0_0_auto]">
            <Button
              variant="ghost"
              className="inline-flex h-[45px] items-center justify-center gap-[30px] px-[30px] py-2.5 relative flex-[0_0_auto] rounded-[15px] h-auto hover:bg-transparent"
              asChild
            >
              <Link to="/setting">
                <span className="relative w-fit mt-[-3.50px] font-h-4 font-[number:var(--h-4-font-weight)] text-dark-grey text-[length:var(--h-4-font-size)] tracking-[var(--h-4-letter-spacing)] leading-[var(--h-4-line-height)] whitespace-nowrap [font-style:var(--h-4-font-style)]">
                  Cancel
                </span>
              </Link>
            </Button>

            <Button
              variant="outline"
              className="inline-flex h-[45px] items-center justify-center gap-[15px] px-[30px] py-2.5 relative flex-[0_0_auto] rounded-[50px] border border-solid border-[#f23a00] bg-transparent text-red hover:bg-red hover:text-white h-auto transition-colors"
              asChild
            >
              <Link to="/">
                <span className="relative w-fit mt-[-2.50px] mb-[-0.50px] [font-family:'Lato',Helvetica] font-semibold text-xl tracking-[0] leading-7 whitespace-nowrap">
                  Yes
                </span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
