import { XIcon } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useUser } from "../../../../contexts/UserContext";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import { AuthService } from "../../../../services/authService";
import { useToast } from "../../../../components/ui/toast";
import { SocialLinksManager } from "../../../../components/SocialLinksManager/SocialLinksManager";


const notificationSettings = [
  {
    id: "treasure-collection",
    label: "Show new treasure collection",
    enabled: true,
  },
  {
    id: "system-notification",
    label: "Show system notification",
    enabled: true,
  },
  {
    id: "email-notification",
    label: "Show email notification",
    enabled: true,
  },
];

interface ProfileContentSectionProps {
  onLogout?: () => void;
}

export const ProfileContentSection = ({ onLogout }: ProfileContentSectionProps): JSX.Element => {
  const { user, logout } = useUser();
  const { showToast } = useToast();
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showPersonalInfoPopup, setShowPersonalInfoPopup] = useState(false);
  const [showSocialLinksPopup, setShowSocialLinksPopup] = useState(false);
  const [editPopupData, setEditPopupData] = useState({
    title: "",
    value: "",
    field: "",
    isTextarea: false,
    placeholder: "",
  });

  // 使用 UserContext 中的社交链接数据
  const { socialLinks: socialLinksData, socialLinksLoading } = useUser();

  const [editingField, setEditingField] = useState<string | null>(null);
  const [notifications, setNotifications] = useState({
    treasureCollection: true,
    systemNotification: true,
    emailNotification: true,
  });

  const handleNotificationToggle = (id: string) => {
    setNotifications((prev) => ({
      ...prev,
      [id]: !prev[id as keyof typeof prev],
    }));
  };
  const [formData, setFormData] = useState({
    name: user?.username || "Guest User",
    username: user?.namespace ? `@${user.namespace}` : "@unknown",
    bio: user?.bio || "Hello, welcome to my creative space.",
    email: user?.email || "user@example.com",
  });

  // 当用户数据更新时，同步更新表单数据
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.username || "Guest User",
        username: user.namespace ? `@${user.namespace}` : "@unknown",
        bio: user.bio || "Hello, welcome to my creative space.",
        email: user.email || "user@example.com",
      }));
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


  const handleLogout = async () => {
    try {
      console.log('👋 用户点击登出按钮');
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
      console.log('✅ 登出成功');

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
  const handleSavePersonalInfo = () => {
    console.log("Saving personal info");
    setShowPersonalInfoPopup(false);
  };

  const handleCancelPersonalInfo = () => {
    setShowPersonalInfoPopup(false);
  };

  return (
    <main className="flex flex-col items-start gap-[30px] pl-[60px] pr-10 pt-0 pb-[30px] relative flex-1 self-stretch grow bg-transparent">
      <section className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
        <div
          className="relative self-stretch w-full h-40 rounded-lg bg-[url(https://c.animaapp.com/w7obk4mX/img/banner.png)] bg-cover bg-[50%_50%]"
          role="img"
          aria-label="Profile banner"
        />

        <div className="gap-10 pl-5 pr-10 py-0 mt-[-46px] flex items-start relative self-stretch w-full flex-[0_0_auto]">
          <div
            className="w-[100px] h-[100px] rounded-[60px] border-2 border-solid border-white bg-cover bg-[50%_50%] relative aspect-[1]"
            style={{
              backgroundImage: `url(${user?.faceUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'vivi'}&backgroundColor=b6e3f4&hair=longHair&hairColor=724133&eyes=happy&mouth=smile&accessories=prescription01&accessoriesColor=262e33`})`
            }}
            role="img"
            aria-label="Profile picture"
          />

          <div className="flex flex-col items-start gap-5 pt-[60px] pb-0 px-0 relative flex-1 grow">
            <div className="flex items-start justify-between w-full">
              <header className="h-[60px] inline-flex flex-col items-start justify-center relative">
                <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto] mt-[-3.50px]">
                  <h1 className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-off-black text-3xl tracking-[0] leading-[42.0px] whitespace-nowrap">
                    {formData.name}
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
                  {formData.username}
                </div>
              </header>
            </div>

            <div className="flex-col gap-2.5 flex items-start relative self-stretch w-full flex-[0_0_auto]">
              <div className="flex items-center gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
                <p className="relative w-fit mt-[-1.00px] font-p-l font-[number:var(--p-l-font-weight)] text-off-black text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
                  {formData.bio}
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
      </section>

      <section className="flex flex-col items-start gap-5 relative self-stretch w-full flex-[0_0_auto]">
        <div className="pt-0 pb-2.5 px-0 flex-[0_0_auto] inline-flex flex-col items-start justify-center relative">
          <h2 className="relative w-fit mt-[-1.00px] font-h-3 font-[number:var(--h-3-font-weight)] text-off-black text-[length:var(--h-3-font-size)] tracking-[var(--h-3-letter-spacing)] leading-[var(--h-3-line-height)] whitespace-nowrap [font-style:var(--h-3-font-style)]">
            Notification
          </h2>
        </div>

        <div className="flex flex-col items-start gap-5 pt-0 pb-[25px] px-0 relative self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-light-grey">
          {notificationSettings.map((setting) => (
            <div
              key={setting.id}
              className="inline-flex items-center gap-[15px] relative flex-[0_0_auto] rounded-[100px]"
            >
              <button
                className="relative w-[26px] h-[16.42px] bg-[#f23a00] rounded-[50px] aspect-[1.58] cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f23a00] flex items-center justify-start"
                onClick={() => handleNotificationToggle(setting.id)}
                role="switch"
                aria-checked={setting.enabled}
                aria-label={`Toggle ${setting.label}`}
              >
                <div className="w-3 h-3 bg-white rounded-full ml-0.5" />
              </button>

              <div className="inline-flex flex-col items-start justify-center gap-[5px] relative flex-[0_0_auto]">
                <label className="relative w-fit mt-[-1.00px] font-p-lato font-[number:var(--p-lato-font-weight)] text-off-black text-[length:var(--p-lato-font-size)] tracking-[var(--p-lato-letter-spacing)] leading-[var(--p-lato-line-height)] whitespace-nowrap [font-style:var(--p-lato-font-style)] cursor-pointer">
                  {setting.label}
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="inline-flex flex-col items-start gap-5 relative flex-[0_0_auto]">
        <button className="inline-flex items-center justify-center gap-2.5 relative flex-[0_0_auto] cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="flex flex-col w-[500px] items-center justify-center gap-5 p-[30px] bg-white rounded-[15px] shadow-lg">
            <div className="flex justify-end w-full">
              <Button variant="ghost" size="sm" className="h-auto p-1" onClick={handleCancelEdit}>
                <XIcon className="w-6 h-6 text-gray-400" />
              </Button>
            </div>

            <div className="flex flex-col items-start gap-[30px] pt-0 pb-5 px-0 relative self-stretch w-full flex-[0_0_auto]">
              <div className="inline-flex flex-col items-start gap-[30px] relative flex-[0_0_auto]">
                <div className="inline-flex items-center gap-[5px] relative flex-[0_0_auto]">
                  <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-off-black text-2xl tracking-[0] leading-[23px] whitespace-nowrap">
                    {editPopupData.title}
                  </div>
                </div>

                {editPopupData.isTextarea ? (
                  <Textarea
                    value={editPopupData.value}
                    onChange={(e) => setEditPopupData(prev => ({ ...prev, value: e.target.value }))}
                    placeholder={editPopupData.placeholder}
                    className="w-[440px] h-[120px] px-3 py-2.5 bg-white rounded-md border-2 border-[#a8a8a8] shadow-inputs resize-none [font-family:'Lato',Helvetica] font-normal text-dark-grey text-lg focus-visible:ring-1 focus-visible:ring-gray-300"
                  />
                ) : (
                  <Input
                    value={editPopupData.value}
                    onChange={(e) => setEditPopupData(prev => ({ ...prev, value: e.target.value }))}
                    placeholder={editPopupData.placeholder}
                    className="w-[440px] h-[51px] px-3 py-2.5 bg-white rounded-md border-2 border-[#a8a8a8] shadow-inputs [font-family:'Lato',Helvetica] font-normal text-dark-grey text-lg focus-visible:ring-1 focus-visible:ring-gray-300"
                    autoFocus
                  />
                )}
              </div>

              <div className="flex items-center justify-end gap-5 relative self-stretch w-full flex-[0_0_auto]">
                <Button variant="ghost" className="h-auto px-5 py-2.5 rounded-[15px]" onClick={handleCancelEdit}>
                  <div className="relative w-fit mt-[-2.00px] font-p-l font-[number:var(--p-l-font-weight)] text-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
                    Cancel
                  </div>
                </Button>

                <Button 
                  className="h-auto px-5 py-2.5 bg-red rounded-[50px] hover:bg-red/90"
                  onClick={() => handleSaveField(editPopupData.value)}
                  disabled={!editPopupData.value.trim()}
                >
                  <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-white text-lg tracking-[0] leading-[25.2px] whitespace-nowrap">
                    Save
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
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
                    defaultValue={formData.name}
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
                    defaultValue={formData.bio}
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

              <div className="flex flex-col items-start gap-2.5 px-0 py-[15px] relative self-stretch w-full flex-[0_0_auto]">
                <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-off-black text-lg tracking-[0] leading-[normal]">
                  Profile photo
                </div>

                <div className="inline-flex items-center gap-[15px] relative flex-[0_0_auto]">
                  <div className="relative w-[45px] h-[45px] rounded-[100px] bg-[url(/img/add-profile-image.svg)] bg-cover bg-[50%_50%]" />

                  <label className="inline-flex items-center gap-2.5 px-5 py-2.5 relative flex-[0_0_auto] rounded-[100px] border border-solid border-medium-grey cursor-pointer hover:bg-gray-50 transition-colors">
                    <svg
                      className="relative w-5 h-5 aspect-[1]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>

                    <span className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-medium-dark-grey text-base tracking-[0] leading-5 whitespace-nowrap">
                      Add File
                    </span>

                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      aria-describedby="profile-image-help"
                    />
                  </label>
                </div>

                <p
                  id="profile-image-help"
                  className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-sm tracking-[0] leading-[19.6px] whitespace-nowrap"
                >
                  We recommend an image of at least 300x300. Gifs work too. Max 5mb.
                </p>
              </div>

              <div className="flex flex-col items-start gap-2.5 px-0 py-[15px] relative self-stretch w-full flex-[0_0_auto]">
                <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-off-black text-lg tracking-[0] leading-[normal]">
                  Banner image
                </div>

                <div className="flex flex-col h-[102px] items-center px-0 py-2.5 relative self-stretch w-full rounded-lg bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] bg-light-grey-transparent">
                  <div className="flex items-center justify-end gap-2.5 px-[15px] py-0 self-stretch w-full relative flex-[0_0_auto]">
                    <button
                      type="button"
                      aria-label="Remove banner image"
                      className="relative flex-[0_0_auto] p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <svg
                        className="relative w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-2.5 relative flex-1 self-stretch w-full grow">
                    <label className="inline-flex items-center gap-2.5 px-5 py-2.5 relative flex-[0_0_auto] bg-white rounded-[100px] border border-solid border-medium-grey cursor-pointer hover:bg-gray-50 transition-colors">
                      <svg
                        className="relative w-5 h-5 aspect-[1]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>

                      <span className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-medium-dark-grey text-base tracking-[0] leading-5 whitespace-nowrap">
                        Add File
                      </span>

                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        aria-describedby="banner-image-help"
                      />
                    </label>
                  </div>
                </div>
              </div>

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
                  className="all-[unset] box-border inline-flex items-center justify-center gap-[15px] px-5 py-2.5 relative flex-[0_0_auto] bg-red rounded-[50px] hover:bg-red/90 transition-colors cursor-pointer"
                >
                  <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-white text-lg tracking-[0] leading-[25.2px] whitespace-nowrap">
                    Save
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
