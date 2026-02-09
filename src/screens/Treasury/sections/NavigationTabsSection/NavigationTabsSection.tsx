import React from "react";
import { Button } from "../../../../components/ui/button";

interface NavigationTabsSectionProps {
  activeTab: "collections" | "curations";
  onTabChange: (tab: "collections" | "curations") => void;
  onImportCSV?: () => void; // 新增：导入CSV功能
  showImportButton?: boolean; // 新增：是否显示导入按钮
}

export const NavigationTabsSection = ({
  activeTab,
  onTabChange,
  onImportCSV,
  showImportButton = false
}: NavigationTabsSectionProps): JSX.Element => {
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
      {/* 左侧：标签页 */}
      <div className="flex items-center flex-1">
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
      </div>

      {/* 右侧：导入按钮 */}
      {showImportButton && onImportCSV && activeTab === "collections" && (
        <div className="flex items-center gap-3 pl-4">
          <Button
            onClick={onImportCSV}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            导入收藏
          </Button>
        </div>
      )}
    </nav>
  );
};
