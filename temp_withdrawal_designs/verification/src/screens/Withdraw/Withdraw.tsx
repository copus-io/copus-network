import React, { useState } from "react";

export const Withdraw = (): JSX.Element => {
  const [withdrawAmount, setWithdrawAmount] = useState<string>("0");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(true);

  const withdrawableAmount = "100.2 USDC";
  const network = "Base Sepolia";
  const walletAddress = "0DUSKFL...UEO";
  const minimumAmount = "10USD";
  const serviceFee = "1USD";

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleVerify = () => {
    console.log("Verify withdrawal:", withdrawAmount);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWithdrawAmount(e.target.value);
  };

  const isVerifyDisabled =
    !withdrawAmount || Number.parseFloat(withdrawAmount) === 0;

  if (!isModalOpen) {
    return <></>;
  }

  return (
    <div
      className="inline-flex flex-col items-center gap-5 p-[30px] relative bg-white rounded-[15px]"
      data-model-id="9678:56381"
      role="dialog"
      aria-labelledby="withdraw-title"
      aria-modal="true"
    >
      <button
        className="relative self-stretch w-full flex-[0_0_auto] cursor-pointer"
        onClick={handleClose}
        aria-label="Close withdraw dialog"
        type="button"
      >
        <img
          className="w-full"
          alt="Close"
          src="https://c.animaapp.com/AJQjkBJq/img/close.svg"
        />
      </button>

      <div className="flex flex-col w-[395px] items-start gap-[25px] pt-0 pb-5 px-0 relative flex-[0_0_auto]">
        <div className="flex flex-col items-start justify-center gap-5 relative self-stretch w-full flex-[0_0_auto]">
          <h2
            id="withdraw-title"
            className="relative w-fit mt-[-1.00px] font-h3 font-[number:var(--h3-font-weight)] text-off-black text-[length:var(--h3-font-size)] tracking-[var(--h3-letter-spacing)] leading-[var(--h3-line-height)] whitespace-nowrap [font-style:var(--h3-font-style)]"
          >
            Withdraw
          </h2>

          <div className="flex flex-col items-start pt-0 pb-5 px-0 relative self-stretch w-full flex-[0_0_auto]">
            <div className="flex items-start justify-between px-0 py-[15px] relative self-stretch w-full flex-[0_0_auto]">
              <div className="relative w-fit mt-[-1.00px] font-h-4 font-[number:var(--h-4-font-weight)] text-off-black text-[length:var(--h-4-font-size)] tracking-[var(--h-4-letter-spacing)] leading-[var(--h-4-line-height)] whitespace-nowrap [font-style:var(--h-4-font-style)]">
                Withdraw-able amount:
              </div>

              <div className="relative w-fit mt-[-1.00px] font-h-4 font-[number:var(--h-4-font-weight)] text-off-black text-[length:var(--h-4-font-size)] tracking-[var(--h-4-letter-spacing)] leading-[var(--h-4-line-height)] whitespace-nowrap [font-style:var(--h-4-font-style)]">
                {withdrawableAmount}
              </div>
            </div>

            <div className="flex items-start justify-between px-0 py-[30px] relative self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-light-grey">
              <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-dark-grey text-base tracking-[0] leading-[23px] whitespace-nowrap">
                Network:
              </div>

              <div className="inline-flex items-center justify-center gap-[5px] relative flex-[0_0_auto]">
                <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-medium text-off-black text-base tracking-[0] leading-[23px] whitespace-nowrap">
                  {network}
                </div>
              </div>
            </div>

            <div className="flex items-start justify-between px-0 py-[30px] relative self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-light-grey">
              <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-dark-grey text-base tracking-[0] leading-[23px] whitespace-nowrap">
                Wallet address:
              </div>

              <div className="inline-flex items-center justify-center gap-[5px] relative flex-[0_0_auto]">
                <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-medium text-off-black text-base tracking-[0] leading-[23px] whitespace-nowrap">
                  {walletAddress}
                </div>
              </div>
            </div>

            <div className="flex items-start justify-between px-0 py-[30px] relative self-stretch w-full flex-[0_0_auto]">
              <div className="inline-flex flex-col items-start gap-[5px] relative flex-[0_0_auto]">
                <label
                  htmlFor="withdraw-amount-input"
                  className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-dark-grey text-base tracking-[0] leading-[23px] whitespace-nowrap"
                >
                  Withdraw amount:
                </label>

                <p className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-sm tracking-[0] leading-5">
                  Minimum amount: {minimumAmount},
                  <br />
                  Service fee: {serviceFee}
                </p>
              </div>

              <div className="flex w-[131px] h-[51px] items-center justify-between px-5 py-2.5 relative bg-monowhite rounded-[15px] overflow-hidden border-2 border-solid border-light-grey shadow-inputs">
                <input
                  id="withdraw-amount-input"
                  type="number"
                  value={withdrawAmount}
                  onChange={handleAmountChange}
                  className="[font-family:'Maven_Pro',Helvetica] font-medium text-dark-grey text-base w-full tracking-[0] leading-[normal] outline-none"
                  min="0"
                  step="0.01"
                  aria-label="Withdraw amount"
                />

                <div className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-sm relative w-fit tracking-[0] leading-[normal]">
                  USDC
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-10 relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex items-center justify-end gap-[30px] relative self-stretch w-full flex-[0_0_auto]">
            <button
              type="button"
              onClick={handleCancel}
              className="relative w-fit font-p font-[number:var(--p-font-weight)] text-off-black text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] whitespace-nowrap [font-style:var(--p-font-style)] cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleVerify}
              disabled={isVerifyDisabled}
              className={`inline-flex items-center justify-center gap-[30px] px-[30px] py-2.5 relative flex-[0_0_auto] rounded-[100px] ${
                isVerifyDisabled
                  ? "bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] bg-light-grey-transparent cursor-not-allowed"
                  : "bg-blue cursor-pointer"
              }`}
              aria-disabled={isVerifyDisabled}
            >
              <span
                className={`relative w-fit mt-[-1.00px] [font-family:'Maven_Pro',Helvetica] font-semibold text-base tracking-[0] leading-[22.4px] whitespace-nowrap ${
                  isVerifyDisabled ? "text-medium-grey" : "text-white"
                }`}
              >
                Verify
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
