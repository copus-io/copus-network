import React from "react";
import { useLocation } from "react-router-dom";
import { HeaderSection } from "../../components/shared/HeaderSection/HeaderSection";
import { SideMenuSection } from "../../components/shared/SideMenuSection/SideMenuSection";
import { DiscoveryContentSection } from "./sections/DiscoveryContentSection/DiscoveryContentSection";
import { useUser } from "../../contexts/UserContext";

export const Discovery = (): JSX.Element => {
  const { isLoggedIn } = useUser();
  const location = useLocation();

  // Scroll to top when page loads
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Listen to route changes for debugging route navigation events
  React.useEffect(() => {
    console.log('Entered discovery page, current route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="w-full min-h-screen bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
      <HeaderSection />
      <SideMenuSection activeItem="discovery" />
      <div className="lg:ml-[310px] lg:mr-[40px] min-h-screen overflow-visible pt-[50px] lg:pt-[80px] pb-[100px]">
        <DiscoveryContentSection />
      </div>
    </div>
  );
};