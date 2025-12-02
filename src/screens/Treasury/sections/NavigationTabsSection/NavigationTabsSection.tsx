import React from "react";

interface NavigationTabsSectionProps {
  activeTab: "collections" | "curations";
  onTabChange: (tab: "collections" | "curations") => void;
}

export const NavigationTabsSection = ({ activeTab, onTabChange }: NavigationTabsSectionProps): JSX.Element => {
  const tabs = [
    { id: "collections" as const, label: "My collections" },
    { id: "curations" as const, label: "My curations" },
  ];

  return (
    <nav
      className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto] border-b border-solid border-light-grey"
      role="navigation"
      aria-label="Content navigation"
    >
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className="flex flex-col gap-2.5 flex-1 grow items-center relative"
        >
          <button
            onClick={() => onTabChange(tab.id)}
            className={`inline-flex justify-center pt-2.5 pb-[5px] px-[15px] flex-[0_0_auto] items-center relative ${
              activeTab === tab.id
                ? "border-b-2 border-solid border-medium-dark-grey"
                : ""
            }`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`${tab.id}-panel`}
            type="button"
          >
            <span
              className={`relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] text-base text-center tracking-[0] leading-[22.4px] whitespace-nowrap ${
                activeTab === tab.id
                  ? "font-semibold text-medium-dark-grey"
                  : "font-normal text-medium-grey"
              }`}
            >
              {tab.label}
            </span>
          </button>
        </div>
      ))}
    </nav>
  );
};
