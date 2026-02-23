import React from "react";
import { useLocation } from "react-router-dom";
import { HeaderSection } from "../../components/shared/HeaderSection/HeaderSection";
import { SideMenuSection } from "../../components/shared/SideMenuSection/SideMenuSection";
import { FollowingAuthorSection } from "./sections/FollowingAuthorSection";
import { SEO } from "../../components/SEO/SEO";

export const Following = (): JSX.Element => {
  const location = useLocation();

  // Scroll to top when page loads
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="w-full min-h-screen bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
      <SEO title="Subscriptions" />
      <HeaderSection />
      <SideMenuSection activeItem="following" />
      <div className="lg:ml-[360px] lg:mr-[40px] min-h-screen overflow-y-auto pt-[80px] lg:pt-[110px] pb-[100px] overflow-x-visible">

        {/* Page Title */}
        <div className="mb-6 px-2.5 lg:pl-2.5 lg:pr-0">
          <h1 className="text-2xl font-bold text-off-black [font-family:'Lato',Helvetica]">
            My Subscriptions
          </h1>
        </div>

        {/* Author Content */}
        <FollowingAuthorSection />
      </div>
    </div>
  );
};
