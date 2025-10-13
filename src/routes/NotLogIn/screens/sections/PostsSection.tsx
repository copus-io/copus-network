import React from "react";
import { ArticleCard, ArticleData } from "../../../../components/ArticleCard";

// 转换静态数据为ArticleData格式
const transformPostToArticleData = (post: any): ArticleData => {
  return {
    id: post.id.toString(),
    uuid: post.id.toString(),
    title: post.title,
    description: post.description,
    coverImage: post.coverImage,
    category: post.category,
    categoryColor: post.category.toLowerCase(), // 将分类转为小写作为颜色名称
    userName: post.author,
    userAvatar: post.authorImage,
    userId: 1, // 静态数据使用固定ID
    date: post.date,
    treasureCount: parseInt(post.treasureCount) || 0,
    visitCount: post.viewCount,
    isLiked: false, // 静态数据默认为未点赞
    targetUrl: `https://${post.website}`,
    website: post.website
  };
};

const postsData = [
  {
    id: 1,
    category: "Art",
    coverImage: "https://c.animaapp.com/mft5gmofxQLTNf/img/cover-2.png",
    title: "Window Swap",
    description: "Explore the world through window, what's inside?",
    author: "User Name",
    authorImage: "https://c.animaapp.com/mft5gmofxQLTNf/img/-profile-image-4.png",
    date: "Nov 15, 2022",
    treasureCount: "999",
    viewCount: "999 Visits",
    website: "productdesign.com",
    column: "left",
  },
  {
    id: 2,
    category: "Sports",
    coverImage: "https://c.animaapp.com/mft5gmofxQLTNf/img/cover-1.png",
    title: "Window Swap",
    description: "Explore the world through window, what's inside?",
    author: "User Name",
    authorImage: "https://c.animaapp.com/mft5gmofxQLTNf/img/-profile-image-4.png",
    date: "Nov 15, 2022",
    treasureCount: "999",
    viewCount: "999 Visits",
    website: "productdesign.com",
    column: "left",
  },
  {
    id: 3,
    category: "Technology",
    coverImage: "https://c.animaapp.com/mft5gmofxQLTNf/img/cover-2.png",
    title: "Window Swap",
    description: "Explore the world through window, what's inside?",
    author: "User Name",
    authorImage: "https://c.animaapp.com/mft5gmofxQLTNf/img/-profile-image-4.png",
    date: "Nov 15, 2022",
    treasureCount: "999",
    viewCount: "999 Visits",
    website: "productdesign.com",
    column: "left",
  },
  {
    id: 4,
    category: "Life",
    coverImage: "https://c.animaapp.com/mft5gmofxQLTNf/img/cover-3.png",
    title: "Window Swap",
    description: "Explore the world through window, what's inside?",
    author: "User Name",
    authorImage: "https://c.animaapp.com/mft5gmofxQLTNf/img/-profile-image-4.png",
    date: "Nov 15, 2022",
    treasureCount: "999",
    viewCount: "999 Visits",
    website: "productdesign.com",
    column: "right",
  },
  {
    id: 5,
    category: "Technology",
    coverImage: "https://c.animaapp.com/mft5gmofxQLTNf/img/cover-4.png",
    title: "Window Swap",
    description: "Explore the world through window, what's inside?",
    author: "User Name",
    authorImage: "https://c.animaapp.com/mft5gmofxQLTNf/img/-profile-image-4.png",
    date: "Nov 15, 2022",
    treasureCount: "999",
    viewCount: "999 Visits",
    website: "productdesign.com",
    column: "right",
  },
];

// 转换为 ArticleData 格式
const articleDataList = postsData.map(transformPostToArticleData);

const leftColumnPosts = articleDataList.filter((_, index) => index % 2 === 0);
const rightColumnPosts = articleDataList.filter((_, index) => index % 2 === 1);

export const PostsSection = (): JSX.Element => {
  // 静态的事件处理函数（无实际功能）
  const handleDemoLike = () => {
  };

  const handleDemoUserClick = () => {
  };

  const renderPostCard = (article: ArticleData) => (
    <div key={article.id} className="flex flex-col gap-10 pt-0 pb-5 flex-1 rounded-[0px_0px_25px_25px]">
      <ArticleCard
        article={article}
        layout="discovery"
        actions={{
          showTreasure: true,
          showVisits: true,
          showWebsite: false,
          showBranchIt: true
        }}
        onLike={handleDemoLike}
        onUserClick={handleDemoUserClick}
      />
    </div>
  );

  return (
    <section className="flex items-start gap-[60px] px-10 pt-5 pb-[30px] min-h-screen">
      <div className="flex flex-col gap-10 pt-0 pb-5 flex-1 rounded-[0px_0px_25px_25px]">
        {leftColumnPosts.map(renderPostCard)}
      </div>

      <div className="flex flex-col gap-10 pt-0 pb-5 flex-1 rounded-[0px_0px_25px_25px]">
        {rightColumnPosts.map(renderPostCard)}
      </div>
    </section>
  );
};