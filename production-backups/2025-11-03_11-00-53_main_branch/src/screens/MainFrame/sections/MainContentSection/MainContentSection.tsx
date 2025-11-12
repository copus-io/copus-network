import React from "react";

export const MainContentSection = (): JSX.Element => {
  return (
    <div className="flex flex-col items-center justify-center px-10 py-5 min-h-screen">
      <div className="text-center">
        <h1 className="font-h-3 font-[number:var(--h-3-font-weight)] text-off-black text-[length:var(--h-3-font-size)] tracking-[var(--h-3-letter-spacing)] leading-[var(--h-3-line-height)] [font-style:var(--h-3-font-style)] mb-4">
          Welcome to Copus
        </h1>
        <p className="font-p-l font-[number:var(--p-l-font-weight)] text-medium-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] [font-style:var(--p-l-font-style)]">
          Navigate using the menu to explore different sections
        </p>
      </div>
    </div>
  );
};
