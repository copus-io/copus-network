import React from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage } from "../../ui/avatar";
import { Button } from "../../ui/button";
import { Separator } from "../../ui/separator";

interface HeaderSectionProps {
  isLoggedIn?: boolean;
}

export const HeaderSection = ({ isLoggedIn = true }: HeaderSectionProps): JSX.Element => {
  return (
    <header className="flex items-center justify-between p-[30px] w-full bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] fixed top-0 left-0 right-0 z-40">
      <div className="flex items-center gap-[15px]">
        <Link to="/discovery" className="flex w-[45px] h-[45px] items-center justify-center rounded-full bg-red">
          <img
            className="w-7 h-7"
            alt="Ic fractopus open"
            src="https://c.animaapp.com/mft9nppdGctUh1/img/ic-fractopus-open.svg"
          />
        </Link>

        <Link to="/discovery" className="[font-family:'Lato',Helvetica] font-bold text-dark-grey text-lg tracking-[0.90px] leading-[27px] whitespace-nowrap">
          Copus
        </Link>

        <Separator
          orientation="vertical"
          className="h-6 bg-[#a8a8a8] mx-[15px]"
        />

        <div className="[font-family:'Lato',Helvetica] font-light text-dark-grey text-lg leading-[27px] whitespace-nowrap">
          Human Internet
        </div>
      </div>

      <div className="flex items-center gap-5">
        {isLoggedIn ? (
          <>
        <Button
          variant="outline"
          className="flex items-center gap-[15px] px-5 py-2.5 h-auto rounded-[50px] border-red text-red hover:bg-[#f23a00]/10 hover:text-red transition-colors"
          asChild
        >
          <Link to="/create">
            <img
              className="w-5 h-5"
              alt="Vector"
              src="https://c.animaapp.com/mft4oqz6uyUKY7/img/vector.svg"
            />
            <span className="[font-family:'Lato',Helvetica] font-bold text-lg leading-5 text-red">
              Create
            </span>
          </Link>
        </Button>

            <Link to="/notification" className="block">
              <img
                className="w-[47px] h-[47px]"
                alt="Notification"
                src="https://c.animaapp.com/mft4oqz6uyUKY7/img/notification.svg"
              />
            </Link>

            <Link to="/my-treasury">
              <Avatar className="w-[47px] h-[47px]">
                <AvatarImage
                  src="https://c.animaapp.com/mft4oqz6uyUKY7/img/avatar.png"
                  alt="Avatar"
                />
              </Avatar>
            </Link>
          </>
        ) : (
          <Button
            variant="outline"
            className="inline-flex items-center justify-center gap-[15px] px-5 py-2.5 h-auto bg-white rounded-[50px] border border-solid border-[#454545] [font-family:'Lato',Helvetica] font-semibold text-dark-grey text-lg tracking-[0] leading-[27px] whitespace-nowrap hover:bg-gray-50"
            asChild
          >
            <Link to="/login">Log in / Sign up</Link>
          </Button>
        )}
      </div>
    </header>
  );
};
