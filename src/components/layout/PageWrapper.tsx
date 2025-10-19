import React from 'react';
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

  return (
    <div className={`w-full min-h-screen bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] ${className}`}>
      <HeaderSection isLoggedIn={isLoggedIn} />
      <SideMenuSection activeItem={activeMenuItem} />
      <div className="ml-[360px] mr-[40px] min-h-screen overflow-y-auto pt-[120px] pb-[100px] overflow-x-visible">
        {children}
      </div>
    </div>
  );
};