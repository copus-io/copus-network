import React, { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { HeaderSection } from "../../components/shared/HeaderSection/HeaderSection";
import { SideMenuSection } from "../../components/shared/SideMenuSection/SideMenuSection";
import { SpaceContentSection } from "./sections/SpaceContentSection";
import { useUser } from "../../contexts/UserContext";

export const Space = (): JSX.Element => {
  const location = useLocation();
  const { namespace } = useParams<{ namespace?: string }>();
  const { user } = useUser();

  // Determine if viewing another user's space (not own)
  const isViewingOtherUser = !!namespace && namespace !== user?.namespace;

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Only highlight "Treasury" in nav when viewing own treasury, not other users'
  const activeMenuItem = isViewingOtherUser ? undefined : "treasury";

  return (
    <div className="w-full min-h-screen bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
      <HeaderSection />
      <SideMenuSection activeItem={activeMenuItem} />
      <div className="lg:ml-[360px] lg:mr-[40px] min-h-screen overflow-y-auto pt-[70px] lg:pt-[110px] pb-[100px]">
        <SpaceContentSection />
      </div>
    </div>
  );
};
