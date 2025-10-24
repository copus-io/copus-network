import { XIcon } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { useUser } from "../../contexts/UserContext";
import { useToast } from "../../components/ui/toast";
import { AuthService, CODE_TYPES } from "../../services/authService";

export const ChangePassword = (): JSX.Element => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { showToast } = useToast();
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);

  const handleSendCode = async () => {
    if (!user?.email) {
      showToast("用户邮箱信息不可用", "error");
      return;
    }

    setIsSendingCode(true);
    try {
      // 调用发送验证码API
      const success = await AuthService.sendVerificationCode({email:user.email,codeType:CODE_TYPES.FindBackEmailPsw });
      if (success) {
        showToast("验证码已发送到您的邮箱", "success");
        setIsCodeSent(true);
      } else {
        showToast("发送验证码失败，请重试", "error");
      }
    } catch (error) {
      console.error("发送验证码失败:", error);
      showToast("发送验证码失败，请重试", "error");
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      showToast("请输入验证码", "error");
      return;
    }

    setIsVerifying(true);
    try {
      // 验证验证码
      const isValid = await AuthService.verifyCode(user?.email || "", verificationCode);
      if (isValid) {
        showToast("验证成功！", "success");
        // 跳转到新密码设置页面
        navigate("/new-password");
      } else {
        showToast("验证码错误，请重新输入", "error");
      }
    } catch (error) {
      console.error("验证码验证失败:", error);
      showToast("验证失败，请重试", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCancel = () => {
    navigate("/setting");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-[600px] bg-white rounded-[15px]">
        <CardContent className="flex flex-col items-center justify-center gap-5 p-[30px] relative">
          <div className="flex justify-end w-full">
            <button onClick={handleCancel}>
              <XIcon className="w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors" />
            </button>
          </div>

          <div className="flex flex-col w-[555px] items-start gap-2.5 pt-0 pb-[25px] px-0 relative flex-[0_0_auto] ml-[-7.50px] mr-[-7.50px]">
            <div className="inline-flex flex-col items-start justify-center gap-[15px] relative flex-[0_0_auto]">
              <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-off-black text-xl tracking-[0] leading-[23px] whitespace-nowrap">
                Change password
              </div>

              <div className="relative flex items-center justify-center w-fit [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[23px] whitespace-nowrap">
                Verify your identity first.
              </div>

              <div className="flex w-[555px] items-center justify-between px-3 py-2.5 relative flex-[0_0_auto] bg-monowhite rounded-lg overflow-hidden border-2 border-solid border-[#ffffff] shadow-inputs">
                <Input
                  className="border-0 bg-transparent p-0 h-auto font-p font-[number:var(--p-font-weight)] text-medium-dark-grey text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] [font-style:var(--p-font-style)] focus-visible:ring-0"
                  value={user?.email || "user@example.com"}
                  readOnly
                />

                <Button
                  className="inline-flex items-center justify-center gap-[30px] px-[15px] py-[5px] h-auto bg-red rounded-[100px] hover:bg-red/90 transition-colors"
                  onClick={handleSendCode}
                  disabled={isSendingCode}
                >
                  <span className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-white text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                    {isSendingCode ? "Sending..." : "Send code"}
                  </span>
                </Button>
              </div>

              <Input
                className="flex w-[555px] h-[52px] items-center px-3 py-2.5 bg-monowhite rounded-lg border-2 border-solid border-[#ffffff] shadow-inputs font-p font-[number:var(--p-font-weight)] text-medium-dark-grey text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] [font-style:var(--p-font-style)] focus-visible:ring-0"
                placeholder="Enter code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-5 pt-[30px] pb-0 px-0 relative self-stretch w-full flex-[0_0_auto]">
              <Button
                variant="ghost"
                className="inline-flex items-center justify-center gap-[30px] px-5 py-2.5 h-auto rounded-[15px] hover:bg-gray-50 transition-colors"
                onClick={handleCancel}
              >
                <span className="relative w-fit mt-[-2.00px] font-p-l font-[number:var(--p-l-font-weight)] text-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
                  Cancel
                </span>
              </Button>

              <Button
                disabled={!verificationCode.trim() || isVerifying}
                className={`inline-flex items-center justify-center gap-[15px] px-5 py-2.5 h-auto rounded-[50px] transition-colors ${
                  verificationCode.trim() && !isVerifying
                    ? "bg-red hover:bg-red/90 text-white"
                    : "bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] bg-light-grey-transparent"
                }`}
                onClick={handleVerifyCode}
              >
                <span className={`relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-lg tracking-[0] leading-[25.2px] whitespace-nowrap ${
                  verificationCode.trim() && !isVerifying ? "text-white" : "text-medium-grey"
                }`}>
                  {isVerifying ? "Verifying..." : "Verify"}
                </span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};