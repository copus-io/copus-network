import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { HeaderSection } from "../../components/shared/HeaderSection/HeaderSection";
import { SideMenuSection } from "../../components/shared/SideMenuSection/SideMenuSection";
import { FollowingAuthorSection } from "./sections/FollowingAuthorSection";
import { SEO } from "../../components/SEO/SEO";

export const Following = (): JSX.Element => {
  const location = useLocation();
  const [showSubscriptionsPopup, setShowSubscriptionsPopup] = useState(false);

  // Scroll to top when page loads
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="w-full min-h-screen bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
      <SEO title="Subscriptions" />
      <HeaderSection />
      <SideMenuSection activeItem="following" />
      <div className="lg:ml-[310px] lg:mr-[40px] min-h-screen overflow-y-auto pt-[64px] lg:pt-[72px] pb-[100px] overflow-x-visible">

        {/* Page Title + My Subscriptions button */}
        <div className="mb-3 px-2.5 lg:pl-2.5 lg:pr-0 flex items-center justify-between">
          <h1 className="text-[20px] font-normal text-off-black [font-family:'Lato',Helvetica] leading-[1.4]">
            New Update
          </h1>
          <button
            onClick={() => setShowSubscriptionsPopup(true)}
            className="bg-white border border-gray-200 rounded-full px-4 py-2.5 [font-family:'Lato',Helvetica] text-sm font-normal text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            My Subscriptions
          </button>
        </div>

        {/* Author Content */}
        <FollowingAuthorSection
          showSubscriptionsPopup={showSubscriptionsPopup}
          setShowSubscriptionsPopup={setShowSubscriptionsPopup}
        />
      </div>
    </div>
  );
};
