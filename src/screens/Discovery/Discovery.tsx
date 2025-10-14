import React from "react";
import { useLocation } from "react-router-dom";
import { HeaderSection } from "../../components/shared/HeaderSection/HeaderSection";
import { SideMenuSection } from "../../components/shared/SideMenuSection/SideMenuSection";
import { DiscoveryContentSection } from "./sections/DiscoveryContentSection/DiscoveryContentSection";
import { useUser } from "../../contexts/UserContext";

export const Discovery = (): JSX.Element => {
  const { isLoggedIn } = useUser();
  const location = useLocation();

  // 监听路由变化，用于调试路由导航事件
  React.useEffect(() => {
    console.log('🏠 进入发现页面，当前路由:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="w-full min-h-screen bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
      <HeaderSection isLoggedIn={isLoggedIn} />
      <SideMenuSection activeItem="discovery" />
      <div className="ml-[360px] mr-[70px] min-h-screen overflow-y-auto pt-[120px] pb-[100px] overflow-x-visible">
        <DiscoveryContentSection />
      </div>
    </div>
  );
};
