import React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../../components/ui/avatar";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui/tabs";

const notificationTabs = [
  { value: "all", label: "All" },
  { value: "system", label: "System" },
  { value: "treasury", label: "Treasury" },
];

const notifications = [
  {
    id: 1,
    type: "system",
    category: "System",
    message: "欢迎加入Copus社区！完成个人资料可获得更多关注和互动。",
    timestamp: "1m",
    isRead: false,
    icon: "https://c.animaapp.com/mft4oqz6uyUKY7/img/icon-wrap-1.svg",
    deleteIcon: "https://c.animaapp.com/mft4oqz6uyUKY7/img/delete.svg",
  },
  {
    id: 2,
    type: "like",
    category: "Like",
    message: 'User Name liked your post "Lorem ipsum dolor sit amet"',
    timestamp: "1h ago",
    isRead: false,
    profileImage:
      "https://c.animaapp.com/mft4oqz6uyUKY7/img/-profile-image-1.png",
    deleteIcon: "https://c.animaapp.com/mft4oqz6uyUKY7/img/delete-1.svg",
  },
  {
    id: 3,
    type: "like",
    category: "Like",
    message:
      'User Name and 3 other users liked your post "Lorem ipsum dolor sit amet"',
    timestamp: "3hs ago",
    isRead: true,
    profileImage:
      "https://c.animaapp.com/mft4oqz6uyUKY7/img/-profile-image-1.png",
    deleteIcon: "https://c.animaapp.com/mft4oqz6uyUKY7/img/delete-1.svg",
  },
  {
    id: 4,
    type: "system",
    category: "System",
    message: "Copus平台已更新至2.0版本，新增智能推荐和内容分类功能。",
    timestamp: "1 day ago",
    isRead: true,
    icon: "https://c.animaapp.com/mft4oqz6uyUKY7/img/icon-wrap-1.svg",
    deleteIcon: "https://c.animaapp.com/mft4oqz6uyUKY7/img/delete.svg",
  },
];

