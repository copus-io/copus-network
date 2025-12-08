import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { HeaderSection } from '../shared/HeaderSection/HeaderSection';
import { SideMenuSection } from '../shared/SideMenuSection/SideMenuSection';

interface PageWrapperProps {
  children: React.ReactNode;
  activeMenuItem?: string;
  requireAuth?: boolean;
  className?: string;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  activeMenuItem = 'discovery',
  requireAuth = false,
  className = '',
}) => {
  const { user } = useUser();
  const isLoggedIn = !!user;
  const location = useLocation();

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeMenuItem, location.pathname]);

  return (
    <div className={`w-full min-h-screen bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] ${className}`}>
      <HeaderSection />
      <SideMenuSection activeItem={activeMenuItem} />
      <div className="lg:ml-[360px] lg:mr-[40px] min-h-screen overflow-y-auto pt-[80px] lg:pt-[110px] pb-[100px] overflow-x-visible">
        {children}
      </div>
    </div>
  );
};