import React from "react";
import { useLocation } from "react-router-dom";
import { HeaderSection } from "../../components/shared/HeaderSection/HeaderSection";
import { SideMenuSection } from "../../components/shared/SideMenuSection/SideMenuSection";
import { FollowingContentSection } from "./sections/FollowingContentSection";

export const Following = (): JSX.Element => {
  const location = useLocation();

  // Scroll to top when page loads
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="w-full min-h-screen bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
      <HeaderSection />
      <SideMenuSection activeItem="following" />
      <div className="lg:ml-[310px] lg:mr-[40px] min-h-screen overflow-y-auto pt-[50px] lg:pt-[62px] pb-[100px] overflow-x-visible">
        <FollowingContentSection />
      </div>
    </div>
  );
};
