import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useToast } from '../../ui/toast';
import profileDefaultAvatar from '../../../assets/images/profile-default.svg';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  activeMenuItem?: string;
  userAvatar?: string;
  username?: string;
}

interface MenuItem {
  id: string;
  label: string;
  path: string;
}

// Icon components from SideMenuSection
const DiscoverIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="30" height="24" viewBox="0 0 30 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M20.9584 0.5C18.7483 0.5 16.6439 1.51341 14.9932 3.35382C13.4004 1.57781 11.3199 0.5 9.04161 0.5C4.05525 0.5 0 5.65856 0 12C0 18.3414 4.05525 23.5 9.04161 23.5C11.3199 23.5 13.4038 22.4222 14.9932 20.6462C16.6405 22.49 18.7381 23.5 20.9584 23.5C25.9447 23.5 30 18.3414 30 12C30 5.65856 25.9447 0.5 20.9584 0.5ZM1.02319 12C1.02319 6.22119 4.62142 1.5168 9.04161 1.5168C13.4618 1.5168 17.06 6.2178 17.06 12C17.06 13.1049 16.927 14.1726 16.6849 15.1724C16.6405 12.749 15.5184 10.7561 13.7278 10.3087C11.395 9.72576 8.80286 11.9932 7.9502 15.3622C7.54775 16.9586 7.58527 18.5685 8.05593 19.8971C8.48567 21.1139 9.2326 21.9748 10.1876 22.3714C9.81241 22.4425 9.43042 22.4798 9.04502 22.4798C4.61801 22.4832 1.02319 17.7788 1.02319 12ZM15.6446 19.8429C17.1555 17.7856 18.0832 15.0301 18.0832 12C18.0832 8.96994 17.1555 6.21441 15.6446 4.15709C17.1146 2.45564 18.9973 1.5168 20.9584 1.5168C25.3786 1.5168 28.9768 6.2178 28.9768 12C28.9768 13.2439 28.8097 14.4369 28.5027 15.5452C28.5709 12.9558 27.425 10.7798 25.5457 10.3121C23.2128 9.72915 20.6207 11.9966 19.7681 15.3656C18.97 18.5211 19.9795 21.541 22.0293 22.3883C21.678 22.4493 21.3199 22.4866 20.955 22.4866C18.9904 22.4832 17.1146 21.5477 15.6446 19.8429Z" fill="currentColor"/>
  </svg>
);

const TreasuryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="20" height="26" viewBox="0 0 18 26" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path fillRule="evenodd" clipRule="evenodd" d="M9 0L17.5 13.1492L9 26L0.5 13.1492L9 0ZM2.22336 13.9537L7.12338 21.3606L4.67388 14.5782L2.22336 13.9537ZM5.75576 14.6575L9.00025 23.6408L12.2447 14.6575H5.75576ZM13.2895 13.5484L16.1104 12.8304L10.4683 4.1022L13.2895 13.5484ZM7.53191 4.10212L1.88981 12.8303L4.71073 13.5484L7.53191 4.10212ZM5.71396 13.6501H12.2863L9.00002 2.64586L5.71396 13.6501ZM15.7769 13.9538L13.3264 14.5784L10.8769 21.3607L15.7769 13.9538Z" fill="currentColor"/>
  </svg>
);

const NotificationIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="24" height="26" viewBox="0 0 24 26" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path fillRule="evenodd" clipRule="evenodd" d="M18.3025 13.9666C15.7584 14.0734 12.343 14.7953 10.5485 15.2804C8.754 15.7655 5.43127 16.8368 3.16498 18.0149C4.21853 15.5749 3.96672 13.1379 3.74386 10.926C3.41969 7.78732 3.14762 5.15103 7.50653 3.95849C14.7974 2.05562 12.9335 9.97317 18.3025 13.9666ZM5.88569 3.37232C6.75625 3.01942 7.66714 2.77502 8.5977 2.64467C8.60531 2.48811 8.58871 2.33131 8.5485 2.17978C8.47147 1.89899 8.31306 1.64713 8.09313 1.45579C7.87321 1.26445 7.60155 1.14215 7.31222 1.10422C7.0229 1.06629 6.72879 1.11442 6.46678 1.24258C6.20476 1.37073 5.98651 1.57321 5.83938 1.82462C5.70382 2.06142 5.63641 2.33095 5.64458 2.60353C5.65275 2.87611 5.73618 3.14114 5.88569 3.36944V3.37232ZM9.6802 2.56671C9.68591 2.00321 9.5037 1.4538 9.16222 1.0049C8.82075 0.556005 8.33938 0.233087 7.79384 0.0869403C7.2483 -0.0592063 6.66954 -0.0202885 6.1486 0.197572C5.62765 0.415433 5.19408 0.799876 4.91607 1.29043C4.69062 1.67764 4.57187 2.11747 4.57187 2.56527C4.57187 3.01306 4.69062 3.45289 4.91607 3.8401C2.08539 5.46288 2.35167 8.05009 2.66137 11.0329C2.9508 13.675 3.24024 16.6635 1.05789 19.4442C0.42853 20.0553 0.0515931 20.8795 0.00144599 21.7542C-0.0141306 22.6316 0.0960042 23.5067 0.32851 24.353C0.32851 24.3876 0.328509 24.4223 0.351664 24.4569C0.6411 25.5166 2.28799 26.0277 4.72505 25.9988C9.52679 25.9411 16.7569 24.0093 20.9335 21.6676C23.0695 20.4779 24.2417 19.2103 23.9581 18.1506C23.9581 18.1246 23.9436 18.0986 23.9349 18.0697C23.7088 17.2128 23.3619 16.3923 22.9045 15.6327C22.4192 14.9 21.6752 14.3764 20.8206 14.1658C17.5442 12.8462 16.3141 10.1089 15.2287 7.68626C13.9986 4.9258 12.9335 2.56382 9.6802 2.56671ZM13.7323 18.422C13.733 18.8288 13.6275 19.2287 13.4261 19.5824C13.2248 19.9362 12.9345 20.2314 12.584 20.4392C12.2335 20.647 11.8347 20.7601 11.4271 20.7674C11.0194 20.7747 10.6168 20.6759 10.2591 20.4808C9.88344 20.274 9.5728 19.9671 9.36182 19.5943C10.7979 19.1305 12.2566 18.7392 13.7323 18.422ZM8.31985 19.9408C6.79238 20.4618 5.31112 21.1089 3.89147 21.8755C2.21274 22.8168 1.24602 23.66 1.38785 24.1855C1.52967 24.711 2.78872 24.9593 4.71347 24.9362C9.32708 24.8785 16.3922 22.9901 20.4183 20.7349C22.097 19.7965 23.0637 18.9533 22.9219 18.4249C22.7801 17.8965 21.4747 17.6511 19.5963 17.6742C17.9826 17.7175 16.3753 17.8962 14.7916 18.2083C14.8444 18.9954 14.6218 19.7764 14.1617 20.418C13.7017 21.0596 13.0328 21.5221 12.2691 21.7266C11.5053 21.931 10.6942 21.8648 9.97397 21.5391C9.25377 21.2134 8.66914 20.6486 8.31985 19.9408ZM8.46746 18.7599C9.33577 18.4711 10.2793 18.1824 11.246 17.9225C12.207 17.6655 13.1505 17.446 14.0594 17.2641H14.1057C15.9092 16.8877 17.7428 16.6732 19.5847 16.6231C20.5267 16.5843 21.4694 16.6816 22.3836 16.9119C22.0044 16.0456 21.5152 15.4681 20.508 15.1793C19.6773 14.9512 18.3112 14.9917 16.8322 15.1591C14.8027 15.4092 12.7924 15.795 10.8148 16.3141C8.84214 16.8488 6.90812 17.5164 5.02606 18.3123C3.67439 18.8898 2.48192 19.5366 1.86831 20.1459L1.83358 20.1834C1.38239 20.6165 1.11071 21.2029 1.07236 21.8264C1.05734 22.0845 1.06508 22.3435 1.09551 22.6002C1.7705 21.9421 2.53662 21.3839 3.37048 20.9428C4.99396 20.0669 6.69303 19.3382 8.4472 18.7656L8.46746 18.7599Z" fill="currentColor"/>
  </svg>
);

const FollowingIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12.6967 13.0467C15.1618 13.0467 17.1671 11.0411 17.1671 8.57603C17.1671 6.11099 15.1618 4.10566 12.6967 4.10566C10.2317 4.10566 8.22603 6.11099 8.22603 8.57603C8.22603 11.0411 10.2317 13.0467 12.6967 13.0467ZM12.6967 4.80566C14.7759 4.80566 16.4671 6.49688 16.4671 8.57603C16.4671 10.6552 14.7759 12.3467 12.6967 12.3467C10.6176 12.3467 8.92603 10.6552 8.92603 8.57603C8.92603 6.49688 10.6176 4.80566 12.6967 4.80566Z" fill="currentColor" stroke="currentColor" strokeWidth="0.5"/>
    <path d="M25.2021 14.8904C25.3276 14.1689 25.3935 13.432 25.3935 12.6967C25.3935 5.6957 19.6978 0 12.6967 0C5.6957 0 0 5.6957 0 12.6967C0 19.6978 5.6957 25.3935 12.6967 25.3935C13.4323 25.3935 14.1695 25.328 14.8906 25.2024C16.238 26.9034 18.3166 28 20.65 28C24.7027 28 28 24.7027 28 20.65C28 18.3165 26.9033 16.2378 25.2021 14.8904ZM12.6967 0.7C19.3119 0.7 24.6935 6.08159 24.6935 12.6967C24.6935 13.2802 24.6495 13.8647 24.5657 14.4409C23.4305 13.7224 22.09 13.3 20.65 13.3C18.8694 13.3 17.2353 13.9372 15.962 14.9946C14.9104 14.6529 13.8131 14.4754 12.6967 14.4754C8.76307 14.4754 5.13302 16.7004 3.32408 20.1724C1.68397 18.1203 0.7 15.522 0.7 12.6967C0.7 6.08159 6.08159 0.7 12.6967 0.7ZM12.6967 24.6935C9.17831 24.6935 6.00907 23.1709 3.81268 20.7502C5.45388 17.3611 8.92765 15.1754 12.6967 15.1754C13.6074 15.1754 14.5029 15.306 15.3694 15.5496C14.0911 16.8727 13.3 18.6694 13.3 20.65C13.3 22.0899 13.7223 23.4303 14.4408 24.5655C13.8649 24.6492 13.2804 24.6935 12.6967 24.6935ZM20.65 27.3C16.9832 27.3 14 24.3168 14 20.65C14 16.9832 16.9832 14 20.65 14C24.3168 14 27.3 16.9832 27.3 20.65C27.3 24.3168 24.3168 27.3 20.65 27.3Z" fill="currentColor" stroke="currentColor" strokeWidth="0.5"/>
    <path d="M23.236 17.5383C22.4608 17.2009 21.4129 17.2672 20.65 18.0879C19.8871 17.2672 18.8392 17.2006 18.064 17.5383C17.1603 17.9313 16.3998 18.9441 16.7371 20.3215C17.3028 22.6293 20.3554 24.2836 20.4849 24.353C20.5365 24.3807 20.5933 24.3944 20.65 24.3944C20.7067 24.3944 20.7635 24.3807 20.8151 24.353C20.9446 24.2836 23.9976 22.6293 24.5629 20.3215C24.9002 18.9441 24.1397 17.9313 23.236 17.5383ZM23.8827 20.1547C23.4609 21.8781 21.2724 23.2747 20.65 23.6414C20.0276 23.2747 17.8394 21.8781 17.4173 20.1547C17.1767 19.1734 17.7088 18.456 18.3432 18.1802C18.5312 18.0981 18.7523 18.0465 18.9854 18.0465C19.4537 18.0465 19.9695 18.2554 20.3574 18.8467C20.4866 19.0442 20.8134 19.0442 20.9426 18.8467C21.5236 17.9611 22.3904 17.9331 22.9568 18.1802C23.5912 18.456 24.1233 19.1734 23.8827 20.1547Z" fill="currentColor" stroke="currentColor" strokeWidth="0.3"/>
  </svg>
);

const LoginIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 17L15 12L10 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  isLoggedIn,
  activeMenuItem,
  userAvatar,
  username
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleContactClick = async () => {
    const email = 'handuo@server31.io';
    try {
      await navigator.clipboard.writeText(email);
      showToast(`Email copied to clipboard: ${email}`, 'success');
    } catch (err) {
      showToast('Failed to copy email. Please copy manually: handuo@server31.io', 'error');
    }
  };

  // Build menu items based on login status
  const menuItems: MenuItem[] = [
    // Add Login option at the top only when user is not logged in
    ...(!isLoggedIn ? [{
      id: "login",
      label: "Log In",
      path: "/login",
    }] : []),
    {
      id: "curate",
      label: "Curate",
      path: "/curate",
    },
    {
      id: "discovery",
      label: "Discovery",
      path: "/",
    },
    {
      id: "following",
      label: "Following",
      path: "/following",
    },
    {
      id: "treasury",
      label: "Treasury",
      path: "/my-treasury",
    },
    {
      id: "notification",
      label: "Notifications",
      path: "/notification",
    },
  ];

  const handleMenuItemClick = (item: MenuItem) => {
    navigate(item.path);
    onClose();
  };

  const renderIcon = (id: string, isActive: boolean) => {
    const className = 'text-dark-grey';

    switch (id) {
      case 'curate':
        return <img className="w-5 h-5" alt="Curate" src="https://c.animaapp.com/mft4oqz6uyUKY7/img/vector.svg" />;
      case 'discovery':
        return <DiscoverIcon className={className} />;
      case 'following':
        return <FollowingIcon className={className} />;
      case 'treasury':
        return <TreasuryIcon className={className} />;
      case 'notification':
        return <NotificationIcon className={className} />;
      case 'login':
        return <LoginIcon className={className} />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#3e3e3eb2] z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Side Menu */}
      <aside
        className="w-[310px] h-full pt-2.5 pb-5 px-0 fixed top-0 right-0 bg-white border-l border-solid border-light-grey flex flex-col items-start z-50 lg:hidden"
        role="navigation"
        aria-label="Mobile menu"
      >
        {/* Header with Profile (logged in) or just Close Button */}
        <div className="relative self-stretch w-full flex-[0_0_auto] p-2.5 flex items-start justify-between">
          {/* Profile Image - only show when logged in */}
          {isLoggedIn ? (
            <button
              onClick={() => {
                navigate('/setting');
                onClose();
              }}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              <img
                src={userAvatar || profileDefaultAvatar}
                alt={username || 'Profile'}
                className="w-12 h-12 rounded-full object-cover border border-gray-200"
              />
            </button>
          ) : (
            <div />
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="cursor-pointer hover:bg-gray-50 rounded"
            aria-label="Close menu"
          >
            <X className="w-6 h-6 text-dark-grey" />
          </button>
        </div>

        <div className="flex flex-col items-start relative flex-1 self-stretch w-full">
          {/* Login Button - Bubble style for non-logged-in users */}
          {!isLoggedIn && (
            <div className="w-full px-5 pt-2.5 pb-5">
              <button
                onClick={() => {
                  navigate('/login');
                  onClose();
                }}
                className="inline-flex items-center justify-center gap-[15px] px-5 py-2.5 bg-white rounded-[50px] border border-solid border-[#454545] hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <span className="[font-family:'Lato',Helvetica] font-semibold text-dark-grey text-lg tracking-[0] leading-[27px] whitespace-nowrap">
                  Log in / Sign up
                </span>
              </button>
            </div>
          )}

          {/* Main Navigation */}
          <nav className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto] border-b border-solid border-light-grey">
            {menuItems.filter(item => item.id !== 'login').map((item, index, filteredItems) => {
              const isActive = activeMenuItem === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuItemClick(item)}
                  className={`flex items-center gap-5 px-5 py-[25px] relative self-stretch w-full flex-[0_0_auto] cursor-pointer hover:bg-gray-50 transition-colors ${
                    isActive ? "bg-gray-50" : ""
                  } ${
                    index < filteredItems.length - 1
                      ? "border-b border-solid border-light-grey"
                      : ""
                  }`}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                >
                  <div className="w-[30px] h-[30px] flex items-center justify-center">
                    {renderIcon(item.id, isActive)}
                  </div>

                  <span
                    className={`relative flex items-center justify-center w-fit [font-family:'Lato',Helvetica] text-2xl tracking-[0] leading-[33.6px] whitespace-nowrap ${
                      item.id === "curate"
                        ? `text-red ${isActive ? "font-bold" : "font-normal"}`
                        : `text-off-black ${isActive ? "font-bold" : "font-normal"}`
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Footer Section */}
          <div className="px-5 py-0 relative self-stretch w-full flex-[0_0_auto] flex flex-col items-start">
            <div className="flex flex-col items-start justify-end gap-2.5 px-0 py-5 relative self-stretch w-full flex-[0_0_auto]">
              {/* Social Links */}
              <div className="flex items-center gap-4 py-2">
                <a href="https://github.com/copus-io/copus-network" target="_blank" rel="noopener noreferrer" className="text-dark-grey hover:text-gray-900 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                </a>
                <a href="https://discord.gg/ZtgdtbDSng" target="_blank" rel="noopener noreferrer" className="text-dark-grey hover:text-gray-900 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0002 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
                  </svg>
                </a>
                <a href="https://x.com/copus_io" target="_blank" rel="noopener noreferrer" className="text-dark-grey hover:text-gray-900 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </div>

            <footer className="flex flex-col items-start justify-center gap-2.5 pt-5 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto] bg-transparent">
              <nav
                className="flex items-center justify-start text-medium-dark-grey text-sm leading-[20px] relative self-stretch [font-family:'Lato',Helvetica] font-normal tracking-[0]"
                aria-label="Footer navigation"
              >
                <div className="flex flex-col items-start [font-family:'Lato',Helvetica] font-normal text-[#686868] text-sm tracking-[0] leading-[20px]">
                  <a href="#" className="hover:text-dark-grey transition-colors">• About</a>
                  <button onClick={handleContactClick} className="hover:text-dark-grey transition-colors cursor-pointer text-left">• Contact us</button>
                  <a href="https://www.copus.io/work/565b548277674c3bae3ccc016c7f58a2" target="_blank" rel="noopener noreferrer" className="hover:text-dark-grey transition-colors">• Terms & Privacy</a>
                </div>
              </nav>

              <p className="flex items-center justify-start text-medium-dark-grey text-sm leading-[20px] relative self-stretch [font-family:'Lato',Helvetica] font-normal tracking-[0]">
                <a
                  href="https://server31.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="[font-family:'Lato',Helvetica] font-normal text-[#686868] text-sm tracking-[0] leading-[20px] hover:text-dark-grey transition-colors"
                >
                  © 2025 S31 Labs
                </a>
              </p>
            </footer>
          </div>
        </div>
      </aside>
    </>
  );
};
