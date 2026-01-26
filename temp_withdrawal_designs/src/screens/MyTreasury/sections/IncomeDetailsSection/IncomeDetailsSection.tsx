import React from "react";

interface HistoryItem {
  id: string;
  title: string;
  description?: string;
  amount: string;
  status: string;
  date: string;
  isPositive?: boolean;
}

export const IncomeDetailsSection = (): JSX.Element => {
  const historyData: HistoryItem[] = [
    {
      id: "1",
      title: "Curation income",
      description: 'From "Post titlePost titlePosttitlePost"',
      amount: "+20.23USDC",
      status: "Completed",
      date: "2023.2.22 12:21",
      isPositive: true,
    },
    {
      id: "2",
      title: "Curation income",
      description: 'From "Post titlePost titlePosttitlePost"',
      amount: "+20.23USDC",
      status: "Completed",
      date: "2023.2.22 12:21",
      isPositive: true,
    },
    {
      id: "3",
      title: "Curation income",
      description: 'From "Post titlePost titlePosttitlePost"',
      amount: "+20.23USDC",
      status: "Completed",
      date: "2023.2.22 12:21",
      isPositive: true,
    },
    {
      id: "4",
      title: "Withdraw",
      amount: "-18.3USDC",
      status: "Completed",
      date: "2023.2.22 12:21",
      isPositive: false,
    },
    {
      id: "5",
      title: "System fee",
      amount: "-0.1USDC",
      status: "Completed",
      date: "2023.2.22 12:21",
      isPositive: false,
    },
  ];

  return (
    <section className="flex flex-col items-center pl-[60px] pr-0 py-0 relative flex-1 grow">
      <div className="flex items-center gap-[30px] relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex flex-col items-center gap-5 p-5 relative flex-1 self-stretch grow rounded-[15px] bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
          <div className="flex h-[25px] items-center gap-[3px] relative self-stretch w-full">
            <h2 className="relative w-fit mt-[-1.00px] font-p-l font-[number:var(--p-l-font-weight)] text-medium-dark-grey text-[length:var(--p-l-font-size)] text-center tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
              Total income
            </h2>
          </div>

          <div className="items-start gap-[5px] pt-0 pb-2.5 px-0 self-stretch w-full flex-[0_0_auto] flex relative">
            <p className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-off-black text-2xl tracking-[0] leading-[33.6px] whitespace-nowrap">
              100 USDC
            </p>
          </div>
        </div>

        <div className="flex-col items-center justify-center gap-5 px-5 py-[30px] flex-1 grow rounded-[15px] bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] flex relative">
          <div className="flex items-start relative self-stretch w-full flex-[0_0_auto]">
            <h2 className="relative w-fit mt-[-1.00px] font-p-l font-[number:var(--p-l-font-weight)] text-medium-dark-grey text-[length:var(--p-l-font-size)] text-center tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
              Withdraw-able amount
            </h2>
          </div>

          <div className="flex items-center justify-between pt-0 pb-2.5 px-0 relative self-stretch w-full flex-[0_0_auto]">
            <p className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-off-black text-2xl tracking-[0] leading-[33.6px] whitespace-nowrap">
              99 USDC
            </p>

            <button
              className="all-[unset] box-border flex w-[105px] items-center justify-center gap-2.5 px-[15px] py-1.5 relative rounded-[100px] border border-solid border-blue"
              type="button"
              aria-label="Withdraw funds"
            >
              <span className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-medium text-blue text-base tracking-[0] leading-[20.8px] whitespace-nowrap">
                Withdraw
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-[5px] pl-5 pr-0 pt-[30px] pb-2.5 relative self-stretch w-full flex-[0_0_auto]">
        <h2 className="relative w-fit mt-[-1.00px] font-p-l font-[number:var(--p-l-font-weight)] text-off-black text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
          History
        </h2>

        <div className="relative w-[25px] h-[25px]" />
      </div>

      <div className="flex items-start gap-[60px] px-5 py-[5px] relative self-stretch w-full flex-[0_0_auto] rounded-[15px] bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] bg-light-grey-transparent">
        <div className="relative flex items-start w-[440px] mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-sm tracking-[0] leading-[23px]">
          Description
        </div>

        <div className="relative flex items-start w-[117px] mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-sm tracking-[0] leading-[23px]">
          Amount
        </div>

        <div className="relative flex items-start w-[180px] mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-sm tracking-[0] leading-[23px]">
          Statues
        </div>

        <div className="relative flex items-start w-[119px] mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-sm tracking-[0] leading-[23px]">
          Date
        </div>
      </div>

      {historyData.map((item) => (
        <article
          key={item.id}
          className="flex items-center gap-[60px] p-5 relative self-stretch w-full flex-[0_0_auto] h-[100px]"
        >
          <div className="flex flex-col w-[440px] items-start justify-center gap-[5px] relative self-stretch">
            <h3 className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-medium text-off-black text-xl tracking-[0] leading-[23px] whitespace-nowrap">
              {item.title}
            </h3>

            {item.description && (
              <p className="relative self-stretch [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[23px]">
                {item.description}
              </p>
            )}
          </div>

          <div className="flex w-[117px] items-center gap-[5px] relative">
            <span
              className={`relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-medium text-lg tracking-[0] leading-[23px] whitespace-nowrap ${
                item.isPositive ? "text-blue" : "text-off-black"
              }`}
            >
              {item.amount}
            </span>
          </div>

          <div className="flex flex-col w-[180px] items-start justify-center gap-2.5 relative self-stretch">
            <span className="relative flex items-center justify-center w-fit [font-family:'Lato',Helvetica] font-normal text-off-black text-lg text-right tracking-[0] leading-[23px] whitespace-nowrap">
              {item.status}
            </span>
          </div>

          <time className="relative flex items-center justify-center w-fit font-p font-[number:var(--p-font-weight)] text-dark-grey text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] whitespace-nowrap [font-style:var(--p-font-style)]">
            {item.date}
          </time>
          
          <div className="absolute bottom-0 left-0 right-0 h-px bg-[#e0e0e0]" />
        </article>
      ))}
    </section>
  );
};
