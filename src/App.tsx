import React, { lazy, Suspense } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { useScrollToTop } from "./hooks/useScrollToTop";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { UserProvider } from "./contexts/UserContext";
import { CategoryProvider } from "./contexts/CategoryContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ImagePreviewProvider } from "./contexts/ImagePreviewContext";
import { ToastProvider } from "./components/ui/toast";
import { GlobalImagePreview } from "./components/ui/GlobalImagePreview";
import { AuthGuard } from "./components/guards/AuthGuard";
import { CopusLoading } from "./components/ui/copus-loading";

// Eagerly loaded - critical path
import { Discovery } from "./screens/Discovery/Discovery";

// Withdrawal and Login - eagerly loaded for better UX
import { Withdrawal } from "./screens/Withdrawal/Withdrawal";
import { Login } from "./screens/Login/Login";

// Content - eagerly loaded to prevent dynamic import errors
import { Content } from "./screens/Content/Content";

// ShortLinkHandler - eagerly loaded to prevent dynamic import errors
import { ShortLinkHandler } from "./components/ShortLinkHandler";

// Lazy loaded routes - split code for better initial load
const Following = lazy(() => import("./screens/Following/Following").then(m => ({ default: m.Following })));
const Notification = lazy(() => import("./screens/Notification/Notification").then(m => ({ default: m.Notification })));
const Setting = lazy(() => import("./screens/Setting/Setting").then(m => ({ default: m.Setting })));
const Treasury = lazy(() => import("./screens/Treasury/Treasury").then(m => ({ default: m.Treasury })));
const Create = lazy(() => import("./screens/Create/Create").then(m => ({ default: m.Create })));
const UserProfile = lazy(() => import("./screens/UserProfile/UserProfile").then(m => ({ default: m.UserProfile })));
const Space = lazy(() => import("./screens/Space/Space").then(m => ({ default: m.Space })));

// Lazy loaded route modules
const NotLogIn = lazy(() => import("./routes/NotLogIn/screens/NotLogIn").then(m => ({ default: m.NotLogIn })));
const NewExplore = lazy(() => import("./routes/NewExplore/screens/NewExplore").then(m => ({ default: m.NewExplore })));
const MyTreasury = lazy(() => import("./routes/MyTreasury/screens/MyTreasury").then(m => ({ default: m.MyTreasury })));
const LinkPreview = lazy(() => import("./routes/LinkPreview/screens/LinkPreview").then(m => ({ default: m.LinkPreview })));
const DeleteAccount = lazy(() => import("./routes/DeleteAccount/screens/DeleteAccount").then(m => ({ default: m.DeleteAccount })));
const Published = lazy(() => import("./routes/Published/screens/Published").then(m => ({ default: m.Published })));
const SignUp = lazy(() => import("./routes/SignUp/screens/SignUp").then(m => ({ default: m.SignUp })));
const NotFoundPage = lazy(() => import("./components/pages/NotFoundPage").then(m => ({ default: m.NotFoundPage })));
const OAuthRedirect = lazy(() => import("./components/OAuthRedirect"));

// Suspense wrapper for lazy components
const LazyRoute = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<CopusLoading />}>
    {children}
  </Suspense>
);

// Router wrapper with scroll to top functionality
const AppRouter = () => {
  useScrollToTop(); // 监听路由变化并滚动到顶部
  return <RouterProvider router={router} />;
};

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
        <LazyRoute><Following /></LazyRoute>
      </AuthGuard>
    ),
  },
  {
    path: "/treasury",
    element: (
      <AuthGuard requireAuth={true} showUnauthorized={true}>
        <LazyRoute><Treasury /></LazyRoute>
      </AuthGuard>
    ),
  },
  {
    path: "/notification",
    element: (
      <AuthGuard requireAuth={true} showUnauthorized={true}>
        <LazyRoute><Notification /></LazyRoute>
      </AuthGuard>
    ),
  },
  {
    path: "/setting",
    element: (
      <AuthGuard requireAuth={true} showUnauthorized={true}>
        <LazyRoute><Setting /></LazyRoute>
      </AuthGuard>
    ),
  },
  {
    path: "/withdrawal",
    element: (
      <AuthGuard requireAuth={true} showUnauthorized={true}>
        <Withdrawal />
      </AuthGuard>
    ),
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/callback",
    element: <LazyRoute><OAuthRedirect /></LazyRoute>,
  },
  {
    path: "/newglobal",
    element: <LazyRoute><OAuthRedirect /></LazyRoute>,
  },
  {
    path: "/explore/new",
    element: <LazyRoute><NewExplore /></LazyRoute>,
  },
  {
    path: "/my-treasury",
    element: (
      <AuthGuard requireAuth={true} showUnauthorized={true}>
        <LazyRoute><MyTreasury /></LazyRoute>
      </AuthGuard>
    ),
  },
  {
    path: "/user/:namespace",
    element: <LazyRoute><UserProfile /></LazyRoute>,
  },
  {
    path: "/user/:namespace/treasury",
    element: <LazyRoute><MyTreasury /></LazyRoute>,
  },
  {
    path: "/treasury/:namespace",
    element: <LazyRoute><Space /></LazyRoute>,
  },
  {
    // Keep old /space route for backwards compatibility
    path: "/space/:category",
    element: (
      <AuthGuard requireAuth={true} showUnauthorized={true}>
        <LazyRoute><Space /></LazyRoute>
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
        <LazyRoute><Create /></LazyRoute>
      </AuthGuard>
    ),
  },
  {
    path: "/work/:id",
    element: <Content />,
  },
  {
    path: "/auth/unauthorized",
    element: <LazyRoute><NotLogIn /></LazyRoute>,
  },
  {
    path: "/preview/link/:id?",
    element: <LazyRoute><LinkPreview /></LazyRoute>,
  },
  {
    path: "/account/delete",
    element: (
      <AuthGuard requireAuth={true} fallbackPath="/login">
        <LazyRoute><DeleteAccount /></LazyRoute>
      </AuthGuard>
    ),
  },
  {
    path: "/published",
    element: <LazyRoute><Published /></LazyRoute>,
  },
  {
    path: "/signup",
    element: <LazyRoute><SignUp /></LazyRoute>,
  },
  // 404 catch-all route - must be last
  {
    path: "*",
    element: <LazyRoute><NotFoundPage /></LazyRoute>,
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
                <AppRouter />
                <GlobalImagePreview />
              </ToastProvider>
            </ImagePreviewProvider>
          </NotificationProvider>
        </CategoryProvider>
      </UserProvider>
    </QueryClientProvider>
  );
};
