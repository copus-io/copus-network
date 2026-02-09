import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../../components/ui/button";

export interface CollectionItem {
  id: string;
  title: string;
  url: string;
  website?: string; // Extracted hostname for display
  coverImage: string;
}

interface CollectionSectionProps {
  title: string;
  treasureCount: number;
  items: CollectionItem[];
  onImportCSV?: () => void; // 新增：CSV导入回调
}

/**
 * Extract hostname from URL for display
 */
const getDisplayHostname = (url: string): string => {
  return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
};

export const CollectionSection = ({ title, treasureCount, items, onImportCSV }: CollectionSectionProps): JSX.Element => {
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <section className="relative w-full h-fit flex flex-col items-start gap-[15px]">
        <div className="flex h-[300px] items-center justify-center relative self-stretch w-full rounded-[15px] shadow-[1px_1px_10px_#c5c5c5] bg-[linear-gradient(0deg,rgba(224,224,224,0.25)_0%,rgba(224,224,224,0.25)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
          <div className="flex flex-col items-center gap-6 p-8 max-w-md text-center">
            {/* 收藏图标 */}
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-800">开始构建您的收藏</h3>
              <p className="text-gray-600 leading-relaxed">
                还没有收藏内容？您可以从其他平台导入现有收藏，或开始发现新的优质内容。
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              {onImportCSV && (
                <Button
                  onClick={onImportCSV}
                  variant="outline"
                  className="flex items-center gap-2 justify-center border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  导入收藏
                </Button>
              )}
              <Button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 justify-center bg-blue-600 hover:bg-blue-700 text-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                发现内容
              </Button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 <strong>提示：</strong>支持从 Chrome、Firefox、Safari 导出的书签文件或 CSV 格式的收藏数据
              </p>
            </div>
          </div>
        </div>
        <header className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
          <h2 className="relative w-fit [font-family:'Lato',Helvetica] font-semibold text-dark-grey text-2xl tracking-[0] leading-9 whitespace-nowrap">
            {title}
          </h2>
          <p className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-sm tracking-[0] leading-[1.4]">
            {treasureCount} treasures
          </p>
        </header>
      </section>
    );
  }

  const [mainItem, ...sideItems] = items.slice(0, 3);

  return (
    <section className="relative w-full h-fit flex flex-col items-start gap-[15px]">
      <div className="flex h-[300px] items-center relative self-stretch w-full rounded-[15px] shadow-[1px_1px_10px_#c5c5c5] bg-[linear-gradient(0deg,rgba(224,224,224,0.25)_0%,rgba(224,224,224,0.25)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
        {/* Main item on the left */}
        <article className="inline-flex flex-col items-start justify-center gap-[5px] px-[15px] py-0 relative self-stretch flex-[0_0_auto] rounded-[15px_0px_0px_15px] bg-[linear-gradient(0deg,rgba(224,224,224,0.25)_0%,rgba(224,224,224,0.25)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
          <div
            className="flex flex-col w-[259px] items-end justify-end p-2.5 relative bg-cover bg-center rounded-lg"
            style={{ backgroundImage: `url(${mainItem.coverImage})`, aspectRatio: '4 / 3' }}
          >
            {mainItem.website && (
            <div className="flex flex-col items-end gap-2.5 self-stretch w-full relative flex-[0_0_auto]">
              <span className="inline-flex items-start gap-[5px] px-2.5 py-[5px] relative flex-[0_0_auto] bg-white/80 rounded-[15px] overflow-hidden">
                <span className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-blue text-[10px] text-right tracking-[0] leading-[13.0px] whitespace-nowrap">
                  {getDisplayHostname(mainItem.url)}
                </span>
              </span>
            </div>
          )}
          </div>

          <div className="flex flex-col items-start gap-[15px] relative self-stretch w-full flex-[0_0_auto]">
            <h3 className="relative self-stretch mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-dark-grey text-base tracking-[0] leading-6 line-clamp-1">
              {mainItem.title}
            </h3>
          </div>
        </article>

        {/* Side items on the right */}
        {sideItems.length > 0 && (
          <div className="flex flex-col items-start justify-center gap-1 relative flex-1 self-stretch grow rounded-[0px_15px_15px_0px]">
            {sideItems.map((item, index) => (
              <article
                key={item.id}
                className={`${
                  index === 0 ? "h-[153px]" : "flex-1 grow"
                } pl-0 pr-[15px] ${index === 0 ? "py-[15px]" : "py-0"} ${
                  index === 0
                    ? "rounded-[0px_15px_0px_0px]"
                    : "rounded-[0px_0px_15px_0px]"
                } flex flex-col items-start gap-[5px] relative self-stretch w-full bg-[linear-gradient(0deg,rgba(224,224,224,0.25)_0%,rgba(224,224,224,0.25)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]`}
              >
                <div
                  className="p-[5px] self-stretch w-full flex flex-col items-end justify-end relative bg-cover bg-center rounded-lg"
                  style={{ backgroundImage: `url(${item.coverImage})`, aspectRatio: '16 / 9' }}
                >
                  <div className="flex flex-col items-end gap-2.5 self-stretch w-full relative flex-[0_0_auto]">
                    <span className="inline-flex items-start gap-[5px] px-2.5 py-[5px] bg-white/80 rounded-[15px] overflow-hidden relative flex-[0_0_auto]">
                      <span className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-blue text-[10px] text-right tracking-[0] leading-[13.0px] whitespace-nowrap">
                        {getDisplayHostname(item.url)}
                      </span>
                    </span>
                  </div>
                </div>

                <div
                  className={`flex flex-col items-start gap-[15px] ${
                    index === 0 ? "mb-[-4.00px]" : ""
                  } relative self-stretch w-full flex-[0_0_auto]`}
                >
                  <h3 className="relative self-stretch mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-dark-grey text-base tracking-[0] leading-6 line-clamp-1">
                    {item.title}
                  </h3>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <header className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
        <h2 className="relative w-fit [font-family:'Lato',Helvetica] font-semibold text-dark-grey text-2xl tracking-[0] leading-9 whitespace-nowrap">
          {title}
        </h2>
        <p className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-sm tracking-[0] leading-[1.4]">
          {treasureCount} treasures
        </p>
      </header>
    </section>
  );
};
