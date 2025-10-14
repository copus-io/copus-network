import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./lib/queryClient";
import { UserProvider } from "./contexts/UserContext";
import { CategoryProvider } from "./contexts/CategoryContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ToastProvider } from "./components/ui/toast";
import { Discovery } from "./screens/Discovery/Discovery";
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
import { MyTreasury30 } from "./routes/MyTreasury30/screens/MyTreasury";
import { MyTreasury32 } from "./routes/MyTreasury32/screens/MyTreasury";
import { MyTreasury34 } from "./routes/MyTreasury34/screens/MyTreasury";
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
    path: "/discovery",
    element: <Discovery />,
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
      <AuthGuard requireAuth={true} fallbackPath="/discovery">
        <Setting />
      </AuthGuard>
    ),
  },
  {
    path: "/login",
    element: <Login />,
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
    path: "/my-treasury/v30",
    element: (
      <AuthGuard requireAuth={true} showUnauthorized={true}>
        <MyTreasury30 />
      </AuthGuard>
    ),
  },
  {
    path: "/my-treasury/v32",
    element: (
      <AuthGuard requireAuth={true} showUnauthorized={true}>
        <MyTreasury32 />
      </AuthGuard>
    ),
  },
  {
    path: "/my-treasury/v34",
    element: (
      <AuthGuard requireAuth={true} showUnauthorized={true}>
        <MyTreasury34 />
      </AuthGuard>
    ),
  },
  {
    path: "/create",
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
    element: <DeleteAccount />,
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
            <ToastProvider>
              <RouterProvider router={router} />
            </ToastProvider>
          </NotificationProvider>
        </CategoryProvider>
      </UserProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
