import React, { useState } from "react";

export const Verify = (): JSX.Element => {
  const [verificationCode, setVerificationCode] = useState("");
  const [email] = useState("XX@gmail.com");

  const handleSendCode = () => {
    console.log("Sending verification code to:", email);
  };

  const handleVerify = () => {
    console.log("Verifying code:", verificationCode);
  };

  const handleCancel = () => {
    console.log("Verification cancelled");
  };

  const handleClose = () => {
    console.log("Modal closed");
  };

  return (
    <div
      className="inline-flex flex-col items-center gap-5 p-[30px] relative bg-white rounded-[15px]"
      data-model-id="9694:56569"
      role="dialog"
      aria-labelledby="verify-title"
      aria-describedby="verify-description"
    >
      <button
        className="relative self-stretch w-full flex-[0_0_auto] cursor-pointer"
        onClick={handleClose}
        aria-label="Close verification dialog"
        type="button"
      >
        <img
          className="relative self-stretch w-full flex-[0_0_auto]"
          alt="Close"
          src="https://c.animaapp.com/TlMqGfyV/img/close.svg"
        />
      </button>

      <div className="flex flex-col w-[395px] items-start gap-10 pt-0 pb-5 px-0 relative flex-[0_0_auto]">
        <div className="flex flex-col items-start justify-center gap-[30px] relative self-stretch w-full flex-[0_0_auto]">
          <h1
            id="verify-title"
            className="relative w-fit mt-[-1.00px] font-h3 font-[number:var(--h3-font-weight)] text-off-black text-[length:var(--h3-font-size)] tracking-[var(--h3-letter-spacing)] leading-[var(--h3-line-height)] whitespace-nowrap [font-style:var(--h3-font-style)]"
          >
            Safety verification
          </h1>

          <div
            id="verify-description"
            className="flex flex-col items-start gap-5 relative self-stretch w-full flex-[0_0_auto]"
          >
            <div className="inline-flex items-center gap-5 relative flex-[0_0_auto]">
              <p className="relative w-fit mt-[-1.00px] font-p-l font-[number:var(--p-l-font-weight)] text-off-black text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
                {email}
              </p>
            </div>

            <div className="flex items-start gap-5 relative self-stretch w-full flex-[0_0_auto]">
              <div className="flex items-center justify-around gap-[242px] px-[15px] py-2.5 relative flex-1 grow bg-white rounded-[15px] overflow-hidden border border-solid border-medium-grey shadow-[0px_2px_5px_#00000040]">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter verification code"
                  className="relative flex items-center justify-center w-full mt-[-1.00px] font-p-l font-[number:var(--p-l-font-weight)] text-off-black text-[length:var(--p-l-font-size)] text-center tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] placeholder:text-medium-grey [font-style:var(--p-l-font-style)]"
                  aria-label="Verification code"
                  required
                />
              </div>

              <button
                className="inline-flex items-center gap-[242px] px-[15px] py-2.5 relative flex-[0_0_auto] bg-red rounded-[15px] overflow-hidden shadow-[0px_2px_5px_#00000040] cursor-pointer"
                onClick={handleSendCode}
                type="button"
              >
                <span className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-white text-lg text-center tracking-[0] leading-[25.2px] whitespace-nowrap">
                  Send code
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-[30px] relative self-stretch w-full flex-[0_0_auto]">
          <button
            className="relative w-fit font-p font-[number:var(--p-font-weight)] text-off-black text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] whitespace-nowrap [font-style:var(--p-font-style)] cursor-pointer"
            onClick={handleCancel}
            type="button"
          >
            Cancel
          </button>

          <button
            className="inline-flex items-center justify-center gap-[30px] px-[30px] py-2.5 relative flex-[0_0_auto] rounded-[100px] bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] bg-light-grey-transparent cursor-pointer disabled:cursor-not-allowed"
            onClick={handleVerify}
            disabled={!verificationCode}
            type="button"
            aria-label="Verify code"
          >
            <span className="relative w-fit mt-[-1.00px] [font-family:'Maven_Pro',Helvetica] font-semibold text-medium-grey text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
              Verify
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
