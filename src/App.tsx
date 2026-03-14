import React, { lazy, Suspense, startTransition, useEffect, useRef } from "react";
import { RouterProvider, createBrowserRouter, useLocation, Outlet } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { queryClient } from "./lib/queryClient";
import { UserProvider } from "./contexts/UserContext";
import { CategoryProvider } from "./contexts/CategoryContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ImagePreviewProvider } from "./contexts/ImagePreviewContext";
import { ToastProvider } from "./components/ui/toast";
import { GlobalImagePreview } from "./components/ui/GlobalImagePreview";
import { AuthGuard } from "./components/guards/AuthGuard";
import { CopusLoading } from "./components/ui/copus-loading";
import { PerformanceMonitor } from "./components/DevTools/PerformanceMonitor";
import { resourcePreloader } from "./utils/resourcePreloader";
import { cssOptimizer } from "./utils/cssOptimizer";
import { trackPageView, trackSessionEnd, incrementPageViewCount } from "./services/analyticsService";

// Eagerly loaded - critical path
import { Discovery } from "./screens/Discovery/Discovery";

// Lazy loaded - previously eager, now deferred for faster initial paint
const Login = lazy(() => import("./screens/Login/Login").then(m => ({ default: m.Login })));
const Content = lazy(() => import("./screens/Content/Content").then(m => ({ default: m.Content })));
const Withdrawal = lazy(() => import("./screens/Withdrawal/Withdrawal").then(m => ({ default: m.Withdrawal })));

// Test components for development
import { TestNoAccess } from "./screens/Test/TestNoAccess";


// Taste test component
import { TasteTest } from "./components/TasteTest/TasteTest";


// ShortLinkHandler - eagerly loaded to prevent dynamic import errors
import { ShortLinkHandler } from "./components/ShortLinkHandler";

// Lazy loaded routes - split code for better initial load
const Following = lazy(() => import("./screens/Following/Following").then(m => ({ default: m.Following })));
const Notification = lazy(() => import("./screens/Notification/Notification").then(m => ({ default: m.Notification })));
const Setting = lazy(() => import("./screens/Setting/Setting").then(m => ({ default: m.Setting })));

const Create = lazy(() => import("./screens/Create/Create").then(m => ({ default: m.Create })));
const UserProfile = lazy(() => import("./screens/UserProfile/UserProfile").then(m => ({ default: m.UserProfile })));
const Space = lazy(() => import("./screens/Space/Space").then(m => ({ default: m.Space })));
const SEOSet = lazy(() => import("./screens/SEOSet/SEOSet").then(m => ({ default: m.SEOSet })));

// Lazy loaded route modules
const NotLogIn = lazy(() => import("./routes/NotLogIn/screens/NotLogIn").then(m => ({ default: m.NotLogIn })));
const NewExplore = lazy(() => import("./routes/NewExplore/screens/NewExplore").then(m => ({ default: m.NewExplore })));
const MyTreasury = lazy(() => import("./routes/MyTreasury/screens/MyTreasury").then(m => ({ default: m.MyTreasury })));
const LinkPreview = lazy(() => import("./routes/LinkPreview/screens/LinkPreview").then(m => ({ default: m.LinkPreview })));
const DeleteAccount = lazy(() => import("./routes/DeleteAccount/screens/DeleteAccount").then(m => ({ default: m.DeleteAccount })));
const Published = lazy(() => import("./routes/Published/screens/Published").then(m => ({ default: m.Published })));
const SignUp = lazy(() => import("./routes/SignUp/screens/SignUp").then(m => ({ default: m.SignUp })));
const NotFoundPage = lazy(() => import("./components/pages/NotFoundPage").then(m => ({ default: m.NotFoundPage })));
const TermsPage = lazy(() => import("./components/pages/TermsPage").then(m => ({ default: m.TermsPage })));
const AboutPage = lazy(() => import("./components/pages/AboutPage").then(m => ({ default: m.AboutPage })));
const OAuthRedirect = lazy(() => import("./components/OAuthRedirect"));

// Error boundary to catch Suspense errors
class SuspenseErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('🚨 Suspense Error Caught:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('🚨 Suspense Error Details:', { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-4">
              Error: {this.state.error?.message || 'Unknown error'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Suspense wrapper for lazy components
const LazyRoute = ({ children }: { children: React.ReactNode }) => (
  <SuspenseErrorBoundary>
    <Suspense fallback={<CopusLoading />}>
      {children}
    </Suspense>
  </SuspenseErrorBoundary>
);

// Track SPA page views on every route change
const RouteTracker = () => {
  const location = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip the initial render — index.tsx already captures landing page
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    trackPageView(location.pathname);
    incrementPageViewCount();
  }, [location.pathname]);

  // Detect returning visitors (1+ day since last visit)
  useEffect(() => {
    import('./services/analyticsService').then(m => m.trackReturnVisit());
  }, []);

  // Send session_end via sendBeacon on page unload
  useEffect(() => {
    const handleUnload = () => trackSessionEnd();
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  return <Outlet />;
};

const router = createBrowserRouter([
  {
    element: <RouteTracker />,
    children: [
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
        path: "/subscription",
        element: (
          <AuthGuard requireAuth={true} showUnauthorized={true}>
            <LazyRoute><Following /></LazyRoute>
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
        path: "/earning",
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
        path: "/test/no-access",
        element: <TestNoAccess />,
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
      {
        path: "/seoSet",
        element: (
          <AuthGuard requireAuth={true} showUnauthorized={true}>
            <LazyRoute><SEOSet /></LazyRoute>
          </AuthGuard>
        ),
      },
      {
        path: "/taste-test",
        element: <TasteTest />,
      },
      {
        path: "/about",
        element: <LazyRoute><AboutPage /></LazyRoute>,
      },
      {
        path: "/terms",
        element: <LazyRoute><TermsPage /></LazyRoute>,
      },
      {
        path: "/privacy",
        element: <LazyRoute><TermsPage /></LazyRoute>,
      },
      // 404 catch-all route - must be last
      {
        path: "*",
        element: <LazyRoute><NotFoundPage /></LazyRoute>,
      },
    ],
  },
]);


export const App = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <CategoryProvider>
            <NotificationProvider>
              <ImagePreviewProvider>
                <ToastProvider>
                  <Suspense fallback={<CopusLoading />}>
                    <RouterProvider router={router} />
                  </Suspense>
                  <GlobalImagePreview />
                  <PerformanceMonitor />
                </ToastProvider>
              </ImagePreviewProvider>
            </NotificationProvider>
          </CategoryProvider>
        </UserProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};
