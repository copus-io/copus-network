import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
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
    element: <Treasury />,
  },
  {
    path: "/notification",
    element: <Notification />,
  },
  {
    path: "/setting",
    element: <Setting />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/new-explore",
    element: <NewExplore />,
  },
  {
    path: "/my-treasury",
    element: <MyTreasury />,
  },
  {
    path: "/my-treasury30",
    element: <MyTreasury30 />,
  },
  {
    path: "/my-treasury32",
    element: <MyTreasury32 />,
  },
  {
    path: "/my-treasury34",
    element: <MyTreasury34 />,
  },
  {
    path: "/create",
    element: <Create />,
  },
  {
    path: "/content/:id",
    element: <Content />,
  },
  {
    path: "/not-logged-in",
    element: <NotLogIn />,
  },
  {
    path: "/link-preview/:id?",
    element: <LinkPreview />,
  },
  {
    path: "/delete-account",
    element: <DeleteAccount />,
  },
  {
    path: "/published",
    element: <Published />,
  },
  {
    path: "/screen",
    element: <Screen />,
  },
  {
    path: "/screen24",
    element: <Screen24 />,
  },
  {
    path: "/screen25",
    element: <Screen25 />,
  },
  {
    path: "/screen26",
    element: <Screen26 />,
  },
  {
    path: "/screen27",
    element: <Screen27 />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
]);

export const App = () => {
  return (
    <UserProvider>
      <CategoryProvider>
        <NotificationProvider>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </NotificationProvider>
      </CategoryProvider>
    </UserProvider>
  );
};
