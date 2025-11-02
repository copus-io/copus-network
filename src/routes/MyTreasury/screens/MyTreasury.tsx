import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HeaderSection } from "../../../components/shared/HeaderSection/HeaderSection";
import { SideMenuSection } from "../../../components/shared/SideMenuSection/SideMenuSection";
import { MainContentSection } from "./sections/MainContentSection";
import { useUser } from "../../../contexts/UserContext";

export const MyTreasury = (): JSX.Element => {
  const { isLoggedIn, user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to top when page loads
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // 智能重定向：如果是从/my-treasury访问且用户有namespace，重定向到短链接
  React.useEffect(() => {
    // 只有访问/my-treasury路径且用户已登录有namespace时才重定向
    if (location.pathname === '/my-treasury' && user?.namespace && isLoggedIn) {
      navigate(`/u/${user.namespace}`, { replace: true });
    }
  }, [location.pathname, user?.namespace, navigate, isLoggedIn]);

  return (
    <div className="w-full min-h-screen bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
      <HeaderSection isLoggedIn={isLoggedIn} />
      <SideMenuSection activeItem="treasury" />
      <div className="px-4 lg:ml-[360px] lg:mr-[40px] min-h-screen overflow-y-auto pt-[80px] lg:pt-[120px]">
        <MainContentSection />
      </div>
    </div>
  );
};