export const NotificationListSection = (): JSX.Element => {
  const [notificationList, setNotificationList] = React.useState(notifications);
  const [notificationStates, setNotificationStates] = React.useState(
    notifications.reduce((acc, notification) => {
      acc[notification.id] = notification.isRead;
      return acc;
    }, {} as Record<number, boolean>)
  );

  const handleNotificationClick = (id: number) => {
    setNotificationStates(prev => ({
      ...prev,
      [id]: true
    }));
  };

  const handleMarkAllAsRead = () => {
    setNotificationStates(prev => {
      const newStates = { ...prev };
      notificationList.forEach(notification => {
        newStates[notification.id] = true;
      });
      return newStates;
    });
  };

  const handleDeleteNotification = (id: number) => {
    setNotificationList(prev => prev.filter(notification => notification.id !== id));
    setNotificationStates(prev => {
      const newStates = { ...prev };
      delete newStates[id];
      return newStates;
    });
  };

  return (
    <section className="flex flex-col items-start gap-2.5 py-5 min-h-screen px-5">
      <header className="flex items-start justify-between w-full">
        <h1 className="font-h-3 font-[number:var(--h-3-font-weight)] text-off-black text-[length:var(--h-3-font-size)] tracking-[var(--h-3-letter-spacing)] leading-[var(--h-3-line-height)] [font-style:var(--h-3-font-style)]">
          Notifications
        </h1>

        <Button
          variant="outline"
          className="h-10 gap-3 px-5 py-[15px] rounded-[100px] border-[#686868] font-p font-[number:var(--p-font-weight)] text-dark-grey text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] [font-style:var(--p-font-style)] hover:bg-gray-50 transition-colors"
          onClick={handleMarkAllAsRead}
        >
          Mark all as read
        </Button>
      </header>

      <Tabs
        defaultValue="all"
        className="w-full translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]"
      >
        <TabsList className="flex w-full bg-transparent h-auto p-0 gap-0">
          {notificationTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={`flex-1 justify-center px-[15px] py-2.5 data-[state=active]:border-b data-[state=active]:border-[#454545] data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none bg-transparent relative ${
                tab.value === "all"
                  ? "[font-family:'Lato',Helvetica] font-bold text-dark-grey text-lg leading-[25.2px]"
                  : "font-p-l font-[number:var(--p-l-font-weight)] text-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] [font-style:var(--p-l-font-style)]"
              } data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-1/2 data-[state=active]:after:transform data-[state=active]:after:-translate-x-1/2 data-[state=active]:after:w-[calc(100%-30px)] data-[state=active]:after:h-[2px] data-[state=active]:after:bg-[#454545]`}
            >
              <span className="relative z-10">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-5">
          <div className="flex flex-col gap-5 pb-[30px]">
            {notificationList.map((notification, index) => {
              const isRead = notificationStates[notification.id];
              return (
                <Card
                  key={notification.id}
                  className={`p-0 border-0 rounded-lg border-b border-white translate-y-[-1rem] animate-fade-in opacity-0 transition-all duration-200 cursor-pointer ${
                    isRead
                      ? "bg-white shadow-none"
                      : "shadow-[1px_1px_10px_#c5c5c5] bg-[linear-gradient(0deg,rgba(224,224,224,0.25)_0%,rgba(224,224,224,0.25)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]"
                  }`}
                  style={
                    {
                      "--animation-delay": `${400 + index * 100}ms`,
                    } as React.CSSProperties
                  }
                  onClick={() => handleNotificationClick(notification.id)}
                >
                <CardContent className="flex items-start gap-[30px] p-5">
                  {notification.type === "system" ? (
                    <img
                      className="flex-shrink-0"
                      alt="System notification icon"
                      src={notification.icon}
                    />
                  ) : (
                    <Avatar className="w-[45px] h-[45px] flex-shrink-0">
                      <AvatarImage
                        src={notification.profileImage}
                        alt="Profile"
                        className="object-cover"
                      />
                      <AvatarFallback>UN</AvatarFallback>
                    </Avatar>
                  )}

                  <div className="flex items-start gap-5 flex-1">
                    <div className="flex flex-col gap-2.5 flex-1">
                      <div className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base leading-[23px]">
                        {notification.category}
                      </div>
                      <div className="[font-family:'Lato',Helvetica] font-medium text-off-black text-lg leading-[23px]">
                        {notification.message}
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-center gap-[5px] flex-shrink-0">
                      <div className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-sm leading-[23px]">
                        {notification.timestamp}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto hover:bg-transparent"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification.id);
                        }}
                      >
                        <img
                          className={
                            notification.type === "system" ? "h-[35px]" : "w-4"
                          }
                          alt="Delete notification"
                          src={notification.deleteIcon}
                        />
                      </Button>
                    </div>
                  </div>
                </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="system" className="mt-5">
          <div className="flex flex-col gap-5 pb-[30px]">
            {notificationList
              .filter((notification) => notification.type === "system")
              .map((notification, index) => {
                const isRead = notificationStates[notification.id];
                return (
                  <Card
                    key={notification.id}
                    className={`p-0 border-0 rounded-lg border-b border-white translate-y-[-1rem] animate-fade-in opacity-0 transition-all duration-200 cursor-pointer ${
                      isRead
                        ? "bg-white shadow-none"
                        : "shadow-[1px_1px_10px_#c5c5c5] bg-[linear-gradient(0deg,rgba(224,224,224,0.25)_0%,rgba(224,224,224,0.25)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]"
                    }`}
                    style={
                      {
                        "--animation-delay": `${400 + index * 100}ms`,
                      } as React.CSSProperties
                    }
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                  <CardContent className="flex items-start gap-[30px] p-5">
                    <img
                      className="flex-shrink-0"
                      alt="System notification icon"
                      src={notification.icon}
                    />

                    <div className="flex items-start gap-5 flex-1">
                      <div className="flex flex-col gap-2.5 flex-1">
                        <div className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base leading-[23px]">
                          {notification.category}
                        </div>
                        <div className="[font-family:'Lato',Helvetica] font-medium text-off-black text-lg leading-[23px]">
                          {notification.message}
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-center gap-[5px] flex-shrink-0">
                        <div className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-sm leading-[23px]">
                          {notification.timestamp}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-auto hover:bg-transparent"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notification.id);
                          }}
                        >
                          <img
                            className="h-[35px]"
                            alt="Delete notification"
                            src={notification.deleteIcon}
                          />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                );
              })}
          </div>
        </TabsContent>

        <TabsContent value="treasury" className="mt-5">
          <div className="flex flex-col gap-5 pb-[30px]">
            <div className="text-center py-10 text-medium-dark-grey">
              No treasury notifications
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
};
