import { EditIcon, XIcon } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../../components/ui/avatar";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Switch } from "../../../../components/ui/switch";

const socialLinks = [
  {
    icon: "https://c.animaapp.com/mft4oqz6uyUKY7/img/logo-wrap.svg",
    username: "@sophiawuuu",
  },
  {
    icon: "https://c.animaapp.com/mft4oqz6uyUKY7/img/logo-wrap.svg",
    username: "@sophiawuuu",
  },
  {
    icon: "https://c.animaapp.com/mft4oqz6uyUKY7/img/logo-wrap.svg",
    username: "@sophiawuuu",
  },
];

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
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editPopupData, setEditPopupData] = useState({
    title: "",
    value: "",
    field: "",
    isTextarea: false,
    placeholder: "",
  });
  const [bannerImage, setBannerImage] = useState<string>("https://c.animaapp.com/mft4oqz6uyUKY7/img/banner.png");
  const [formData, setFormData] = useState({
    name: "Sophiaaaaa",
    username: "@nan09",
    bio: "Hello, welcome to my creativce space. Design, travel, and everyday life.",
    email: "XX@gmail.com",
    socialLinks: [...socialLinks],
  });

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

  const handleSocialEdit = (index: number, value: string) => {
    const newSocialLinks = [...formData.socialLinks];
    newSocialLinks[index] = { ...newSocialLinks[index], username: value };
    setFormData(prev => ({ ...prev, socialLinks: newSocialLinks }));
    setEditingField(null);
  };

  const handleLogout = () => {
    setIsLoggedOut(true);
  };

  const handleBannerImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setBannerImage(imageUrl);
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
    if (editPopupData.field.startsWith('social-')) {
      const index = parseInt(editPopupData.field.split('-')[1]);
      const newSocialLinks = [...formData.socialLinks];
      newSocialLinks[index] = { ...newSocialLinks[index], username: newValue };
      setFormData(prev => ({ ...prev, socialLinks: newSocialLinks }));
    } else {
      setFormData(prev => ({ ...prev, [editPopupData.field]: newValue }));
    }
    setShowEditPopup(false);
  };

  const handleCancelEdit = () => {
    setShowEditPopup(false);
  };

  return (
    <div className="flex flex-col items-start gap-[30px] py-5 min-h-screen">
      <div className="flex flex-col items-start w-full flex-[0_0_auto] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms] relative">
        <div 
          className="w-full h-40 rounded-lg bg-cover bg-center relative"
          style={{ backgroundImage: `url(${bannerImage})` }}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleBannerImageUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            id="banner-upload"
          />
          
          <Button
            variant="ghost"
            size="sm"
            className="absolute bottom-3 right-3 p-0 h-auto w-[35px] z-10"
            onClick={() => document.getElementById('banner-upload')?.click()}
          >
            <img
              className="w-[35px] h-[35px]"
              alt="Edit"
              src="https://c.animaapp.com/mft4oqz6uyUKY7/img/edit-2.svg"
            />
          </Button>
        </div>

        <div className="gap-10 pl-5 pr-10 py-0 mt-[-46px] flex items-start w-full flex-[0_0_auto]">
          <Avatar className="w-[100px] h-[100px] border-2 border-solid border-[#ffffff]">
            <AvatarImage
              src="https://c.animaapp.com/mft4oqz6uyUKY7/img/profile.png"
              alt="Profile"
              className="object-cover"
            />
            <AvatarFallback>S</AvatarFallback>
          </Avatar>

          <div className="flex flex-col items-start gap-5 pt-[60px] pb-0 px-0 flex-1 grow">
            <div className="h-[60px] inline-flex flex-col items-start justify-center">
              <div className="gap-2.5 mt-[-3.50px] inline-flex items-center flex-[0_0_auto]">
                {editingField === "name" ? (
                  <Input
                    defaultValue={formData.name}
                    onBlur={(e) => handleSave("name", e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSave("name", e.currentTarget.value);
                      }
                    }}
                    className="w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-off-black text-3xl tracking-[0] leading-[42px] border-0 bg-transparent p-0 focus-visible:ring-1 focus-visible:ring-gray-300"
                    autoFocus
                  />
                ) : (
                  <div className="w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-off-black text-3xl tracking-[0] leading-[42px] whitespace-nowrap">
                    {formData.name}
                  </div>
                )}

                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-0 h-auto w-3"
                  onClick={() => handleEditField("name", "Name", formData.name, false, "Enter your name")}
                >
                  <EditIcon className="w-3 h-[15px] text-[#696969]" />
                </Button>
              </div>

              <div className="gap-2.5 inline-flex items-center flex-[0_0_auto]">
                <div className="w-fit mb-[-2.50px] [font-family:'Lato',Helvetica] font-normal text-off-black text-lg tracking-[0] leading-[25.2px] whitespace-nowrap">
                  {formData.username}
                </div>
              </div>
            </div>

            <div className="flex-col gap-[15px] flex items-start w-full flex-[0_0_auto]">
              <div className="flex items-center gap-2.5 w-full flex-[0_0_auto]">
                {editingField === "bio" ? (
                  <Input
                    defaultValue={formData.bio}
                    onBlur={(e) => handleSave("bio", e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSave("bio", e.currentTarget.value);
                      }
                    }}
                    className="w-fit mt-[-1.00px] font-p-l font-[number:var(--p-l-font-weight)] text-off-black text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] [font-style:var(--p-l-font-style)] border-0 bg-transparent p-0 focus-visible:ring-1 focus-visible:ring-gray-300"
                    autoFocus
                  />
                ) : (
                  <div className="w-fit mt-[-1.00px] font-p-l font-[number:var(--p-l-font-weight)] text-off-black text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
                    {formData.bio}
                  </div>
                )}

                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-0 h-auto w-3"
                  onClick={() => handleEditField("bio", "Bio", formData.bio, true, "Write something about yourself")}
                >
                  <EditIcon className="w-3 h-[15px] text-[#696969]" />
                </Button>
              </div>

              <div className="inline-flex items-center gap-[30px] flex-[0_0_auto]">
                {formData.socialLinks.map((link, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center justify-center gap-2.5 flex-[0_0_auto]"
                  >
                    <div className="gap-[5px] inline-flex items-center flex-[0_0_auto]">
                      <img
                        className="flex-[0_0_auto]"
                        alt="Logo wrap"
                        src={link.icon}
                      />

                      {editingField === `social-${index}` ? (
                        <Input
                          defaultValue={link.username}
                          onBlur={(e) => handleSocialEdit(index, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSocialEdit(index, e.currentTarget.value);
                            }
                          }}
                          className="w-fit mt-[-1.00px] font-p-l font-[number:var(--p-l-font-weight)] text-medium-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] [font-style:var(--p-l-font-style)] border-0 bg-transparent p-0 focus-visible:ring-1 focus-visible:ring-gray-300"
                          autoFocus
                        />
                      ) : (
                        <div className="w-fit mt-[-1.00px] font-p-l font-[number:var(--p-l-font-weight)] text-medium-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
                          {link.username}
                        </div>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-auto w-3"
                      onClick={() => handleEditField(`social-${index}`, "Social Media", link.username, false, "Enter username")}
                    >
                      <EditIcon className="w-3 h-[15px] text-[#696969]" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="inline-flex flex-col items-start gap-5 px-0 py-[30px] flex-[0_0_auto] mr-[-4.00px] border-b [border-bottom-style:solid] border-[#ffffff] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms]">
        <div className="pt-0 pb-2.5 px-0 flex-[0_0_auto] inline-flex flex-col items-start justify-center">
          <div className="w-fit mt-[-1.00px] font-h-3 font-[number:var(--h-3-font-weight)] text-off-black text-[length:var(--h-3-font-size)] tracking-[var(--h-3-letter-spacing)] leading-[var(--h-3-line-height)] whitespace-nowrap [font-style:var(--h-3-font-style)]">
            Account
          </div>
        </div>

        <div className="inline-flex gap-[30px] flex-col items-start flex-[0_0_auto]">
          <div className="flex-col w-[1059px] items-start gap-[15px] flex flex-[0_0_auto]">
            <div className="inline-flex items-center gap-[5px] flex-[0_0_auto]">
              <div className="w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-dark-grey text-xl tracking-[0] leading-[23px] whitespace-nowrap">
                Email
              </div>
            </div>

            <div className="inline-flex items-center gap-5 flex-[0_0_auto]">
              {editingField === "email" ? (
                <Input
                  defaultValue={formData.email}
                  onBlur={(e) => handleSave("email", e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSave("email", e.currentTarget.value);
                    }
                  }}
                  className="w-fit mt-[-1.00px] font-p-l font-[number:var(--p-l-font-weight)] text-medium-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] [font-style:var(--p-l-font-style)] border-0 bg-transparent p-0 focus-visible:ring-1 focus-visible:ring-gray-300"
                  autoFocus
                />
              ) : (
                <div className="w-fit mt-[-1.00px] font-p-l font-[number:var(--p-l-font-weight)] text-medium-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
                  {formData.email}
                </div>
              )}

              <Button 
                variant="ghost" 
                size="sm" 
                className="p-0 h-auto w-3"
                onClick={() => handleEditField("email", "Email", formData.email, false, "Enter your email")}
              >
                <EditIcon className="w-3 h-[15px] text-[#696969]" />
              </Button>
            </div>
          </div>

          <Button
            variant="link"
            className="inline-flex items-center justify-center gap-2.5 pt-0 pb-2.5 px-0 h-auto flex-[0_0_auto] border-b border-[#f23a00] text-red hover:text-red rounded-none hover:no-underline"
          >
            <div className="w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal hover:font-bold text-lg tracking-[0] leading-[23px] whitespace-nowrap transition-all">
              Change password
            </div>
          </Button>
        </div>
      </div>

      <div className="flex gap-5 w-full flex-col items-start flex-[0_0_auto] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:600ms]">
        <div className="h-[60px] pt-0 pb-2.5 px-0 inline-flex flex-col items-start justify-center">
          <div className="w-fit font-h-3 font-[number:var(--h-3-font-weight)] text-off-black text-[length:var(--h-3-font-size)] tracking-[var(--h-3-letter-spacing)] leading-[var(--h-3-line-height)] whitespace-nowrap [font-style:var(--h-3-font-style)]">
            Notification
          </div>
        </div>

        <div className="flex flex-col items-start gap-5 pt-0 pb-[25px] px-0 w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-[#ffffff]">
          {notificationSettings.map((setting) => (
            <div
              key={setting.id}
              className="inline-flex items-center gap-[15px] flex-[0_0_auto] rounded-[100px] group hover:bg-[linear-gradient(0deg,rgba(224,224,224,0.45)_0%,rgba(224,224,224,0.45)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] p-2 -m-2 transition-colors"
            >
              <Switch
                defaultChecked={setting.enabled}
                className="data-[state=checked]:bg-[#f23a00]"
              />

              <div className="inline-flex flex-col items-start justify-center gap-[5px] flex-[0_0_auto]">
                <div className="w-fit mt-[-1.00px] font-p-l font-[number:var(--p-l-font-weight)] text-off-black text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
                  {setting.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="inline-flex flex-col items-start gap-5 flex-[0_0_auto] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:800ms]">
        <Button
          variant="link"
          className="inline-flex items-center justify-center gap-2.5 h-auto flex-[0_0_auto] text-red hover:text-red p-0"
          asChild
        >
          <Link to="/delete-account">
            <div className="w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-lg tracking-[0] leading-[23px] whitespace-nowrap">
              Delete account
            </div>
          </Link>
        </Button>

        <Button
          variant="link"
          className="inline-flex items-center justify-center gap-2.5 h-auto flex-[0_0_auto] text-red hover:text-red p-0"
          onClick={handleLogout}
        >
          <div className="w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-lg tracking-[0] leading-[23px] whitespace-nowrap">
            Log out
          </div>
        </Button>
      </div>

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
    </div>
  );
};
