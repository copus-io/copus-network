import React from "react";

export interface CollectionItem {
  id: string;
  title: string;
  url: string;
  coverImage: string;
}

interface CollectionSectionProps {
  title: string;
  treasureCount: number;
  items: CollectionItem[];
}

export const CollectionSection = ({ title, treasureCount, items }: CollectionSectionProps): JSX.Element => {
  if (items.length === 0) {
    return (
      <section className="relative w-full h-fit flex flex-col items-start gap-[15px]">
        <div className="flex h-[300px] items-center justify-center relative self-stretch w-full rounded-[15px] shadow-[1px_1px_10px_#c5c5c5] bg-[linear-gradient(0deg,rgba(224,224,224,0.25)_0%,rgba(224,224,224,0.25)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
          <p className="text-gray-500">No items in this collection</p>
        </div>
        <header className="justify-between flex items-start relative self-stretch w-full flex-[0_0_auto]">
          <h2 className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-dark-grey text-2xl tracking-[0] leading-9 whitespace-nowrap">
            {title}
          </h2>
          <p className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-lg tracking-[0] leading-[27px] whitespace-nowrap">
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
            className="flex flex-col w-[259px] h-60 items-end justify-end p-2.5 relative bg-cover bg-center rounded-lg"
            style={{ backgroundImage: `url(${mainItem.coverImage})` }}
          >
            <div className="flex flex-col items-end gap-2.5 self-stretch w-full relative flex-[0_0_auto]">
              <a
                href={mainItem.url.startsWith('http') ? mainItem.url : `https://${mainItem.url}`}
                className="inline-flex items-start gap-[5px] px-2.5 py-[5px] relative flex-[0_0_auto] bg-white/80 rounded-[15px] overflow-hidden hover:bg-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-blue text-[10px] text-right tracking-[0] leading-[13.0px] whitespace-nowrap">
                  {mainItem.url.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                </span>
              </a>
            </div>
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
                  className="h-[98px] p-[5px] self-stretch w-full flex flex-col items-end justify-end relative bg-cover bg-center rounded-lg"
                  style={{ backgroundImage: `url(${item.coverImage})` }}
                >
                  <div className="flex flex-col items-end gap-2.5 self-stretch w-full relative flex-[0_0_auto]">
                    <a
                      href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
                      className="inline-flex items-start gap-[5px] px-2.5 py-[5px] bg-white/80 rounded-[15px] overflow-hidden relative flex-[0_0_auto] hover:bg-white transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-blue text-[10px] text-right tracking-[0] leading-[13.0px] whitespace-nowrap">
                        {item.url.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                      </span>
                    </a>
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

      <header className="justify-between flex items-start relative self-stretch w-full flex-[0_0_auto]">
        <h2 className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-dark-grey text-2xl tracking-[0] leading-9 whitespace-nowrap">
          {title}
        </h2>
        <p className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-lg tracking-[0] leading-[27px] whitespace-nowrap">
          {treasureCount} treasures
        </p>
      </header>
    </section>
  );
};
