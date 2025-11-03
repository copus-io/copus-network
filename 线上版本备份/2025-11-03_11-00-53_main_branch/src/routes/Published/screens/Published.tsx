import React, { useState, useEffect } from "react";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { HeaderSection } from "../../../components/shared/HeaderSection/HeaderSection";
import { SideMenuSection } from "../../../components/shared/SideMenuSection/SideMenuSection";
import { MainContentSection } from "./sections/MainContentSection";

export const Published = (): JSX.Element => {
  const [showAlert, setShowAlert] = useState(true);

  // 3秒后自动隐藏成功提示
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAlert(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full min-h-screen bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
      {showAlert && (
        <Alert className="fixed top-5 left-1/2 transform -translate-x-1/2 w-fit inline-flex items-center justify-center gap-[15px] px-5 py-2.5 rounded-[50px] border border-solid border-[#f23a00] bg-[linear-gradient(0deg,rgba(242,58,0,0.15)_0%,rgba(242,58,0,0.15)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] z-[60] shadow-lg transition-opacity duration-500 animate-fade-in">
          <AlertDescription className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-red text-xl tracking-[0] leading-[30px] whitespace-nowrap">
            You've shared your treasure!
          </AlertDescription>
          <button
            onClick={() => setShowAlert(false)}
            className="ml-2 text-red hover:text-red-700 transition-colors"
            title="关闭"
          >
            ×
          </button>
        </Alert>
      )}

      <HeaderSection isLoggedIn={true} />
      <SideMenuSection activeItem="treasury" />
      <div className="ml-[360px] mr-[70px] min-h-screen overflow-y-auto pt-[120px]">
        <MainContentSection />
      </div>
    </div>
  );
};
