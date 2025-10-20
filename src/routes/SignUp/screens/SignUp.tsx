import { EyeIcon } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Checkbox } from "../../../components/ui/checkbox";
import { Input } from "../../../components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";

export const SignUp = (): JSX.Element => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    verificationCode: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSendCode = () => {
  };

  const handleSignUp = () => {
  };

  return (
    <div className="w-full min-h-screen flex bg-[linear-gradient(0deg,rgba(224,224,224,0.15)_0%,rgba(224,224,224,0.15)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
      <div className="flex w-full h-screen relative flex-col items-center">
        <header className="flex items-start justify-between px-[30px] py-5 relative w-full flex-[0_0_auto] bg-transparent">
          <Link to="/copus" className="flex w-[45px] h-[45px] items-center justify-center gap-2.5 p-2.5 relative bg-red rounded-[100px]">
            <img
              className="relative w-7 h-7 mt-[-1.50px] mb-[-1.50px] ml-[-1.50px] mr-[-1.50px]"
              alt="Ic fractopus open"
              src="https://c.animaapp.com/mfw7e857KDarQ5/img/ic-fractopus-open.svg"
            />
          </Link>

          <Link to="/copus" className="inline-flex items-center justify-end relative flex-[0_0_auto] rounded-[10px_10px_0px_0px]">
            <div className="relative flex items-center justify-center w-fit font-p-l font-[number:var(--p-l-font-weight)] text-dark-grey text-[length:var(--p-l-font-size)] text-center tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
              Discover now
            </div>
          </Link>
        </header>

        <main className="inline-flex items-center gap-2.5 relative flex-1 grow">
          <Card className="w-[480px] bg-white rounded-lg border-0 shadow-none">
            <CardContent className="flex flex-col items-center justify-center gap-[50px] px-[50px] py-[60px]">
              <div className="flex flex-col items-start gap-[15px] relative self-stretch w-full flex-[0_0_auto]">
                <h1 className="relative self-stretch mt-[-1.00px] font-h-3 font-[number:var(--h-3-font-weight)] text-off-black text-[length:var(--h-3-font-size)] text-center tracking-[var(--h-3-letter-spacing)] leading-[var(--h-3-line-height)] [font-style:var(--h-3-font-style)]">
                  Join Copus
                </h1>

                <p className="relative self-stretch font-h-4 font-[number:var(--h-4-font-weight)] text-dark-grey text-[length:var(--h-4-font-size)] text-center tracking-[var(--h-4-letter-spacing)] leading-[var(--h-4-line-height)] [font-style:var(--h-4-font-style)]">
                  Discover and share valuable digital gem
                </p>
              </div>

              <div className="flex flex-col items-center justify-center gap-[30px] relative self-stretch w-full flex-[0_0_auto]">
                <Tabs defaultValue="signup" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-transparent h-auto p-0">
                    <TabsTrigger
                      value="login"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#454545] data-[state=inactive]:border-b-0 rounded-none pb-2.5 px-[15px] bg-transparent"
                      asChild
                    >
                      <Link to="/login">
                        <div className="relative w-fit mt-[-1.00px] font-p-l font-[number:var(--p-l-font-weight)] text-dark-grey text-[length:var(--p-l-font-size)] text-center tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
                          Log in
                        </div>
                      </Link>
                    </TabsTrigger>
                    <TabsTrigger
                      value="signup"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#454545] data-[state=inactive]:border-b-0 rounded-none pb-2.5 px-[15px] bg-transparent"
                    >
                      <div className="text-dark-grey text-center relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-lg tracking-[0] leading-[25.2px] whitespace-nowrap">
                        Sign up
                      </div>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="signup" className="mt-[30px]">
                    <div className="flex flex-col items-start gap-5 relative self-stretch w-full flex-[0_0_auto]">
                      <Input
                        placeholder="User name"
                        value={formData.username}
                        onChange={(e) => handleInputChange("username", e.target.value)}
                        className="h-auto p-[15px] bg-white rounded-[15px] border border-solid border-[#a8a8a8] font-p-l font-[number:var(--p-l-font-weight)] text-medium-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] [font-style:var(--p-l-font-style)]"
                      />

                      <Input
                        placeholder="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="h-auto p-[15px] bg-white rounded-[15px] border border-solid border-[#a8a8a8] font-p-l font-[number:var(--p-l-font-weight)] text-medium-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] [font-style:var(--p-l-font-style)]"
                      />

                      <div className="flex h-[55px] items-start gap-5 relative self-stretch w-full">
                        <Input
                          placeholder="Enter verification code"
                          value={formData.verificationCode}
                          onChange={(e) => handleInputChange("verificationCode", e.target.value)}
                          className="flex-1 h-auto px-[15px] py-2.5 bg-white border border-solid border-[#a8a8a8] shadow-[0px_2px_5px_#00000040] rounded-[15px] [font-family:'Lato',Helvetica] font-normal text-[#a9a9a9] text-lg tracking-[0] leading-[25.2px] placeholder:text-[#a9a9a9]"
                        />

                        <Button 
                          onClick={handleSendCode}
                          className="h-auto px-[15px] py-2.5 bg-red hover:bg-red/90 rounded-[15px] [font-family:'Lato',Helvetica] font-normal text-white text-lg tracking-[0] leading-[25.2px] whitespace-nowrap"
                        >
                          Send code
                        </Button>
                      </div>

                      <div className="flex flex-col items-start justify-center gap-[15px] relative self-stretch w-full flex-[0_0_auto]">
                        <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-off-black text-lg tracking-[0] leading-[18px]">
                          <span className="text-[#f23a00] leading-[var(--p-l-line-height)] font-p-l [font-style:var(--p-l-font-style)] font-[number:var(--p-l-font-weight)] tracking-[var(--p-l-letter-spacing)] text-[length:var(--p-l-font-size)]">
                            *
                          </span>
                          <span className="text-[#231f20] leading-[25.2px]">
                            Password
                          </span>
                        </div>

                        <div className="relative w-full">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password"
                            value={formData.password}
                            onChange={(e) => handleInputChange("password", e.target.value)}
                            className="h-auto p-[15px] pr-12 bg-white border border-solid border-[#a8a8a8] rounded-[15px] [font-family:'Maven_Pro',Helvetica] font-normal text-[#a9a9a9] text-base tracking-[0] leading-[23px] placeholder:text-[#a9a9a9]"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-3 top-1/2 -translate-y-1/2 h-auto p-0 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            <EyeIcon className="w-5 h-5 text-medium-dark-grey" />
                          </Button>
                        </div>

                        <div className="relative w-full">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm password"
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                            className="h-auto p-[15px] pr-12 bg-white border border-solid border-[#a8a8a8] rounded-[15px] [font-family:'Maven_Pro',Helvetica] font-normal text-[#a9a9a9] text-base tracking-[0] leading-[23px] placeholder:text-[#a9a9a9]"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-3 top-1/2 -translate-y-1/2 h-auto p-0 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            <EyeIcon className="w-5 h-5 text-medium-dark-grey" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
                        <Checkbox
                          id="terms"
                          checked={formData.agreeToTerms}
                          onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                          className="mt-1 w-[18px] h-[18px] rounded-[9px] border border-solid border-[#231f20] data-[state=checked]:bg-button-green data-[state=checked]:border-[#231f20]"
                        />
                        <label
                          htmlFor="terms"
                          className="relative flex-1 mt-[-1.00px] font-p font-[number:var(--p-font-weight)] text-medium-dark-grey text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] [font-style:var(--p-font-style)] cursor-pointer"
                        >
                          I have read and understood the terms.
                        </label>
                      </div>
                    </div>

                    <Button
                      onClick={handleSignUp}
                      disabled={!formData.agreeToTerms || !formData.username || !formData.email || !formData.password || !formData.confirmPassword}
                      className={`mt-[30px] h-auto w-full px-10 py-2.5 rounded-[100px] [font-family:'Lato',Helvetica] font-bold text-xl tracking-[0] leading-7 whitespace-nowrap transition-all ${
                        formData.agreeToTerms && formData.username && formData.email && formData.password && formData.confirmPassword
                          ? 'bg-red text-white hover:bg-red/90 border border-solid border-[#f23a00]' 
                          : 'bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] text-medium-grey border-0'
                      }`}
                    >
                      Sign up
                    </Button>
                  </TabsContent>

                  <TabsContent value="login" className="mt-[30px]">
                    {/* This content won't be shown since clicking the tab redirects to /login */}
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>

          <img
            className="absolute top-[350px] left-[-480px] w-[399px] h-[532px]"
            alt="Ic fractopus open"
            src="https://c.animaapp.com/mfw7e857KDarQ5/img/ic-fractopus-open-1.svg"
          />
        </main>
      </div>
    </div>
  );
};
