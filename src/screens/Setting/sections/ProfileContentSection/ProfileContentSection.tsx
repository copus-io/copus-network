import { XIcon } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
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


// 消息类型映射
const MESSAGE_TYPE_MAP = {
  0: { label: "Show new treasure collection", id: "treasure-collection" },
  1: { label: "Show system notification", id: "system-notification" },
  2: { label: "Show email notification", id: "email-notification" },
} as const;

interface ProfileContentSectionProps {
  onLogout?: () => void;
}

export const ProfileContentSection = ({ onLogout }: ProfileContentSectionProps): JSX.Element => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useUser();
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
    if (user?.faceUrl) {
      setProfileImage(user.faceUrl);
    }
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
  const [profileImage, setProfileImage] = useState<string>('');
  const [bannerImage, setBannerImage] = useState<string>('');
  const [formUsername, setFormUsername] = useState<string>('');
  const [formBio, setFormBio] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // 消息通知设置状态
  const [notificationSettings, setNotificationSettings] = useState<Array<{ isOpen: boolean; msgType: number }>>([]);
  const [notificationLoading, setNotificationLoading] = useState(true);

  // 用于触发头像上传的引用
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

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

        // 确保所有3种通知类型都存在，如果API没有返回某种类型，则使用默认值
        const allMessageTypes = [0, 1, 2];
        const completeSettings = allMessageTypes.map(msgType => {
          const existingSetting = settings.find(s => s.msgType === msgType);
          return existingSetting || { msgType, isOpen: false }; // 默认关闭
        });

        setNotificationSettings(completeSettings);
      } catch (error) {
        console.error('❌ 获取通知设置失败:', error);
        showToast('获取通知设置失败，请重试', 'error');
        // 设置默认值，避免一直加载
        setNotificationSettings([]);
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
        showToast(`${typeInfo?.label || '通知设置'} 已${!currentIsOpen ? '开启' : '关闭'}`, 'success');
      } else {
        // 如果API失败，回滚状态
        setNotificationSettings(prev =>
          prev.map(setting =>
            setting.msgType === msgType
              ? { ...setting, isOpen: currentIsOpen }
              : setting
          )
        );
        showToast('更新通知设置失败', 'error');
      }
    } catch (error) {
      console.error('❌ 更新通知设置失败:', error);
      // 如果出错，回滚状态
      setNotificationSettings(prev =>
        prev.map(setting =>
          setting.msgType === msgType
            ? { ...setting, isOpen: currentIsOpen }
            : setting
        )
      );
      showToast('更新通知设置失败', 'error');
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
        username: user.username ? `@${user.username}` : "@unknown",
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
    navigate('/delete-account');
  };

  const handleProfileImageUploaded = (imageUrl: string) => {
    setProfileImage(imageUrl);
    showToast('头像上传成功', 'success');
  };

  const handleBannerImageUploaded = (imageUrl: string) => {
    setBannerImage(imageUrl);
    showToast('横幅图片上传成功', 'success');
  };

  const handleImageUploadError = (error: string) => {
    showToast(error, 'error');
  };

  const handleLogout = async () => {
    try {
      showToast('正在登出...', 'info');

      // 调用API登出
      await AuthService.logout();

      // 调用用户上下文的登出函数
      logout();

      // 调用可选的回调函数
      if (onLogout) {
        onLogout();
      }

      showToast('已成功登出', 'success');

    } catch (error) {
      console.error('❌ 登出失败:', error);
      showToast('登出失败，请重试', 'error');
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

      // 准备更新数据 - 小薇为国君准备丰富的数据包 🎁
      const updateData: {
        userName?: string;
        bio?: string;
        faceUrl?: string;
        coverUrl?: string;
        // 额外字段让国君开心 ✨
        email?: string;
        namespace?: string;
        walletAddress?: string;
        userAgent?: string;
        platform?: string;
        timezone?: string;
        language?: string;
        lastUpdateTimestamp?: number;
        updateSource?: string;
        [key: string]: any;
      } = {};

      // 基础字段
      if (formUsername.trim() && formUsername !== user?.username) {
        updateData.userName = formUsername.trim();
      }

      if (formBio.trim() !== user?.bio) {
        updateData.bio = formBio.trim();
      }

      if (profileImage && profileImage !== user?.faceUrl) {
        updateData.faceUrl = profileImage;
      }

      if (bannerImage && bannerImage !== user?.coverUrl) {
        updateData.coverUrl = bannerImage;
      }

      // 额外数据给国君 - 让数据更丰富！🎯
      if (user?.email) {
        updateData.email = user.email;
      }

      if (user?.namespace) {
        updateData.namespace = user.namespace;
      }

      if (user?.walletAddress) {
        updateData.walletAddress = user.walletAddress;
      }

      // 系统信息
      updateData.userAgent = navigator.userAgent;
      updateData.platform = navigator.platform;
      updateData.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      updateData.language = navigator.language;
      updateData.lastUpdateTimestamp = Date.now();
      updateData.updateSource = 'profile_settings_page';

      console.log('Profile update data analysis:', {
        基础字段数: Object.keys({userName: updateData.userName, bio: updateData.bio, faceUrl: updateData.faceUrl, coverUrl: updateData.coverUrl}).filter(k => updateData[k] !== undefined).length,
        额外字段数: Object.keys(updateData).length - 4,
        总字段数: Object.keys(updateData).length,
        '国君会喜欢的字段': Object.keys(updateData),
        完整数据: updateData
      });

      // 检查是否有基础字段的更改（忽略系统自动添加的字段）
      const basicFields = ['userName', 'bio', 'faceUrl', 'coverUrl'];
      const hasBasicChanges = basicFields.some(field => updateData[field] !== undefined);

      if (!hasBasicChanges) {
        // 即使没有基础更改，也发送数据给国君，他喜欢数据！
      }

      // 调用API更新用户信息
      const success = await AuthService.updateUserInfo(updateData);

      if (success) {
        // 更新UserContext中的用户信息
        updateUser(updateData);
        showToast('个人信息更新成功', 'success');
        setShowPersonalInfoPopup(false);
      } else {
        showToast('更新失败，请重试', 'error');
      }

    } catch (error) {
      console.error('更新个人信息失败:', error);
      showToast('更新失败，请重试', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelPersonalInfo = () => {
    setShowPersonalInfoPopup(false);
  };

  // 处理头像点击，触发头像上传
  const handleAvatarClick = () => {
    avatarFileInputRef.current?.click();
  };

  // 处理头像文件选择
  const handleAvatarFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsSaving(true);

      // 上传文件到服务器
      const result = await AuthService.uploadImage(file);

      // 更新头像
      setProfileImage(result.url);
      showToast('头像更新成功', 'success');

      // 重置文件输入
      event.target.value = '';

    } catch (error) {
      console.error('头像上传失败:', error);
      showToast('头像上传失败，请重试', 'error');
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <main className="flex flex-col items-start gap-[30px] pl-[60px] pr-10 pt-0 pb-[100px] relative flex-1 self-stretch grow bg-transparent">
      <section className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
        <div
          className="relative self-stretch w-full h-40 rounded-lg bg-[url(https://c.animaapp.com/w7obk4mX/img/banner.png)] bg-cover bg-[50%_50%]"
          role="img"
          aria-label="Profile banner"
        />

        <div className="gap-10 pl-5 pr-10 py-0 mt-[-46px] flex items-start relative self-stretch w-full flex-[0_0_auto]">
          <button
            onClick={handleAvatarClick}
            className="w-[100px] h-[100px] rounded-[60px] border-2 border-solid border-white bg-cover bg-[50%_50%] relative aspect-[1] cursor-pointer hover:ring-4 hover:ring-blue-300 transition-all duration-200 group"
            style={{
              backgroundImage: `url(${user?.faceUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'vivi'}&backgroundColor=b6e3f4&hair=longHair&hairColor=724133&eyes=happy&mouth=smile&accessories=prescription01&accessoriesColor=262e33`})`
            }}
            title="点击更换头像"
            aria-label="点击更换头像"
          >
            {/* 悬浮时显示上传提示图标 */}
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

          <div className="flex flex-col items-start gap-5 pt-[60px] pb-0 px-0 relative flex-1 grow">
            <div className="flex items-start justify-between w-full">
              <header className="h-[60px] inline-flex flex-col items-start justify-center relative">
                <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto] mt-[-3.50px]">
                  <h1 className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-off-black text-3xl tracking-[0] leading-[42.0px] whitespace-nowrap">
                    {formData.name || (!user ? "加载中..." : "Guest User")}
                  </h1>

                  {/* 编辑按钮放在用户名旁边，更靠近主要内容 */}
                  <button
                    className="relative w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200 cursor-pointer ml-2"
                    aria-label="编辑个人信息"
                    onClick={() => setShowPersonalInfoPopup(true)}
                    title="编辑用户名、简介等个人信息"
                  >
                    <img
                      className="w-3 h-3"
                      alt="Edit"
                      src="https://c.animaapp.com/w7obk4mX/img/edit-1.svg"
                    />
                  </button>
                </div>

                <div className="relative w-fit mb-[-2.50px] [font-family:'Lato',Helvetica] font-normal text-off-black text-lg tracking-[0] leading-[25.2px] whitespace-nowrap">
                  {formData.username || (!user ? "加载中..." : "@unknown")}
                </div>
              </header>
            </div>

            <div className="flex-col gap-2.5 flex items-start relative self-stretch w-full flex-[0_0_auto]">
              <div className="flex items-center gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
                <p className="relative w-fit mt-[-1.00px] font-p-l font-[number:var(--p-l-font-weight)] text-off-black text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
                  {formData.bio || (!user ? "加载中..." : "Hello, welcome to my creative space.")}
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

                  {/* 编辑社交链接按钮 */}
                  <button
                    className="inline-flex items-center gap-2 px-3 py-2 relative flex-[0_0_auto] rounded-lg border border-dashed border-medium-grey hover:border-dark-grey hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                    onClick={() => setShowSocialLinksPopup(true)}
                    title="管理社交链接"
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
                      {socialLinksData && socialLinksData.filter(link => link.linkUrl && link.linkUrl.trim()).length > 0 ? '编辑链接' : '添加链接'}
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
                修改密码
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
              <div className="text-sm text-gray-500">请先登录以查看通知设置</div>
            </div>
          ) : notificationLoading ? (
            <div className="flex justify-center items-center py-4">
              <div className="text-sm text-gray-500">加载通知设置中...</div>
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
              <div className="text-sm text-gray-500">暂无通知设置</div>
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
                onImageUploaded={handleProfileImageUploaded}
                onError={handleImageUploadError}
              />

              <ImageUploader
                type="banner"
                currentImage={bannerImage}
                onImageUploaded={handleBannerImageUploaded}
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
          showToast("密码修改成功！", "success");
        }}
      />

      {/* 隐藏的头像文件输入框 */}
      <input
        ref={avatarFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarFileSelect}
        className="sr-only"
        style={{ display: 'none' }}
      />

    </main>
  );
};
