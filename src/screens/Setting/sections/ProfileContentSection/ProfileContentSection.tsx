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
// Message types in display order (998 first, then numerical order)
const MESSAGE_TYPE_ORDER = [998, 2, 3, 4, 6, 7, 8, 9];

const MESSAGE_TYPE_MAP = {
  998: { label: "Receive daily email summaries from Copus", id: "email-summaries" },
  2: { label: "Show new followers of your treasury", id: "treasury-followers" },
  3: { label: "Show new treasures from followed treasuries", id: "followed-treasures" },
  4: { label: "Show new comments", id: "new-comments" },
  6: { label: "Show new comment replies", id: "comment-replies" },
  7: { label: "Show new comment likes", id: "comment-likes" },
  8: { label: "Show new earnings", id: "new-earnings" },
  9: { label: "Show new treasure collections", id: "treasure-collections" },
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
  const { socialLinks: socialLinksData, socialLinksLoading, fetchSocialLinks, deleteSocialLink } = useUser();

  // Fetch social links when page loads (since we don't fetch them globally anymore)
  React.useEffect(() => {
    if (user) {
      fetchSocialLinks();
    }
  }, [user, fetchSocialLinks]);

  // 智能图片加载检测
  const checkImageLoad = React.useCallback((imageUrl: string) => {
    if (!imageUrl) return;

    setBannerImageLoaded(false);
    setShowLoadingSpinner(false);

    let isLoaded = false;

    // 延迟300ms显示loading，如果图片快速加载完成就不显示loading
    const loadingTimer = setTimeout(() => {
      if (!isLoaded) {
        setShowLoadingSpinner(true);
      }
    }, 300);

    // 创建新图片对象检测加载
    const img = new Image();
    img.onload = () => {
      isLoaded = true;
      clearTimeout(loadingTimer);
      setBannerImageLoaded(true);
      setShowLoadingSpinner(false);
    };
    img.onerror = () => {
      isLoaded = true;
      clearTimeout(loadingTimer);
      setBannerImage('');
      setBannerImageLoaded(false);
      setShowLoadingSpinner(false);
    };
    img.src = imageUrl;

    // 清理函数
    return () => clearTimeout(loadingTimer);
  }, []);

  // 初始化图片状态和表单数据
  React.useEffect(() => {
    // Set profile image - use faceUrl if available, otherwise use default
    setProfileImage(user?.faceUrl || profileDefaultAvatar);

    if (user?.coverUrl) {
      setBannerImage(user.coverUrl);
      checkImageLoad(user.coverUrl);
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
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState<string>('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState<string>('');
  const [isSavingDescription, setIsSavingDescription] = useState(false);
  const [isEditingCustomId, setIsEditingCustomId] = useState(false);
  const [editedCustomId, setEditedCustomId] = useState<string>('');
  const [isSavingCustomId, setIsSavingCustomId] = useState(false);
  const [showCoverUploader, setShowCoverUploader] = useState(false);
  const [showAvatarUploader, setShowAvatarUploader] = useState(false);
  const [isAvatarSaving, setIsAvatarSaving] = useState(false);
  const [isCoverSaving, setIsCoverSaving] = useState(false);
  const [bannerImageLoaded, setBannerImageLoaded] = useState(false);
  const [showLoadingSpinner, setShowLoadingSpinner] = useState(false);

  // 消息通知设置状态
  const [notificationSettings, setNotificationSettings] = useState<Array<{ isOpen: boolean; msgType: number }>>([]);
  const [notificationLoading, setNotificationLoading] = useState(true);

  // OAuth/Wallet authentication status (Google, Metamask, etc.)
  const [isPasswordlessAuth, setIsPasswordlessAuth] = useState(false);
  const [checkingAuthMethod, setCheckingAuthMethod] = useState(true);

  // 阻止背景滚动
  useEffect(() => {
    if (showPersonalInfoPopup || showSocialLinksPopup || showChangePasswordModal || showCoverUploader || showAvatarUploader) {
      // 禁止背景滚动
      document.body.style.overflow = 'hidden';
    } else {
      // 恢复背景滚动
      document.body.style.overflow = 'unset';
    }

    // 清理函数
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showPersonalInfoPopup, showSocialLinksPopup, showChangePasswordModal, showCoverUploader, showAvatarUploader]);

  // Check authentication method to determine if password management should be shown
  useEffect(() => {
    const checkAuthMethod = () => {
      if (!user) {
        console.log('🔍 No user logged in, skipping auth method check');
        setCheckingAuthMethod(false);
        setIsPasswordlessAuth(false);
        return;
      }

      console.log('🔍 Checking login method for user:', {
        email: user.email,
        walletAddress: user.walletAddress,
        hasEmail: !!user.email,
        hasWallet: !!user.walletAddress
      });

      // Check localStorage for auth method flag set during login
      const authMethod = localStorage.getItem('copus_auth_method');
      console.log('🔍 Stored auth method:', authMethod);

      // Hide password section for users who logged in via:
      // - Google OAuth (no password in system, managed by Google)
      // - Metamask wallet (no password in system, wallet-based auth)

      if (authMethod === 'google' || authMethod === 'metamask') {
        console.log(`✅ User logged in via ${authMethod} - hiding password section`);
        setIsPasswordlessAuth(true);
      } else {
        console.log('❌ User logged in via email/password or X - showing password section');
        setIsPasswordlessAuth(false);
      }

      setCheckingAuthMethod(false);
    };

    checkAuthMethod();
  }, [user]);

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

        // Always show all notification types from MESSAGE_TYPE_ORDER
        // Merge with API response - use API values where available, default to ON for missing
        const allMessageTypes = MESSAGE_TYPE_ORDER;
        const settingsMap = new Map(settings?.map(s => [s.msgType, s.isOpen]) || []);

        const mergedSettings = allMessageTypes.map(msgType => ({
          msgType,
          isOpen: settingsMap.has(msgType) ? settingsMap.get(msgType)! : true
        }));

        setNotificationSettings(mergedSettings);
      } catch (error) {
        console.error('❌ Failed to get notification settings:', error);
        showToast('Failed to get notification settings, please try again', 'error');
        // Set default values to avoid infinite loading - all notifications ON by default
        setNotificationSettings(
          MESSAGE_TYPE_ORDER.map(msgType => ({ msgType, isOpen: true }))
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
        name: user.username || "Anonymous",
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
    setIsAvatarSaving(true);
    try {
      // Call API to update user profile
      const success = await AuthService.updateUserInfo({
        userName: formUsername || user?.username || '',
        bio: formBio || user?.bio || '',
        faceUrl: imageUrl,
        coverUrl: bannerImage || user?.coverUrl || ''
      });

      if (!success) {
        throw new Error('API returned failure');
      }

      // Update user context with new image URL
      // This must be done AFTER API success to ensure UI shows new avatar
      updateUser({ faceUrl: imageUrl });
      setProfileImage(imageUrl);

      // Close modal and show success
      setShowAvatarUploader(false);
      showToast('Avatar updated successfully!', 'success');
    } catch (error) {
      console.error('Failed to update avatar:', error);
      showToast('Failed to update avatar, please try again', 'error');
    } finally {
      setIsAvatarSaving(false);
    }
  };

  const handleBannerImageUploaded = async (imageUrl: string) => {
    setIsCoverSaving(true);
    try {
      // Call API to update user profile
      const success = await AuthService.updateUserInfo({
        userName: formUsername || user?.username || '',
        bio: formBio || user?.bio || '',
        faceUrl: profileImage === profileDefaultAvatar ? '' : (profileImage || user?.faceUrl || ''),
        coverUrl: imageUrl
      });

      if (!success) {
        throw new Error('API returned failure');
      }

      // Update user context with new image URL
      updateUser({ coverUrl: imageUrl });
      setBannerImage(imageUrl);
      checkImageLoad(imageUrl);

      // Close modal and show success
      setShowCoverUploader(false);
      showToast('Cover image updated successfully!', 'success');
    } catch (error) {
      console.error('Failed to update cover image:', error);
      showToast('Failed to update cover image, please try again', 'error');
    } finally {
      setIsCoverSaving(false);
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
    if (imageUrl) {
      checkImageLoad(imageUrl);
    }
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
        // 延迟刷新页面让用户看到成功消息
        setTimeout(() => {
          window.location.reload();
        }, 1500);
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

  // Handle inline name editing
  const handleStartEditingName = () => {
    setEditedName(formData.name || user?.username || '');
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }

    setIsSavingName(true);
    try {
      const success = await AuthService.updateUserInfo({
        userName: editedName.trim(),
        bio: formBio || user?.bio || '',
        faceUrl: profileImage === profileDefaultAvatar ? '' : profileImage,
        coverUrl: bannerImage || ''
      });

      if (success) {
        updateUser({ username: editedName.trim() });
        setFormUsername(editedName.trim());
        setFormData(prev => ({ ...prev, name: editedName.trim() }));
        setIsEditingName(false);
        showToast('Name updated successfully', 'success');
      } else {
        showToast('Update failed, please try again', 'error');
      }
    } catch (error) {
      console.error('Failed to update name:', error);
      showToast('Update failed, please try again', 'error');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleCancelEditingName = () => {
    setIsEditingName(false);
    setEditedName('');
  };

  // Handle inline description editing
  const handleStartEditingDescription = () => {
    setEditedDescription(formData.bio || user?.bio || '');
    setIsEditingDescription(true);
  };

  const handleSaveDescription = async () => {
    setIsSavingDescription(true);
    try {
      const success = await AuthService.updateUserInfo({
        userName: formUsername || user?.username || '',
        bio: editedDescription.trim(),
        faceUrl: profileImage === profileDefaultAvatar ? '' : profileImage,
        coverUrl: bannerImage || ''
      });

      if (success) {
        updateUser({ bio: editedDescription.trim() });
        setFormBio(editedDescription.trim());
        setFormData(prev => ({ ...prev, bio: editedDescription.trim() }));
        setIsEditingDescription(false);
        showToast('Description updated successfully', 'success');
      } else {
        showToast('Update failed, please try again', 'error');
      }
    } catch (error) {
      console.error('Failed to update description:', error);
      showToast('Update failed, please try again', 'error');
    } finally {
      setIsSavingDescription(false);
    }
  };

  const handleCancelEditingDescription = () => {
    setIsEditingDescription(false);
    setEditedDescription('');
  };

  // Handle inline custom ID editing
  const handleStartEditingCustomId = () => {
    setEditedCustomId(user?.namespace || '');
    setIsEditingCustomId(true);
  };

  const validateCustomId = (id: string): string | null => {
    if (!id.trim()) {
      return 'Custom ID cannot be empty';
    }
    if (id.length < 3) {
      return 'Custom ID must be at least 3 characters';
    }
    if (id.length > 20) {
      return 'Custom ID cannot exceed 20 characters';
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
      return 'Custom ID can only contain letters, numbers, underscores and hyphens';
    }
    return null;
  };

  const handleSaveCustomId = async () => {
    const validationError = validateCustomId(editedCustomId);
    if (validationError) {
      showToast(validationError, 'error');
      return;
    }

    setIsSavingCustomId(true);
    try {
      const success = await AuthService.updateUserNamespace(editedCustomId.trim());
      if (success) {
        updateUser({ namespace: editedCustomId.trim() });
        setFormData(prev => ({ ...prev, username: `@${editedCustomId.trim()}` }));
        setIsEditingCustomId(false);
        showToast('Custom ID updated successfully!', 'success');
      } else {
        showToast('Update failed, please try again', 'error');
      }
    } catch (error) {
      console.error('Failed to update custom ID:', error);
      showToast('Failed to update custom ID, please try again', 'error');
    } finally {
      setIsSavingCustomId(false);
    }
  };

  const handleCancelEditingCustomId = () => {
    setIsEditingCustomId(false);
    setEditedCustomId('');
  };

  // Handle deleting social link
  const handleDeleteSocialLink = async (linkId: number, linkTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${linkTitle}" link?`)) return;

    try {
      const success = await deleteSocialLink(linkId);
      if (success) {
        showToast(`${linkTitle} link deleted successfully`, 'success');
      } else {
        showToast('Failed to delete link, please try again', 'error');
      }
    } catch (error) {
      console.error('Failed to delete link:', error);
      showToast('Failed to delete link, please try again', 'error');
    }
  };

  return (
    <main className="flex flex-col items-start gap-5 px-4 lg:pl-[60px] lg:pr-10 pt-5 pb-5 relative flex-1 self-stretch grow bg-transparent">
      {/* Identity section */}
      <section className="flex flex-col items-start gap-3 relative self-stretch w-full flex-[0_0_auto] pb-8 border-b border-[#E0E0E0]">
        <div className="pt-0 pb-1 px-0 flex-[0_0_auto] inline-flex flex-col items-start justify-center relative">
          <h2 className="relative w-fit mt-[-1.00px] font-h-3 font-[number:var(--h-3-font-weight)] text-off-black text-[length:var(--h-3-font-size)] tracking-[var(--h-3-letter-spacing)] leading-[var(--h-3-line-height)] whitespace-nowrap [font-style:var(--h-3-font-style)]">
            Identity
          </h2>
        </div>

        {/* Username and Bio */}
        <div className="flex flex-col items-start gap-5 relative w-full max-w-[500px]">
          {/* Name */}
          <div className="flex flex-col items-start gap-1">
            <h3 className="[font-family:'Lato',Helvetica] font-normal text-[#696969] text-sm tracking-[0] leading-[20px]">Name</h3>
            {isEditingName ? (
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="[font-family:'Lato',Helvetica] font-medium text-off-black text-base tracking-[0] leading-[1.4] px-4 py-2 border border-gray-300 rounded-[20px] focus:outline-none focus:border-blue-500 w-[280px]"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') handleCancelEditingName();
                  }}
                />
                <button
                  onClick={handleSaveName}
                  disabled={isSavingName}
                  className="px-4 py-2 bg-red text-white rounded-[20px] text-sm hover:bg-red/90 transition-colors disabled:opacity-50"
                >
                  {isSavingName ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancelEditingName}
                  disabled={isSavingName}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-[20px] text-sm hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <h1 className="[font-family:'Lato',Helvetica] font-medium text-off-black text-base tracking-[0] leading-[1.4]">
                  {formData.name || (!user ? "Loading..." : "Anonymous")}
                </h1>

                {/* Edit button next to username */}
                <button
                  className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                  aria-label="Edit name"
                  onClick={handleStartEditingName}
                  title="Edit name"
                >
                  <img
                    className="w-4 h-4"
                    alt="Edit"
                    src="https://c.animaapp.com/w7obk4mX/img/edit-1.svg"
                  />
                </button>
              </div>
            )}
          </div>

          {/* Custom ID */}
          <div className="flex flex-col items-start gap-1">
            <h3 className="[font-family:'Lato',Helvetica] font-normal text-[#696969] text-sm tracking-[0] leading-[20px]">Custom ID</h3>
            {isEditingCustomId ? (
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={editedCustomId}
                  onChange={(e) => setEditedCustomId(e.target.value)}
                  className="[font-family:'Lato',Helvetica] font-normal text-off-black text-base tracking-[0] leading-[1.4] px-4 py-2 border border-gray-300 rounded-[20px] focus:outline-none focus:border-blue-500 w-[280px]"
                  autoFocus
                  placeholder="Enter 3-20 characters"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveCustomId();
                    if (e.key === 'Escape') handleCancelEditingCustomId();
                  }}
                />
                <button
                  onClick={handleSaveCustomId}
                  disabled={isSavingCustomId}
                  className="px-4 py-2 bg-red text-white rounded-[20px] text-sm hover:bg-red/90 transition-colors disabled:opacity-50"
                >
                  {isSavingCustomId ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancelEditingCustomId}
                  disabled={isSavingCustomId}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-[20px] text-sm hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <p className="[font-family:'Lato',Helvetica] font-normal text-off-black text-base tracking-[0] leading-[1.4]">
                  @{user?.namespace || (!user ? "Loading..." : "Not set")}
                </p>

                {/* Edit button next to custom ID */}
                <button
                  className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                  aria-label="Edit custom ID"
                  onClick={handleStartEditingCustomId}
                  title="Edit custom ID"
                >
                  <img
                    className="w-4 h-4"
                    alt="Edit"
                    src="https://c.animaapp.com/w7obk4mX/img/edit-1.svg"
                  />
                </button>
              </div>
            )}
            <p className="[font-family:'Lato',Helvetica] font-normal text-gray-500 text-sm tracking-[0] leading-[1.4]">
              Set a unique custom ID for easy sharing and promotion
            </p>
          </div>

          {/* Description */}
          <div className="flex flex-col items-start gap-1">
            <h3 className="[font-family:'Lato',Helvetica] font-normal text-[#696969] text-sm tracking-[0] leading-[20px]">Description</h3>
            {isEditingDescription ? (
              <div className="flex items-end gap-3">
                <div className="relative">
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className={`[font-family:'Lato',Helvetica] font-normal text-off-black text-base tracking-[0] leading-[1.4] px-4 py-3 pr-16 border rounded-[20px] focus:outline-none focus:border-blue-500 w-[450px] h-[80px] resize-none transition-colors ${
                      editedDescription.length >= 55 ? 'border-orange-400' : editedDescription.length > 0 ? 'border-gray-300' : 'border-gray-300'
                    }`}
                    autoFocus
                    maxLength={60}
                    placeholder="A short bio about yourself"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSaveDescription();
                      }
                      if (e.key === 'Escape') handleCancelEditingDescription();
                    }}
                  />
                  <span className={`absolute right-4 bottom-3 text-sm font-medium transition-colors ${
                    editedDescription.length >= 55 ? 'text-red-500' :
                    editedDescription.length >= 50 ? 'text-orange-500' :
                    editedDescription.length > 0 ? 'text-gray-400' :
                    'text-gray-400'
                  }`}>
                    {editedDescription.length}/60
                  </span>
                </div>
                <button
                  onClick={handleSaveDescription}
                  disabled={isSavingDescription}
                  className="px-4 py-2 mb-3 bg-red text-white rounded-[20px] text-sm hover:bg-red/90 transition-colors disabled:opacity-50"
                >
                  {isSavingDescription ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancelEditingDescription}
                  disabled={isSavingDescription}
                  className="px-4 py-2 mb-3 bg-gray-200 text-gray-700 rounded-[20px] text-sm hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <p className="[font-family:'Lato',Helvetica] font-normal text-off-black text-base tracking-[0] leading-[1.4]">
                  {formData.bio || (!user ? "Loading..." : "Hello, welcome to my creative space.")}
                </p>

                {/* Edit button next to bio */}
                <button
                  className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                  aria-label="Edit bio"
                  onClick={handleStartEditingDescription}
                  title="Edit bio"
                >
                  <img
                    className="w-4 h-4"
                    alt="Edit"
                    src="https://c.animaapp.com/w7obk4mX/img/edit-1.svg"
                  />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile and Cover images in one row on desktop, stacked on mobile */}
        <div className="flex flex-col lg:flex-row items-start gap-5 lg:gap-8 relative w-full max-w-[650px] mt-3">
          {/* Profile image */}
          <div className="flex flex-col items-start gap-2 flex-shrink-0">
            <h3 className="[font-family:'Lato',Helvetica] font-normal text-[#696969] text-sm tracking-[0] leading-[20px]">Profile image</h3>
            <button
              onClick={handleAvatarClick}
              className="w-[60px] h-[60px] lg:w-[80px] lg:h-[80px] rounded-full border-2 border-solid border-light-grey relative aspect-[1] cursor-pointer hover:ring-4 hover:ring-blue-300 transition-all duration-200 group overflow-hidden bg-gray-100 flex-shrink-0"
              title="Click to change avatar"
              aria-label="Click to change avatar"
            >
              <img
                key={user?.faceUrl || 'default'}
                src={(user?.faceUrl && user.faceUrl.trim()) ? user.faceUrl : profileDefaultAvatar}
                alt="Profile avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = profileDefaultAvatar;
                }}
              />
              <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
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
          </div>

          {/* Divider - hidden on mobile, aligned with profile/cover images */}
          <div className="hidden lg:block w-px h-[80px] bg-[#E0E0E0] mt-[28px]"></div>

          {/* Cover image */}
          <div className="flex flex-col items-start gap-2">
            <h3 className="[font-family:'Lato',Helvetica] font-normal text-[#696969] text-sm tracking-[0] leading-[20px]">Cover image</h3>
            <button
              onClick={handleCoverClick}
              className="w-[250px] lg:w-[480px] h-[60px] lg:h-[80px] relative cursor-pointer hover:opacity-90 transition-opacity duration-200 group overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-2xl border border-gray-200 flex items-center justify-center"
          title="Click to change cover image"
          aria-label="Click to change cover image"
        >
          {bannerImage ? (
            <>
              <div
                className="w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-200"
                style={{
                  backgroundImage: `url(${bannerImage})`,
                  backgroundColor: '#f3f4f6'
                }}
              />
              {showLoadingSpinner && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-2xl flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-0 text-gray-500">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm font-medium">Add cover image</span>
            </div>
          )}

          {bannerImage && !showLoadingSpinner && (
            <div className="absolute inset-0 bg-black/50 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-20">
              <div className="flex flex-col items-center gap-2 text-white">
                <svg
                  className="w-8 h-8"
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
                <span className="text-sm font-medium">Change cover</span>
              </div>
            </div>
          )}
            </button>
          </div>
        </div>

        {/* Social links - below profile and cover */}
        <div className="flex flex-col items-start gap-2 mt-3 w-full max-w-[500px]">
          <h3 className="[font-family:'Lato',Helvetica] font-normal text-[#696969] text-sm tracking-[0] leading-[20px]">Social links</h3>

          {/* Display existing social links */}
          {socialLinksData && socialLinksData.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 mb-2">
              {socialLinksData.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full group"
                >
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    title={link.title || link.url}
                  >
                    {link.iconUrl && (
                      <img
                        src={link.iconUrl}
                        alt=""
                        className="w-5 h-5 rounded-sm object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <span className="[font-family:'Lato',Helvetica] font-normal text-sm text-off-black max-w-[150px] truncate">
                      {link.title || new URL(link.url).hostname}
                    </span>
                  </a>
                  <button
                    onClick={() => handleDeleteSocialLink(link.id, link.title || 'Link')}
                    className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete link"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowSocialLinksPopup(true)}
            className="flex items-center gap-2 px-5 h-[35px] rounded-[50px] border border-solid border-dark-grey text-dark-grey hover:bg-gray-100 transition-all duration-300 cursor-pointer"
            title="Manage social links"
            aria-label="Manage social links"
          >
            <svg
              className="w-4 h-4 text-dark-grey"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            <span className="[font-family:'Lato',Helvetica] font-normal text-[16px] leading-5">Add links</span>
          </button>
        </div>
      </section>

      <section className="flex flex-col items-start gap-5 pt-0 pb-8 px-0 relative self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-[#E0E0E0]">
        <div className="pt-0 pb-1 px-0 flex-[0_0_auto] inline-flex flex-col items-start justify-center relative">
          <h2 className="relative w-fit mt-[-1.00px] font-h-3 font-[number:var(--h-3-font-weight)] text-off-black text-[length:var(--h-3-font-size)] tracking-[var(--h-3-letter-spacing)] leading-[var(--h-3-line-height)] whitespace-nowrap [font-style:var(--h-3-font-style)]">
            Account
          </h2>
        </div>

        <div className="flex flex-col items-start gap-5 relative w-full">
          <div className="inline-flex flex-col items-start justify-center gap-1.5 relative flex-[0_0_auto]">
            <div className="inline-flex items-center justify-end gap-0.5 relative flex-[0_0_auto]">
              <h3 className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-[#696969] text-sm tracking-[0] leading-[20px] whitespace-nowrap">
                {user?.walletAddress ? 'Wallet address' : 'Email address'}
              </h3>
            </div>

            <div className="relative w-fit font-p-l font-[number:var(--p-l-font-weight)] text-medium-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
              {user?.walletAddress || user?.email || 'Not provided'}
            </div>
          </div>

          {/* Only show password section if user logged in via email/password */}
          {!isPasswordlessAuth && (
            <div className="inline-flex flex-col items-start justify-center gap-1.5 relative flex-[0_0_auto]">
              <div className="inline-flex items-center justify-end gap-0.5 relative flex-[0_0_auto]">
                <h3 className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-[#696969] text-sm tracking-[0] leading-[20px] whitespace-nowrap">
                  Password
                </h3>
              </div>

              <Button
                onClick={() => setShowChangePasswordModal(true)}
                variant="outline"
                className="flex items-center gap-2 px-5 h-[35px] rounded-[50px] border border-solid border-dark-grey text-dark-grey hover:bg-gray-100 transition-all duration-300"
              >
                <span className="[font-family:'Lato',Helvetica] font-normal text-[16px] leading-5">
                  Change Password
                </span>
              </Button>
            </div>
          )}
        </div>
      </section>

      <section className="flex flex-col items-start gap-5 pt-0 relative self-stretch w-full flex-[0_0_auto]">
        <div className="pt-0 pb-1 px-0 flex-[0_0_auto] inline-flex flex-col items-start justify-center relative">
          <h2 className="relative w-fit mt-[-1.00px] font-h-3 font-[number:var(--h-3-font-weight)] text-off-black text-[length:var(--h-3-font-size)] tracking-[var(--h-3-letter-spacing)] leading-[var(--h-3-line-height)] whitespace-nowrap [font-style:var(--h-3-font-style)]">
            Notification
          </h2>
        </div>

        <div className="flex flex-col items-start gap-3 pt-0 pb-8 px-0 relative self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-[#E0E0E0]">
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
                className="hover:opacity-70 transition-opacity"
                onClick={handleCancelPersonalInfo}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
                  <path d="M3 3L15 15M3 15L15 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className="flex flex-col items-start pt-0 pb-5 px-5 relative self-stretch w-full flex-[0_0_auto]">
              <div className="flex flex-col items-start gap-2.5 pt-0 pb-[15px] px-0 relative self-stretch w-full flex-[0_0_auto]">
                <div className="inline-flex items-center gap-[5px] relative flex-[0_0_auto]">
                  <label
                    htmlFor="username-input"
                    className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-[450] text-off-black text-[18px] tracking-[0] leading-[23px] whitespace-nowrap"
                  >
                    User name
                  </label>
                </div>

                <div className="flex items-center px-2.5 py-[15px] relative self-stretch w-full flex-[0_0_auto] bg-monowhite rounded-lg overflow-hidden border border-solid border-gray-300 shadow-inputs">
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
                    className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-[450] text-off-black text-[18px] tracking-[0] leading-[23px] whitespace-nowrap"
                  >
                    Bio
                  </label>
                </div>

                <div className={`flex items-center justify-between px-4 py-3 relative self-stretch w-full bg-monowhite rounded-lg overflow-hidden border border-solid transition-all duration-200 shadow-inputs ${
                  formBio.length >= 50 ? 'border-orange-400' : formBio.length > 0 ? 'border-green-400' : 'border-gray-300'
                }`}>
                  <input
                    id="bio-textarea"
                    type="text"
                    value={formBio}
                    onChange={(e) => setFormBio(e.target.value)}
                    placeholder="A short bio about yourself"
                    className="relative w-full [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[normal] bg-transparent border-none outline-none placeholder:text-medium-dark-grey transition-colors duration-200"
                    maxLength={60}
                    aria-describedby="bio-counter"
                  />

                  <div
                    id="bio-counter"
                    className={`relative ml-3 flex-shrink-0 [font-family:'Lato',Helvetica] font-medium text-sm tracking-[0] leading-[normal] transition-colors duration-200 ${
                      formBio.length >= 55 ? 'text-red-500' :
                      formBio.length >= 50 ? 'text-orange-500' :
                      formBio.length > 0 ? 'text-green-600' :
                      'text-medium-dark-grey'
                    }`}
                    aria-live="polite"
                  >
                    {formBio.length}/60
                  </div>
                </div>
              </div>

              <ImageUploader
                type="avatar"
                currentImage={profileImage}
                onImageUploaded={handleProfileImageLocalUpdate}
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

      {/* Change Password Modal - Only render if user logged in via email/password */}
      {!isPasswordlessAuth && (
        <ChangePasswordModal
          isOpen={showChangePasswordModal}
          onClose={() => setShowChangePasswordModal(false)}
          onSuccess={() => {
            showToast("Password changed successfully!", "success");
          }}
        />
      )}

      {/* Cover image upload modal */}
      {showCoverUploader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 relative">
            {isCoverSaving && (
              <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-red border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-600 font-medium">Saving cover image...</span>
                </div>
              </div>
            )}
            <h3 className="text-xl font-semibold mb-4 text-center">Change Cover Image</h3>
            <ImageUploader
              type="banner"
              currentImage={user?.coverUrl}
              onImageUploaded={handleBannerImageUploaded}
              onError={handleImageUploadError}
            />
            <button
              onClick={() => setShowCoverUploader(false)}
              disabled={isCoverSaving}
              className="mt-4 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Avatar upload modal */}
      {showAvatarUploader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 relative">
            {isAvatarSaving && (
              <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-red border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-600 font-medium">Saving avatar...</span>
                </div>
              </div>
            )}
            <h3 className="text-xl font-semibold mb-4 text-center">Change Avatar</h3>
            <ImageUploader
              type="avatar"
              currentImage={user?.faceUrl}
              onImageUploaded={handleProfileImageUploaded}
              onError={handleImageUploadError}
            />
            <button
              onClick={() => setShowAvatarUploader(false)}
              disabled={isAvatarSaving}
              className="mt-4 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      )}


    </main>
  );
};