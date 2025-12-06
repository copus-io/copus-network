import { ShareIcon } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useUser } from "../../../../contexts/UserContext";
import { useToast } from "../../../../components/ui/toast";
import { Avatar, AvatarImage } from "../../../../components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui/tabs";
import { ArticleCard, ArticleData } from "../../../../components/ArticleCard";
import { useArticleState } from "../../../../hooks/useArticleState";

export const MainContentSection = (): JSX.Element => {
  const { user, isLoggedIn } = useUser();
  const { showToast } = useToast();
  const { toggleLike, syncArticleStates } = useArticleState(showToast);

  const handleLikeToggle = async (articleId: string, currentIsLiked: boolean, currentLikeCount: number) => {
    if (!isLoggedIn) {
      showToast('请先登录再点赞', 'error');
      return;
    }

    try {
      await toggleLike(articleId, currentIsLiked, currentLikeCount);
    } catch (error) {
      console.error('点赞操作失败:', error);
      showToast('操作失败，请重试', 'error');
    }
  };

  const handleShareProfile = () => {
    // 分享个人资料
    if (navigator.share) {
      navigator.share({
        title: 'Sophiaaaaa\'s Profile',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('链接已复制到剪贴板', 'success');
    }
  };
  const socialLinks = [
    {
      icon: "https://c.animaapp.com/mfvyjo4ej1WzJf/img/logo-wrap.svg",
      handle: "@sophiawuuu",
    },
    {
      icon: "https://c.animaapp.com/mfvyjo4ej1WzJf/img/logo-wrap.svg",
      handle: "@sophiawuuu",
    },
    {
      icon: "https://c.animaapp.com/mfvyjo4ej1WzJf/img/logo-wrap.svg",
      handle: "@sophiawuuu",
    },
  ];

  // 转换静态数据为ArticleData格式
  const transformStaticToArticleData = (card: any, index: number): ArticleData => {
    return {
      id: card.id.toString(),
      uuid: card.id.toString(),
      title: card.title,
      description: card.description.replace(/^"|"$/g, ''), // 移除引号
      coverImage: card.coverImage,
      category: card.category,
      categoryColor: card.categoryColor,
      userName: card.author,
      userAvatar: card.authorImage,
      userId: 1, // 静态数据使用固定ID
      date: card.date,
      treasureCount: parseInt(card.treasures) || 0,
      visitCount: card.visits,
      isLiked: card.hasLike,
      targetUrl: `https://${card.url}`,
      website: card.url
    };
  };

  const projectCardsData = [
    {
      id: 1,
      category: "艺术",
      categoryColor: "green",
      coverImage: "https://c.animaapp.com/mfvyjo4ej1WzJf/img/cover.png",
      title: "Window Swap",
      description: "Explore the world through window, what's inside?",
      author: "User Name",
      authorImage: "https://c.animaapp.com/mfvyjo4ej1WzJf/img/-profile-image-1.png",
      date: "Nov 15, 2022",
      treasures: "999",
      visits: "999 Visits",
      url: "productdesign.com",
      hasLike: false,
    },
    {
      id: 2,
      category: "科技",
      categoryColor: "red",
      coverImage: "https://c.animaapp.com/mfvyjo4ej1WzJf/img/cover-1.png",
      title: "Window Swap",
      description: "Explore the world through window, what's inside?",
      author: "User Name",
      authorImage: "https://c.animaapp.com/mfvyjo4ej1WzJf/img/-profile-image-1.png",
      date: "Nov 15, 2022",
      treasures: "999",
      visits: "999 Visits",
      url: "productdesign.com",
      hasLike: true,
    },
  ];

  const projectCards = projectCardsData.map(transformStaticToArticleData);

  // 同步文章状态到localStorage
  useEffect(() => {
    if (projectCards.length > 0) {
      syncArticleStates(projectCards);
    }
  }, [projectCards, syncArticleStates]);

  return (
    <main className="flex flex-col items-start gap-[30px] pb-5 min-h-screen">
      <section className="flex flex-col items-start w-full">
        <div className="relative self-stretch w-full h-[200px] rounded-lg [background:url(https://c.animaapp.com/mfvyjo4ej1WzJf/img/banner.png)_50%_50%_/_cover]" />

        <div className="gap-6 pl-5 pr-10 py-0 mt-[-46px] flex items-start w-full">
          <Avatar className="w-[100px] h-[100px] border-2 border-solid border-[#ffffff]">
            <AvatarImage
              src="https://c.animaapp.com/mfvyjo4ej1WzJf/img/profile-1.png"
              alt="Profile"
              className="object-cover"
            />
          </Avatar>

          <div className="flex flex-col items-start gap-5 pt-[60px] pb-0 px-0 flex-1 grow">
            <div className="flex-col items-start justify-center inline-flex">
              <div className="items-center gap-[15px] inline-flex">
                <h1 className="mt-[-1.00px] [font-family:'Lato',Helvetica] font-medium text-off-black text-3xl tracking-[0] leading-[42px] whitespace-nowrap">
                  Sophiaaaaa
                </h1>

                <ShareIcon
                  className="mr-[-0.39px] w-5 h-5 text-off-black cursor-pointer hover:opacity-70 transition-opacity"
                  onClick={handleShareProfile}
                  title="分享个人资料"
                />
              </div>

              <p className="[font-family:'Lato',Helvetica] font-normal text-off-black text-lg tracking-[0] leading-[25.2px] whitespace-nowrap">
                @nan09
              </p>
            </div>

            <div className="flex-col gap-[15px] flex items-start w-full">
              <div className="flex items-center gap-2.5 w-full">
                <p className="mt-[-1.00px] font-p-l font-[number:var(--p-l-font-weight)] text-off-black text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
                  Hello, welcome to my creativce space. Design, travel, and
                  everyday life.
                </p>
              </div>

              <div className="inline-flex items-center gap-[30px]">
                {socialLinks.map((link, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center justify-center gap-2.5"
                  >
                    <div className="gap-[5px] inline-flex items-center">
                      <img
                        className=""
                        alt="Social platform logo"
                        src={link.icon}
                      />

                      <span className="mt-[-1.00px] font-p-l font-[number:var(--p-l-font-weight)] text-medium-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
                        {link.handle}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col items-start gap-[30px] w-full">
        <Tabs defaultValue="my-share" className="w-full">
          <TabsList className="flex items-center justify-between w-full bg-transparent h-auto p-0 rounded-none relative border-b border-[#ffffff]">
            <TabsTrigger
              value="my-treasury"
              className="flex-1 flex items-center justify-center bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none h-auto p-0 rounded-none relative data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-1/2 data-[state=active]:after:transform data-[state=active]:after:-translate-x-1/2 data-[state=active]:after:w-[calc(100%-30px)] data-[state=active]:after:h-[2px] data-[state=active]:after:bg-[#454545]"
            >
              <div className="flex justify-center px-[15px] py-2.5 w-full items-center">
                <span className="[font-family:'Lato',Helvetica] data-[state=active]:font-bold font-normal text-dark-grey text-lg text-center tracking-[0] leading-[25.2px] whitespace-nowrap">
                  Treasury collection
                </span>
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="my-share"
              className="flex-1 flex items-center justify-center bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none h-auto p-0 rounded-none relative data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-1/2 data-[state=active]:after:transform data-[state=active]:after:-translate-x-1/2 data-[state=active]:after:w-[calc(100%-30px)] data-[state=active]:after:h-[2px] data-[state=active]:after:bg-[#454545]"
            >
              <div className="inline-flex justify-center px-[15px] py-2.5 items-center">
                <span className="[font-family:'Lato',Helvetica] data-[state=active]:font-bold font-normal text-dark-grey text-lg text-center tracking-[0] leading-[25.2px] whitespace-nowrap">
                  My share
                </span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-treasury" className="mt-[30px]">
            <div
              className="w-full"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
                gap: '2rem'
              }}
            >
              {projectCards.map((card) => (
                <ArticleCard
                  key={card.id}
                  article={card}
                  layout="treasury"
                  actions={{
                    showTreasure: true,
                    showVisits: true,
                    showWebsite: true,
                    showBranchIt: false
                  }}
                  onLike={handleLikeToggle}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-share" className="mt-[30px]">
            <div
              className="w-full"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
                gap: '2rem'
              }}
            >
              {projectCards.map((card) => (
                <ArticleCard
                  key={card.id}
                  article={card}
                  layout="treasury"
                  actions={{
                    showTreasure: true,
                    showVisits: true,
                    showWebsite: true,
                    showBranchIt: false
                  }}
                  onLike={handleLikeToggle}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
};
