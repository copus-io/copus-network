import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { UserProvider } from "./contexts/UserContext";
import { CategoryProvider } from "./contexts/CategoryContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ImagePreviewProvider } from "./contexts/ImagePreviewContext";
import { ToastProvider } from "./components/ui/toast";
import { GlobalImagePreview } from "./components/ui/GlobalImagePreview";
import { Discovery } from "./screens/Discovery/Discovery";
import { Following } from "./screens/Following/Following";
import { MainFrame } from "./screens/MainFrame/MainFrame";
import { Notification } from "./screens/Notification/Notification";
import { Setting } from "./screens/Setting/Setting";
import { Treasury } from "./screens/Treasury/Treasury";
import { Login } from "./screens/Login/Login";
import { Create } from "./screens/Create/Create";
import { Content } from "./screens/Content/Content";
import { NotLogIn } from "./routes/NotLogIn/screens/NotLogIn";
import { NewExplore } from "./routes/NewExplore/screens/NewExplore";
import { MyTreasury } from "./routes/MyTreasury/screens/MyTreasury";
import { LinkPreview } from "./routes/LinkPreview/screens/LinkPreview";
import { DeleteAccount } from "./routes/DeleteAccount/screens/DeleteAccount";
import { Published } from "./routes/Published/screens/Published";
import { Screen } from "./routes/Screen/screens/Screen";
import { Screen as Screen24 } from "./routes/Screen24/screens/Screen";
import { Screen as Screen25 } from "./routes/Screen25/screens/Screen";
import { Screen as Screen26 } from "./routes/Screen26/screens/Screen";
import { Screen as Screen27 } from "./routes/Screen27/screens/Screen";
import { SignUp } from "./routes/SignUp/screens/SignUp";
import { SwitchDemo } from "./components/demo/SwitchDemo";
import { AuthGuard } from "./components/guards/AuthGuard";
import { UserProfile } from "./screens/UserProfile/UserProfile";
import { NotFoundPage } from "./components/pages/NotFoundPage";
import OAuthRedirect from "./components/OAuthRedirect";
import { ShortLinkHandler } from "./components/ShortLinkHandler";
import { Space } from "./screens/Space/Space";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Discovery />,
  },
  {
    path: "/home",
    element: <Discovery />,
  },
  {
    path: "/copus",
    element: <Discovery />,
  },
  {
    path: "/following",
    element: (
      <AuthGuard requireAuth={true} showUnauthorized={true}>
        <Following />
      </AuthGuard>
    ),
  },
  {
    path: "/treasury",
    element: (
      <AuthGuard requireAuth={true} showUnauthorized={true}>
        <Treasury />
      </AuthGuard>
    ),
  },
  {
    path: "/notification",
    element: (
      <AuthGuard requireAuth={true} showUnauthorized={true}>
        <Notification />
      </AuthGuard>
    ),
  },
  {
    path: "/setting",
    element: (
      <AuthGuard requireAuth={true} showUnauthorized={true}>
        <Setting />
      </AuthGuard>
    ),
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/callback",
    element: <OAuthRedirect />,
  },
  {
    path: "/newglobal",
    element: <OAuthRedirect />,
  },
  {
    path: "/explore/new",
    element: <NewExplore />,
  },
  {
    path: "/my-treasury",
    element: (
      <AuthGuard requireAuth={true} showUnauthorized={true}>
        <MyTreasury />
      </AuthGuard>
    ),
  },
  {
    path: "/user/:namespace",
    element: <UserProfile />,
  },
  {
    path: "/user/:namespace/treasury",
    element: <MyTreasury />,
  },
  {
    path: "/treasury/:namespace",
    element: <Space />,
  },
  {
    // Keep old /space route for backwards compatibility
    path: "/space/:category",
    element: (
      <AuthGuard requireAuth={true} showUnauthorized={true}>
        <Space />
      </AuthGuard>
    ),
  },
  {
    path: "/u/:namespace",
    element: <ShortLinkHandler />, // Short link format: /u/namespace
  },
  {
    path: "/curate",
    element: (
      <AuthGuard requireAuth={true} showUnauthorized={true}>
        <Create />
      </AuthGuard>
    ),
  },
  {
    path: "/work/:id",
    element: <Content />,
  },
  {
    path: "/auth/unauthorized",
    element: <NotLogIn />,
  },
  {
    path: "/preview/link/:id?",
    element: <LinkPreview />,
  },
  {
    path: "/account/delete",
    element: (
      <AuthGuard requireAuth={true} fallbackPath="/login">
        <DeleteAccount />
      </AuthGuard>
    ),
  },
  {
    path: "/published",
    element: <Published />,
  },
  {
    path: "/screen/default",
    element: <Screen />,
  },
  {
    path: "/screen/v24",
    element: <Screen24 />,
  },
  {
    path: "/screen/v25",
    element: <Screen25 />,
  },
  {
    path: "/screen/v26",
    element: <Screen26 />,
  },
  {
    path: "/screen/v27",
    element: <Screen27 />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/demo/components/switch",
    element: <SwitchDemo />,
  },
  // 404 catch-all route - must be last
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);


export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <CategoryProvider>
          <NotificationProvider>
            <ImagePreviewProvider>
              <ToastProvider>
                <RouterProvider router={router} />
                <GlobalImagePreview />
              </ToastProvider>
            </ImagePreviewProvider>
          </NotificationProvider>
        </CategoryProvider>
      </UserProvider>
    </QueryClientProvider>
  );
};