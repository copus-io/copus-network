import { XIcon } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../../contexts/UserContext";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import { AuthService } from "../../../../services/authService";
import { useToast } from "../../../../components/ui/toast";
import { SocialLinksManager } from "../../../../components/SocialLinksManager/SocialLinksManager";
import { ImageUploader } from "../../../../components/ImageUploader/ImageUploader";
import { PopUp } from "../../../../components/PopUp/PopUp";
import { ChangePasswordModal } from "../../../../components/ChangePasswordModal/ChangePasswordModal";
import { CustomSwitch } from "../../../../components/ui/custom-switch";
import profileDefaultAvatar from "../../../../assets/images/profile-default.svg";


// Message type mapping - matches API msgType values
const MESSAGE_TYPE_MAP = {
  0: { label: "Show all notifications", id: "all-notifications" },
  1: { label: "Show like notifications", id: "like-notifications" },
  999: { label: "Show system notifications", id: "system-notifications" },
} as const;

interface ProfileContentSectionProps {
  onLogout?: () => void;
}

export const ProfileContentSection = ({ onLogout }: ProfileContentSectionProps): JSX.Element => {
  const navigate = useNavigate();
  const { user, logout, updateUser, fetchUserInfo } = useUser();
  const { showToast } = useToast();
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showPersonalInfoPopup, setShowPersonalInfoPopup] = useState(false);
  const [showSocialLinksPopup, setShowSocialLinksPopup] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [editPopupData, setEditPopupData] = useState({
    title: "",
    value: "",
    field: "",
    isTextarea: false,
    placeholder: "",
  });

  // 使用 UserContext 中的社交链接数据
  const { socialLinks: socialLinksData, socialLinksLoading } = useUser();

  // 初始化图片状态和表单数据
  React.useEffect(() => {
    // Set profile image - use faceUrl if available, otherwise use default
    setProfileImage(user?.faceUrl || profileDefaultAvatar);

    if (user?.coverUrl) {
      setBannerImage(user.coverUrl);
    }
    if (user?.username) {
      setFormUsername(user.username);
    }
    if (user?.bio) {
      setFormBio(user.bio);
    }
  }, [user]);

  const [editingField, setEditingField] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string>(profileDefaultAvatar);
  const [bannerImage, setBannerImage] = useState<string>('');
  const [formUsername, setFormUsername] = useState<string>('');
  const [formBio, setFormBio] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [showCoverUploader, setShowCoverUploader] = useState(false);
  const [showAvatarUploader, setShowAvatarUploader] = useState(false);

  // 消息通知设置状态
  const [notificationSettings, setNotificationSettings] = useState<Array<{ isOpen: boolean; msgType: number }>>([]);
  const [notificationLoading, setNotificationLoading] = useState(true);



  // 获取消息通知设置
  useEffect(() => {
    const fetchNotificationSettings = async () => {
      if (!user) {
        setNotificationLoading(false);
        return;
      }

      try {
        setNotificationLoading(true);
        const settings = await AuthService.getMessageNotificationSettings();

        // Use the API response directly - it returns the msgTypes that are available
        // If API returns empty, use default msgTypes from MESSAGE_TYPE_MAP
        if (settings && settings.length > 0) {
          setNotificationSettings(settings);
        } else {
          // Default fallback: all notification types ON
          const defaultMessageTypes = Object.keys(MESSAGE_TYPE_MAP).map(Number);
          setNotificationSettings(
            defaultMessageTypes.map(msgType => ({ msgType, isOpen: true }))
          );
        }
      } catch (error) {
        console.error('❌ Failed to get notification settings:', error);
        showToast('Failed to get notification settings, please try again', 'error');
        // Set default values to avoid infinite loading - all notifications ON by default
        const defaultMessageTypes = Object.keys(MESSAGE_TYPE_MAP).map(Number);
        setNotificationSettings(
          defaultMessageTypes.map(msgType => ({ msgType, isOpen: true }))
        );
      } finally {
        setNotificationLoading(false);
      }
    };

    fetchNotificationSettings();
  }, [user, showToast]);

  // 处理通知开关切换
  const handleNotificationToggle = async (msgType: number, currentIsOpen: boolean) => {
    try {

      // 先立即更新UI状态，提供即时反馈
      setNotificationSettings(prev =>
        prev.map(setting =>
          setting.msgType === msgType
            ? { ...setting, isOpen: !currentIsOpen }
            : setting
        )
      );

      // 然后调用API
      const success = await AuthService.updateMessageNotificationSetting(msgType, !currentIsOpen);

      if (success) {
        const typeInfo = MESSAGE_TYPE_MAP[msgType as keyof typeof MESSAGE_TYPE_MAP];
        showToast(`${typeInfo?.label || 'Notification setting'} ${!currentIsOpen ? 'enabled' : 'disabled'}`, 'success');
      } else {
        // 如果API失败，回滚状态
        setNotificationSettings(prev =>
          prev.map(setting =>
            setting.msgType === msgType
              ? { ...setting, isOpen: currentIsOpen }
              : setting
          )
        );
        showToast('Failed to update notification settings', 'error');
      }
    } catch (error) {
      console.error('❌ Failed to update notification settings:', error);
      // 如果出错，回滚状态
      setNotificationSettings(prev =>
        prev.map(setting =>
          setting.msgType === msgType
            ? { ...setting, isOpen: currentIsOpen }
            : setting
        )
      );
      showToast('Failed to update notification settings', 'error');
    }
  };
  // 初始化时使用空字符串，等待用户数据加载
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    bio: "",
    email: "",
  });

  // 当用户数据更新时，同步更新表单数据
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.username || "Guest User",
        username: user.namespace ? `@${user.namespace}` : "@unknown",
        bio: user.bio || "Hello, welcome to my creative space.",
        email: user.email || "user@example.com",
      });
    } else {
      setFormData({
        name: "",
        username: "",
        bio: "",
        email: "",
      });
    }
  }, [user]);


  useEffect(() => {
    if (isLoggedOut && onLogout) {
      onLogout();
    }
  }, [isLoggedOut, onLogout]);

  const handleEdit = (field: string) => {
    setEditingField(field);
  };

  const handleSave = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setEditingField(null);
  };


  const handleDeleteAccount = () => {
    navigate('/account/delete');
  };

  const handleProfileImageUploaded = async (imageUrl: string) => {
    try {
      console.log('Avatar uploaded successfully, updating user profile:', imageUrl);

      // Update local state
      setProfileImage(imageUrl);

      // Call API to update user profile - send ALL 4 fields to prevent data loss
      // Use current form/state values to preserve all information
      const success = await AuthService.updateUserInfo({
        userName: formUsername || user?.username || '',
        bio: formBio || user?.bio || '',
        faceUrl: imageUrl,
        coverUrl: bannerImage || user?.coverUrl || ''
      });

      console.log('Profile update result with all fields:', success);

      if (success) {
        // Try to fetch latest user data from server to ensure UI is in sync
        try {
          await fetchUserInfo();
        } catch (fetchError) {
          console.warn('Failed to refresh user info after avatar update, but update was successful:', fetchError);
          // Don't throw - the update was successful even if we can't refresh
        }

        // Close upload modal
        setShowAvatarUploader(false);
        showToast('Avatar updated successfully!', 'success');
      } else {
        throw new Error('Failed to update user avatar');
      }
    } catch (error) {
      console.error('Failed to update avatar:', error);
      showToast('Failed to update avatar, please try again', 'error');
    }
  };

  const handleBannerImageUploaded = async (imageUrl: string) => {
    try {
      console.log('Cover image uploaded successfully, updating user profile:', imageUrl);

      // Update local state
      setBannerImage(imageUrl);

      // Call API to update user profile - send ALL 4 fields to prevent data loss
      // Use current form/state values to preserve all information
      const success = await AuthService.updateUserInfo({
        userName: formUsername || user?.username || '',
        bio: formBio || user?.bio || '',
        faceUrl: profileImage === profileDefaultAvatar ? '' : (profileImage || user?.faceUrl || ''),
        coverUrl: imageUrl
      });

      console.log('User profile update result with all fields:', success);

      if (success) {
        // Try to fetch latest user data from server to ensure UI is in sync
        try {
          await fetchUserInfo();
        } catch (fetchError) {
          console.warn('Failed to refresh user info after cover update, but update was successful:', fetchError);
          // Don't throw - the update was successful even if we can't refresh
        }

        // Close upload modal
        setShowCoverUploader(false);
        showToast('Cover image updated successfully!', 'success');
      } else {
        throw new Error('Failed to update user profile');
      }
    } catch (error) {
      console.error('Failed to update cover image:', error);
      showToast('Failed to update cover image, please try again', 'error');
    }
  };

  const handleImageUploadError = (error: string) => {
    showToast(error, 'error');
  };

  // Local-only image handlers for Personal Info Popup (don't call API until Save button)
  const handleProfileImageLocalUpdate = (imageUrl: string) => {
    console.log('Profile image updated locally (will save on click Save):', imageUrl);
    // If empty string (deleted), show default avatar
    setProfileImage(imageUrl || profileDefaultAvatar);
  };

  const handleBannerImageLocalUpdate = (imageUrl: string) => {
    console.log('Banner image updated locally (will save on click Save):', imageUrl);
    setBannerImage(imageUrl);
  };

  const handleLogout = async () => {
    try {
      showToast('Logging out...', 'info');

      // Call user context logout function (it calls API and clears local state)
      await logout();

      // Call optional callback function
      if (onLogout) {
        onLogout();
      }

      showToast('Successfully logged out', 'success');

      // Redirect to homepage
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1000); // Delay 1 second to let user see success message

    } catch (error) {
      console.error('❌ Logout failed:', error);
      showToast('Logout failed, please try again', 'error');

      // Call optional callback function
      if (onLogout) {
        onLogout();
      }

      // Redirect to homepage anyway to avoid staying on authenticated page
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 2000);
    }
  };

  const handleEditField = (field: string, title: string, currentValue: string, isTextarea = false, placeholder = "") => {
    setEditPopupData({
      title,
      value: currentValue,
      field,
      isTextarea,
      placeholder,
    });
    setShowEditPopup(true);
  };

  const handleSaveField = (newValue: string) => {
    // 处理字段编辑
    setFormData(prev => ({ ...prev, [editPopupData.field]: newValue }));
    setShowEditPopup(false);
  };

  const handleCancelEdit = () => {
    setShowEditPopup(false);
  };



  // Personal Info Popup Handlers
  const handleSavePersonalInfo = async () => {
    setIsSaving(true);
    try {
      // Prepare update data - ALWAYS send ALL 4 fields (both changed and unchanged)
      // API expects all fields to be sent, not just the changed ones
      const updateData = {
        userName: formUsername.trim() || user?.username || '',
        bio: formBio.trim() || user?.bio || '',
        faceUrl: profileImage === profileDefaultAvatar ? '' : profileImage,
        coverUrl: bannerImage || ''
      };

      console.log('Updating user profile with ALL fields:', updateData);

      // Call API to update user information
      const success = await AuthService.updateUserInfo(updateData);

      if (success) {
        // Try to fetch latest user data from server to ensure UI is in sync
        // If this fails with a non-auth error, still show success since the update worked
        try {
          await fetchUserInfo();
        } catch (fetchError) {
          console.warn('Failed to refresh user info after update, but update was successful:', fetchError);
          // Don't throw - the update was successful even if we can't refresh
        }

        showToast('Personal information updated successfully', 'success');
        setShowPersonalInfoPopup(false);
      } else {
        showToast('Update failed, please try again', 'error');
      }

    } catch (error) {
      console.error('Failed to update personal information:', error);
      showToast('Update failed, please try again', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelPersonalInfo = () => {
    setShowPersonalInfoPopup(false);
  };

  // 处理头像点击，显示上传弹窗
  const handleAvatarClick = () => {
    setShowAvatarUploader(true);
  };

  // 处理封面图点击，显示上传弹窗
  const handleCoverClick = () => {
    setShowCoverUploader(true);
  };



  return (
    <main className="flex flex-col items-start gap-[30px] px-4 lg:pl-[60px] lg:pr-10 pt-0 pb-[100px] relative flex-1 self-stretch grow bg-transparent">
      <section className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
        <div
          className="relative self-stretch w-full h-40 rounded-lg overflow-hidden bg-gradient-to-r from-blue-100 to-purple-100 group cursor-pointer"
          onClick={handleCoverClick}
        >
          <img
            src={user?.coverUrl || 'https://c.animaapp.com/w7obk4mX/img/banner.png'}
            alt="Profile banner"
            className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
          />
          {/* 编辑提示覆盖层 */}
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
            <div className="bg-white bg-opacity-90 rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="gap-4 lg:gap-10 px-4 lg:pl-5 lg:pr-10 py-0 mt-[-46px] flex flex-col lg:flex-row items-start relative self-stretch w-full flex-[0_0_auto]">
          <button
            onClick={handleAvatarClick}
            className="w-[80px] h-[80px] lg:w-[100px] lg:h-[100px] rounded-[60px] border-2 border-solid border-white relative aspect-[1] cursor-pointer hover:ring-4 hover:ring-blue-300 transition-all duration-200 group overflow-hidden bg-gray-100"
            title="Click to change avatar"
            aria-label="Click to change avatar"
          >
            {/* Avatar image */}
            <img
              src={(user?.faceUrl && user.faceUrl.trim()) ? user.faceUrl : profileDefaultAvatar}
              alt="Profile avatar"
              className="w-full h-full object-cover"
              onError={(e) => {
                console.log('🔥 Avatar image failed to load, using default');
                e.currentTarget.src = profileDefaultAvatar;
              }}
            />

            {/* Show upload icon on hover */}
            <div className="absolute inset-0 bg-black/50 rounded-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89L8.65 4.54A2 2 0 0110.314 4h3.372a2 2 0 011.664.54L16.41 6.11A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </button>

          <div className="flex flex-col items-start gap-5 pt-0 lg:pt-[60px] pb-0 px-0 relative flex-1 grow w-full">
            <div className="flex items-start justify-between w-full">
              <header className="h-[60px] inline-flex flex-col items-start justify-center relative">
                <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto] mt-[-3.50px]">
                  <h1 className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-off-black text-3xl tracking-[0] leading-[42.0px] whitespace-nowrap">
                    {formData.name || (!user ? "Loading..." : "Guest User")}
                  </h1>

                  {/* Edit button next to username */}
                  <button
                    className="relative w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                    aria-label="Edit personal information"
                    onClick={() => setShowPersonalInfoPopup(true)}
                    title="Edit username, bio and other personal information"
                  >
                    <img
                      className="w-4 h-4"
                      alt="Edit"
                      src="https://c.animaapp.com/w7obk4mX/img/edit-1.svg"
                    />
                  </button>
                </div>

                <div className="relative w-fit mb-[-2.50px] [font-family:'Lato',Helvetica] font-normal text-off-black text-lg tracking-[0] leading-[25.2px] whitespace-nowrap">
                  {formData.username || (!user ? "Loading..." : "@unknown")}
                </div>
              </header>
            </div>

            <div className="flex-col gap-2.5 flex items-start relative self-stretch w-full flex-[0_0_auto]">
              <div className="flex items-center gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
                <p className="relative w-fit mt-[-1.00px] font-p-l font-[number:var(--p-l-font-weight)] text-off-black text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
                  {formData.bio || (!user ? "Loading..." : "Hello, welcome to my creative space.")}
                </p>
              </div>

              <div className="flex flex-col gap-3 relative self-stretch w-full flex-[0_0_auto]">
                {/* 显示已填写的社交链接 */}
                <div className="inline-flex items-center gap-[25px] relative flex-[0_0_auto] flex-wrap">
                  {socialLinksData && socialLinksData.filter(link => link.linkUrl && link.linkUrl.trim()).map((link) => (
                    <button
                      key={link.id}
                      className="inline-flex items-center gap-2.5 relative flex-[0_0_auto] px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                      onClick={() => setShowSocialLinksPopup(true)}
                      title={`Edit ${link.title}`}
                    >
                      <img
                        className="relative w-6 h-6 flex-[0_0_auto]"
                        alt={`${link.title} logo`}
                        src={link.iconUrl || 'https://c.animaapp.com/w7obk4mX/img/link-icon.svg'}
                        onError={(e) => {
                          e.currentTarget.src = 'https://c.animaapp.com/w7obk4mX/img/link-icon.svg';
                        }}
                      />

                      <div className="relative w-fit font-p-l font-[number:var(--p-l-font-weight)] text-medium-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)] max-w-[120px] overflow-hidden text-ellipsis">
                        {link.title}
                      </div>
                    </button>
                  ))}

                  {/* Edit social links button */}
                  <button
                    className="inline-flex items-center gap-2 px-3 py-2 relative flex-[0_0_auto] rounded-lg border border-dashed border-medium-grey hover:border-dark-grey hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                    onClick={() => setShowSocialLinksPopup(true)}
                    title="Manage social links"
                  >
                    <svg
                      className="w-5 h-5 text-medium-dark-grey"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    <span className="text-sm text-medium-dark-grey">
                      {socialLinksData && socialLinksData.filter(link => link.linkUrl && link.linkUrl.trim()).length > 0 ? 'Edit Links' : 'Add Links'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      <section className="flex flex-col items-start gap-5 pt-5 pb-[30px] px-0 relative self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-light-grey">
        <div className="pt-0 pb-2.5 px-0 flex-[0_0_auto] inline-flex flex-col items-start justify-center relative">
          <h2 className="relative w-fit mt-[-1.00px] font-h-3 font-[number:var(--h-3-font-weight)] text-off-black text-[length:var(--h-3-font-size)] tracking-[var(--h-3-letter-spacing)] leading-[var(--h-3-line-height)] whitespace-nowrap [font-style:var(--h-3-font-style)]">
            Account
          </h2>
        </div>

        <div className="flex flex-col items-start gap-5 relative w-full">
          <div className="inline-flex flex-col items-start justify-center gap-[15px] relative flex-[0_0_auto]">
            <div className="inline-flex items-center justify-end gap-0.5 relative flex-[0_0_auto]">
              <h3 className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-dark-grey text-xl tracking-[0] leading-[23px] whitespace-nowrap">
                {user?.walletAddress ? 'Wallet address' : 'Email address'}
              </h3>
            </div>

            <div className="relative w-fit font-p-l font-[number:var(--p-l-font-weight)] text-medium-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
              {user?.walletAddress || user?.email || 'Not provided'}
            </div>
          </div>

          <div className="inline-flex flex-col items-start justify-center gap-[15px] relative flex-[0_0_auto]">
            <div className="inline-flex items-center justify-end gap-0.5 relative flex-[0_0_auto]">
              <h3 className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-dark-grey text-xl tracking-[0] leading-[23px] whitespace-nowrap">
                Password
              </h3>
            </div>

            <Button
              onClick={() => setShowChangePasswordModal(true)}
              variant="outline"
              className="inline-flex items-center justify-center gap-2.5 px-4 py-2 h-auto rounded-lg border border-solid border-red text-red hover:bg-[#F23A001A] hover:text-red transition-colors duration-200"
            >
              <span className="[font-family:'Lato',Helvetica] font-normal text-base leading-5">
                Change Password
              </span>
            </Button>
          </div>
        </div>
      </section>

      <section className="flex flex-col items-start gap-5 relative self-stretch w-full flex-[0_0_auto]">
        <div className="pt-0 pb-2.5 px-0 flex-[0_0_auto] inline-flex flex-col items-start justify-center relative">
          <h2 className="relative w-fit mt-[-1.00px] font-h-3 font-[number:var(--h-3-font-weight)] text-off-black text-[length:var(--h-3-font-size)] tracking-[var(--h-3-letter-spacing)] leading-[var(--h-3-line-height)] whitespace-nowrap [font-style:var(--h-3-font-style)]">
            Notification
          </h2>
        </div>

        <div className="flex flex-col items-start gap-5 pt-0 pb-[25px] px-0 relative self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-light-grey">
          {!user ? (
            <div className="flex justify-center items-center py-4">
              <div className="text-sm text-gray-500">Please log in to view notification settings</div>
            </div>
          ) : notificationLoading ? (
            <div className="flex justify-center items-center py-4">
              <div className="text-sm text-gray-500">Loading notification settings...</div>
            </div>
          ) : notificationSettings.length > 0 ? (
            notificationSettings.map((setting) => {
              const typeInfo = MESSAGE_TYPE_MAP[setting.msgType as keyof typeof MESSAGE_TYPE_MAP];
              if (!typeInfo) return null;

              return (
                <CustomSwitch
                  key={setting.msgType}
                  checked={setting.isOpen}
                  onCheckedChange={(checked) => handleNotificationToggle(setting.msgType, setting.isOpen)}
                  label={typeInfo.label}
                  aria-label={`Toggle ${typeInfo.label}`}
                />
              );
            })
          ) : (
            <div className="flex justify-center items-center py-4">
              <div className="text-sm text-gray-500">No notification settings available</div>
            </div>
          )}
        </div>
      </section>

      <section className="inline-flex flex-col items-start gap-5 relative flex-[0_0_auto]">
        <button
          className="inline-flex items-center justify-center gap-2.5 relative flex-[0_0_auto] cursor-pointer hover:opacity-80 focus:outline-none"
          onClick={handleDeleteAccount}
        >
          <span className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-red text-lg tracking-[0] leading-[23px] whitespace-nowrap">
            Delete account
          </span>
        </button>

        <button
          className="inline-flex items-center justify-center gap-2.5 relative flex-[0_0_auto] cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red"
          onClick={handleLogout}
        >
          <span className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-red text-lg tracking-[0] leading-[23px] whitespace-nowrap">
            Log out
          </span>
        </button>
      </section>

      {/* Edit Popup */}
      {showEditPopup && (
        <PopUp
          title={editPopupData.title}
          value={editPopupData.value}
          onSave={handleSaveField}
          onCancel={handleCancelEdit}
          placeholder={editPopupData.placeholder}
          isTextarea={editPopupData.isTextarea}
        />
      )}

      {/* Social Links Management Popup */}
      {showSocialLinksPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
          <div className="flex flex-col w-[600px] max-h-[90vh] items-center justify-center gap-5 p-[30px] bg-white rounded-[15px] shadow-lg overflow-y-auto">
            <SocialLinksManager onClose={() => setShowSocialLinksPopup(false)} />
          </div>
        </div>
      )}

      {/* Personal Info Popup */}
      {showPersonalInfoPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className="flex flex-col w-[600px] items-center justify-center gap-5 p-[30px] relative bg-white rounded-[15px]"
            role="dialog"
            aria-labelledby="info-setting-title"
          >
            <div className="flex items-center justify-end gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
              <button
                type="button"
                aria-label="Close dialog"
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                onClick={handleCancelPersonalInfo}
              >
                <XIcon className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="flex flex-col items-start pt-0 pb-5 px-5 relative self-stretch w-full flex-[0_0_auto]">
              <div className="flex flex-col items-start gap-2.5 pt-0 pb-[15px] px-0 relative self-stretch w-full flex-[0_0_auto]">
                <div className="inline-flex items-center gap-[5px] relative flex-[0_0_auto]">
                  <label
                    htmlFor="username-input"
                    className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-off-black text-lg tracking-[0] leading-[23px] whitespace-nowrap"
                  >
                    User name
                  </label>
                </div>

                <div className="flex items-center px-2.5 py-[15px] relative self-stretch w-full flex-[0_0_auto] bg-monowhite rounded-lg overflow-hidden border-2 border-solid border-light-grey shadow-inputs">
                  <input
                    id="username-input"
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    className="relative w-full mt-[-2.00px] [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[normal] bg-transparent border-none outline-none"
                    aria-describedby="username-help"
                  />
                </div>
              </div>

              <div className="flex flex-col items-start gap-2.5 px-0 py-[15px] relative self-stretch w-full flex-[0_0_auto]">
                <div className="inline-flex items-center gap-[5px] relative flex-[0_0_auto]">
                  <label
                    htmlFor="bio-textarea"
                    className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-off-black text-lg tracking-[0] leading-[23px] whitespace-nowrap"
                  >
                    Bio
                  </label>
                </div>

                <div className="flex flex-col h-[120px] items-start justify-between px-2.5 py-[15px] relative self-stretch w-full bg-monowhite rounded-lg overflow-hidden border-2 border-solid border-light-grey shadow-inputs">
                  <textarea
                    id="bio-textarea"
                    value={formBio}
                    onChange={(e) => setFormBio(e.target.value)}
                    placeholder="Write something about yourself"
                    className="relative w-full flex-1 mt-[-2.00px] [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[normal] bg-transparent border-none outline-none resize-none placeholder:text-medium-dark-grey"
                    maxLength={140}
                    aria-describedby="bio-counter"
                  />

                  <div
                    id="bio-counter"
                    className="relative self-stretch [font-family:'Maven_Pro',Helvetica] font-normal text-medium-dark-grey text-sm text-right tracking-[0] leading-[normal]"
                    aria-live="polite"
                  >
                    {formData.bio.length}/140
                  </div>
                </div>
              </div>

              <ImageUploader
                type="avatar"
                currentImage={profileImage}
                onImageUploaded={handleProfileImageLocalUpdate}
                onError={handleImageUploadError}
              />

              <ImageUploader
                type="banner"
                currentImage={bannerImage}
                onImageUploaded={handleBannerImageLocalUpdate}
                onError={handleImageUploadError}
              />

              <div className="flex items-center justify-end gap-5 pt-5 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto]">
                <button
                  type="button"
                  onClick={handleCancelPersonalInfo}
                  className="all-[unset] box-border inline-flex items-center justify-center gap-[30px] px-5 py-2.5 relative flex-[0_0_auto] rounded-[15px] hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="relative w-fit mt-[-2.00px] font-p-l font-[number:var(--p-l-font-weight)] text-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
                    Cancel
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleSavePersonalInfo}
                  disabled={isSaving}
                  className="all-[unset] box-border inline-flex items-center justify-center gap-[15px] px-5 py-2.5 relative flex-[0_0_auto] bg-red rounded-[50px] hover:bg-red/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-white text-lg tracking-[0] leading-[25.2px] whitespace-nowrap">
                    {isSaving ? 'Saving...' : 'Save'}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSuccess={() => {
          showToast("Password changed successfully!", "success");
        }}
      />

      {/* Cover image upload modal */}
      {showCoverUploader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4 text-center">Change Cover Image</h3>
            <ImageUploader
              type="banner"
              currentImage={user?.coverUrl}
              onImageUploaded={handleBannerImageUploaded}
              onError={handleImageUploadError}
            />
            <button
              onClick={() => setShowCoverUploader(false)}
              className="mt-4 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Avatar upload modal */}
      {showAvatarUploader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4 text-center">Change Avatar</h3>
            <ImageUploader
              type="avatar"
              currentImage={user?.faceUrl}
              onImageUploaded={handleProfileImageUploaded}
              onError={handleImageUploadError}
            />
            <button
              onClick={() => setShowAvatarUploader(false)}
              className="mt-4 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}


    </main>
  );
};
