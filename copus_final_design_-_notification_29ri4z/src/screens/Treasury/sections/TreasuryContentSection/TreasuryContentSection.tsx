import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";

const treasuryData = [
  {
    id: 1,
    title: "My Collection",
    description: "Curated items from my explorations",
    itemCount: 24,
    lastUpdated: "2 days ago",
    coverImage: "https://c.animaapp.com/mft9nppdGctUh1/img/cover-2.png",
    category: "Personal",
    categoryColor: "border-[#2b8649] bg-[linear-gradient(0deg,rgba(43,134,73,0.2)_0%,rgba(43,134,73,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    categoryTextColor: "text-green",
  },
  {
    id: 2,
    title: "Favorites",
    description: "My most treasured discoveries",
    itemCount: 12,
    lastUpdated: "1 week ago",
    coverImage: "https://c.animaapp.com/mft9nppdGctUh1/img/cover-1.png",
    category: "Favorites",
    categoryColor: "border-[#2191fb] bg-[linear-gradient(0deg,rgba(33,145,251,0.2)_0%,rgba(33,145,251,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    categoryTextColor: "text-blue",
  },
];

export const TreasuryContentSection = (): JSX.Element => {
  return (
    <div className="flex flex-col items-start gap-[30px] py-5 min-h-screen">
      <header className="flex items-start justify-between w-full">
        <h1 className="font-h-3 font-[number:var(--h-3-font-weight)] text-off-black text-[length:var(--h-3-font-size)] tracking-[var(--h-3-letter-spacing)] leading-[var(--h-3-line-height)] [font-style:var(--h-3-font-style)]">
          My Treasury
        </h1>

        <Button
          variant="outline"
          className="h-10 gap-3 px-5 py-[15px] rounded-[100px] border-[#686868] font-p font-[number:var(--p-font-weight)] text-dark-grey text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] [font-style:var(--p-font-style)] hover:bg-gray-50 transition-colors"
        >
          Create Collection
        </Button>
      </header>

      <div className="flex items-start gap-[60px] w-full px-5">
        {treasuryData.map((item) => (
          <div key={item.id} className="flex flex-col gap-10 pt-0 pb-5 flex-1 rounded-[0px_0px_25px_25px]">
            <Link to={`/content/${item.id}`}>
              <Card className="bg-white rounded-lg border-0 shadow-none hover:shadow-[1px_1px_10px_#c5c5c5] hover:bg-[linear-gradient(0deg,rgba(224,224,224,0.25)_0%,rgba(224,224,224,0.25)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] transition-all duration-200 cursor-pointer group">
                <CardContent className="flex flex-col gap-[25px] p-[30px]">
                  <div className="flex flex-col gap-5">
                    <div
                      className="flex flex-col h-48 items-start justify-between p-[15px] rounded-lg"
                      style={{
                        background: `url(${item.coverImage}) 50% 50% / cover`,
                      }}
                    >
                      <Badge
                        variant="outline"
                        className={`${item.categoryColor} px-2.5 py-2 rounded-[50px] border border-solid w-fit`}
                      >
                        <span
                          className={`${item.categoryTextColor} [font-family:'Lato',Helvetica] font-semibold text-sm tracking-[0] leading-[14px] whitespace-nowrap`}
                        >
                          {item.category}
                        </span>
                      </Badge>
                    </div>

                    <div className="flex flex-col gap-[15px]">
                      <h3 className="[font-family:'Lato',Helvetica] font-semibold text-dark-grey text-xl tracking-[0] leading-7">
                        {item.title}
                      </h3>

                      <div className="flex flex-col gap-[15px] px-2.5 py-[15px] rounded-lg bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] group-hover:bg-[linear-gradient(0deg,rgba(224,224,224,0.45)_0%,rgba(224,224,224,0.45)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] transition-colors">
                        <p className="[font-family:'Lato',Helvetica] font-normal text-dark-grey text-base tracking-[0] leading-[24px]">
                          {item.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="[font-family:'Lato',Helvetica] font-medium text-medium-dark-grey text-sm tracking-[0] leading-[20px]">
                            {item.itemCount} items
                          </span>
                          <span className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-sm tracking-[0] leading-[20px]">
                            Updated {item.lastUpdated}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
