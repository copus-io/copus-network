import React, { useState } from "react";

export const InfoSetting = (): JSX.Element => {
  const [username, setUsername] = useState("Sophiawuu");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [bannerImage, setBannerImage] = useState<File | null>(null);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= 140) {
      setBio(e.target.value);
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBannerImage(e.target.files[0]);
    }
  };

  const handleRemoveBannerImage = () => {
    setBannerImage(null);
  };

  const handleCancel = () => {
    setUsername("Sophiawuu");
    setBio("");
    setProfileImage(null);
    setBannerImage(null);
  };

  const handleSave = () => {
    console.log("Saving user info:", {
      username,
      bio,
      profileImage,
      bannerImage,
    });
  };

  return (
    <div
      className="flex flex-col w-[600px] items-center justify-center gap-5 p-[30px] relative bg-white rounded-[15px]"
      data-model-id="9020:63275"
      role="dialog"
      aria-labelledby="info-setting-title"
    >
      <div className="flex items-center justify-end gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
        <button
          type="button"
          aria-label="Close dialog"
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <img className="relative w-3 h-3" alt="Close" src="/img/x.svg" />
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
              value={username}
              onChange={handleUsernameChange}
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
              value={bio}
              onChange={handleBioChange}
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
              {bio.length}/140
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
              <img
                className="relative w-5 h-5 aspect-[1]"
                alt=""
                src="/img/vector.svg"
              />

              <span className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-medium-dark-grey text-base tracking-[0] leading-5 whitespace-nowrap">
                Add File
              </span>

              <input
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
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
                onClick={handleRemoveBannerImage}
                aria-label="Remove banner image"
                className="relative flex-[0_0_auto] p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <img
                  className="relative"
                  alt="Remove"
                  src="/img/close-button.svg"
                />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center gap-2.5 relative flex-1 self-stretch w-full grow">
              <label className="inline-flex items-center gap-2.5 px-5 py-2.5 relative flex-[0_0_auto] bg-white rounded-[100px] border border-solid border-medium-grey cursor-pointer hover:bg-gray-50 transition-colors">
                <img
                  className="relative w-5 h-5 aspect-[1]"
                  alt=""
                  src="/img/vector-1.svg"
                />

                <span className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-medium-dark-grey text-base tracking-[0] leading-5 whitespace-nowrap">
                  Add File
                </span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerImageChange}
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
            onClick={handleCancel}
            className="all-[unset] box-border inline-flex items-center justify-center gap-[30px] px-5 py-2.5 relative flex-[0_0_auto] rounded-[15px] hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <div className="relative w-fit mt-[-2.00px] font-p-l font-[number:var(--p-l-font-weight)] text-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
              Cancel
            </div>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="all-[unset] box-border inline-flex items-center justify-center gap-[15px] px-5 py-2.5 relative flex-[0_0_auto] bg-red rounded-[50px] hover:bg-red/90 transition-colors cursor-pointer"
          >
            <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-white text-lg tracking-[0] leading-[25.2px] whitespace-nowrap">
              Save
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
