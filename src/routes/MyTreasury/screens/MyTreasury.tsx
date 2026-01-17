import React from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { HeaderSection } from "../../../components/shared/HeaderSection/HeaderSection";
import { SideMenuSection } from "../../../components/shared/SideMenuSection/SideMenuSection";
import { MainContentSection } from "./sections/MainContentSection";
import { useUser } from "../../../contexts/UserContext";

export const MyTreasury = (): JSX.Element => {
  const { isLoggedIn, user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { namespace } = useParams<{ namespace?: string }>();

  // Determine if viewing another user's treasury (not own)
  const isViewingOtherUser = !!namespace && namespace !== user?.namespace;

  // Scroll to top when page loads
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Smart redirect: if accessing /my-treasury and user has namespace, redirect to short link
  React.useEffect(() => {
    // Only redirect when accessing /my-treasury path and user is logged in with namespace
    if (location.pathname === '/my-treasury' && user?.namespace && isLoggedIn) {
      navigate(`/u/${user.namespace}`, { replace: true });
    }
  }, [location.pathname, user?.namespace, navigate, isLoggedIn]);

  // Only highlight "Treasury" in nav when viewing own treasury, not other users'
  const activeMenuItem = isViewingOtherUser ? undefined : "treasury";

  return (
    <div className="w-full min-h-screen bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
      <HeaderSection />
      <SideMenuSection activeItem={activeMenuItem} />
      <div className="lg:ml-[360px] lg:mr-[40px] min-h-screen overflow-y-auto pt-[70px] lg:pt-[80px] pb-[100px]">
        <MainContentSection />
      </div>
    </div>
  );
};