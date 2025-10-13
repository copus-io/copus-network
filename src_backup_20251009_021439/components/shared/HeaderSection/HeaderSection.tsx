import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarImage } from "../../ui/avatar";
import { Button } from "../../ui/button";
import { Separator } from "../../ui/separator";
import { useUser } from "../../../contexts/UserContext";
import { useNotification } from "../../../contexts/NotificationContext";

interface HeaderSectionProps {
  isLoggedIn?: boolean;
  hideCreateButton?: boolean;
}

export const HeaderSection = ({ isLoggedIn = true, hideCreateButton = false }: HeaderSectionProps): JSX.Element => {
  const { user, logout } = useUser();
  const { unreadCount } = useNotification();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const handleAvatarDoubleClick = () => {
    navigate('/setting');
    setShowUserMenu(false);
  };


  // 点击外部关闭菜单
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
    <header className="flex items-center justify-between p-[30px] w-full bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] fixed top-0 left-0 right-0 z-40">
      <div className="flex items-center gap-[15px]">
        <Link to="/" className="flex w-[45px] h-[45px] items-center justify-center rounded-full bg-red">
          <img
            className="w-7 h-7"
            alt="Ic fractopus open"
            src="https://c.animaapp.com/mft9nppdGctUh1/img/ic-fractopus-open.svg"
          />
        </Link>

        <Link to="/" className="[font-family:'Lato',Helvetica] font-bold text-dark-grey text-lg tracking-[0.90px] leading-[27px] whitespace-nowrap">
          Copus
        </Link>

        <Separator
          orientation="vertical"
          className="h-6 bg-[#a8a8a8] mx-[15px]"
        />

        <div className="[font-family:'Lato',Helvetica] font-light text-dark-grey text-lg leading-[27px] whitespace-nowrap">
          Human Internet
        </div>
      </div>

      <div className="flex items-center gap-5">
        {isLoggedIn ? (
          <>
        {!hideCreateButton && (
          <Button
            variant="outline"
            className="flex items-center gap-[15px] px-5 py-2.5 h-auto rounded-[50px] border-red text-red hover:bg-[#F23A001A] hover:text-red transition-colors duration-200"
            asChild
          >
            <Link to="/create">
              <img
                className="w-5 h-5"
                alt="Vector"
                src="https://c.animaapp.com/mft4oqz6uyUKY7/img/vector.svg"
              />
              <span className="[font-family:'Lato',Helvetica] font-bold text-lg leading-5 text-red">
                Create
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
                  {unreadCount > 99 ? '99+' : unreadCount}
                </div>
              )}
            </Link>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                onDoubleClick={handleAvatarDoubleClick}
                className="focus:outline-none"
                title="单击显示菜单，双击前往设置页面"
              >
                <Avatar className="w-[47px] h-[47px] hover:ring-2 hover:ring-red hover:scale-110 transition-all duration-200 cursor-pointer">
                  <AvatarImage
                    src={
                      user?.faceUrl ||
                      user?.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'vivi'}&backgroundColor=b6e3f4&hair=longHair&hairColor=724133&eyes=happy&mouth=smile&accessories=prescription01&accessoriesColor=262e33`
                    }
                    alt="Avatar"
                  />
                </Avatar>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-[55px] w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {user && (
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.username}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  )}
                  <Link
                    to="/my-treasury"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    我的珍藏
                  </Link>
                  <Link
                    to="/setting"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    设置
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    退出登录
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Button
            variant="outline"
            className="inline-flex items-center justify-center gap-[15px] px-5 py-2.5 h-auto bg-white rounded-[50px] border border-solid border-[#454545] [font-family:'Lato',Helvetica] font-semibold text-dark-grey text-lg tracking-[0] leading-[27px] whitespace-nowrap hover:bg-gray-50"
            asChild
          >
            <Link to="/login">Log in / Sign up</Link>
          </Button>
        )}
      </div>
    </header>
  );
};
