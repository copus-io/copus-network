import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Checkbox } from "../../../components/ui/checkbox";
import { Input } from "../../../components/ui/input";
import { Card, CardContent } from "../../../components/ui/card";
import { AuthService, CODE_TYPES } from "../../../services/authService";
import { useUser } from "../../../contexts/UserContext";
import { HeaderSection } from "../../../components/shared/HeaderSection/HeaderSection";

export const DeleteAccount = (): JSX.Element => {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);

  const reminderItems = [
    "After account deletion, all your data including personal information, published content, and saved records will be permanently deleted and cannot be recovered.",
    "You will lose all purchased services and benefits.",
    "Your username will be released and may be used by other users.",
    "If you only wish to take a temporary break, please consider logging out instead of deleting your account.",
  ];

  const handleSendCode = async () => {
    if (!user?.email) {
      alert('无法获取用户邮箱地址');
      return;
    }

    setIsSendingCode(true);
    try {
      await AuthService.sendVerificationCode({
        email: user.email,
        codeType: CODE_TYPES.RESET_PASSWORD // 使用重置密码的验证码类型，或者可以定义新的删除账号类型
      });
      alert('验证码已发送到您的邮箱');
    } catch (error) {
      console.error('发送验证码失败:', error);
      alert('发送验证码失败，请稍后重试');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!isConfirmed || !verificationCode.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const success = await AuthService.deleteAccount({
        accountType: 0, // 普通账号类型
        code: verificationCode.trim(),
        reason: deleteReason.trim()
      });

      if (success) {
        setShowSuccessPopup(true);
      } else {
        alert('删除账号失败，请检查验证码是否正确');
      }
    } catch (error) {
      console.error('删除账号失败:', error);
      alert('删除账号失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalConfirm = async () => {
    // 最终确认删除后，登出用户并跳转到首页
    await logout();
    navigate('/');
  };

  const isFormValid = isConfirmed && verificationCode.trim() !== "";

  return (
    <div className="min-h-screen flex bg-[linear-gradient(0deg,rgba(224,224,224,0.15)_0%,rgba(224,224,224,0.15)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
      <HeaderSection isLoggedIn={true} hideCreateButton={true} />
      <div className="flex w-full min-h-screen flex-col items-center pt-[120px]">{/* 增加顶部间距适配HeaderSection */}

        <main className="flex flex-col w-[540px] items-center pt-5 pb-10 px-0">
          <div className="flex flex-col items-center gap-10 w-full">
            <div className="flex flex-col items-center gap-5 w-full">
              <img
                className="w-[50px] h-[50px]"
                alt="Question"
                src="https://c.animaapp.com/mfv9qqz8KPkAx8/img/question.svg"
              />

              <h1 className="font-h-3 font-[number:var(--h-3-font-weight)] text-off-black text-[length:var(--h-3-font-size)] text-center tracking-[var(--h-3-letter-spacing)] leading-[var(--h-3-line-height)] [font-style:var(--h-3-font-style)]">
                Delete your account
              </h1>
            </div>

            <div className="flex flex-col items-center justify-center gap-5 w-full">
              <div className="font-p-l font-[number:var(--p-l-font-weight)] text-off-black text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] [font-style:var(--p-l-font-style)] w-full">
                Important reminder:
              </div>

              <div className="flex flex-col items-start gap-[15px] w-full">
                {reminderItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 w-full"
                  >
                    <span className="[font-family:'Lato',Helvetica] font-normal text-[#231f20] text-lg tracking-[0] leading-[25.2px] flex-shrink-0">
                      •
                    </span>
                    <span className="[font-family:'Lato',Helvetica] font-normal text-[#231f20] text-lg tracking-[0] leading-[25.2px]">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-start gap-5 pt-0 pb-[30px] px-0 w-full border-b border-solid border-[#ffffff]">
              <div className="flex flex-col items-start justify-center">
                <h2 className="font-h-3 font-[number:var(--h-3-font-weight)] text-off-black text-[length:var(--h-3-font-size)] tracking-[var(--h-3-letter-spacing)] leading-[var(--h-3-line-height)] whitespace-nowrap [font-style:var(--h-3-font-style)]">
                  Email verification
                </h2>
              </div>

              <div className="flex flex-col items-start gap-5 w-full">
                <div className="flex items-center gap-5">
                  <div className="font-p-l font-[number:var(--p-l-font-weight)] text-medium-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
                    {user?.email || 'Loading...'}
                  </div>
                </div>

                <div className="flex items-start gap-5 w-full">
                  <Input
                    placeholder="Enter verification code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="flex-1 bg-white rounded-[15px] border border-solid border-[#a8a8a8] shadow-[0px_2px_5px_#00000040] px-[15px] py-2.5 [font-family:'Lato',Helvetica] font-normal text-[#a9a9a9] text-lg tracking-[0] leading-[25.2px] h-auto placeholder:text-[#a9a9a9]"
                  />

                  <Button
                    onClick={handleSendCode}
                    disabled={isSendingCode || !user?.email}
                    className="h-auto bg-red px-[15px] py-2.5 rounded-[15px] shadow-[0px_2px_5px_#00000040] [font-family:'Lato',Helvetica] font-semibold text-white text-lg text-center tracking-[0] leading-[25.2px] whitespace-nowrap hover:bg-red/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSendingCode ? 'Sending...' : 'Send code'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start gap-5 pt-0 pb-[30px] px-0 w-full border-b border-solid border-[#ffffff]">
              <div className="flex flex-col items-start justify-center">
                <h2 className="font-h-3 font-[number:var(--h-3-font-weight)] text-off-black text-[length:var(--h-3-font-size)] tracking-[var(--h-3-letter-spacing)] leading-[var(--h-3-line-height)] whitespace-nowrap [font-style:var(--h-3-font-style)]">
                  Delete reason (optional)
                </h2>
              </div>

              <Input
                placeholder="Tell us why you want to delete your account"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-[500px] h-[45px] bg-white border border-solid border-[#a8a8a8] px-[15px] py-2.5 rounded-[15px] shadow-[0px_2px_5px_#00000040] [font-family:'Lato',Helvetica] font-normal text-[#a9a9a9] text-lg text-left tracking-[0] leading-[25.2px] placeholder:text-[#a9a9a9]"
              />
            </div>
          </div>

          <div className="flex items-start gap-2.5 px-0 py-5 w-full">
            <div className="relative w-[18px] h-[18px]">
              <Checkbox
                checked={isConfirmed}
                onCheckedChange={setIsConfirmed}
                className="w-[18px] h-[18px] rounded-[9px] border border-solid border-[#231f20] data-[state=checked]:bg-button-green data-[state=checked]:border-[#231f20]"
              />
            </div>

            <div className="flex-1 font-p-l font-[number:var(--p-l-font-weight)] text-medium-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] [font-style:var(--p-l-font-style)]">
              I have read and understood all the consequences of account
              deletion and confirm that I wish to proceed with deleting my
              account.
            </div>
          </div>

          <div className="flex w-[500px] items-center justify-center gap-[30px] px-5 py-[30px]">
            <Button
              variant="ghost"
              className="h-auto h-[45px] px-5 py-[15px] rounded-[15px] font-h-4 font-[number:var(--h-4-font-weight)] text-dark-grey text-[length:var(--h-4-font-size)] tracking-[var(--h-4-letter-spacing)] leading-[var(--h-4-line-height)] [font-style:var(--h-4-font-style)] hover:bg-transparent"
              asChild
            >
              <Link to="/setting">Cancel</Link>
            </Button>

            <Button
              disabled={!isFormValid || isLoading}
              onClick={handleConfirmDelete}
              className={`h-auto px-5 py-[15px] rounded-[100px] [font-family:'Lato',Helvetica] font-bold text-xl tracking-[0] leading-7 whitespace-nowrap transition-all ${
                (isFormValid && !isLoading)
                  ? 'bg-red text-white hover:bg-red/90'
                  : 'bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] text-medium-grey'
              }`}
            >
              {isLoading ? 'Deleting...' : 'Confirm'}
            </Button>
          </div>
        </main>

        {showSuccessPopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="inline-flex flex-col items-center justify-center gap-10 pt-[100px] pb-[50px] px-10 bg-white rounded-[15px] relative shadow-lg">
              <button 
                className="absolute right-6 top-6 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                onClick={() => setShowSuccessPopup(false)}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="sr-only">Close</span>
              </button>

              <div className="inline-flex flex-col items-center justify-center gap-[30px] px-[30px] py-0 relative flex-[0_0_auto]">
                <div className="inline-flex flex-col items-center justify-center gap-[25px] relative flex-[0_0_auto]">
                  <h1 className="relative w-[400px] mt-[-1.00px] font-h3-s font-[number:var(--h3-s-font-weight)] text-off-black text-[length:var(--h3-s-font-size)] text-center tracking-[var(--h3-s-letter-spacing)] leading-[var(--h3-s-line-height)] [font-style:var(--h3-s-font-style)]">
                    Are you sure you want to delete your account?
                  </h1>
                </div>

                <div className="inline-flex items-center justify-center gap-[15px] relative flex-[0_0_auto]">
                  <Button
                    variant="ghost"
                    className="inline-flex h-[45px] items-center justify-center gap-[30px] px-[30px] py-2.5 relative flex-[0_0_auto] rounded-[15px] h-auto hover:bg-transparent"
                    onClick={() => setShowSuccessPopup(false)}
                  >
                    <span className="relative w-fit mt-[-3.50px] font-h-4 font-[number:var(--h-4-font-weight)] text-dark-grey text-[length:var(--h-4-font-size)] tracking-[var(--h-4-letter-spacing)] leading-[var(--h-4-line-height)] whitespace-nowrap [font-style:var(--h-4-font-style)]">
                      Cancel
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    className="inline-flex h-[45px] items-center justify-center gap-[15px] px-[30px] py-2.5 relative flex-[0_0_auto] rounded-[50px] border border-solid border-[#f23a00] bg-transparent text-red hover:bg-red hover:text-white h-auto transition-colors"
                    onClick={handleFinalConfirm}
                  >
                    <span className="relative w-fit mt-[-2.50px] mb-[-0.50px] [font-family:'Lato',Helvetica] font-semibold text-xl tracking-[0] leading-7 whitespace-nowrap">
                      Yes
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
