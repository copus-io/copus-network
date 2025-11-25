import { EyeIcon, EyeOffIcon, XIcon } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { useToast } from "../../components/ui/toast";
import { AuthService } from "../../services/authService";

export const NewPassword = (): JSX.Element => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChanging, setIsChanging] = useState(false);

  const handleSavePassword = async () => {
    // Validate input
    if (!newPassword || !confirmPassword) {
      showToast("Please fill in all password fields", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("The passwords entered do not match", "error");
      return;
    }

    if (newPassword.length < 6) {
      showToast("Password must be at least 6 characters long", "error");
      return;
    }

    setIsChanging(true);
    try {
      // Call update password API (assuming direct update since verification has passed)
      const result = await AuthService.updatePassword(newPassword);

      if (result) {
        showToast("Password changed successfully!", "success");
        navigate("/setting");
      } else {
        showToast("Password change failed, please try again", "error");
      }
    } catch (error) {
      console.error("Password change failed:", error);
      showToast("Password change failed, please try again later", "error");
    } finally {
      setIsChanging(false);
    }
  };

  const handleCancel = () => {
    navigate("/change-password");
  };

  const isFormValid = newPassword && confirmPassword && newPassword === confirmPassword && newPassword.length >= 6;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-[600px] bg-white rounded-[15px]">
        <CardContent className="flex flex-col items-center justify-center gap-5 p-[30px]">
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

              <div className="relative w-[555px]">
                <Input
                  type={showPassword1 ? "text" : "password"}
                  placeholder="Enter your new password"
                  className="w-full h-[52px] px-3 py-2.5 bg-monowhite rounded-lg border-2 border-[#ffffff] shadow-inputs font-p font-[number:var(--p-font-weight)] text-dark-grey text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] [font-style:var(--p-font-style)] pr-12 focus-visible:ring-0"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-auto p-0"
                  onClick={() => setShowPassword1(!showPassword1)}
                >
                  {showPassword1 ? (
                    <EyeOffIcon className="w-5 h-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="w-5 h-5 text-gray-400" />
                  )}
                </Button>
              </div>

              <div className="relative w-[555px]">
                <Input
                  type={showPassword2 ? "text" : "password"}
                  placeholder="Enter your new password again"
                  className="w-full h-[52px] px-3 py-2.5 bg-monowhite rounded-lg border-2 border-[#ffffff] shadow-inputs font-p font-[number:var(--p-font-weight)] text-dark-grey text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] [font-style:var(--p-font-style)] pr-12 focus-visible:ring-0"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-auto p-0"
                  onClick={() => setShowPassword2(!showPassword2)}
                >
                  {showPassword2 ? (
                    <EyeOffIcon className="w-5 h-[13px] text-gray-400" />
                  ) : (
                    <EyeIcon className="w-5 h-[13px] text-gray-400" />
                  )}
                </Button>
              </div>

              <div className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[normal]">
                You can use lower case, upper case, number, and punctuation.{" "}
                <br />
                Minimum 6 characters.
              </div>

              {/* 密码匹配提示 */}
              {confirmPassword && (
                <div className={`text-sm ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                  {newPassword === confirmPassword ? '✓ 密码匹配' : '✗ 密码不匹配'}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-5 pt-[30px] pb-0 px-0 relative self-stretch w-full flex-[0_0_auto]">
              <Button
                variant="ghost"
                className="h-auto inline-flex items-center justify-center gap-[30px] px-5 py-2.5 relative flex-[0_0_auto] rounded-[15px] hover:bg-gray-50 transition-colors"
                onClick={handleCancel}
              >
                <div className="relative w-fit mt-[-2.00px] font-p-l font-[number:var(--p-l-font-weight)] text-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
                  Cancel
                </div>
              </Button>

              <Button
                className={`h-auto inline-flex items-center justify-center gap-[15px] px-5 py-2.5 relative flex-[0_0_auto] rounded-[50px] transition-colors ${
                  isFormValid && !isChanging
                    ? "bg-red hover:bg-red/90 text-white"
                    : "bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] bg-light-grey-transparent"
                }`}
                disabled={!isFormValid || isChanging}
                onClick={handleSavePassword}
              >
                <div className={`relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-lg tracking-[0] leading-[25.2px] whitespace-nowrap ${
                  isFormValid && !isChanging ? "text-white" : "text-medium-grey"
                }`}>
                  {isChanging ? "Saving..." : "Save"}
                </div>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};