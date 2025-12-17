import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Avatar, AvatarImage } from "../../ui/avatar";
import { Button } from "../../ui/button";
import { Separator } from "../../ui/separator";
import { useUser } from "../../../contexts/UserContext";
import { useNotification } from "../../../contexts/NotificationContext";
import profileDefaultAvatar from "../../../assets/images/profile-default.svg";
import { MobileMenu } from "../MobileMenu";
import { Menu } from "lucide-react";

interface HeaderSectionProps {
  hideCreateButton?: boolean;
  showDiscoverNow?: boolean;
  hideLoginButton?: boolean;
  articleAuthorId?: string; // For conditional rendering in article detail page
}

export const HeaderSection = ({ hideCreateButton = false, showDiscoverNow = false, hideLoginButton = false, articleAuthorId }: HeaderSectionProps): JSX.Element => {
  const { user, logout, isLoggedIn: userIsLoggedIn, loading } = useUser();
  // Always use actual UserContext state, not props
  // If still loading, optimistically check if token exists in storage
  const isLoggedIn = loading
    ? !!(localStorage.getItem('copus_token') || sessionStorage.getItem('copus_token'))
    : userIsLoggedIn;
  const { unreadCount } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const handleAvatarDoubleClick = () => {
    navigate('/setting');
    setShowUserMenu(false);
  };


  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  return (
    <>
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isLoggedIn={isLoggedIn}
        activeMenuItem={location.pathname === '/create' ? 'curate' : location.pathname.substring(1)}
        userAvatar={user?.faceUrl || user?.avatar}
        username={user?.username}
        userNamespace={user?.namespace}
      />

      <header className="flex items-center justify-between px-2.5 py-[5px] lg:px-[30px] lg:pt-[30px] lg:pb-[20px] w-full bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center gap-2.5 lg:gap-[15px]">
          <Link to="/" className="flex w-[25px] h-[25px] lg:w-[47px] lg:h-[47px] items-center justify-center rounded-full bg-red">
            <img
              className="w-[15px] h-[15px] lg:w-[29px] lg:h-[29px]"
              alt="Ic fractopus open"
              src="https://c.animaapp.com/mft9nppdGctUh1/img/ic-fractopus-open.svg"
            />
          </Link>

          <Link to="/" className="[font-family:'Lato',Helvetica] font-bold text-dark-grey text-lg tracking-[0.90px] leading-[27px] whitespace-nowrap">
            Copus
          </Link>

          <Separator
            orientation="vertical"
            className="h-6 bg-[#a8a8a8] mx-2.5 lg:mx-[15px]"
          />

          <div className="[font-family:'Lato',Helvetica] font-light text-dark-grey text-lg leading-[27px] whitespace-nowrap">
            Internet Treasure Map
          </div>
        </div>

        {/* Mobile: Hamburger Menu */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden flex items-center justify-center h-[43px] cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6 text-dark-grey" />
        </button>

        {/* Desktop: Full Navigation */}
        <div className="hidden lg:flex items-center gap-5">
        {isLoggedIn ? (
          <>
        {!hideCreateButton && (
          <Button
            variant="outline"
            className="flex items-center gap-[15px] px-5 py-2.5 h-auto rounded-[50px] border-red text-red hover:bg-[#F23A001A] hover:text-red transition-colors duration-200"
            asChild
          >
            <Link to="/curate">
              <img
                className="w-5 h-5"
                alt="Vector"
                src="https://c.animaapp.com/mft4oqz6uyUKY7/img/vector.svg"
              />
              <span className="[font-family:'Lato',Helvetica] font-bold text-lg leading-5 text-red">
                Curate
              </span>
            </Link>
          </Button>
        )}

            <Link to="/notification" className="block cursor-pointer relative">
              <img
                className="w-[47px] h-[47px] rotate-[12deg] hover:rotate-[17deg] transition-transform duration-200"
                alt="Notification"
                src="https://c.animaapp.com/mft4oqz6uyUKY7/img/notification.svg"
              />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red text-white text-xs font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1">
                  {unreadCount > 99 ? '99' : unreadCount}
                </div>
              )}
            </Link>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                onDoubleClick={handleAvatarDoubleClick}
                className="focus:outline-none"
                title="Click to show menu, double-click to go to settings"
              >
                <Avatar className="w-[47px] h-[47px] hover:ring-2 hover:ring-red hover:scale-110 transition-all duration-200 cursor-pointer">
                  <AvatarImage
                    src={
                      user?.faceUrl ||
                      user?.avatar ||
                      profileDefaultAvatar
                    }
                    alt="Avatar"
                  />
                </Avatar>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-[55px] w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {user && (
                    <div className="px-6 py-3 border-b border-gray-100">
                      <p className="text-base font-medium text-gray-900 truncate">{user.username}</p>
                      <p className="text-base text-gray-500 truncate" title={user.email}>{user.email}</p>
                    </div>
                  )}
                  <Link
                    to="/setting"
                    className="block px-6 py-3 text-base text-gray-700 hover:bg-gray-100 whitespace-nowrap"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-6 py-3 text-base text-red-600 hover:bg-gray-100 whitespace-nowrap"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-[15px]">
            {showDiscoverNow && (
              <Link to="/" className="inline-flex items-center justify-end relative flex-[0_0_auto] rounded-[10px_10px_0px_0px]">
                <div className="relative flex items-center justify-center w-fit font-p-l font-[number:var(--p-l-font-weight)] text-dark-grey text-[length:var(--p-l-font-size)] text-center tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
                  Discover now
                </div>
              </Link>
            )}
            {!hideLoginButton && (
              <Button
                variant="outline"
                className="inline-flex items-center justify-center gap-[15px] px-5 py-2.5 h-auto bg-white rounded-[50px] border border-solid border-[#454545] [font-family:'Lato',Helvetica] font-semibold text-dark-grey text-lg tracking-[0] leading-[27px] whitespace-nowrap hover:bg-gray-50"
                asChild
              >
                <Link to="/login">Log in / Sign up</Link>
              </Button>
            )}
          </div>
        )}
      </div>
      </header>
    </>
  );
};
